package com.kh.acaedmy_final.dto.websocket;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor 
public class RoomDto {
	private long roomNo;//채팅방 번호
	private String roomTitle;//채팅방 제목
	private long roomOwner;//방장
	private List<Long> memberNos;//채팅방에 초대된 멤버 번호들
}
