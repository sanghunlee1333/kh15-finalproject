package com.kh.acaedmy_final.dao.websocket;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.kh.acaedmy_final.dto.websocket.RoomDto;
import com.kh.acaedmy_final.vo.websocket.RoomListVO;
import com.kh.acaedmy_final.vo.websocket.UserVO;

@Repository
public class RoomDao {
	
	@Autowired
    private SqlSession sqlSession;

    //채팅방 번호 시퀀스 조회
    public long getSequence() {
        return sqlSession.selectOne("room.sequence");
    }

    //채팅방 생성
    public void insert(RoomDto roomDto) {
        sqlSession.insert("room.insert", roomDto);
    }

    //채팅방 멤버 추가
    public void insertMembers(long roomNo, List<Long> memberNos) {
        for(Long memberNo : memberNos) {
            sqlSession.insert("room.enter", 
                    Map.of("roomNo", roomNo, "memberNo", memberNo));
        }
    }
    
	//전체 채팅방 목록 조회
    public List<RoomDto> selectList() {
        return sqlSession.selectList("room.list");
    }

    //특정 채팅방 조회
    public RoomDto selectOne(long roomNo) {
        return sqlSession.selectOne("room.find", roomNo);
    }

    //방 삭제
    public void delete(long roomNo) {
        sqlSession.delete("room.delete", roomNo);
    }

    //방 입장
    public void enterRoom(long roomNo, long memberNo) {
        Map<String, Object> list = new HashMap<>();
        list.put("roomNo", roomNo);
        list.put("memberNo", memberNo);
        sqlSession.insert("room.enter", list);
    }

    //채팅방 중복 입장 검사
    public boolean checkRoom(long roomNo, long memberNo) {
        int count = sqlSession.selectOne("room.check", Map.of(
                    "roomNo", roomNo,
                    "memberNo", memberNo
                ));
        return count > 0;
    }

    //사용자가 속한 채팅방 목록 조회
    public List<RoomDto> selectListByMember(long memberNo) {
        List<RoomDto> rooms = sqlSession.selectList("room.listByMember", memberNo);
        return rooms;
    }

    //채팅방 목록 조회(RoomListVO 전용)
    public List<RoomListVO> selectRoomListByMember(long memberNo) {
        return sqlSession.selectList("room.listByMember", Map.of("memberNo", memberNo));
    }
	
    //채팅방에 속한 사용자 목록 조회
    public List<UserVO> getRoomUsers(long roomNo) {
    	return sqlSession.selectList("room.getUsers", roomNo);
    }
    
    //채팅방 멤버 초대
    public void addMembers(long roomNo, List<Long> memberNos) {
    	for(Long memberNo : memberNos) {
    		if(!checkRoom(roomNo, memberNo)) {
    			sqlSession.insert("room.enter", Map.of(
    						"roomNo", roomNo,
    						"memberNo", memberNo
    			));
    		}
    	}
    }

	public LocalDateTime getJoinTime(long roomNo, Long memberNo) {
		Map<String, Object> params = new HashMap<>();
		params.put("roomNo", roomNo);
		params.put("memberNo", memberNo);
		return sqlSession.selectOne("room.getJoinTime", params);
	}
	
	public void increaseUnreadCount(Long roomNo, Long senderNo) {
		sqlSession.update("room.increaseUnreadCount", Map.of(
					"roomNo", roomNo,
					"senderName", senderNo
		));
	}
	
	public List<Long> findParticipantNos(Long roomNo) {
		return sqlSession.selectList("room.getParticipantNos", roomNo);
	}
	
	//1:1 채팅방이 이미 있는지 확인
	public Long findDirectRoom(Long ownerNo, Long targetNo) {
		Map<String, Object> params = new HashMap<>();
		params.put("ownerNo", ownerNo);
		params.put("targetNo", targetNo);
		return sqlSession.selectOne("room.findDirectRoom", params);
	}
}
