package com.kh.acaedmy_final.restcontroller.websocket;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.acaedmy_final.dto.websocket.RoomCreateRequestDto;
import com.kh.acaedmy_final.dto.websocket.RoomDto;
import com.kh.acaedmy_final.service.TokenService;
import com.kh.acaedmy_final.service.websocket.RoomService;
import com.kh.acaedmy_final.vo.ClaimVO;
import com.kh.acaedmy_final.vo.websocket.RoomListVO;

@RestController
@RequestMapping("/api/rooms")
public class RoomRestController {
	
	@Autowired
	private TokenService tokenService;
	
	@Autowired
	private RoomService roomService;
	
	@PostMapping
	public void createRoom(@RequestBody RoomCreateRequestDto request,
										@RequestHeader("Authorization") String bearerToken) {
		//사용자 인증
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		
		//채팅방 생성 서비스 호출
		roomService.createRoom(claimVO.getMemberNo(), request);
	}
	
	//사용자가 참여한 채팅방 목록 조회(상세 정보)
	@GetMapping
	public List<RoomDto> getMyRooms(@RequestHeader("Authorization") String bearerToken) {
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		
		//사용자가 참여 중인 채팅방 목록 조회
		return roomService.getMyRooms(claimVO.getMemberNo());
	}
	
	//사용자가 참여한 채팅방 목록 조회(간단한 정보 - RoomListVO)
	@GetMapping("/list")
	public List<RoomListVO> getRoomList(@RequestHeader("Authorization") String bearerToken) {
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		
		//사용자가 참여 중인 채팅방 목록 조회(간단한 정보 제공)
		return roomService.getRoomListByMember(claimVO.getMemberNo());
	}
}
