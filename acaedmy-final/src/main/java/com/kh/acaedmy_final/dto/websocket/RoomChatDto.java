package com.kh.acaedmy_final.dto.websocket;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RoomChatDto {
	private Long roomChatNo; //채팅 고유 번호
	private Long roomChatSender;//보낸 사람(member_no) 회원탈퇴로 null될 수 있으니 참조형으로 설정
	private Long roomChatOrigin;//채팅방 번호(room_chat_origin)
	private String roomChatType;//채팅 종류(CHAT / SYSTEM)
	private String roomChatContent;//채팅 내용
	private LocalDateTime roomChatTime;//전송 시간
}
