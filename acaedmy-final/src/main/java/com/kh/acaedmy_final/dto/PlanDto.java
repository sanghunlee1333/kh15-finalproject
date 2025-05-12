package com.kh.acaedmy_final.dto;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PlanDto { //DB 매핑용 DTO
	private long planNo;
	private long planSenderNo;
	private String planStatus;
	private String planType;
	private String planTitle;
	private String planContent;
	private Timestamp planStartTime;
	private Timestamp planEndTime;
	private Timestamp planCreateTime;
}
