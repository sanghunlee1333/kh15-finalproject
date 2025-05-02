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
	
	//메세지 수신 및 처리
	@MessageMapping("/chat/{roomNo}")
	public void chat(@DestinationVariable long roomNo,
							Message<ChatRequestVO> message) {
		//헤더 분석 (유저 인증 관리)
		StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
		String accessToken = accessor.getFirstNativeHeader("Authorization");
		if(accessToken == null || !accessToken.startsWith("Bearer ")) {
			return; //인증 실패 시 처리
		}
		
		//사용자 인증(토큰에서 사용자 정보 추출)
		ClaimVO claimVO = tokenService.parseBearerToken(accessToken);
		MemberDto memberDto = memberDao.selectOne(claimVO.getMemberNo());
		
		if(memberDto == null) {
			return;
		}
		
		//메세지 처리
		ChatRequestVO chatRequest = message.getPayload();
		
		//수신된 메세지 내용
		String content = chatRequest.getContent();
		
		//RoomChatDto 생성 및 저장
		RoomChatDto roomChatDto = RoomChatDto.builder()
					.roomChatOrigin(roomNo)
					.roomChatContent(content)
					.roomChatType("CHAT")
				.build();
		roomChatService.sendMessage(roomChatDto, claimVO);//DB저장
		
		//ChatResponseVO 변환 (채팅방 번호, 보낸 사람 번호, 메세지 내용 등)
		//응답 메세지 생성 및 전송
		ChatResponseVO response = ChatResponseVO.builder()
					.roomNo(roomNo)
					.senderNo(claimVO.getMemberNo())
					.senderName(memberDto.getMemberName())
					.content(content)
					.time(LocalDateTime.now())
				.build();
		
		//채팅방에 메세지 전송 (그룹 채팅, 개인 채팅 구분 없이 동일하게 처리)
		//roomNo를 기준으로 그룹 또는 개인 채팅방으로 메세지 전송
		messagingTemplate.convertAndSend("/private/group/chat/" + roomNo, response);
	}
}
