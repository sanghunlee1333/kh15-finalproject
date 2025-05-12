package com.kh.acaedmy_final.dao;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.kh.acaedmy_final.dto.PlanReceiveDto;
import com.kh.acaedmy_final.vo.PlanReceiveResponseVO;

@Repository
public class PlanReceiveDao {

	@Autowired
	private SqlSession sqlSession;
	
	//등록
	public void insert(PlanReceiveDto planReceiveDto) {
		sqlSession.insert("planReceive.add", planReceiveDto);
	}
	
	//삭제
	public boolean delete(long planReceiveNo) {
		return sqlSession.delete("planReceive.delete", planReceiveNo) > 0;
	}
	
	//전체 조회
	public List<PlanReceiveDto> selectList(long planReceiveReceiverNo) {
		return sqlSession.selectList("planReceive.list", planReceiveReceiverNo);
	}
	
	//목록 조회(일정에 포함된 수신자 목록)
	public List<Long> selectReceiverList(long planNo) {
		return sqlSession.selectList("planReceive.listReceiver", planNo);
	}
	
	//상세 조회
	public PlanReceiveDto selectOne(long planReceiveNo) {
		return sqlSession.selectOne("planReceive.detail", planReceiveNo);
	}
	
	//일정 + 보낸사람 이름 + 수신자 상태 조회
	public List<PlanReceiveResponseVO> listReceived(long memberNo) {
        return sqlSession.selectList("planReceive.listReceived", memberNo);
    }
	
	//일정 수락
	public void accept(long planNo, long planReceiverNo) {
		Map<String, Object> params = new HashMap<>();
		params.put("planNo", planNo);
		params.put("receiverNo", planReceiverNo);
		sqlSession.update("planReceive.accept", params);
	}
	
	//수락한 일정 조회
	public List<PlanReceiveResponseVO> listAccepted(long memberNo) {
		return sqlSession.selectList("planReceive.listAccepted", memberNo);
	}
	
}
