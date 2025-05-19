package com.kh.acaedmy_final.dao;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.kh.acaedmy_final.dto.AttendanceOutingDto;
import com.kh.acaedmy_final.vo.RequestResultByMonthVO;

@Repository
public class AttendanceOutingDao {
	@Autowired
	private SqlSession sqlSession;
	
	public AttendanceOutingDto selectOne(long outingNo) {
		return sqlSession.selectOne("attendance.selectOuting", outingNo);
	}

	public boolean delete(long outingNo) {
		return sqlSession.delete("attendance.deleteOuting", outingNo) > 0;
	}
	
	public long sequence() {
		return sqlSession.selectOne("attendance.sequenceOuting");
	}
	public boolean insert(AttendanceOutingDto dto) {
		return sqlSession.insert("attendance.addOuting", dto) > 0;
	}
	
	public List<AttendanceOutingDto> selectListOuting(long memberNo , RequestResultByMonthVO vo){
		int year = Integer.parseInt(vo.getYear());
		int month = Integer.parseInt(vo.getMonth());
		
		LocalDate startDay = LocalDate.of(year, month, 1);
		LocalDate endDay = LocalDate.of(year, month, startDay.lengthOfMonth());
		
		Map<String, Object> map = new HashMap<>();
		map.put("memberNo", memberNo);
		map.put("startDay", startDay);
		map.put("endDay", endDay);
		return sqlSession.selectList("attendance.selectListOuting", map);
	}
	
}














