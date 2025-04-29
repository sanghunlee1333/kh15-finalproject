package com.kh.acaedmy_final.vo;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AdminMemberListVO {
	private String memberNo;
	private String memberId;
	private String memberName;
	private String memberDepartment;
	private String memberRank;
	private String memberContact;
	private String memberEmail;
	private LocalDateTime memberJoin;
	
	
	private String order;
	
	private String memberDepartmentCk;
	
	private String column;
	private String keyword;
	
	private Integer beginRow;
	private Integer endRow;
//	
	public String toSnakeCase(String target) {
		
		 return target.replaceAll("([a-z])([A-Z]+)", "$1_$2").toLowerCase();
	}
}










