package com.kh.acaedmy_final.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class HolidayResponseVO {
	private String locDate;
	private String dateName;
}
