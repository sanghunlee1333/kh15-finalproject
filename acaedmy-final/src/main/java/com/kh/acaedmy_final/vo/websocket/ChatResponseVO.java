package com.kh.acaedmy_final.vo.websocket;

import java.time.LocalDateTime;
import java.util.List;

import com.kh.acaedmy_final.dto.AttachmentDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

//채팅 메세지 표시용 VO
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ChatResponseVO {
	private Long roomNo;//채팅방 번호
	private Long senderNo; //보낸 사람 번호
	private String senderName;//보낸 사람 이름
	private String content; //채팅 내용
	private LocalDateTime time;//채팅 전송 시간
	
	//시스템 메세지 구분용 필드
	private String type;//"CHAT" 또는 "SYSTEM"
	
	//첨부파일 리스트
	private List<AttachmentDto> attachments;
}
