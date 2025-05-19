package com.kh.acaedmy_final.restcontroller;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.kh.acaedmy_final.dao.AttachmentDao;
import com.kh.acaedmy_final.dao.AttendanceDao;
import com.kh.acaedmy_final.dao.AttendanceOutingDao;
import com.kh.acaedmy_final.dao.AttendanceReasonDao;
import com.kh.acaedmy_final.dao.MemberDao;
import com.kh.acaedmy_final.dao.PolicyDao;
import com.kh.acaedmy_final.dto.AttachmentDto;
import com.kh.acaedmy_final.dto.AttendanceLogDto;
import com.kh.acaedmy_final.dto.AttendanceOutingDto;
import com.kh.acaedmy_final.dto.AttendanceReasonDto;
import com.kh.acaedmy_final.dto.AttendanceResultDto;
import com.kh.acaedmy_final.dto.MemberDto;
import com.kh.acaedmy_final.dto.PolicyDto;
import com.kh.acaedmy_final.error.TargetNotFoundException;
import com.kh.acaedmy_final.service.AttachmentService;
import com.kh.acaedmy_final.service.AttendanceService;
import com.kh.acaedmy_final.service.TokenService;
import com.kh.acaedmy_final.vo.ClaimVO;
import com.kh.acaedmy_final.vo.RequestAttendanceVO;
import com.kh.acaedmy_final.vo.RequestResultByMonthVO;

@CrossOrigin
@RequestMapping("/api/attendance")
@RestController
public class AttendanceRestController {
	public static final int policyNo = 1;
	@Autowired
	private AttendanceDao attendanceDao;
	@Autowired
	private TokenService tokenService;
	@Autowired
	private AttendanceService attendanceService;
	@Autowired
	private PolicyDao policyDao;
	@Autowired
	private MemberDao memberDao;
	@Autowired
	private AttachmentService attachmentService;
	@Autowired
	private AttendanceReasonDao attendanceReasonDao;
	@Autowired
	private AttachmentDao attachmentDao;
	@Autowired
	private AttendanceOutingDao attendanceOutingDao;
	
	@PostMapping("/status/{memberNo}")
	public Map<String, Object> status(@PathVariable long memberNo, 
			@RequestBody RequestResultByMonthVO vo){
		System.out.println("STATUS CONTROLLER");
		System.out.println(memberNo);
		System.out.println(vo);
		
		List<AttendanceResultDto> resultList =  attendanceReasonDao.selectResultByMonth(memberNo, vo);
		
		List<AttendanceReasonDto> reasonList = attendanceReasonDao.selectReasonList(memberNo, vo);  
//		int countReason = 
		List<AttendanceOutingDto> outingList = attendanceOutingDao.selectListOuting(memberNo, vo);
		Map<String, Object> map = attendanceService.getStatus(resultList, reasonList, outingList ,memberNo, vo);
		
		return map;
	}
		
	
	
	
	@GetMapping("/{memberNo}")
	public String getName(@PathVariable long memberNo) {
		MemberDto dto = memberDao.selectOne(memberNo);
		if(dto == null) {
			return null;
		}
		else {
			return dto.getMemberName();
		}
	}
	
	@GetMapping("/")
	public PolicyDto selectList(@RequestHeader ("Authorization") String bearerToken){
		PolicyDto dto = policyDao.selectOne(policyNo);
		//System.out.println(dto);
		return dto;
	}
	
	@PostMapping("/result/{memberNo}")
	public AttendanceResultDto getResult(@PathVariable long memberNo, @RequestBody RequestAttendanceVO date) {
		return attendanceDao.selectResult(memberNo, date);
	}
//	
	@PostMapping("/inTime")
	public boolean inTime(@RequestHeader ("Authorization") String bearerToken) {
		LocalDate now = LocalDate.now();
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		long attendanceLogNo = attendanceDao.sequence();
		AttendanceLogDto attendanceDto = new AttendanceLogDto();
		attendanceDto.setMemberNo(claimVO.getMemberNo());
		attendanceDto.setAttendanceLogNo(attendanceLogNo);
		attendanceDto.setAttendanceLogDay(now);
		return attendanceDao.inTime(attendanceDto);
	}
	
	@PostMapping("/outTime")
	public boolean outTime(@RequestHeader ("Authorization") String bearerToken) {
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		LocalDate now = LocalDate.now();
		long attendanceLogNo = attendanceDao.sequence();
		AttendanceLogDto attendanceDto = new AttendanceLogDto();
		attendanceDto.setMemberNo(claimVO.getMemberNo());
		attendanceDto.setAttendanceLogNo(attendanceLogNo);
		attendanceDto.setAttendanceLogDay(now);
		boolean isValid = attendanceDao.outTime(attendanceDto);
		attendanceService.result(claimVO.getMemberNo());
	//	attendanceService.getLateMinute(attendanceDto);
		return isValid;
	}
	
	@PostMapping("/")
	public boolean setPolicy(@RequestBody PolicyDto policyDto) {
		PolicyDto dto = policyDao.selectOne(policyNo);
		policyDto.setPolicyInTime(policyDto.getPolicyInTime() + ":00");
		//System.err.println(policyDto);
		if(dto == null) {
			if(policyDto.getPolicyGraceTime() == 0) {
				policyDto.setPolicyType("자율");
			}
			else {
				policyDto.setPolicyType("고정");
			}
			return policyDao.insert(policyDto);
		}
		else {
			//update
			if(policyDto.getPolicyArrange() == 0) {
				policyDto.setPolicyType("고정");
			}
			else {
				policyDto.setPolicyType("자율");
			}
			return policyDao.update(policyDto);
		}
	}
	
