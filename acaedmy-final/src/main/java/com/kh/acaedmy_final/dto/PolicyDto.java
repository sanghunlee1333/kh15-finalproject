package com.kh.acaedmy_final.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PolicyDto {
	private int policyNo;
	private String policyInTime;
	private int policyArrange;
	private int policyGraceTime;
	private int policyWorkTime;
	private int policyLunchTime;
	private int policyDinnerTime;
	private String policyType;
}
