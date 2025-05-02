package com.kh.acaedmy_final.vo.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RoomListVO {
	private long roomNo;
	private String roomTitle;//그룹이면 방 제목, 개인이면 상대방 이름
	private String lastMessage;
	private String lastMessageTime;
	private int unreadCount;
}
