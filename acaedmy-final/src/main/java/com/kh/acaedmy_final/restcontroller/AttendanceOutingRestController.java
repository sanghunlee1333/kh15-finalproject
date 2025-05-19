package com.kh.acaedmy_final.restcontroller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.acaedmy_final.dao.AttendanceOutingDao;
import com.kh.acaedmy_final.dto.AttendanceOutingDto;
import com.kh.acaedmy_final.vo.RequestResultByMonthVO;

@CrossOrigin
@RequestMapping("/api/outing")
@RestController
public class AttendanceOutingRestController {
	@Autowired
	private AttendanceOutingDao attendanceOutingDao;
	
//	
	@PostMapping("/add/{memberNo}")
	public boolean addOuting(@PathVariable long memberNo, @RequestBody AttendanceOutingDto dto) {
		long outingNo = attendanceOutingDao.sequence();
		dto.setOutingNo(outingNo);
		dto.setMemberNo(memberNo);
//		System.out.println(memberNo);
//		System.out.println(dto);
		return attendanceOutingDao.insert(dto);

	}
//	
	@DeleteMapping("/{outingNo}")
	public boolean removeOuting(@PathVariable long outingNo) {
//		return attendanceOutingDao.delete(outingNo);
		
//		System.err.println("DELDELDELDEL");
//		System.out.println(outingNo);
		return attendanceOutingDao.delete(outingNo);
	}
	
	@PostMapping("/list/{memberNo}")
	public List<AttendanceOutingDto> selectOutingList(@PathVariable long memberNo, @RequestBody RequestResultByMonthVO vo){
//		System.err.println("CONTROLLER");
//		System.out.println(memberNo);
//		System.out.println(vo);
//		System.out.println(attendanceOutingDao.selectListOuting(memberNo, vo));
		return (attendanceOutingDao.selectListOuting(memberNo, vo));
	}
	
}














