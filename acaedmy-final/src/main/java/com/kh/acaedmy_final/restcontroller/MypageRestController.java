package com.kh.acaedmy_final.restcontroller;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.kh.acaedmy_final.dao.AttachmentDao;
import com.kh.acaedmy_final.dao.AttendanceDao;
import com.kh.acaedmy_final.dao.MemberDao;
import com.kh.acaedmy_final.dao.MemberDocumentDao;
import com.kh.acaedmy_final.dto.AttachmentDto;
import com.kh.acaedmy_final.dto.MemberDto;
import com.kh.acaedmy_final.error.TargetNotFoundException;
import com.kh.acaedmy_final.service.AttachmentService;
import com.kh.acaedmy_final.service.TokenService;
import com.kh.acaedmy_final.vo.ClaimVO;
import com.kh.acaedmy_final.vo.PwRequestVO;

@CrossOrigin
@RequestMapping("/api/mypage")
@RestController
public class MypageRestController {
	@Autowired
	private MemberDao memberDao;
	@Autowired
	private MemberDocumentDao memberDocumentDao;
	@Autowired
	private TokenService tokenService;
	@Autowired
	private AttachmentService attachmentService;
	@Autowired
	private AttachmentDao attachmentDao;
	@Autowired
	private AttendanceDao attendanceDao;
	
	@GetMapping("/")
	public Map<String, Object> selectOne(@RequestHeader ("Authorization") String bearerToken ) {
	//	System.out.println(bearerToken);
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		MemberDto memberDto = memberDao.selectOne(claimVO.getMemberNo());
		Integer attachmentNo = memberDocumentDao.selectOne(claimVO.getMemberNo());
		if(attachmentNo == null) {
			attachmentNo = -1;
		}
	//	System.err.println(attachmentNo);
		Map<String, Object> map = new HashMap<>();
		map.put("attachmentNo", attachmentNo);
		map.put("memberDto", memberDto);
		return map;
	}
	
	@PostMapping("/profile")
	public boolean addOrChangeImage(@RequestHeader ("Authorization") String bearerToken, @RequestParam MultipartFile newAttach ) throws IllegalStateException, IOException {
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		MemberDto memberDto = memberDao.selectOne(claimVO.getMemberNo());
//		System.err.println("addorChange");
//		System.err.println(newAttach);
		Integer targetNo = memberDocumentDao.selectOne(claimVO.getMemberNo());
		AttachmentDto dto = attachmentService.save(newAttach);
		if(targetNo != null) { // edit
			boolean isValid = memberDocumentDao.update(dto.getAttachmentNo(), claimVO.getMemberNo());
			attachmentService.delete(targetNo);
			return isValid;
		}//
		else { // insert
			boolean isValid = memberDocumentDao.connect(dto.getAttachmentNo(), claimVO.getMemberNo());
			return isValid;
		}
//		return true;
	}
	
	@PatchMapping("/edit")
	public boolean editInfo(@RequestHeader ("Authorization") String bearerToken, @RequestBody MemberDto memberDto) {
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
	
		if(claimVO == null) {
			return false;
		}
		return memberDao.editPart(memberDto);
	}
	
	@Autowired
	public PasswordEncoder encoder;
	
	@PostMapping("/changePw")
//	public boolean changePw(@RequestHeader ("Authorization") String bearerToken) {
		public boolean changePw(@RequestHeader ("Authorization") String bearerToken, @RequestBody PwRequestVO vo) {
	//	System.err.println(vo);
		String newPw = vo.getMemberPw();
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		MemberDto dto = memberDao.selectOne(claimVO.getMemberNo());
		newPw = encoder.encode(newPw);
		dto.setMemberPw(newPw);
//		System.out.println(newPw);
		
		return memberDao.resetPw(dto);
	}
	
	
	@GetMapping("/attachment/{attachmentNo}")
	public ResponseEntity<byte[]> loadAttachment(@PathVariable int attachmentNo) throws IOException{
		AttachmentDto attachmentDto = attachmentDao.selectOne(attachmentNo);
		if(attachmentDto == null) throw new TargetNotFoundException();
		byte[] data = attachmentService.load(attachmentNo);
//		System.err.println(data);
		HttpHeaders headers = new HttpHeaders();
		headers.set("Content-Type", attachmentDto.getAttachmentType());
		
		return new ResponseEntity<>(data, headers, HttpStatus.OK);
	}
	
	
	@PatchMapping("/")
	public boolean updateInfo(@RequestBody MemberDto memberDto, @RequestHeader ("Authorization") String bearerToken) {
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		MemberDto originDto = memberDao.selectOne(claimVO.getMemberNo());
		System.out.println(memberDto);
		return false;
	}
	


	@GetMapping("/")
	public boolean checkAttendance(@RequestHeader ("Authorization") String bearerToken) {
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		attendanceDao.countAttendance(claimVO.getMemberNo());
		
		return false;
		
	}

	@GetMapping("/profile/{memberNo}")
	public int getProfileImageNo(@PathVariable int memberNo) {
		Integer attachmentNo = memberDocumentDao.selectOne(memberNo);
		return attachmentNo != null ? attachmentNo : -1;
	}

	@PostMapping("/profile-batch")
	public Map<Integer, Integer> getProfileImageMap(@RequestBody List<Integer> memberNos) {
	    Map<Integer, Integer> result = new HashMap<>();
	    for (Integer memberNo : memberNos) {
	        Integer attachmentNo = memberDocumentDao.selectOne(memberNo);
	        result.put(memberNo, attachmentNo != null ? attachmentNo : -1);
	    }
	    return result;
	}
	
	@PostMapping("/upload")
	public Map<String, Object> uploadOnly(@RequestParam MultipartFile attach) throws TargetNotFoundException, IOException {
	    AttachmentDto attachmentDto = attachmentService.save(attach);
	    Map<String, Object> result = new HashMap<>();
	    result.put("attachmentNo", attachmentDto.getAttachmentNo()); 
	    return result;
	}

}

































