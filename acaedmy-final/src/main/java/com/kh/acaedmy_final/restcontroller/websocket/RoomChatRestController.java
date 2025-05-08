package com.kh.acaedmy_final.restcontroller.websocket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
	@PostMapping("/")
	public void send(@RequestBody RoomChatDto roomChatDto, 
					 @RequestHeader("Authorization") String bearerToken) {
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		roomChatService.sendMessage(roomChatDto, claimVO);
	}
	
	// 해당 방의 최근 채팅 조회
	@GetMapping("/recent/{roomNo}")
	public ChatRoomResponseVO recent(@PathVariable long roomNo,
									 @RequestParam(defaultValue = "20") int count,
									 @RequestHeader("Authorization") String bearerToken) {
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		return roomChatService.getRecentChats(roomNo, count, claimVO);
	}
}
