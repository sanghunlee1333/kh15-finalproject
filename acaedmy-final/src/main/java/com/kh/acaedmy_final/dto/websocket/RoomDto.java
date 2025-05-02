package com.kh.acaedmy_final.dto.websocket;

import java.time.LocalDateTime;
import java.util.List;

import com.kh.acaedmy_final.vo.websocket.UserVO;

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
	
	//목록 화면용 필드
	private String lastMessage;//최근 메세지 내용
	private int unreadCount;//읽지 않은 메세지 수
	private LocalDateTime lastMessageTime;//최근 메세지 시간
	
	//채팅방에 속한 멤버 정보
	private List<UserVO> users;//채팅방의 멤버들
}