	//' 하루동안의 로그
	@PostMapping("/{memberNo}")
	public List<AttendanceLogDto> getAttendanceLog(@PathVariable long memberNo, @RequestBody RequestAttendanceVO date ) {
			List<AttendanceLogDto> list = attendanceDao.aDay(memberNo, date);
		return list;
	}
	
	// 사유 등록
	@PostMapping("/reason/{memberNo}")
	public boolean insertReason(@PathVariable long memberNo, @RequestPart(value = "file", required = false) MultipartFile file,
		    @RequestPart("reason") AttendanceReasonDto reasonDto) throws IllegalStateException, IOException {
		AttachmentDto attachmentDto = attachmentService.save(file);
		long attandanceReasonNo = attendanceReasonDao.sequence();
		int attachmentNo = attachmentDto.getAttachmentNo();
		reasonDto.setAttendanceReasonNo(attandanceReasonNo);
		reasonDto.setMemberNo(memberNo);
		return attendanceReasonDao.insert(reasonDto) && attendanceReasonDao.connect(attandanceReasonNo, attachmentNo);
		//return false;
	}	
	
	//사유 삭제
	@DeleteMapping("/reason/{attendanceReasonNo}")
	public void deleteReason(@PathVariable long attendanceReasonNo) {
		int attachmentNo = attendanceReasonDao.image(attendanceReasonNo);
			attendanceReasonDao.deleteImage(attendanceReasonNo);
		 attendanceReasonDao.delete(attendanceReasonNo); // 중간테이블
		 attachmentService.delete(attachmentNo); // 어태치먼트 테이블
	}
	
	@PutMapping("/reason/{attendanceReasonNo}")
	public int update(@PathVariable long attendanceReasonNo, @RequestPart("file") MultipartFile file,
		    @RequestPart("reason") AttendanceReasonDto reasonDto) throws IOException {
		int attachmentNo = attendanceReasonDao.image(attendanceReasonNo);
		boolean isNull = file == null;
		
		boolean isValid = true;
		if(!isNull) {
			
		isValid = Arrays.equals(file.getBytes(), attachmentService.load(attachmentNo));
		}
		AttachmentDto attachmentDto = new AttachmentDto();
		 int attachNo = 0;
		if(!isValid && !isNull) {
			 attendanceReasonDao.deleteImage(attendanceReasonNo);
			 attachmentService.delete(attachmentNo);
			 attachmentDto = attachmentService.save(file);
			 attachNo = attachmentDto.getAttachmentNo();
			 attendanceReasonDao.connect(attendanceReasonNo, attachNo);
		}
		attendanceReasonDao.update(reasonDto);
		
		return attachNo;
	}
	
	@GetMapping("/reason/{memberNo}")
	public Map<String, Object> selectReason(@PathVariable long memberNo, @RequestBody RequestAttendanceVO vo){
		
		Map<String, Object> map = new HashMap<>();
		List<AttendanceReasonDto> list = attendanceReasonDao.selectByMemberAndDate(memberNo, vo);
		map.put("list", list);
		List<Integer> attachNoList = new LinkedList<>();
		if(list != null) {			
			for(AttendanceReasonDto dto : list) {
				attachNoList.add(attendanceReasonDao.image(dto.getAttendanceReasonNo()));
			}
			map.put("attachList", attachNoList);
		}
		map.put("list", list);
		return map;
	}
	
	// select reason list
	@PostMapping("/view/{memberNo}")
	public List<AttendanceReasonDto> selectViewResult(@PathVariable long memberNo, @RequestBody RequestResultByMonthVO vo ){
		List<AttendanceReasonDto> list = attendanceReasonDao.selectReasonList(memberNo, vo);
		return list;
	}
	
	// 이미지 pdf 미리보기
	@GetMapping("/attachment/{attendanceReasonNo}")
	public ResponseEntity<byte[]> loadAttachment(@PathVariable long attendanceReasonNo) throws IOException{
		int attachmentNo = attendanceReasonDao.image(attendanceReasonNo);
		AttachmentDto attachmentDto = attachmentDao.selectOne(attachmentNo);
		if(attachmentDto == null) throw new TargetNotFoundException();
		byte[] data = attachmentService.load(attachmentNo);
		HttpHeaders headers = new HttpHeaders();
		headers.set("Content-Type", attachmentDto.getAttachmentType());
		return new ResponseEntity<>(data, headers, HttpStatus.OK);
	}
	
	// attachmentNo
	@GetMapping("/attachmentNo/{attendanceReasonNo}")
	public AttachmentDto attachmentNo(@PathVariable long attendanceReasonNo) {
		int attachmentNo = attendanceReasonDao.image(attendanceReasonNo);
		return attachmentDao.selectOne(attachmentNo);
	}
	
	
	@PostMapping("/resultlist/{memberNo}")
	public Map<String, Object> selectResultList(@PathVariable long memberNo, @RequestBody RequestResultByMonthVO vo){
		Map<String, Object> map = new HashMap<>();
		List<AttendanceResultDto>list =  attendanceReasonDao.selectResultByMonth(memberNo, vo);
		map.put("attendanceResultList", list);
		return map;
	}
	
	
	
}



















