package com.kh.acaedmy_final.restcontroller;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.kh.acaedmy_final.dao.AttachmentDao;
import com.kh.acaedmy_final.dto.AttachmentDto;
import com.kh.acaedmy_final.service.AttachmentService;

@CrossOrigin
@RestController
@RequestMapping("/api/attachment")
public class AttachmentRestController {
	
	@Autowired
	private AttachmentDao attachmentDao;
	
	@Autowired
	private AttachmentService attachmentService;
	
	@GetMapping("/{attachmentNo}")
	public ResponseEntity<ByteArrayResource> download(@PathVariable int attachmentNo) throws IOException {
		byte[] data = attachmentService.load(attachmentNo); 
		AttachmentDto attachmentDto = attachmentDao.selectOne(attachmentNo);
		
		//포장(wrap)
		ByteArrayResource resource = new ByteArrayResource(data);
		
		//반환
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_ENCODING, "UTF-8")
				.header(HttpHeaders.CONTENT_TYPE, attachmentDto.getAttachmentType())
				.contentLength(attachmentDto.getAttachmentSize())
				.header(HttpHeaders.CONTENT_DISPOSITION, 
						ContentDisposition.attachment()
							.filename(attachmentDto.getAttachmentName(), StandardCharsets.UTF_8)
								.build().toString()
				)
				.body(resource);
	}
	
	@PostMapping("/upload")
	public Map<String, Object> upload(@RequestParam MultipartFile attach) throws IllegalStateException, IOException {
		AttachmentDto attachmentDto = attachmentService.save(attach); //(DB + 파일 저장)
		
		String url = "/api/attachment/" + attachmentDto. getAttachmentNo(); //저장된 파일 URL 경로
		
		Map<String, Object> map = new HashMap<>();
		map.put("url", url); //프론트에 반환할 것
		map.put("attachmentNo", attachmentDto.getAttachmentNo());
		
		return map;
	}
	
	@DeleteMapping("/{attachmentNo}")
	public void delete(@PathVariable int attachmentNo) {
	    attachmentService.delete(attachmentNo);
	}
	
}
