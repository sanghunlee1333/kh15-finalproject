package com.kh.acaedmy_final.service.websocket;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.kh.acaedmy_final.dao.MemberDao;
import com.kh.acaedmy_final.dao.websocket.RoomChatDao;
import com.kh.acaedmy_final.dao.websocket.RoomDao;
import com.kh.acaedmy_final.dto.AttachmentDto;
import com.kh.acaedmy_final.dto.MemberDto;
import com.kh.acaedmy_final.dto.websocket.RoomChatDto;
import com.kh.acaedmy_final.dto.websocket.RoomDto;
import com.kh.acaedmy_final.error.TargetNotFoundException;
import com.kh.acaedmy_final.service.AttachmentService;
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
	private AttachmentService attachmentService;
	
	@Autowired
	private RoomChatAttachmentService roomChatAttachmentService;
	
	@Autowired
	private RoomChatAttachmentQueryService roomChatAttachmentQueryService;
	
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
		
		if(roomChatDto.getRoomChatType() == null || roomChatDto.getRoomChatType().trim().isEmpty()) {
			roomChatDto.setRoomChatType("CHAT");
		}
		if (roomChatDto.getRoomChatContent() == null || roomChatDto.getRoomChatContent().isBlank()) {
			roomChatDto.setRoomChatContent("");
		}

		
		//DB에 저장
		roomChatDao.insert(roomChatDto);
		
		//안읽은 메세지 수 증가
		roomDao.increaseUnreadCount(roomNo, senderNo);
		
		List<Long> participantNos = roomDao.findParticipantNos(roomNo);
		for(Long participantNo : participantNos) {
			messagingTemplate.convertAndSend("/topic/room-list/" + participantNo, "REFRESH");
		}
		
		//첨부 파일 저장 및 연결 처리
		if(roomChatDto.getAttachments() != null && !roomChatDto.getAttachments().isEmpty()) {
			for (MultipartFile file : roomChatDto.getAttachments())
				try {
					//파일 저장
					AttachmentDto saved = attachmentService.save(file);
					
					//메세지와 첨부파일 연결
					roomChatAttachmentService.connect(roomChatDto.getRoomChatNo(), saved.getAttachmentNo());
				}
				catch(Exception e) {
					throw new RuntimeException("첨부파일 처리 중 오류 발생", e);
				}
		}
		
		//채팅방에 구독된 사용자들에게 실시간 메세지 전송
		sendRealTimeMessage(roomNo, roomChatDto);
	}
	
	//최근 채팅 메세지 조회(이름 포함)
	public ChatRoomResponseVO getChatsByRoom(long roomNo, ClaimVO claimVO) {
	    Long memberNo = claimVO.getMemberNo();
	    if (!roomDao.checkRoom(roomNo, memberNo)) {
	        throw new TargetNotFoundException("채팅방에 참여하지 않은 사용자입니다");
	    }

	    RoomDto roomDto = roomDao.selectOne(roomNo);
	    String roomTitle = roomDto.getRoomTitle();

	    if (roomTitle == null || roomTitle.trim().isEmpty()) {
	        List<Long> participants = roomDao.findParticipantNos(roomNo);
	        
	        // 참여자가 1명뿐이면
	        if (participants.size() == 1 && participants.contains(memberNo)) {
	            roomTitle = "빈 채팅방";
	        }
	        else {
	            for (Long participant : participants) {
	                if (!participant.equals(memberNo)) {
	                    MemberDto other = memberDao.selectOne(participant);
	                    if (other != null) {
	                        roomTitle = other.getMemberName();
	                        break;
	                    }
	                }
	            }
	        }
	    }

	    List<RoomChatDto> messageDtos = roomChatDao.listByRoom(roomNo);
	    List<ChatResponseVO> messages = new ArrayList<>();

	    for (RoomChatDto dto : messageDtos) {
	        String senderName = "알 수 없음";
	        if (dto.getRoomChatSender() != null) {
	            MemberDto sender = memberDao.selectOne(dto.getRoomChatSender());
	            if (sender != null) {
	                senderName = sender.getMemberName();
	            }
	        }
	        
	        List<Integer> attachmentNos = roomChatAttachmentService.findAttachmentNos(dto.getRoomChatNo());
	        List<AttachmentDto> attachments = roomChatAttachmentQueryService.findByNos(attachmentNos);

	        messages.add(ChatResponseVO.builder()
	            .roomNo(dto.getRoomChatOrigin())
	            .senderNo(dto.getRoomChatSender())
	            .senderName(senderName)
	            .content(dto.getRoomChatContent())
	            .time(dto.getRoomChatTime())
	            .type(dto.getRoomChatType())
	            .attachments(attachments)
	            .build());
	    }

	    return ChatRoomResponseVO.builder()
	            .roomTitle(roomTitle)
	            .messages(messages)
	            .build();
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
		
		List<Integer> attachmentNos = roomChatAttachmentService.findAttachmentNos(roomChatDto.getRoomChatNo());
		List<AttachmentDto> attachments = roomChatAttachmentQueryService.findByNos(attachmentNos);
		
		ChatResponseVO chat = ChatResponseVO.builder()
					.roomNo(roomChatDto.getRoomChatOrigin())
					.senderNo(roomChatDto.getRoomChatSender())
					.senderName(senderName)
					.content(roomChatDto.getRoomChatContent())
					.time(roomChatDto.getRoomChatTime())
					.type(roomChatDto.getRoomChatType())
					.attachments(attachments)
				.build();
		
		messagingTemplate.convertAndSend(destination, chat);
	}
	
	//시스템 메세지 저장 + WebSocket 전송
	public void sendSystemMessage(RoomChatDto message) {
		//시간과 번호 자동 설정
		message.setRoomChatNo(roomChatDao.sequence());
		message.setRoomChatTime(LocalDateTime.now());
		message.setRoomChatType("SYSTEM");
		
		//DB 저장
		roomChatDao.insertSystemMessage(message);
		
		//WenSocket 전송
		sendRealTimeMessage(message.getRoomChatOrigin(), message);
	}
}
