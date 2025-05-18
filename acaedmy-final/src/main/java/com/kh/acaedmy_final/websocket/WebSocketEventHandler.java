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

import com.kh.acaedmy_final.service.TokenService;
import com.kh.acaedmy_final.vo.ClaimVO;
import com.kh.acaedmy_final.vo.websocket.ActionVO;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class WebSocketEventHandler {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private TokenService tokenService;

    // 세션별 방번호, 사용자 정보 매핑
    private final Map<String, Long> roomSessions = Collections.synchronizedMap(new HashMap<>());
    private final Map<String, Long> roomUsers = Collections.synchronizedMap(new HashMap<>());
    private final Map<Long, String> userNames = Collections.synchronizedMap(new HashMap<>());

    // WebSocket 최초 연결 시
    @EventListener
    public void whenUserEnter(SessionConnectEvent event) {
        String sessionId = StompHeaderAccessor.wrap(event.getMessage()).getSessionId();
//        log.info("SessionConnectEvent 발생 - 세션 ID: {}", sessionId);
    }

    // 구독 시 방번호 & 사용자 등록만 처리 (입장 메시지는 제거)
    @EventListener
    public void whenUserSubscribe(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        String destination = accessor.getDestination();
        String accessToken = accessor.getFirstNativeHeader("accessToken");

        if (destination != null && destination.startsWith("/public/chat/")) {
            long roomNo = Long.parseLong(destination.substring("/public/chat/".length()));
            ClaimVO claimVO = getUserFromAccessToken(accessToken);

            if (claimVO == null) {
//                log.error("토큰 파싱 실패: {}", accessToken);
                return;
            }

            roomSessions.put(sessionId, roomNo);
            roomUsers.put(sessionId, claimVO.getMemberNo());
            userNames.put(claimVO.getMemberNo(), claimVO.getMemberDepartment());

//            log.info("사용자 {}가 방 {}를 구독", claimVO.getMemberNo(), roomNo);
        }
    }

    // 연결 종료 시 퇴장 알림 전송 (LEAVE만 유지)
    @EventListener
    public void whenUserLeave(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();

        Long roomNo = roomSessions.remove(sessionId);
        Long userId = roomUsers.remove(sessionId);

        if (roomNo == null || userId == null) return;

        String userName = userNames.remove(userId);

        // LEAVE 메시지만 전송
        messagingTemplate.convertAndSend("/public/chat/" + roomNo,
                new ActionVO("LEAVE", userId, userName));

//        log.info("사용자 {}가 방 {}에서 퇴장", userId, roomNo);
    }

    // JWT에서 사용자 정보 추출
    private ClaimVO getUserFromAccessToken(String accessToken) {
        try {
            return tokenService.parseBearerToken("Bearer " + accessToken);
        } catch (Exception e) {
//            log.error("WebSocket 토큰 파싱 실패", e);
            return null;
        }
    }
}
