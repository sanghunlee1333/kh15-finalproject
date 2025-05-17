package com.kh.acaedmy_final.restcontroller;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
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

import com.kh.acaedmy_final.dao.AttendanceDao;
import com.kh.acaedmy_final.dao.AttendanceReasonDao;
import com.kh.acaedmy_final.dao.MemberDao;
import com.kh.acaedmy_final.dao.PolicyDao;
import com.kh.acaedmy_final.dto.AttachmentDto;
import com.kh.acaedmy_final.dto.AttendanceLogDto;
import com.kh.acaedmy_final.dto.AttendanceReasonDto;
import com.kh.acaedmy_final.dto.AttendanceResultDto;
import com.kh.acaedmy_final.dto.MemberDto;
import com.kh.acaedmy_final.dto.PolicyDto;
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
		System.out.println(dto);
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
		System.err.println(policyDto);
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
	
	@PostMapping("/{memberNo}")
	public List<AttendanceLogDto> getAttendanceLog(@PathVariable long memberNo, @RequestBody RequestAttendanceVO date ) {
//			System.out.println("ENTER CONTROLLER");
//			System.err.println(date);
			
			List<AttendanceLogDto> list = attendanceDao.aDay(memberNo, date);
//			System.out.println(list);
//			for(AttendanceLogDto log : list) {
//				System.out.println(log);
//			}
//			System.out.println(list.size());
		return list;
	}
//	@PostMapping("/{memberNo}")
//	public boolean addLog
	
	@PostMapping("/reason/{memberNo}")
	public boolean insertReason(@PathVariable long memberNo, @RequestPart(value = "file", required = false) MultipartFile file,
		    @RequestPart("reason") AttendanceReasonDto reasonDto) throws IllegalStateException, IOException {
		AttachmentDto attachmentDto = attachmentService.save(file);
		long attandanceReasonNo = attendanceReasonDao.sequence();
		int attachmentNo = attachmentDto.getAttachmentNo();
//		System.out.println("file");
//		System.out.println(file);
//		System.out.println("dto");
//		System.out.println(reasonDto);
//		System.out.println("omemberNo");
//		System.out.println(memberNo);
		reasonDto.setAttendanceReasonNo(attandanceReasonNo);
		reasonDto.setMemberNo(memberNo);
		return attendanceReasonDao.insert(reasonDto) && attendanceReasonDao.connect(attandanceReasonNo, attachmentNo);
		//return false;
	}	
	
	@DeleteMapping("/reason/{attendanceReasonNo}")
	public void deleteReason(@PathVariable long attendanceReasonNo) {
		int attachmentNo = attendanceReasonDao.image(attendanceReasonNo);
			System.out.println(attendanceReasonNo + " reason NO");
			System.out.println(attachmentNo);
		 attendanceReasonDao.delete(attendanceReasonNo); // 중간테이블
	//	 attachmentService.delete(attachmentNo); // 어태치먼트 테이블
		//System.err.println("CONTROLLER ENTER DELETE");
		//System.err.println(attendanceReasonNo);
		//return true;
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
	
	@PostMapping("/view/{memberNo}")
	public List<AttendanceReasonDto> selectViewResult(@PathVariable long memberNo, @RequestBody RequestResultByMonthVO vo ){
		System.out.println(vo);
		System.err.println("CONTROLLER ENTHER");
		System.out.println(memberNo);
		List<AttendanceReasonDto> list = attendanceReasonDao.selectResultByMonth(memberNo, vo);
	//	System.err.println(list);
//		for(AttendanceReasonDto dto : list) {
//			System.out.println(dto);
//		}
		return list;
	}
	

	
	
	
}



















