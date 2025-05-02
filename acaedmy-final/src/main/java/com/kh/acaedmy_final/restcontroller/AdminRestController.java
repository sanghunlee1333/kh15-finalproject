package com.kh.acaedmy_final.restcontroller;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.kh.acaedmy_final.dao.MemberDao;
import com.kh.acaedmy_final.dao.MemberDocumentDao;
import com.kh.acaedmy_final.dto.AttachmentDto;
import com.kh.acaedmy_final.dto.MemberDocsDto;
import com.kh.acaedmy_final.dto.MemberDto;
import com.kh.acaedmy_final.dto.UpdateMemberDocsDto;
import com.kh.acaedmy_final.error.TargetNotFoundException;
import com.kh.acaedmy_final.service.AttachmentService;
import com.kh.acaedmy_final.service.PasswordService;
import com.kh.acaedmy_final.vo.AdminMemberListVO;
import com.kh.acaedmy_final.vo.MemberDetailResponseVO;

@CrossOrigin
@RestController
@RequestMapping("/api/admin")
public class AdminRestController {
	@Autowired
	private MemberDao memberDao;
	@Autowired
	private PasswordService passwordService;
	@Autowired
	private AttachmentService attachmentService;
	@Autowired
	private MemberDocumentDao memberDocumentDao;
	
	@DeleteMapping("/member/{memberNo}")
	public boolean delete(@PathVariable long memberNo) {
		if(memberDao.selectOne(memberNo) == null) throw new TargetNotFoundException();
		return memberDao.delete(memberNo);
	}
	@GetMapping("/member/{memberNo}") // 상세페이지
	public Map<String, Object> selectOne(@PathVariable long memberNo) {
		Map<String, Object> ret = new HashMap<>();
		MemberDetailResponseVO vo =  memberDao.selectOneDetail(memberNo);
		ret.put("vo", vo);
		return ret;
	}
	
	@PatchMapping("/member/")
	public boolean update( @RequestBody MemberDto memberDto ) {
		System.err.println("ENTER CONTROLLER");
		MemberDto dto = memberDao.selectOne(memberDto.getMemberNo());
		if(dto == null) throw new TargetNotFoundException();
		return memberDao.editPart(memberDto);
	}
	
	
	@PostMapping("/member")
	public Map<String, Object> searchList(@RequestBody AdminMemberListVO adminMemberListVO){
		Map<String, Object> ret = new HashMap<>();
		
		if(adminMemberListVO.getColumn() != null) {	
		String columnSnakeCase = adminMemberListVO.toSnakeCase(adminMemberListVO.getColumn());
		//System.out.println(adminMemberListVO.getColumn());
		adminMemberListVO.setColumn(columnSnakeCase);
		}

		
		List<AdminMemberListVO> list = memberDao.selectIntegratedList(adminMemberListVO);
		ret.put("list", list);
		int count = memberDao.count(adminMemberListVO);
		ret.put("count", count);
		return ret;
	}
	
	@PostMapping("/member/resetPw/{memberNo}")
	public String sendEmail (@PathVariable long memberNo) {
//		String re = newPw.random();
//		sender.createMimeMessage();
		String newPP = passwordService.sendPw(memberNo);
		//System.err.println("ENTER CONTROLLER");
		return newPP;
	}
	
	@PostMapping("/member/document/{memberNo}")
	public boolean getAttachList (@PathVariable long memberNo, @ModelAttribute MemberDocsDto dto) throws IllegalStateException, IOException {
		dto.setMemberNo(memberNo);
		
		UpdateMemberDocsDto updateMemberDocsDto = new UpdateMemberDocsDto();
		updateMemberDocsDto.setMemberNo(memberNo);
		
		boolean ret = true;
		int length = dto.getFile().size();
		for(int i = 0; i < length; i++) {
			MultipartFile file = dto.getFile().get(i);
			String type = dto.getMemberDocumentType().get(i);
			AttachmentDto attach = attachmentService.save(file);
			updateMemberDocsDto.setAttachmentNo(attach.getAttachmentNo());
			updateMemberDocsDto.setMemberDocumentType(type);
			boolean isValid = memberDocumentDao.connect(updateMemberDocsDto);
			if(!isValid) {
				ret = false;
			}
		}
		return ret;
	}
	
	
}

























