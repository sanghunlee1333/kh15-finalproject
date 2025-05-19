package com.kh.acaedmy_final.dto.websocket;

import java.util.List;

import lombok.Data;

@Data
public class RoomCreateRequestDto {
	private String roomTitle;
	private List<Long> memberNos;
	private Long roomProfileNo;
}
