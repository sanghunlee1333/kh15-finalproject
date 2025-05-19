package com.kh.acaedmy_final.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AttendanceOutingDto {
	private long outingNo;
	private String outingReason;
	private String outingDay;
	private String outingStart;
	private String outingEnd;
	private long memberNo;
}
