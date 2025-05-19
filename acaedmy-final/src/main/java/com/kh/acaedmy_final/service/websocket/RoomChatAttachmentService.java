package com.kh.acaedmy_final.service.websocket;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kh.acaedmy_final.dao.websocket.RoomChatAttachmentDao;
import com.kh.acaedmy_final.dto.websocket.RoomChatAttachmentDto;

@Service
public class RoomChatAttachmentService {
	
	@Autowired
	private RoomChatAttachmentDao roomChatAttachmentDao;
	
	public void connect(Long roomChatNo, int attachmentNo) {
		RoomChatAttachmentDto roomChatAttachmentDto = RoomChatAttachmentDto.builder()
					.roomChatNo(roomChatNo)
					.attachmentNo(attachmentNo)
				.build();
		roomChatAttachmentDao.insert(roomChatAttachmentDto);
	}
	
	//첨부 파일 번호 목록 조회
	public List<Integer> findAttachmentNos(Long roomChatNo) {
		return roomChatAttachmentDao.findAttachmentNosByRoomChatNo(roomChatNo);
	}
}
