package com.property.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.core.io.ClassPathResource;

import com.property.model.HouseRecord;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MarketStatsService {

    private List<HouseRecord> houses = new ArrayList<>();
    private double lowPriceThreshold;
    private double highPriceThreshold;

    public MarketStatsService() {
        loadData();
        calculateThresholds();
    }

    private void loadData() {
        try {
            ClassPathResource resource = new ClassPathResource("housing.csv");
            try (InputStreamReader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
                 CSVParser parser = CSVFormat.DEFAULT.withFirstRecordAsHeader().parse(reader)) {
                for (CSVRecord record : parser) {
                    HouseRecord h = new HouseRecord();
                    h.setSquareFootage(Double.parseDouble(record.get("square_footage")));
                    h.setBedrooms(Integer.parseInt(record.get("bedrooms")));
                    h.setBathrooms(Double.parseDouble(record.get("bathrooms")));
                    h.setYearBuilt(Integer.parseInt(record.get("year_built")));
                    h.setLotSize(Double.parseDouble(record.get("lot_size")));
                    h.setDistanceToCityCenter(Double.parseDouble(record.get("distance_to_city_center")));
                    h.setSchoolRating(Double.parseDouble(record.get("school_rating")));
                    h.setPrice(Double.parseDouble(record.get("price")));
                    houses.add(h);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // 基于价格分位数计算动态阈值
    private void calculateThresholds() {
        if (houses.isEmpty()) {
            lowPriceThreshold = 200_000;
            highPriceThreshold = 500_000;
            return;
        }
        List<Double> prices = houses.stream()
                .map(HouseRecord::getPrice)
                .sorted()
                .collect(Collectors.toList());
        int size = prices.size();
        lowPriceThreshold = prices.get((int) Math.floor(size * 0.33));
        highPriceThreshold = prices.get((int) Math.floor(size * 0.66));
        System.out.println("动态阈值 - 低价阈值: " + lowPriceThreshold + ", 高价阈值: " + highPriceThreshold);
    }

    // 根据 segment 过滤房屋列表
    private List<HouseRecord> filterBySegment(String segment) {
        if (segment == null || "all".equalsIgnoreCase(segment)) {
            return new ArrayList<>(houses);
        }
        return houses.stream()
                .filter(h -> {
                    double price = h.getPrice();
                    switch (segment.toLowerCase()) {
                        case "low-price":
                            return price < lowPriceThreshold;
                        case "mid-price":
                            return price >= lowPriceThreshold && price <= highPriceThreshold;
                        case "high-price":
                            return price > highPriceThreshold;
                        default:
                            return true;
                    }
                })
                .collect(Collectors.toList());
    }

    // 平均价格（支持 segment 过滤）
    @Cacheable(value = "averagePrice", key = "#segment")
    public double getAveragePrice(String segment) {
        List<HouseRecord> filtered = filterBySegment(segment);
        return filtered.stream().mapToDouble(HouseRecord::getPrice).average().orElse(0.0);
    }

    // 动态分桶的价格分布（支持 segment 过滤）
    public List<Map<String, Object>> getPriceDistribution(String segment, int buckets) {
        List<HouseRecord> filtered = filterBySegment(segment);
        if (filtered.isEmpty()) return Collections.emptyList();

        double minPrice = filtered.stream().mapToDouble(HouseRecord::getPrice).min().getAsDouble();
        double maxPrice = filtered.stream().mapToDouble(HouseRecord::getPrice).max().getAsDouble();
        double step = (maxPrice - minPrice) / buckets;

        List<Double> boundaries = new ArrayList<>();
        for (int i = 0; i <= buckets; i++) {
            boundaries.add(minPrice + i * step);
        }

        int[] counts = new int[buckets];
        for (HouseRecord h : filtered) {
            double price = h.getPrice();
            for (int i = 0; i < buckets; i++) {
                if (price >= boundaries.get(i) && (i == buckets - 1 ? price <= boundaries.get(i+1) : price < boundaries.get(i+1))) {
                    counts[i]++;
                    break;
                }
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i < buckets; i++) {
            Map<String, Object> item = new HashMap<>();
            String range = String.format("%.0fk-%.0fk", boundaries.get(i)/1000, boundaries.get(i+1)/1000);
            item.put("range", range);
            item.put("count", counts[i]);
            result.add(item);
        }
        return result;
    }

    // 房间数分布（支持 segment 过滤）
    public List<Map<String, Object>> getRoomDistribution(String segment) {
        List<HouseRecord> filtered = filterBySegment(segment);
        Map<Integer, Integer> distribution = new LinkedHashMap<>();
        for (HouseRecord h : filtered) {
            int bedrooms = h.getBedrooms();
            distribution.put(bedrooms, distribution.getOrDefault(bedrooms, 0) + 1);
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<Integer, Integer> entry : distribution.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("rooms", entry.getKey());
            item.put("count", entry.getValue());
            result.add(item);
        }
        return result;
    }
}