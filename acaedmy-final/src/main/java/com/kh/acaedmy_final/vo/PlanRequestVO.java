package com.kh.acaedmy_final.vo;

import java.sql.Timestamp;
import java.util.List;

import lombok.Data;

@Data
public class PlanRequestVO { //일정 등록 요청용 VO
//	목적 | 프론트에서 일정 등록 시 사용하는 요청 바디
//	특징 | receivers 포함 -> DB에는 없는 필드
	private String planType;
	private String planTitle;
	private String planContent;
	private String planColor;
	private Timestamp planStartTime;
	private Timestamp planEndTime;
	private String planIsAllDay;
	private List<Long> receivers; // 수신자 member_no 목록
}