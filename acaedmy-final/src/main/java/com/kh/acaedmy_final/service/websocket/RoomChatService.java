package com.kh.acaedmy_final.service.websocket;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kh.acaedmy_final.dao.websocket.RoomChatDao;
import com.kh.acaedmy_final.dao.websocket.RoomDao;
import com.kh.acaedmy_final.dto.websocket.RoomChatDto;
import com.kh.acaedmy_final.error.TargetNotFoundException;
import com.kh.acaedmy_final.vo.ClaimVO;

@Service
public class RoomChatService {
	
	@Autowired
	private RoomChatDao roomChatDao;
	
	@Autowired
	private RoomDao roomDao;
	
	//채팅 메세지를 DB에 저장하는 메소드
	public void sendMessage(RoomChatDto roomChatDto, ClaimVO claimVO) {
		Long roomNo = roomChatDto.getRoomChatOrigin();
		Long senderNo = claimVO.getMemberNo();
		
		//사용자가 해당 채팅방에 참여 했는지 확인
		boolean isEnter = roomDao.checkRoom(roomNo, senderNo);
		if(!isEnter) {
			throw new TargetNotFoundException("해당 채팅방("+roomNo+ ")에 참여하지 않은 사용자입니다");
		}
		
		// 채팅 번호 생성 및 전송자 등록
		roomChatDto.setRoomChatNo(roomChatDao.sequence());
		roomChatDto.setRoomChatSender(senderNo);
		
		//DB에 저장
		roomChatDao.insert(roomChatDto);
	}
	
	//최근 채팅 메세지를 조회하는 메소드
	public List<RoomChatDto> getRecentChats(long roomNo, int count, int offset, ClaimVO claimVO) {
		//사용자가 해당 채팅방에 참여했는지 확인
		Long memberNo = claimVO.getMemberNo();
		boolean isEnter = roomDao.checkRoom(roomNo, memberNo);
		if(!isEnter) {
			throw new TargetNotFoundException("해당 채팅방("+roomNo+ ")에 참여하지 않은 사용자입니다");
		}
		
		//최근 채팅 메세지 조회
		return roomChatDao.listRecent(roomNo, count, offset);
	}
}
