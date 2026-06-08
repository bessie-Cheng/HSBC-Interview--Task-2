package com.property.service;

import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class MarketService {

    @Value("${model.api.url}")
    private String modelApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Cacheable("stats")
    public double getAveragePriceByRegion(String region) {
        // 模拟从数据集计算平均价格（实际应读取 CSV 并聚合）
        // 这里仅作为示例返回固定值
        return 450000.0;
    }

    public double whatIfAnalysis(Map<String, Object> features) {
        String url = modelApiUrl + "/predict_single";
        // 注意：RestTemplate 默认期望返回的 JSON 是数字，但模型容器返回的是 {"predicted_price": xxx}
        // 因此可能需要提取价格字段，或者修改模型端直接返回数字。这里简化处理。
        Double price = restTemplate.postForObject(url, features, Double.class);
        return price != null ? price : 0.0;
    }
}