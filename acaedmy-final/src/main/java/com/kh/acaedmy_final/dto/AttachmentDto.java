package com.kh.acaedmy_final.dto;

import lombok.Data;

@Data
public class AttachmentDto {
	private int attachmentNo; //시퀀스 번호
	private String attachmentName; //업로드한 파일명
	private String attachmentType; //업로드한 파일유형
	private long attachmentSize; //업로드한 파일크기
}
