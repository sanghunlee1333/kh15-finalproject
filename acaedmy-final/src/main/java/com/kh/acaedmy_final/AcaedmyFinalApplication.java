package com.kh.acaedmy_final;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling //스케줄링 활성화
@SpringBootApplication(exclude = {SecurityAutoConfiguration.class})
public class AcaedmyFinalApplication {

	public static void main(String[] args) {
		SpringApplication.run(AcaedmyFinalApplication.class, args);
	}

}
