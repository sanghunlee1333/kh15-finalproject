package com.kh.acaedmy_final.dao.websocket;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.kh.acaedmy_final.dto.websocket.RoomDto;

@Repository
public class RoomDao {

	@Autowired
	private SqlSession sqlSession;
	
	public long getSequence() {
		return sqlSession.selectOne("room.sequence");
	}
	
	//방 생성
	public void insert(RoomDto roomDto) {
//		long roomNo = getSequence();//시퀀스를 통해서 방 번호를 조회
//		roomDto.setRoomNo(roomNo);//조회한 방 번호를 DTO에 설정
		sqlSession.insert("room.insert", roomDto);
		
		//방에 참여할 멤버들 처리
//		for(Long memberNo : roomDto.getMemberNos()) {
//			sqlSession.insert("room.enter", Map.of(
//					"roomNo", roomNo,
//					"memberNo", memberNo
//				));
//		}
	}
	
	//멤버 추가
	public void insertMembers(long roomNo, List<Long> memberNos) {
		for(Long memberNo : memberNos) {
			sqlSession.insert("room.enter", 
					Map.of("roomNo", roomNo, "memberNo", memberNo));
		}
	}
	
	//방 목록 조회
	public List<RoomDto> selectList() {
		return sqlSession.selectList("room.list");
	}
	
	//특정 방 조회
	public RoomDto selectOne(long roomNo) {
		return sqlSession.selectOne("room.find", roomNo);
	}
	
	//방 삭제
	public void delete(long roomNo) {
		sqlSession.delete("room.delete", roomNo);
	}
	
	//방 입장
	public void enterRoom(long roomNo, long memberNo) {
		Map<String, Object> list = new HashMap<>();
		list.put("roomNo", roomNo);
		list.put("memberNo", memberNo);
		System.err.println("roomno " + roomNo);
		System.err.println("memberNo " + memberNo  );
		sqlSession.insert("room.enter", list);
	}
	
	//사용자가 해당 채팅방에 입장했는지 확인
	public boolean checkRoom(long roomNo, long memberNo) {
		int count = sqlSession.selectOne("room.check", Map.of(
					"roomNo", roomNo,
					"memberNo", memberNo
				));
		return count > 0;
	}
	
	//사용자가 참여 중인 채팅방 목록 조회
	public List<RoomDto> selectListByMember(long memberNo) {
		return sqlSession.selectList("room.listByMember", memberNo);
	}
	
}
