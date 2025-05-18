package com.kh.acaedmy_final.dto.websocket;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AlarmDto {
	private long alarmNo; //알림 번호
	private long alarmReceiverNo; //알림 수신자
	private long alarmSenderNo; //알림 작성자
	private String alarmType; //알림 유형
	private String alarmMessage; //알림 메시지 ex) PLAN_SOON, PLAN_START..
	private long alarmPlanNo; //관련 일정 번호
	private String alarmRead; //알림 읽음 여부
	private Timestamp alarmCreateTime; //알림 생성 시간
}
