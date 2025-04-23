package com.kh.acaedmy_final.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TokenDto {	
	private long tokenNo;
	private long tokenTarget;
	private String tokenValue;
	private LocalDateTime tokenTime;

}
