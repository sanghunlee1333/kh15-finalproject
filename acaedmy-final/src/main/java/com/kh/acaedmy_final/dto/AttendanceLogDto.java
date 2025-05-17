package com.kh.acaedmy_final.dto;

import java.sql.Timestamp;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AttendanceLogDto {
	private long attendanceLogNo;
	private Timestamp attendanceLogInTime;
	private Timestamp attendanceLogOutTime;
	private LocalDate attendanceLogDay;
	private long memberNo;
}
