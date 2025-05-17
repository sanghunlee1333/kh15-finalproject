package com.kh.acaedmy_final.vo;

import lombok.Data;

@Data
public class ReceiverStatusRequestVO {
	private Long planReceivePlanNo;
    private Long planReceiveReceiverNo;
    private String planReceiveStatus;
}
