package com.kh.acaedmy_final.vo.websocket;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AlarmResponseVO { //서버 -> 클라이언트로 알림 데이터를 응답할 때 사용하는 VO (UI 표시용)
	private long alarmNo; //알림 번호
    private String alarmMessage; //알림 메시지
    private String alarmType; //알림 유형
    private String alarmRead; //알림 읽음 여부
    private Timestamp alarmCreateTime; //알림 생성 시간
    
    private String alarmSenderName; //알림 작성자 이름 
    private String planTitle; //일정 제목
    private Timestamp planStartTime; //일정 시작일시
    private Timestamp planEndTime; //일정 종료일시
    
    private long alarmPlanNo; //일정 번호
    private long alarmReceiverNo; //수신자 번호
}
