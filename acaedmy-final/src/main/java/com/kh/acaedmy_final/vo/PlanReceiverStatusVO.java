package com.kh.acaedmy_final.vo;

import lombok.Data;

@Data
public class PlanReceiverStatusVO { //일정에 속한 각 참여자의 상태를 같이 조회할 때 사용하는 VO
    private Long planReceiveReceiverNo; //일정 수신자 번호
    private String planReceiveStatus; //일정 달성 여부
    private String planReceiveIsAccept; //일정 수락 여부
    
    private String receiverName; //일정 수신자 이름
    private String receiverDepartment; //일정 수신자 부서
}
