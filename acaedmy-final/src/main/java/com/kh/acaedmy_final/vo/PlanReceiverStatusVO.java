package com.kh.acaedmy_final.vo;

import lombok.Data;

@Data
public class PlanReceiverStatusVO { //일정에 속한 각 참여자의 상태를 같이 조회할 때 사용하는 VO
    private Long planReceiveReceiverNo;
    private String planReceiveStatus;
    
    private String receiverName;
    private String receiverDepartment;
}
