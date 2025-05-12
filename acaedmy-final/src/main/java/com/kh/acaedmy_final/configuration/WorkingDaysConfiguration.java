package com.kh.acaedmy_final.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class WorkingDaysConfiguration {

	
	@Bean
	public RestTemplate template() {
		RestTemplate restTemplate = new RestTemplate();

		return restTemplate;
		
	}
}
