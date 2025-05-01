package com.kh.acaedmy_final.vo.websocket;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

//채팅 메세지 표시용 VO
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ChatResponseVO {
	private String content; //채팅 내용
	private LocalDateTime time;//채팅 전송 시간
}
