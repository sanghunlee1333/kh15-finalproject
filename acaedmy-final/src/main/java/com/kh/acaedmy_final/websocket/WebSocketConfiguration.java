package com.kh.acaedmy_final.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

//순수 웹소켓 활성화
@EnableWebSocketMessageBroker//STOMP 도우미 활성화
@Configuration//설정 파일임을 명시
public class WebSocketConfiguration implements WebSocketMessageBrokerConfigurer{
	
	//[1] 사용자가 접속하거나 메세지를 보낼 수 있는 "채널"을 개설
	@Override
	public void configureMessageBroker(MessageBrokerRegistry registry) {
		registry.enableSimpleBroker("/public", "/private");
		registry.setApplicationDestinationPrefixes("/app");
	}
	
	//[2] 웹소켓 연결방식에 대한 설정
	@Override
	public void registerStompEndpoints(StompEndpointRegistry registry) {
		registry.addEndpoint("/ws")//웹소켓 연결 생성 주소 (접속 주소)
				.setAllowedOriginPatterns("*")//허용 가능한 클라이언트 주소 패턴(CORS와 비슷)
				.withSockJS();//ws를 http처럼 쓸 수 있게 하며 유요한 기능을 제공
	}

}
