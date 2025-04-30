package com.kh.acaedmy_final.restcontroller.websocket;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.acaedmy_final.dao.websocket.RoomDao;
import com.kh.acaedmy_final.dto.websocket.RoomCreateRequestDto;
import com.kh.acaedmy_final.dto.websocket.RoomDto;
import com.kh.acaedmy_final.service.TokenService;
import com.kh.acaedmy_final.vo.ClaimVO;

@RestController
@RequestMapping("/api/rooms")
public class RoomRestController {
	
	@Autowired
	private TokenService tokenService;
	
	@Autowired
	private RoomDao roomDao;
	
	@PostMapping
	public void createRoom(@RequestBody RoomCreateRequestDto request,
										@RequestHeader("Authorization") String bearerToken) {
		//사용자 인증
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		
		//방 생성
		RoomDto roomDto = RoomDto.builder()
					.roomTitle(request.getRoomTitle())
					.roomOwner(claimVO.getMemberNo())
				.build();
		
		//DB에 채팅방 정보 저장 및 roomNo 세팅
		roomDao.insert(roomDto);
		
		// 방장 및 참여자들 모두 추가
		roomDao.enterRoom(roomDto.getRoomNo(), claimVO.getMemberNo());//방장도 참여자니까
		
		//초대 멤버 등록
		for(Long memberNo : request.getMemberNos()) {
			if(!memberNo.equals(claimVO.getMemberNo())) {//중복 방지
				roomDao.enterRoom(roomDto.getRoomNo(), memberNo);
			}
		}
	}
	
	@GetMapping
	public List<RoomDto> getMyRooms(@RequestHeader("Authorization") String bearerToken) {
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		
		//사용자가 참여 중인 채팅방 목록 조회
		return roomDao.selectListByMember(claimVO.getMemberNo());
	}
}
