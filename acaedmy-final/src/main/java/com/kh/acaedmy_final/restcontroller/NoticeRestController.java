package com.kh.acaedmy_final.restcontroller;

import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
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
import com.kh.acaedmy_final.service.TokenService;
import com.kh.acaedmy_final.vo.ClaimVO;
import com.kh.acaedmy_final.vo.SearchVO;

@CrossOrigin
@RestController
@RequestMapping("/api/notice")
public class NoticeRestController {

	@Autowired
	private TokenService tokenService;
	
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
	public void insert(@RequestHeader ("Authorization") String bearerToken, 
					   @ModelAttribute NoticeDto noticeDto, 
					   @RequestParam(value = "attach", required = false) MultipartFile[] attach, 
					   @RequestParam(value = "editorImage", required = false) List<Integer> editorImage) throws IllegalStateException, IOException {
		
		//토큰에서 사용자 정보 추출
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		
		if(!claimVO.getMemberDepartment().equals("인사")) {
			throw new AccessDeniedException("인사팀만 글을 작성할 수 있습니다");
		}
		//작성자 설정
		noticeDto.setNoticeWriterNo(claimVO.getMemberNo());
		
		//게시글 등록
		noticeDao.insert(noticeDto);
		
		//파일 유무에 따라 추가 처리
		//일반 첨부파일 연결
		if(attach != null) {
			for(MultipartFile file : attach) {
				if(!file.isEmpty()) {
					AttachmentDto attachmentDto = attachmentService.save(file);
					noticeDao.connect(noticeDto, attachmentDto);
				}
			}
		}
		
		//서머노트 이미지 연결
		if (editorImage != null) {
		    for (int attachmentNo : editorImage) {
		        noticeDao.connectEditor(noticeDto.getNoticeNo(), attachmentNo);
		    }
		}		
		
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

		//2. 에디터 이미지 삭제 (notice_editor_image + attachment + 파일)
	    noticeAttachmentService.deleteEditorImages(noticeNo);
		
		//3. 일반 첨부파일 삭제 (notice_image + attachment + 파일)
	    noticeAttachmentService.deleteNoticeImages(noticeNo);

		//4. 글 삭제 (notice_image, notice_editor_image는 ON DELETE CASCADE로 날아감)
		noticeDao.delete(noticeNo); //있으면 200
	}
		
	//상세
	@GetMapping("/{noticeNo}")
	public NoticeDto find(@PathVariable long noticeNo) {
		NoticeDto noticeDto = noticeDao.selectOne(noticeNo);
		if(noticeDto == null) throw new TargetNotFoundException();
		return noticeDto;
	}
	
	//목록 + 검색 조회
	@PostMapping("/search")
	public Map<String, Object> searchList(@RequestBody SearchVO searchVO){
		int count = noticeDao.count(searchVO);
		List<NoticeDto> list = noticeDao.selectList(searchVO);
		
		Map<String, Object> obj = new HashMap<>();
		obj.put("list", list);
		obj.put("count", count);
		return obj;
	}
	
	//수정
	@PostMapping(value= "/edit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public void edit(@ModelAttribute NoticeDto noticeDto,
					 @RequestParam(value = "attach", required = false) MultipartFile[] attach,
					 @RequestParam(value = "editorImage", required = false) List<Integer> editorImage,
					 @RequestParam(value = "deleteAttach", required = false) List<Integer> deleteAttach,
					 @RequestParam(value = "deleteEditorImage", required = false) List<Integer> deleteEditorImage
					 ) throws IllegalStateException, IOException {
		
		//게시글 존재 여부 확인
		NoticeDto targetDto = noticeDao.selectOne(noticeDto.getNoticeNo());
		if(targetDto == null) throw new TargetNotFoundException();
		
		//글 수정
		noticeDao.update(noticeDto);
		
		//기존 일반 첨부파일 삭제
		if(deleteAttach != null) {
			for(int attachmentNo : deleteAttach) {
				noticeDao.deleteNoticeImageConnection(noticeDto.getNoticeNo(), attachmentNo);
				attachmentService.delete(attachmentNo);
			}
		}
		
		//기존 서머노트 이미지 삭제
		if(deleteEditorImage != null) {
			for(int attachmentNo : deleteEditorImage) {
				System.out.println("삭제할 editor 이미지 attachmentNo = " + attachmentNo);
				noticeDao.deleteEditorImageConnection(noticeDto.getNoticeNo(), attachmentNo);
				attachmentService.delete(attachmentNo);
			}
		}
		
		//새 일반 첨부파일 연결
		if(attach != null) {
			for(MultipartFile file : attach) {
				if(!file.isEmpty()) {
					AttachmentDto saved = attachmentService.save(file);
					noticeDao.connect(noticeDto, saved);
				}
			}
		}
		
		//서머노트 이미지 전체 재연결 (중복 방지)
		noticeDao.deleteEditorImageConnections(noticeDto.getNoticeNo());
		if(editorImage != null) {
			Set<Integer> uniqueNo = new HashSet<>(editorImage);
			for(int attachmentNo : uniqueNo) {
				noticeDao.connectEditor(noticeDto.getNoticeNo(), attachmentNo);
			}
		}
		
	}
	
}
