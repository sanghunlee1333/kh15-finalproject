package com.kh.acaedmy_final.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MemberDto {
	private long memberNo;
	private String memberId;
	private String memberPw;
	private String memberDepartment;
	private String memberName;
	private String memberResidentNo;
	private String memberContact;
	private String memberEmail;
	private String memberPost;
	private String memberAddress1;
	private String memberAddress2;
	private String memberRank;
	private String memberBank;
	private String memberBankNo;
	private String memberJoin;
	private String memberState;
}
