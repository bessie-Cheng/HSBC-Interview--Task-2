package com.property.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import com.property.service.MarketStatsService;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/market")
public class MarketController {

    private final MarketStatsService statsService;
    private final RestTemplate restTemplate;

    public MarketController(MarketStatsService statsService, RestTemplate restTemplate) {
        this.statsService = statsService;
        this.restTemplate = restTemplate;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats(@RequestParam(required = false) String segment,
                                        @RequestParam(required = false, defaultValue = "4") int buckets) {
        double avgPrice = statsService.getAveragePrice(segment);
        List<Map<String, Object>> priceDistribution = statsService.getPriceDistribution(segment, buckets);
        List<Map<String, Object>> roomDistribution = statsService.getRoomDistribution(segment);
        return Map.of(
            "averagePrice", avgPrice,
            "priceDistribution", priceDistribution,
            "roomDistribution", roomDistribution
        );
    }

    @PostMapping("/what-if")
    public double whatIf(@RequestBody Map<String, Object> features) {
        String url = "http://localhost:8000/predict";
        
        // 设置请求头
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        // 构建请求实体
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(features, headers);
        
        try {
            // 发送 POST 请求，期望返回一个包含 prediction 字段的 JSON 对象
            ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                Map.class
            );
            
            // 从响应体中提取预测价格
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("prediction")) {
                Object prediction = responseBody.get("prediction");
                // 处理可能为整数的情形
                if (prediction instanceof Number) {
                    return ((Number) prediction).doubleValue();
                } else if (prediction instanceof String) {
                    return Double.parseDouble((String) prediction);
                }
            }
            throw new RuntimeException("Invalid response from model container");
        } catch (Exception e) {
            // 根据业务需求处理异常，可以记录日志并返回默认值或抛出异常
            throw new RuntimeException("Failed to call model service: " + e.getMessage(), e);
        }
    }
}