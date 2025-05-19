package com.kh.acaedmy_final.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RoomChatAttachmentDto {
	private Long roomChatNo;
	private Integer attachmentNo;
}
