package com.kh.acaedmy_final.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@Data @Component 
@ConfigurationProperties(prefix = "holiday.api")
public class WorkingDaysProperties {
	private String key;
	private String baseUrl;
}
