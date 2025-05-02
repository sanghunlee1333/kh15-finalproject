package com.kh.acaedmy_final.websocket;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import com.kh.acaedmy_final.service.websocket.RoomChatService;
import com.kh.acaedmy_final.vo.ClaimVO;
import com.kh.acaedmy_final.vo.websocket.ActionVO;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class WebSocketEventHandler {
	
	@Autowired
	private SimpMessagingTemplate messagingTemplate;//WebSocket 메세지를 전송
	@Autowired
	private RoomChatService roomChatService;//채팅 서비스 (메세지 저장)
	
	//세션별로 채팅방 정보와 사용자 ID를 관리하는 맵
	private Map<String, Long> roomSessions = Collections.synchronizedMap(new HashMap<>());
	private Map<String, Long> roomUsers = Collections.synchronizedMap(new HashMap<>());
	private Map<Long, String> userNames = Collections.synchronizedMap(new HashMap<>()); // 사용자 이름 매핑
	
	//사용자가 WebSocket에 접속할 때 호출되는 메서드
	@EventListener
	public void whenUserEnter(SessionConnectEvent event) {
		StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
		String sessionId = accessor.getSessionId();//WebSocket 세션 ID
		String accessToken = accessor.getFirstNativeHeader("accessToken");//클라이언트에서 전달한 accessToken
		
		//토큰이 없으면 차단
		if(accessToken == null) {
			log.error("접속 시 토큰이 누락 되었습니다.");
			return;
		}
		
		//토큰을 통해 사용자 정보 가져오기
		ClaimVO claimVO = getUserFromAccessToken(accessToken);//토큰을 통해 사용자 정보 추출
		if(claimVO == null) {
			log.error("토큰으로부터 사용자 정보를 추출 할 수 없습니다.");
			return;
		}
		
		log.info("사용자 {}가 접속함}", claimVO.getMemberNo());
		
		//방 번호 추출 (구독 이벤트에서 방 번호 확인)
		String destination = accessor.getDestination();
		if(destination != null && destination.startsWith("/private/group/users/")) {
			long roomNo = Long.parseLong(destination.substring("/private/group/users/".length()));
			
			//방번호와 사용자 세션 연결
			roomSessions.put(sessionId, roomNo);
			roomUsers.put(sessionId, claimVO.getMemberNo());
			userNames.put(claimVO.getMemberNo(), claimVO.getMemberDepartment()); // 사용자 이름 저장
			
			//입장 알림 메세지 전송
			messagingTemplate.convertAndSend("/private/group/users/" + roomNo,
					new ActionVO("ENTER", claimVO.getMemberNo(), claimVO.getMemberDepartment()));
			
			log.info("사용자 {}가 방 {}에 입장", claimVO.getMemberNo(), roomNo);
		}
	}
	
	//사용자가 WebSocket 채널을 구독할 때 호출되는 메서드
	@EventListener
	public void whenUserSubscribe(SessionSubscribeEvent event) {
		StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
		String destination = accessor.getDestination();
		String sessionId = accessor.getSessionId();
		
		if(destination != null && destination.startsWith("/private/group/users/")) {
			//구독한 채널의 방 번호를 추출
			long roomNo = Long.parseLong(destination.substring("/private/group/users/".length()));
			
			Long memberNo = roomUsers.get(sessionId);//여기서 가져오기
			
			//채팅방에 대한 사용자 목록 업데이트
			if(memberNo != null) {
				String userName = userNames.get(memberNo);
				messagingTemplate.convertAndSend("/private/group/users/" + roomNo,
						new ActionVO("SUBSCRIBE", memberNo, userName));
				
				log.info("사용자가 방 {}를 구독", roomNo);	
			}
		}
	}
	
	//사용자가 WebSocket연결을 종료할 때 호출되는 메서드
	@EventListener
	public void whenUserLeave(SessionDisconnectEvent event) {
		StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
		String sessionId = accessor.getSessionId();
		Long roomNo = roomSessions.remove(sessionId);//연결된 방번호
		Long userId = roomUsers.remove(sessionId);//연결된 사용자 ID
		
		if(roomNo == null || userId == null) {
			return; //유효한 세션이 아니면 종료
		}
		
		//방에 사용자 퇴장 알림전송
		String userName = userNames.remove(userId);//사용자 이름 가져오기
		messagingTemplate.convertAndSend("/private/group/users/" + roomNo, 
				new ActionVO("LEAVE", userId, userName));
		
		log.info("사용자 {}가 방 {}에서 퇴장", userId, roomNo);
	}
	
	//토큰을 통해 사용자 정보를 추출하는 메서드
	private ClaimVO getUserFromAccessToken(String accessToken) {
		//실제로 accessToken을 통해 사용자를 추출하는 로직을 작성
		//예를 들어, JWT 토큰을 파싱하거나, DB에서 사용자 정보를 조회하는 방식
		//아래는 예시로 빈 객체를 반환
		return ClaimVO.builder()
					.memberNo(1L)
					.memberDepartment("개발")
				.build();//실제 사용자 정보를 반환해야 함
	}
	
}
