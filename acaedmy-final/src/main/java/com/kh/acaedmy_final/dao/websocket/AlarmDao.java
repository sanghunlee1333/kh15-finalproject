package com.kh.acaedmy_final.dao.websocket;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.kh.acaedmy_final.dto.websocket.AlarmDto;
import com.kh.acaedmy_final.vo.websocket.AlarmResponseVO;

@Repository
public class AlarmDao {

	@Autowired
	private SqlSession sqlSession;
	
	//시퀀스 생성
	public long sequence() {
		return sqlSession.selectOne("alarm.sequence");
	}
	
	//알림 등록
	public void insert (AlarmDto alarmDto) {
		sqlSession.insert("alarm.insert", alarmDto);
	}
	
	//알림 삭제(일정 삭제 시 관련 알림들)
	public boolean deleteByPlanNo(long planNo) {
		return sqlSession.delete("alarm.deleteByPlanNo", planNo) > 0;
	}
	
	//알림 삭제(1개)
	public boolean delete(long alarmNo) {
		return sqlSession.delete("alarm.delete", alarmNo) > 0;
	}
	
	//알림 삭제(전체)
	public boolean deleteAll(long receiverNo) {
		return sqlSession.delete("alarm.deleteAll", receiverNo) > 0;
	}
		
	//전체 알림 조회(수신자 기준)
	public List<AlarmResponseVO> selectListByReceiver(long receiverNo) {
		return sqlSession.selectList("alarm.listByReceiver", receiverNo);
	}
	
	//알림 모두 읽음 처리
	public int updateReadByReceiver(long receiverNo) {
		return sqlSession.update("alarm.updateReadByReceiver", receiverNo);
	}
	
	//안 읽은 알림 개수 세기
	public int countUnRead(long receiverNo) {
		return sqlSession.selectOne("alarm.countUnRead", receiverNo);
	}
	
	//상세 알림 조회(DTO용)
	public AlarmDto selectOne(long alarmNo) {
		return sqlSession.selectOne("alarm.detail");
	}
	
	//상세 알림 조회(프론트 응답용-VO)
	public AlarmResponseVO getAlarm(long alarmNo) {
		return sqlSession.selectOne("alarm.find", alarmNo);
	}
	
	//알림 조회(무한 스크롤)
	public List<AlarmResponseVO> selectListByReceiverWithPaging(long receiverNo, int offset, int size) {
		Map<String, Object> params = new HashMap<>();
		params.put("receiverNo", receiverNo);
		params.put("offset", offset);
		params.put("size", size);
		
		return sqlSession.selectList("alarm.listByReceiverWithPaging", params);
	}
	
}
