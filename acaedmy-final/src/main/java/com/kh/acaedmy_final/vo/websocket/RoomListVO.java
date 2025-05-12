package com.kh.acaedmy_final.vo.websocket;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RoomListVO {
	private long roomNo;
	private String roomTitle;
	private long roomOwner;
	private String lastMessage;
	private Timestamp lastMessageTime;
	private int unreadCount;
}
