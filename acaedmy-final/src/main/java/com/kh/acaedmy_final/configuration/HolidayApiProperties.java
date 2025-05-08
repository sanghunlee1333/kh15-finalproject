package com.kh.acaedmy_final.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

@Data
@Configuration //해당 클래스가 스프링 Bean으로 등록된다는 의미
@ConfigurationProperties(prefix = "custom.holiday") //application.properties에서 custom.holiday.*로 시작하는 설정 값을 자동으로 주입
public class HolidayApiProperties { //스프링이 애플리케이션 시작 시 application.properties를 읽고, custom.holiday.service-key, custom.holiday.base-url 값을 찾아서 serviceKey, baseUrl 필드에 주입함.
    private String serviceKey;
    private String baseUrl;
    
    /*
		(참고)
		custom.holiday.service-key = 공공데이터 포털에서 발급받은 인증키 (URL 인코딩된 상태)
		-> 요청 시 ServiceKey=... 쿼리 파라미터로 사용
		
		custom.holiday.base-url = 호출할 API의 기본 URL
		-> 연도/월 쿼리 파라미터는 코드에서 추가로 붙임
    */
}