package com.kh.acaedmy_final.dto;

import java.sql.Timestamp;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PlanDto { //DB 매핑용 DTO(일정)
	private long planNo;
	private long planSenderNo;
	private String planStatus;
	private String planType;
	private String planTitle;
	private String planContent;
	private String planColor;
	private Timestamp planStartTime;
	private Timestamp planEndTime;
	private String planIsAllDay;
	private Timestamp planCreateTime;
}
