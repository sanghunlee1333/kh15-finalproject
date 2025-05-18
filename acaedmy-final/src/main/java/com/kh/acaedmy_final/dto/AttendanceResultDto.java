package com.kh.acaedmy_final.dto;

import java.sql.Timestamp;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AttendanceResultDto {
	private long attendanceResultNo;
	private Timestamp attendanceResultInTime;
	private Timestamp attendanceResultOutTime;
	private int attendanceResultLateMinute;
	private int attendanceResultEarlyLeave;
	private int attendanceResultWorkTime;
	private int attendanceResultOverTime;
	private long memberNo;
	private String attendanceResultState;
	private LocalDate attendanceResultDay;
}
