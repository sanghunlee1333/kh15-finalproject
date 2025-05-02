package com.kh.acaedmy_final.dao.websocket;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.kh.acaedmy_final.dto.websocket.RoomChatDto;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Repository
public class RoomChatDao {
	
	@Autowired
	private SqlSession sqlSession;
	
	public long sequence() {
		return sqlSession.selectOne("roomChat.sequence");
	}
	
	//채팅 메세지를 DB에 저장하는 메소드
	public void insert(RoomChatDto roomChatDto) {
		sqlSession.insert("roomChat.insert", roomChatDto);
	}
	
	//방의 모든 채팅 메세지를 조회하는 메소드
	public List<RoomChatDto> listByRoom(long roomNo) {
		return sqlSession.selectList("roomChat.listByRoom", roomNo);
	}
	
	//방의 최근 채팅 메세지 일부를 조회하는 메소드
	public List<RoomChatDto> listRecent(long roomNo, int count) {
		Map<String, Object> params = new HashMap<>();
		params.put("roomNo", roomNo);
		params.put("count", count);
		//방 번호와 개수 기준으로 최근 채팅을 가져옴
		return sqlSession.selectList("roomChat.listRecent", params);
	}
}
