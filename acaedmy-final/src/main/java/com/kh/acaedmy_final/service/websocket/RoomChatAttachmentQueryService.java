package com.kh.acaedmy_final.service.websocket;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kh.acaedmy_final.dto.AttachmentDto;

@Service
public class RoomChatAttachmentQueryService {
	
	@Autowired
	private SqlSession sqlSession;
	
	public List<AttachmentDto> findByNos(List<Integer> attachmentNos) {
		if(attachmentNos == null || attachmentNos.isEmpty()) return List.of();
		return sqlSession.selectList("roomChatAttachment.findAttachmentDetails", attachmentNos);
	}
}
