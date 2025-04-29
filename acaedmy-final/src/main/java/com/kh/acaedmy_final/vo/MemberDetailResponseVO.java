package com.kh.acaedmy_final.vo;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MemberDetailResponseVO {
	private long memberNo;
	private String memberId;
	private String memberDepartment;
	private String memberName;
	private String memberContact;
	private String memberEmail;
	private String memberPost;
	private String memberAddress1;
	private String memberAddress2;
	private String memberRank;
	private String memberBank;
	private String memberBankNo;
	private LocalDateTime memberJoin;
	private String memberState;
}
