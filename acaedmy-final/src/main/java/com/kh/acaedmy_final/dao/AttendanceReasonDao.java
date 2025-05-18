package com.kh.acaedmy_final.dao;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.kh.acaedmy_final.dto.AttendanceReasonDto;
import com.kh.acaedmy_final.vo.RequestAttendanceVO;
import com.kh.acaedmy_final.vo.RequestResultByMonthVO;

@Repository
public class AttendanceReasonDao {
	@Autowired
	private SqlSession sqlSession;
	
	public long sequence() {
		return sqlSession.selectOne("attendance.sequenceReason");
	}
	public boolean insert(AttendanceReasonDto dto) {
		return sqlSession.insert("attendance.addReason",dto)>0;
	}
	public boolean delete(AttendanceReasonDto dto) {
		return sqlSession.delete("attendance.deleteReason", dto) > 0;
	}
	public boolean delete(long attendanceReasonNo) {
		return sqlSession.delete("attendance.deleteReason", attendanceReasonNo) > 0;
	}
	
	public AttendanceReasonDto selectOne(long attendanceReasonNo) {
		return sqlSession.selectOne("attendance.findReason", attendanceReasonNo);
	}
	public AttendanceReasonDto selectOne(AttendanceReasonDto dto) {
		return sqlSession.selectOne("attendance.findReason", dto);
	}
	public List<AttendanceReasonDto> selectByMemberAndDate(long attendanceResultNo, RequestAttendanceVO vo) {
		return sqlSession.selectList("attendance.findReasonByResult", attendanceResultNo);
	}
	
	public boolean update(AttendanceReasonDto dto) {
		return sqlSession.update("attendance.updateReason", dto) > 0;
	}
	
	public boolean connect(long attendanceReasonNo, int attachmentNo) {
		Map<String, Object> params = new HashMap<>();
		params.put("attendanceReasonNo",attendanceReasonNo);
		params.put("attachmentNo", attachmentNo);
		return sqlSession.insert("attendance.connect", params) > 0;
	}
	
	public int image(long attendanceReasonNo) {
		return sqlSession.selectOne("attendance.findImages", attendanceReasonNo);
	}
	
	public boolean deleteImage(long attendanceReasonNo) {
		return sqlSession.delete("attendance.deleteAttendanceImage",attendanceReasonNo) > 0;
	}
	public List<AttendanceReasonDto> selectResultByMonth(long memberNo, RequestResultByMonthVO vo) {
		// TODO Auto-generated method stub
		Map<String, Object> params = new HashMap<>();
		params.put("memberNo", memberNo);
		String trans = vo.getYear() + "-" + vo.getMonth() + "-%";
		params.put("attendanceReasonDate", trans);
		//System.err.println(trans);
	//	System.err.println(memberNo);
//		System.out.println(vo);
		//System.out.println(sqlSession.selectList("attendance.selectReason", memberNo));
	//	System.out.println("console");
	//	System.out.println(sqlSession.selectList("attendance.selectReasonByMonth", params));
		return sqlSession.selectList("attendance.selectReasonByMonth", params);
	}
	
//	public List<att>
	
}






