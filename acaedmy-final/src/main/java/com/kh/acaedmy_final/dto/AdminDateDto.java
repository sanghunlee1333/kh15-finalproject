package com.kh.acaedmy_final.dto;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AdminDateDto {
	private long holidayNo;
	private String holidayName;
	private Timestamp holidayDate;
	private char holidayAdmin;
}
