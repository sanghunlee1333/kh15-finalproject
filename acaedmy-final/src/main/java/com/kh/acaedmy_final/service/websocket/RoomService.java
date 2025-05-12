package com.kh.acaedmy_final.service.websocket;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kh.acaedmy_final.dao.websocket.RoomDao;
import com.kh.acaedmy_final.dto.websocket.RoomCreateRequestDto;
import com.kh.acaedmy_final.dto.websocket.RoomDto;
import com.kh.acaedmy_final.error.TargetNotFoundException;
import com.kh.acaedmy_final.vo.websocket.RoomListVO;
import com.kh.acaedmy_final.vo.websocket.UserVO;

@Service
public class RoomService {

	@Autowired
	private RoomDao roomDao;
	
	@Autowired
	private SqlSession sqlSession;
	
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
	
	//메세지 읽음 처리
	public void updateReadTime(long roomNo, long memberNo) {
		sqlSession.update("room.updateReadTime", Map.of(
				"roomNo", roomNo,
				"memberNo", memberNo
		));
	}
	
	//채팅방에 속한 사용자 목록 조회
	public List<UserVO> getRoomUsers(long roomNo, long memberNo) {
		boolean isParticipant = roomDao.checkRoom(roomNo, memberNo);
		if(!isParticipant) {
			throw new TargetNotFoundException("해당 채팅방에 참여하지 않은 사용자입니다");
		}
		//실제 사용자 목록 조회
		return roomDao.getRoomUsers(roomNo);
	}
	
	//채팅방 멤버 초대
	public void inviteMembers(long roomNo, List<Long> memberNos, long inviterNo) {
		//해당 유저가 이 방에 속해있는지 먼저 확인
		if(!roomDao.checkRoom(roomNo, inviterNo)) {
			throw new TargetNotFoundException("초대 권한이 없습니다");
		}
		//중복 없이 멤버 추가
		roomDao.addMembers(roomNo, memberNos);
	}
}
