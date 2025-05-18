package com.kh.acaedmy_final.restcontroller.websocket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.acaedmy_final.dto.websocket.RoomChatDto;
import com.kh.acaedmy_final.service.TokenService;
import com.kh.acaedmy_final.service.websocket.RoomChatService;
import com.kh.acaedmy_final.vo.ClaimVO;
import com.kh.acaedmy_final.vo.websocket.ChatRoomResponseVO;

@RestController
@RequestMapping("api/chat")
public class RoomChatRestController {
	
	@Autowired
	private RoomChatService roomChatService;
	
	@Autowired
	private TokenService tokenService;
	
	// 채팅 전송 (등록)

	@PostMapping(value = "/send", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public void send(@ModelAttribute RoomChatDto roomChatDto,
	                 @RequestHeader("Authorization") String bearerToken) {

		// 내용과 첨부 모두 비어있으면 거부
	    if ((roomChatDto.getRoomChatContent() == null || roomChatDto.getRoomChatContent().trim().isEmpty())
	        && (roomChatDto.getAttachments() == null || roomChatDto.getAttachments().isEmpty())) {
	        throw new RuntimeException("채팅 내용과 첨부파일이 모두 비어있습니다");
	    }

	    // 첨부만 있는 경우 → 첫 번째 파일 이름을 내용으로 대체
	    if ((roomChatDto.getRoomChatContent() == null || roomChatDto.getRoomChatContent().trim().isEmpty())
	        && roomChatDto.getAttachments() != null && !roomChatDto.getAttachments().isEmpty()) {
	        
	        String firstFileName = roomChatDto.getAttachments().get(0).getOriginalFilename();
	        roomChatDto.setRoomChatContent("[파일] " + firstFileName);
	    }
		
	    ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
	    roomChatService.sendMessage(roomChatDto, claimVO);
	}
	
	// 해당 방의 전체 채팅 조회
	@GetMapping("/recent/{roomNo}")
	public ChatRoomResponseVO recent(@PathVariable long roomNo,
	                                 @RequestHeader("Authorization") String bearerToken) {
	    ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
	    return roomChatService.getChatsByRoom(roomNo, claimVO);
	}

}
