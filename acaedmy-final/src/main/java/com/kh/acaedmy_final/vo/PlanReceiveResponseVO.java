package com.kh.acaedmy_final.vo;

import java.sql.Timestamp;

import lombok.Data;

@Data
public class PlanReceiveResponseVO { //응답용 VO – 수신자에게 보여줄 정보
//	목적 : 프론트에서 수신자가 받은 일정 목록 확인 시 사용 
//	특징 : JOIN 결과 (이름, 제목 등 포함)
	private long planReceiveNo;
    private String planTitle;
    private Timestamp planStartTime;
    private Timestamp planEndTime;
    private String planSenderName;  // 요청자 이름
    private String planReceiveIsAccept; // 수신 여부
}
