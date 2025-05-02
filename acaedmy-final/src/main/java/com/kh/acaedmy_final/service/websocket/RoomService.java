package com.kh.acaedmy_final.service.websocket;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kh.acaedmy_final.dao.websocket.RoomDao;
import com.kh.acaedmy_final.dto.websocket.RoomCreateRequestDto;
import com.kh.acaedmy_final.dto.websocket.RoomDto;
import com.kh.acaedmy_final.error.TargetNotFoundException;
import com.kh.acaedmy_final.vo.websocket.RoomListVO;

@Service
public class RoomService {

	@Autowired
	private RoomDao roomDao;
	
	//채팅방 생성
	//@param member 방장 번호(토큰에서 추출)
	//@param request 채팅방 제목, 초대할 멤버 목록 포함
	public void createRoom(long memberNo, RoomCreateRequestDto request) {
		//방 제목 검증
		if(request.getRoomTitle() == null || request.getRoomTitle().trim().isEmpty()) {
			throw new TargetNotFoundException("방 제목이 없습니다");
		}
		
		//방 정보 생성 및 저장
		RoomDto roomDto = RoomDto.builder()
					.roomTitle(request.getRoomTitle())
					.roomOwner(memberNo)
				.build();
		
		//방 생성
		roomDao.insert(roomDto);
		long roomNo = roomDto.getRoomNo();
		
		//초대할 멤버 리스트 준비
		List<Long> invitees = request.getMemberNos() == null ? new ArrayList<>() : request.getMemberNos();
		List<Long> allMembers = new ArrayList<>(invitees);
		allMembers.add(memberNo);//방장은 항상 포함
		
		//멤버 DB 등록
		roomDao.insertMembers(roomNo, allMembers);
	}
	
	//사용자 참여 채팅방 목록 조회
	//@param memberNo 사용자 번호
	//@return 사용자가 참여 중인 채팅방 목록
	public List<RoomDto> getMyRooms(long memberNo) {
		return roomDao.selectListByMember(memberNo);
	}
	
	//사용자가 속한 채팅방 목록 조회 (RoomListVO)
	//@param memberNo 사용자 번호
	//@return 사용자가 참여 중인 채팅방 목록 (간단 정보)
	public List<RoomListVO> getRoomListByMember(long memberNo) {
		return roomDao.selectRoomListByMember(memberNo);
	}
}
