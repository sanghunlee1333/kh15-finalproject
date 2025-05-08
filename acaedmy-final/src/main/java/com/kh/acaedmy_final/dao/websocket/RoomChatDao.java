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
	
	// 채팅 메시지 번호 시퀀스를 조회하는 메소드
	public long sequence() {
		try {
			return sqlSession.selectOne("roomChat.sequence");
		} catch (Exception e) {
			throw new RuntimeException("채팅 메시지 번호 시퀀스 조회 실패", e);
		}
	}
		
	// 채팅 메시지를 DB에 저장하는 메소드
	public void insert(RoomChatDto roomChatDto) {
		try {
			sqlSession.insert("roomChat.insert", roomChatDto);
		} catch (Exception e) {
			throw new RuntimeException("채팅 메시지 저장 실패", e);
		}
	}
		
	// 방 번호 기준 모든 채팅 메시지를 조회하는 메소드
	public List<RoomChatDto> listByRoom(long roomNo) {
		try {
			return sqlSession.selectList("roomChat.listByRoom", roomNo);
		} catch (Exception e) {
			throw new RuntimeException("방 번호에 해당하는 채팅 메시지 조회 실패", e);
		}
	}
		
	// RoomChatDao.java
	public List<RoomChatDto> listRecent(long roomNo, int count) {
	    Map<String, Object> params = new HashMap<>();
	    params.put("roomChatOrigin", roomNo);
	    params.put("count", count);
	    return sqlSession.selectList("roomChat.listRecent", params);
	}
}
