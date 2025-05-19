package com.kh.acaedmy_final.dao;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.kh.acaedmy_final.dto.AttendanceLogDto;
import com.kh.acaedmy_final.dto.AttendanceResultDto;
import com.kh.acaedmy_final.vo.RequestAttendanceVO;

@Repository
public class AttendanceDao {
	@Autowired
	private SqlSession sqlSession;

	public long sequence() {
	//	System.out.println("sequence");
		return sqlSession.selectOne("attendance.sequence");
	}
	public long sequenceResult() {
		return sqlSession.selectOne("attendance.sequenceResult");
	}
	
	public boolean inTime(	AttendanceLogDto dto ) {
	//	System.out.println("inTIME");
		
		return sqlSession.insert("attendance.inTime", dto) > 0;
	}
	public boolean outTime(	AttendanceLogDto dto ) {
		//System.out.println("inTIME");
		return sqlSession.insert("attendance.outTime", dto) > 0;
	}
	
	public AttendanceLogDto last(long attendanceNo) {
		return sqlSession.selectOne("attendance.getOne", attendanceNo);
	}
	public AttendanceLogDto last(AttendanceLogDto dto) {
		return sqlSession.selectOne("attendance.getOne", dto);
	}
	
	// 하루 전체 기록들
	public List<AttendanceLogDto> aDay(long memberNo, RequestAttendanceVO day){
		// day = 20250506
		
		int yearSt = Integer.parseInt(day.getYear()); 
		int monthSt = Integer.parseInt(day.getMonth());
		int daySt = Integer.parseInt(day.getDay());
		
		LocalDateTime startDay = LocalDateTime.of(yearSt, monthSt, daySt, 0, 0, 0);
		LocalDateTime endDay = LocalDateTime.of(yearSt, monthSt, daySt, 23, 59, 59);
		
		Map<String, Object> map = new HashMap<>();
		map.put("memberNo", memberNo);
		map.put("startDay", startDay);
		map.put("endDay", endDay);
		
		return sqlSession.selectList("attendance.getAllByDay",map);
	}
	
	// 하루 보고
	public void reportDay(AttendanceResultDto todayResult) {
		sqlSession.insert("attendance.addResult", todayResult);
	}

	public AttendanceResultDto selectResult(long memberNo, RequestAttendanceVO day) {
		int yearSt = Integer.parseInt(day.getYear()); 
		int monthSt = Integer.parseInt(day.getMonth());
		int daySt = Integer.parseInt(day.getDay());
		Map<String, Object> map = new HashMap<>();
		LocalDate attendanceResultDay = LocalDate.of(yearSt, monthSt, daySt);
		map.put("attendanceResultDay", attendanceResultDay);
		map.put("memberNo", memberNo);
		return sqlSession.selectOne("attendance.findResult", map);
	}
	
	
	public boolean validDup(LocalDate day, long memberNo) {
		Map<String,Object> map = new HashMap<>();
		map.put("attendanceResultDay", day);
		map.put("memberNo", memberNo);
		//List<AttendanceResultDto> dto = sqlSession.selectList("attendance.findResult", map);
		AttendanceResultDto dto = sqlSession.selectOne("attendance.findResult", map);
		System.out.println(dto);
		boolean isValid = dto == null;
		return isValid;
	}
	public boolean update(AttendanceResultDto dto) {
		System.err.println(dto.getAttendanceResultOutTime());
		return sqlSession.update("attendance.updateResult", dto) > 0;
	}
	
	public AttendanceResultDto selectResult(LocalDate day, long memberNo) {
		Map<String,Object> map = new HashMap<>();
		map.put("attendanceResultDay", day);
		map.put("memberNo", memberNo);
		return sqlSession.selectOne("attendance.findResult", map);
	}
	
	
//	public AttendanceResultDto result() {
//		
//	}
	public List<AttendanceLogDto> getInDay (long memberNo, LocalDateTime startDay, LocalDateTime endDay){
		Map<String, Object> params = new HashMap<>();
		params.put("memberNo", memberNo);
		params.put("startDay", startDay);
		params.put("endDay", endDay);
		return sqlSession.selectList("attendance.getAllInByDay" , params);
	}
 	
	public List<AttendanceLogDto> getOutDay (long memberNo, LocalDateTime startDay, LocalDateTime endDay){
		Map<String, Object> params = new HashMap<>();
		params.put("memberNo", memberNo);
		params.put("startDay", startDay);
		params.put("endDay", endDay);
		return sqlSession.selectList("attendance.getAllOutByDay" , params);
	}
	
	public int countLate(Map<String, Object> map) {
		String attendanceResultState = "%지각%";
		map.put("attendanceResultState", attendanceResultState);
		return sqlSession.selectOne("attendance.selectResultByLate", map);
	}
 	
	public int countEarly(Map<String, Object> map) {
		String attendanceResultState = "%조퇴%";
		map.put("attendanceResultState", attendanceResultState);
		return sqlSession.selectOne("attendance.selectResultByEarly", map);
	}
	
	public int countAttendance(long memberNo) {
		LocalDate now = LocalDate.now();
		Map<String, Object> map = new HashMap<>();
		map.put("attendanceLogDay", now);
		map.put("memberNo", memberNo);
		sqlSession.selectOne("attendance.checkAttendance",map);
		return 0;
		
	}
	
}












