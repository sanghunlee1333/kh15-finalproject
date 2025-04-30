package com.kh.acaedmy_final.vo.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

//채팅방 참여자 목록용 VO
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserVO {
	private Long memberNo;           // 사용자 번호
	private String memberName;       // 사용자 이름
	private String memberDepartment; // 사용자 부서
}
