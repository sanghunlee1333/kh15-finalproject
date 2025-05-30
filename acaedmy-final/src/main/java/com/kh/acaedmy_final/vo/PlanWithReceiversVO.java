package com.kh.acaedmy_final.vo;

import java.sql.Timestamp;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PlanWithReceiversVO { //일정과 그 일정에 참여하는 수신자들(memberNo) 정보를 프론트에 응답해줄 때 쓰는 VO
    private long planNo;
    private String planTitle;
    private long planSenderNo;
    private String planContent;
    private String planColor;
    private Timestamp planStartTime;
    private Timestamp planEndTime;
    private String planIsAllDay;
    private String planStatus;
    private String planType;
    private List<PlanReceiverStatusVO> receivers; // 상태 포함된 참여자 목록
    private String planSenderName;
    private String planSenderDepartment;
}