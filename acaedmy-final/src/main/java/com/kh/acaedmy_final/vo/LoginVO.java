package com.kh.acaedmy_final.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LoginVO {
	private String memberId;
	private String memberPw;
	
}
