package com.kh.acaedmy_final.restcontroller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.acaedmy_final.dao.AttendanceReasonDao;

@CrossOrigin
@RestController
@RequestMapping("/api/attendance/reason")
public class AttendanceReasonRestController {
	@Autowired
	private AttendanceReasonDao attendanceReasonDao;
//	@GetMapping("/{memberNo}")
//	pubilc List<AttendanceLogDto> 
}
