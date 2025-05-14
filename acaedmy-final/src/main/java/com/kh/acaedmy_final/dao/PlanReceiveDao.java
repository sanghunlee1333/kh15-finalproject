package com.kh.acaedmy_final.dao;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.kh.acaedmy_final.dto.PlanReceiveDto;
import com.kh.acaedmy_final.vo.PlanReceiveResponseVO;
import com.kh.acaedmy_final.vo.PlanReceiverStatusVO;

@Repository
public class PlanReceiveDao {

	@Autowired
	private SqlSession sqlSession;
	
	//등록
	public void insert(PlanReceiveDto planReceiveDto) {
		sqlSession.insert("planReceive.add", planReceiveDto);
	}
	
	//삭제
	public boolean delete(long planNo, long receiverNo) {
		Map<String, Object> map = new HashMap<>();
	    map.put("planReceivePlanNo", planNo);
	    map.put("planReceiveReceiverNo", receiverNo);
	    return sqlSession.delete("planReceive.delete", map) > 0;
	}
	
	//전체 조회
	public List<PlanReceiveDto> selectList(long planReceiveReceiverNo) {
		return sqlSession.selectList("planReceive.list", planReceiveReceiverNo);
	}
	
	//목록 조회(특정 일정에 포함된 참여자의 일정 상태)
	public List<PlanReceiverStatusVO> selectReceiverList(long planNo) {
		return sqlSession.selectList("planReceive.listReceiver", planNo);
	}
	
	//상세 조회
	public PlanReceiveDto selectOne(long planNo, long receiverNo) {
	    Map<String, Object> params = new HashMap<>();
	    params.put("planReceivePlanNo", planNo);
	    params.put("planReceiveReceiverNo", receiverNo);
	    return sqlSession.selectOne("planReceive.detail", params);
	}
	
	//목록 조회(내가 받은 모든 일정)
	public List<PlanReceiveResponseVO> listReceived(long memberNo) {
        return sqlSession.selectList("planReceive.listReceived", memberNo);
    }
	
	//일정 수락
	public void accept(long planNo, long planReceiveReceiverNo) {
		Map<String, Object> params = new HashMap<>();
		params.put("planNo", planNo);
		params.put("receiverNo", planReceiveReceiverNo);
		sqlSession.update("planReceive.accept", params);
	}
	
	//수정(참여자 + 수신자의 일정 상태)
	public boolean updateReceiveStatus(long planNo, long planReceiveReceiverNo, String planReceiveStatus) {
		Map<String, Object> params = new HashMap<>();
		params.put("planNo", planNo);
		params.put("planReceiveReceiverNo", planReceiveReceiverNo);
		params.put("planReceiveStatus", planReceiveStatus);
		return sqlSession.update("planReceive.updateReceiveStatus", params) > 0;
	}
	
	//수락한 일정 조회
	public List<PlanReceiveResponseVO> listAccepted(long memberNo) {
		return sqlSession.selectList("planReceive.listAccepted", memberNo);
	}
	
	//최종 일성 달성 여부 체크(총 참여자 수 = 완료된 참여자 수)
	public boolean isAllComplete(long planNo) {
	    int total = sqlSession.selectOne("planReceive.countAllReceivers", planNo);
	    int done = sqlSession.selectOne("planReceive.countCompletedReceivers", planNo);
	    return total == done;
	}
	
}
