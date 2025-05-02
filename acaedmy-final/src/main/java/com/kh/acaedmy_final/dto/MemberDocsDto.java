package com.kh.acaedmy_final.dto;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import jakarta.mail.Multipart;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MemberDocsDto {
//	private List<MultipartFile> updatedAttachments;
	 private List<MultipartFile> file;
	 private List<String> memberDocumentType;
	 private long memberNo;
}
