package com.kh.acaedmy_final.dto;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AttendanceReasonDto {
	private long attendanceReasonNo;
	private String attendanceReasonState;
	private String attendanceReasonContent;
	private String attendanceReasonDate;
	private String attendanceReasonStart;
	private String attendanceReasonEnd;
	private long memberNo;
//	private long attendanceResultNo;
}
