package com.kh.acaedmy_final.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ContactVO {
	private long memberNo;
	private String memberName;
	private String memberDepartment;
	private String memberContact;
	private String memberEmail;
}
