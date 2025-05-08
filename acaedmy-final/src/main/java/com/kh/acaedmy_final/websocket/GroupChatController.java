package com.kh.acaedmy_final.websocket;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;

import com.kh.acaedmy_final.dao.MemberDao;
import com.kh.acaedmy_final.dto.MemberDto;
import com.kh.acaedmy_final.dto.websocket.RoomChatDto;
import com.kh.acaedmy_final.service.TokenService;
import com.kh.acaedmy_final.service.websocket.RoomChatService;
import com.kh.acaedmy_final.vo.ClaimVO;
import com.kh.acaedmy_final.vo.websocket.ChatRequestVO;
import com.kh.acaedmy_final.vo.websocket.ChatResponseVO;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
public class GroupChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private MemberDao memberDao;

    @Autowired
    private RoomChatService roomChatService;

    @MessageMapping("/chat/{roomNo}")
    public void chat(@DestinationVariable long roomNo,
                     Message<ChatRequestVO> message) {
        log.info("[WebSocket] 수신됨 roomNo={}, message={}", roomNo, message);

        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        String accessToken = accessor.getFirstNativeHeader("accessToken"); // ✅ 수정됨
        log.info("[WebSocket] accessToken={}", accessToken);

        if (accessToken == null || accessToken.isBlank()) {
            log.error("❌ WebSocket accessToken 누락");
            return;
        }

        try {
            ClaimVO claimVO = tokenService.parseBearerToken("Bearer " + accessToken);
            MemberDto memberDto = memberDao.selectOne(claimVO.getMemberNo());

            if (memberDto == null) {
                log.error("❌ 사용자 정보 없음");
                return;
            }

            ChatRequestVO chatRequest = message.getPayload();
            String content = chatRequest.getContent();

            RoomChatDto roomChatDto = RoomChatDto.builder()
                    .roomChatOrigin(roomNo)
                    .roomChatContent(content)
                    .roomChatType("CHAT")
                    .build();

            roomChatService.sendMessage(roomChatDto, claimVO); // DB 저장

            ChatResponseVO response = ChatResponseVO.builder()
                    .roomNo(roomNo)
                    .senderNo(claimVO.getMemberNo())
                    .senderName(memberDto.getMemberName())
                    .content(content)
                    .time(LocalDateTime.now())
                    .build();
            
        } catch (Exception e) {
            log.error("❌ 메시지 처리 중 오류", e);
        }
    }
}