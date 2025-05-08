package com.kh.acaedmy_final.vo.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ActionVO {
	private String action;//예: "ENTER", "LEAVE", "SUBSCRIBE"
	private Long memberNo;//사용자 번호
	private String userName;//사용자 이름 또는 부서 (화면에 표시할 정보)
}
