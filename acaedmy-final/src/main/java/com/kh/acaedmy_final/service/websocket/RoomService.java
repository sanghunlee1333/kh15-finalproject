package com.kh.acaedmy_final.service.websocket;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.kh.acaedmy_final.dao.MemberDao;
import com.kh.acaedmy_final.dao.websocket.RoomDao;
import com.kh.acaedmy_final.dto.MemberDto;
import com.kh.acaedmy_final.dto.websocket.RoomChatDto;
import com.kh.acaedmy_final.dto.websocket.RoomCreateRequestDto;
import com.kh.acaedmy_final.dto.websocket.RoomDto;
import com.kh.acaedmy_final.error.TargetNotFoundException;
import com.kh.acaedmy_final.vo.websocket.RoomListVO;
import com.kh.acaedmy_final.vo.websocket.UserVO;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class RoomService {

	@Autowired
	private RoomDao roomDao;
	
	@Autowired
	private MemberDao memberDao;
	
	@Autowired
	private RoomChatService roomChatService;
	
	@Autowired
	private SimpMessagingTemplate messagingTemplate;
	
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
		log.debug("getRoomListByMember 호출됨 - memberNo: {}", memberNo);
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
		
		//초대한 사람 이름 조회
		MemberDto inviter = memberDao.selectOne(inviterNo);
		if(inviter == null) return;
		
		//초대된 사람들 이름을 수동으로 수집
		List<String> names = new ArrayList<>();
		for(Long memberNo : memberNos) {
			MemberDto dto = memberDao.selectOne(memberNo);
			if(dto != null) {
				names.add(dto.getMemberName());
			}
		}
		
		//시스템 메세지 내용 구성
		String content = inviter.getMemberName() + "님이 " + String.join(", ", names) + "님을 초대했습니다.";
		
		//메세지 저장
		RoomChatDto message = RoomChatDto.builder()
					.roomChatSender(inviterNo)
					.roomChatOrigin(roomNo)
					.roomChatType("SYSTEM")
					.roomChatContent(content)
				.build();
		
		roomChatService.sendSystemMessage(message);
		
		List<Long> targets = new ArrayList<>(memberNos);
		targets.add(inviterNo);
		
		for (Long target : targets) {
			log.debug("📢 WebSocket 알림 전송 대상: {}", target);
			messagingTemplate.convertAndSend("/topic/room-list/" + target, "REFRESH");
			messagingTemplate.convertAndSend("/topic/room-users/" + roomNo, "REFRESH");
		}
	}
	
	//채팅방 나가기
	public void exitRoom(long roomNo, long memberNo) {
		int count = sqlSession.delete("room.exit", Map.of("roomNo", roomNo, "memberNo", memberNo));
		if (count == 0) {
			throw new TargetNotFoundException("해당 채팅방 참여자를 찾을 수 없습니다");
		}
		
		MemberDto member = memberDao.selectOne(memberNo);
		if(member == null) return;
		
		String content = member.getMemberName() + "님이 채팅방을 나갔습니다.";
		
		RoomChatDto message = RoomChatDto.builder()
					.roomChatSender(memberNo)
					.roomChatOrigin(roomNo)
					.roomChatType("SYSTEM")
					.roomChatContent(content)
				.build();
		
		roomChatService.sendSystemMessage(message);
	}
	
	//1:1 채팅방 생성
	public Long startDirectChat(Long ownerNo, Long targetNo) {
		//이미 존재하는 1:1 채팅방 확인
		Long roomNo = roomDao.findDirectRoom(ownerNo, targetNo);
		if(roomNo != null) return roomNo;
		
		//방 번호 시퀀스 발급
		Long newRoomNo = roomDao.getSequence();
		
		//대상 유저 정보 조회
		MemberDto targetMember = memberDao.selectOne(targetNo);
		if(targetMember == null) {
			throw new TargetNotFoundException("대상 사용자를 찾을 수 없습니다");
		}
		
		//채팅방 생성
		RoomDto roomDto = RoomDto.builder()
					.roomNo(newRoomNo)
					.roomTitle(null)
					.roomOwner(ownerNo)
				.build();
		
		//방 등록
		roomDao.insert(roomDto);
		
		//참여자 2명 등록 (본인 + 대상)
		roomDao.insertMembers(newRoomNo, List.of(ownerNo, targetNo));
		
		return newRoomNo;
	}
}
