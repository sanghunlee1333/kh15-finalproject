package com.kh.acaedmy_final.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PlanReceiveDto { //DB 매핑용 DTO(수신자)
	private Long planReceivePlanNo; //일정 번호 (외래키)
	private Long planReceiveReceiverNo; //참여자 번호 (작성자 또는 수신자)
	private String planReceiveIsWriter; //작성자인지 여부 (Y/N)
	private String planReceiveIsAccept; //수신자 수락 여부 (Y/N)
	private String planReceiveStatus; //일정 상태 (완료/미완료/보류)
}
