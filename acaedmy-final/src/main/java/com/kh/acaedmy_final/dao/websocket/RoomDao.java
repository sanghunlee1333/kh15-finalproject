package com.kh.acaedmy_final.dao.websocket;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.kh.acaedmy_final.dto.websocket.RoomDto;
import com.kh.acaedmy_final.vo.websocket.RoomListVO;

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
//        long roomNo = getSequence();//시퀀스를 통해서 방 번호를 조회
//        roomDto.setRoomNo(roomNo);//조회한 방 번호를 DTO에 설정
        sqlSession.insert("room.insert", roomDto);


        //방에 참여할 멤버들 처리
//        for(Long memberNo : roomDto.getMemberNos()) {
//            sqlSession.insert("room.enter", Map.of(
//                    "roomNo", roomNo,
//                    "memberNo", memberNo
//                ));
//        }

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
        System.err.println("roomno " + roomNo);
        System.err.println("memberNo " + memberNo  );
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
//        for(RoomDto room : rooms) {
//            //해당 채팅방에 속한 사용자 목록을 조회
//            List<UserVO> users = sqlSession.selectList("room.getUsers", room.getRoomNo());
//            room.setUsers(users);
//        }
        return rooms;
    }

    //채팅방 목록 조회(RoomListVO 전용)
    public List<RoomListVO> selectRoomListByMember(long memberNo) {
        return sqlSession.selectList("room.listByMember", memberNo);
    }
	
}
