package com.kh.acaedmy_final.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PlanReceiveDto { //DB 매핑용 DTO
	private long planReceiveNo;
	private long planReceiveReceiverNo;
	private String planReceiveIsAccept;
}
