package com.kh.acaedmy_final.vo;

import lombok.Data;

@Data
public class PlanStatusUpdateRequestVO { //클라이언트가 서버에 작성자의 일정 상태를 변경 요청할 때 사용하는 VO
	private String planStatus;
	private Long receiverNo; //작성자면 null 또는 생략
}
