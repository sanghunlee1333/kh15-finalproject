package com.kh.acaedmy_final.dao.websocket;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.kh.acaedmy_final.dto.websocket.RoomChatAttachmentDto;

@Repository
public class RoomChatAttachmentDao {

	@Autowired
	private SqlSession sqlSession;
	
	public void insert(RoomChatAttachmentDto roomChatAttachmentDto) {
		sqlSession.insert("roomChatAttachment.insert", roomChatAttachmentDto);
	}
	
	public List<Integer> findAttachmentNosByRoomChatNo(Long roomChatNo) {
		return sqlSession.selectList("roomChatAttachment.findAttachmentNosByRoomChatNo", roomChatNo);
	}
}
