package com.kh.acaedmy_final.dto;

import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UpdateMemberDocsDto {
	private long memberNo;
	private int attachmentNo;
	private String memberDocumentType; 
	
}
