package com.kh.acaedmy_final.restcontroller.websocket;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kh.acaedmy_final.dao.MemberDao;
import com.kh.acaedmy_final.dao.websocket.RoomDao;
import com.kh.acaedmy_final.dto.MemberDto;
import com.kh.acaedmy_final.dto.websocket.RoomCreateRequestDto;
import com.kh.acaedmy_final.dto.websocket.RoomDto;
import com.kh.acaedmy_final.service.TokenService;
import com.kh.acaedmy_final.service.websocket.RoomService;
import com.kh.acaedmy_final.vo.ClaimVO;
import com.kh.acaedmy_final.vo.websocket.InviteRequestVO;
import com.kh.acaedmy_final.vo.websocket.RoomListVO;
import com.kh.acaedmy_final.vo.websocket.UserVO;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/rooms")
public class RoomRestController {
	
	@Autowired
    private TokenService tokenService;

    @Autowired
    private RoomService roomService;
    
    @Autowired
    private RoomDao roomDao;
    
    @Autowired
    private MemberDao memberDao;
    
    @PostMapping
    public long createRoom(@RequestBody RoomCreateRequestDto request,
                                        @RequestHeader("Authorization") String bearerToken) {
        ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
        //방 생성
        long roomNo = roomDao.getSequence();
        RoomDto roomDto = RoomDto.builder()
                    .roomNo(roomNo)
                    .roomTitle(request.getRoomTitle())
                    .roomOwner(claimVO.getMemberNo())
                    .memberNos(request.getMemberNos())
                .build();

        // 방먼저
        roomDao.insert(roomDto);
        // 방장 참여
        roomDao.enterRoom(roomNo, claimVO.getMemberNo());
        // 참여자 추가
        roomDao.insertMembers(roomNo, request.getMemberNos());

        return roomNo;

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
    
    @GetMapping("/{roomNo}")
    public RoomDto getRoom(@PathVariable long roomNo) {
    	return roomDao.selectOne(roomNo);
    }
    
    @PostMapping("/{roomNo}/read")
    public void readMessage(@PathVariable long roomNo,
    									@RequestHeader("Authorization") String bearerToken) {
    	ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
    	roomService.updateReadTime(roomNo, claimVO.getMemberNo());
    }
    
    //채팅방에 속한 사용자 목록 조회
    @GetMapping("/{roomNo}/users")
    public List<UserVO> getRoomUsers(@PathVariable long roomNo,
    														@RequestHeader("Authorization") String bearerToken) {
    	ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
    	return roomService.getRoomUsers(roomNo, claimVO.getMemberNo());
    }
    
    //채팅방에 멤버 초대
    @PostMapping("/{roomNo}/invite")
    public void inviteMembers(@PathVariable long roomNo, 
    		@RequestBody InviteRequestVO request,
    		HttpServletRequest httpRequest) {
    	
    	//토큰 헤더에서 꺼내기
    	String authorization = httpRequest.getHeader("Authorization");
        String token = authorization != null ? authorization.replace("Bearer ", "") : null;
    	
        //사용자 정보 파싱
        ClaimVO claimVO = tokenService.parseBearerToken("Bearer " + token);
        
    	//사용자 정보로 초대 처리
    	roomService.inviteMembers(roomNo, request.getMemberNos(), claimVO.getMemberNo());
    }
    
    @DeleteMapping("/{roomNo}/exit")
    public ResponseEntity<?> exitRoom(@PathVariable long roomNo,
    														@RequestHeader("Authorization") String bearerToken) {
    	ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
    	long memberNo = claimVO.getMemberNo();
    	
    	//나가기 처리
    	roomService.exitRoom(roomNo, memberNo);
    	
    	return ResponseEntity.ok().build();
    }
    
    @GetMapping("/{roomNo}/invitable")
    public List<MemberDto> getInvitableMembers(@PathVariable long roomNo,
    																			@RequestHeader("Authorization") String bearerToken) {
    	ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
    	long memberNo = claimVO.getMemberNo();
    	
    	return memberDao.selectInvitableContacts(roomNo, memberNo);
    }
    
    @GetMapping("/{roomNo}/invitable/search")
    public List<MemberDto> searchInvitableMembers(@PathVariable long roomNo,
    																				@RequestParam("search") String search,
    																				@RequestHeader("Authorization") String bearerToken) {
    	ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
    	long memberNo = claimVO.getMemberNo();
    	
    	return memberDao.searchInvitableContacts(roomNo, memberNo, search);
    }
    
    @PostMapping("/direct/{targetNo}")
    public Long startDirectChat(@PathVariable long targetNo,
    											@RequestHeader("Authorization") String bearerToken) {
    	ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
    	long ownerNo = claimVO.getMemberNo();
    	return roomService.startDirectChat(ownerNo, targetNo);
    }
}
