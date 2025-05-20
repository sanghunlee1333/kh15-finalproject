package com.kh.acaedmy_final.dao;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.kh.acaedmy_final.dto.PlanDto;
import com.kh.acaedmy_final.vo.PlanWithReceiversVO;

@Repository
public class PlanDao {

	@Autowired
	private SqlSession sqlSession;
	
	//시퀀스 생성
	public long sequence() {
	    return sqlSession.selectOne("plan.sequence");
	}
	
	//등록
	public void insert(PlanDto planDto) {
		sqlSession.insert("plan.make", planDto);
	}
	
	//삭제
	public boolean delete(long planNo) {
		return sqlSession.delete("plan.delete", planNo) > 0;
	}
	
	//전체 조회(개인 + 팀 + 전체)
	public List<PlanDto> selectAllList(long memberNo) {
		return sqlSession.selectList("plan.allList", memberNo);
	}
	
	//전체 조회(개인-Todo)
	public List<PlanDto> selectPersonalList(long memberNo) {
		return sqlSession.selectList("plan.personalList", memberNo);
	}
	
	//전체 조회(팀-일정)
	public List<PlanDto> selectTeamList(long planSenderNo){
		return sqlSession.selectList("plan.teamList", planSenderNo);
	}
	
	//상세 조회
	public PlanDto selectOne(long planNo) {
		return sqlSession.selectOne("plan.detail", planNo);
	}
	
	//목록 조회(일정 번호별로 수신자 번호들 조회)
	public List<Long> selectReceiverList(long planNo) {
		return sqlSession.selectList("plan.listReceiver", planNo);
	}
	
	//수정(일정 달성 여부)
	public boolean updateStatus(long planNo, String planStatus) {
		Map<String, Object> params = new HashMap<>();
		params.put("planNo", planNo);
		params.put("planStatus", planStatus);
		return sqlSession.update("plan.updateStatus", params) > 0;
	}
	
	//조회(일정 시작 30분 전 알림)
	public List<PlanWithReceiversVO> findPlansStartingSoon(Timestamp targetTime) {
		return sqlSession.selectList("plan.findPlansStartingSoon", targetTime);
	}

	//조회(일정 시작 알림)
	public List<PlanWithReceiversVO> findPlansStartingAt(Timestamp planStartTime) {
	    return sqlSession.selectList("plan.findPlansStartingAt", planStartTime);
	}

	//조회(일정 종료 알림)
	public List<PlanWithReceiversVO> findPlansEndingAt(Timestamp planEndTime) {
		return sqlSession.selectList("plan.findPlansEndingAt", planEndTime);
	}
	
	//관리자 휴일등록
	public boolean insertByAdmin(PlanDto dto) {
		return sqlSession.insert("plan.makeByAdmin", dto) > 0;
	}
	
	
	
}






























