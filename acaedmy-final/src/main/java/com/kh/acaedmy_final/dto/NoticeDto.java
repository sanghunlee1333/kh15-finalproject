package com.kh.acaedmy_final.dto;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NoticeDto {
	private long noticeNo;
	private String noticeType;
	private String noticeTitle;
	private String noticeContent;
	private long noticeWriterNo;
	private String noticeWriterName;
	private Timestamp noticeWriteDate;
}
