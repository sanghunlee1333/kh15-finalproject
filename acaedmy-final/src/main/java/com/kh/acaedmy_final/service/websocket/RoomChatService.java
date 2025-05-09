package com.kh.acaedmy_final.service.websocket;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.kh.acaedmy_final.dao.MemberDao;
import com.kh.acaedmy_final.dao.websocket.RoomChatDao;
import com.kh.acaedmy_final.dao.websocket.RoomDao;
import com.kh.acaedmy_final.dto.MemberDto;
import com.kh.acaedmy_final.dto.websocket.RoomChatDto;
import com.kh.acaedmy_final.dto.websocket.RoomDto;
import com.kh.acaedmy_final.error.TargetNotFoundException;
import com.kh.acaedmy_final.vo.ClaimVO;
import com.kh.acaedmy_final.vo.websocket.ChatResponseVO;
import com.kh.acaedmy_final.vo.websocket.ChatRoomResponseVO;

@Service
public class RoomChatService {
	
	@Autowired
	private RoomChatDao roomChatDao;
	
	@Autowired
	private RoomDao roomDao;
	
	@Autowired
	private MemberDao memberDao;
	
	@Autowired
	private SimpMessagingTemplate messagingTemplate;
	
	//채팅 메세지를 DB에 저장하고, 실시간으로 WebSocket을 통해 전송하는 메소드
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
		roomChatDto.setRoomChatTime(LocalDateTime.now());
		
		//DB에 저장
		roomChatDao.insert(roomChatDto);
		
		//방 목록 갱신을 위한 WebSocket 메세지
		messagingTemplate.convertAndSend("/topic/room-list", "REFRESH");
		
		//채팅방에 구독된 사용자들에게 실시간 메세지 전송
		sendRealTimeMessage(roomNo, roomChatDto);
	}
	
	//최근 채팅 메세지 조회(이름 포함)
	public ChatRoomResponseVO getRecentChats(long roomNo, int count, ClaimVO claimVO) {
	    Long memberNo = claimVO.getMemberNo();
	    if (!roomDao.checkRoom(roomNo, memberNo)) {
	        throw new TargetNotFoundException("해당 채팅방(" + roomNo + ")에 참여하지 않은 사용자입니다");
	    }

	    RoomDto roomDto = roomDao.selectOne(roomNo);
	    String roomTitle = roomDto.getRoomTitle();

	    List<RoomChatDto> messageDtos = roomChatDao.listRecent(roomNo, count);
	    List<ChatResponseVO> messages = new ArrayList<>();
	    for (RoomChatDto dto : messageDtos) {
	        String senderName = "알 수 없음";
	        if (dto.getRoomChatSender() != null) {
	            MemberDto sender = memberDao.selectOne(dto.getRoomChatSender());
	            if (sender != null) {
	                senderName = sender.getMemberName();
	            }
	        }

	        messages.add(ChatResponseVO.builder()
	            .roomNo(dto.getRoomChatOrigin())
	            .senderNo(dto.getRoomChatSender())
	            .senderName(senderName)
	            .content(dto.getRoomChatContent())
	            .time(dto.getRoomChatTime())
	            .build());
	    }

	    ChatRoomResponseVO response = new ChatRoomResponseVO();
	    response.setRoomTitle(roomTitle);
	    response.setMessages(messages);
	    return response;
	}
	
	//WebSocket을 통해 채팅방에 구독된 사용자에게 실시간 메세지 전송
	private void sendRealTimeMessage(Long roomNo, RoomChatDto roomChatDto) {
		String destination = "/public/chat/" + roomNo;
		 
		String senderName = "알 수 없음";
		if(roomChatDto.getRoomChatSender() != null) {
			MemberDto sender = memberDao.selectOne(roomChatDto.getRoomChatSender());
			if(sender != null) {
				senderName = sender.getMemberName();
			}
		}
		
		ChatResponseVO chat = ChatResponseVO.builder()
					.roomNo(roomChatDto.getRoomChatOrigin())
					.senderNo(roomChatDto.getRoomChatSender())
					.senderName(senderName)
					.content(roomChatDto.getRoomChatContent())
					.time(roomChatDto.getRoomChatTime())
				.build();
		
		messagingTemplate.convertAndSend(destination, chat);
	}
	
}
