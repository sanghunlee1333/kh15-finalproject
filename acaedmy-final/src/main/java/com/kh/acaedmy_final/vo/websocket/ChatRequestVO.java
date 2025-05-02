package com.kh.acaedmy_final.vo.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ChatRequestVO {
	private Long roomNo;//채팅방 번호
	private Long senderNo;//보낸 사람 번호
	private String content;//메세지 내용
}
