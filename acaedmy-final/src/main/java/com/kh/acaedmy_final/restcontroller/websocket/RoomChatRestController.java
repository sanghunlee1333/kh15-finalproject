package com.kh.acaedmy_final.restcontroller.websocket;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kh.acaedmy_final.dao.websocket.RoomChatDao;
import com.kh.acaedmy_final.dao.websocket.RoomDao;
import com.kh.acaedmy_final.dto.websocket.RoomChatDto;
import com.kh.acaedmy_final.error.TargetNotFoundException;
import com.kh.acaedmy_final.service.TokenService;
import com.kh.acaedmy_final.vo.ClaimVO;

@RestController
@RequestMapping("api/chat")
public class RoomChatRestController {
	
	@Autowired
	private RoomChatDao roomChatDao;
	
	@Autowired
	private RoomDao roomDao;
	
	@Autowired
	private TokenService tokenService;
	
	//채팅 전송 (등록)
	@PostMapping("/")
	public void send(@RequestBody RoomChatDto roomChatDto, 
			@RequestHeader("Authorization") String bearerToken) {
		//로그인한 사용자 확인
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		
		//사용자가 해당 채팅방에 참여 했는지 확인
		boolean isEnter = roomDao.checkRoom(roomChatDto.getRoomChatOrigin(), claimVO.getMemberNo());
		if(!isEnter) {
			throw new TargetNotFoundException("채팅방 입장 전입니다");
		}
		
		//채팅 번호 생성 및 전송자 등록
		roomChatDto.setRoomChatNo(roomChatDao.sequence());
		roomChatDto.setRoomChatSender(claimVO.getMemberNo());
		
		//DB등록
		roomChatDao.insert(roomChatDto);
	}
	
	//해당 방의 최근 채팅 조회
	@GetMapping("/recent/{roomNo}")
	public List<RoomChatDto> recent(@PathVariable long roomNo,
									@RequestParam int count,
									@RequestHeader("Authorization") String bearerToken) {
		
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		
		boolean isEnter = roomDao.checkRoom(roomNo, claimVO.getMemberNo());
		if(!isEnter) {
			throw new TargetNotFoundException("채팅방 입장 전입니다");
		}
		
		return roomChatDao.listRecent(roomNo, count);
	}
}
