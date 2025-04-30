package com.kh.acaedmy_final.restcontroller;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.kh.acaedmy_final.dao.NoticeDao;
import com.kh.acaedmy_final.dto.AttachmentDto;
import com.kh.acaedmy_final.dto.NoticeDto;
import com.kh.acaedmy_final.error.TargetNotFoundException;
import com.kh.acaedmy_final.service.AttachmentService;
import com.kh.acaedmy_final.service.NoticeAttachmentService;
import com.kh.acaedmy_final.vo.SearchVO;

@CrossOrigin
@RestController
@RequestMapping("/api/notice")
public class NoticeRestController {

	@Autowired
	private NoticeDao noticeDao;
	
	@Autowired
	private AttachmentService attachmentService;
	
	@Autowired
	private NoticeAttachmentService noticeAttachmentService;
	
	//등록
//	파일이 없으면 (application/json 형태 수신) 
//	@PostMapping("/")
//	public void add(@RequestBody ItemDto itemDto)
	
//  파일이 있으면 (multipart/form-data 형태 수신)
//  SpringDoc에서 정상적으로 이용하려면 추가 클래스 생성이 필요
	@PostMapping(value = "/", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public void insert(@ModelAttribute NoticeDto noticeDto, @RequestParam(value = "attach", required = false) MultipartFile[] attach) throws IllegalStateException, IOException {
		noticeDao.insert(noticeDto);
		
		//파일 유무에 따라 추가 처리
		if(attach != null) {
			for(MultipartFile file : attach) {
				if(!file.isEmpty()) {
					AttachmentDto attachmentDto = attachmentService.save(file);
					noticeDao.connect(noticeDto, attachmentDto);
				}
			}
		}
		// 에디터 이미지 연결
	    noticeAttachmentService.connectEditorImages(noticeDto.getNoticeNo(), noticeDto.getNoticeContent());
	}
	
	//각 게시글에 첨부된 첨부파일 리스트 조회
	@GetMapping("/{noticeNo}/attach")
	public List<AttachmentDto> getAttachList(@PathVariable long noticeNo){
		return noticeDao.selectAttachList(noticeNo); 
	}
	
	//삭제
	@DeleteMapping("/{noticeNo}")
	public void delete(@PathVariable long noticeNo) {
		//1. 글 삭제 전에 noticeContent를 읽기
		NoticeDto noticeDto = noticeDao.selectOne(noticeNo);
		if(noticeDto == null) {
			throw new TargetNotFoundException(); //없으면 404
		}
		
		//서머노트 내부 이미지 삭제
		String content = noticeDto.getNoticeContent();
		
		Pattern pattern = Pattern.compile("/attachment/(\\d+)");
		Matcher matcher = pattern.matcher(content);
		
		//2. noticeContent 안에 <img src="/attachment/123"> 이런 식으로 있는 것을 정규표현식으로 모두 뽑아내기
		while(matcher.find()) {
			int attachmentNo = Integer.parseInt(matcher.group(1));
			attachmentService.delete(attachmentNo); // 첨부파일 삭제 (DB + 서버파일 삭제)
		}
		
		// 2. 일반 첨부파일 (notice_image 테이블에 연결된) 삭제
	    List<AttachmentDto> attachList = noticeDao.selectAttachList(noticeNo);
	    for (AttachmentDto attach : attachList) {
	        attachmentService.delete(attach.getAttachmentNo());
	    }
		
		//3. notice 삭제
		noticeDao.delete(noticeNo); //있으면 200
	}
	
	//목록
	@GetMapping("/")
	public List<NoticeDto> list(){
		return noticeDao.selectList();
	}
	
	//상세
	@GetMapping("/{noticeNo}")
	public NoticeDto find(@PathVariable long noticeNo) {
		NoticeDto noticeDto = noticeDao.selectOne(noticeNo);
		if(noticeDto == null) throw new TargetNotFoundException();
		return noticeDto;
	}
	
	//(미사용)검색 조회(컬럼-키워드)
	@GetMapping("/column/{column}/keyword/{keyword}")
	public List<NoticeDto> list(@PathVariable String column, String keyword){
		return noticeDao.selectList(column, keyword);
	}
	//(사용)검색 조회
	@PostMapping("/search")
	public Map<String, Object> searchList(@RequestBody SearchVO searchVO){
		int count = noticeDao.count(searchVO);
		List<NoticeDto> list = noticeDao.selectList(searchVO);
		
		Map<String, Object> obj = new HashMap<>();
		obj.put("list", list);
		obj.put("count", count);
		return obj;
	}
	
	
	
	
	
}
