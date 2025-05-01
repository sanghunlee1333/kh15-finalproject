package com.kh.acaedmy_final.configuration;

import java.util.Properties;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSenderImpl;


@Configuration
public class EmailConfiguration {
	
	@Autowired
	private EmailProperties emailProperties;
	
	// 자주 사용하는 도구를 미리 등ㄹ록 시킬수 있다
	// @Bean을 메소드에 붙여서 원하는 도구를 생성 하도록 구현
	// JavaMailSenderImpl sender = new JavaMailSenderImpl();
	@Bean
	public JavaMailSenderImpl sender() {
	JavaMailSenderImpl sender = new JavaMailSenderImpl();
		
		//[2]
		sender.setHost("smtp.gmail.com"); // 이용할 업체의 별칭 또는 IP(위치 정보)
		sender.setPort(587);	// 이용할 업체의 서비스 실행 번호
		sender.setUsername(emailProperties.getUsername());//이용할 업체의 사용자 계정이름
		sender.setPassword(emailProperties.getPassword());//이용할 업체의 사용자 계정 비밀번호(구글은 앱 비밀번호)
		
		Properties props = new Properties();
		props.setProperty("mail.smtp.auth", "true");	//인증 후 이용 설정
		props.setProperty("mail.smtp.debmg", "true");		//디버깅 허용 설정
		props.setProperty("mail.smtp.starttls.enable", "true");		//TLS 사용 설정
		props.setProperty("mail.smtp.ssl.protocols", "TLSv1.2");	//TLS 버전 설정
		props.setProperty("mail.smtp.ssl.trust", "smtp.gmail.com");	//신뢰할수 있는 업체로 주소 등록
		sender.setJavaMailProperties(props);		//추가 정보 설정
		
		return sender;
	}
	
}