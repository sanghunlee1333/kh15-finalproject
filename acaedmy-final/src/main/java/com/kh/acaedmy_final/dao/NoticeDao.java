package com.kh.acaedmy_final.dao;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.kh.acaedmy_final.dto.AttachmentDto;
import com.kh.acaedmy_final.dto.NoticeDto;
import com.kh.acaedmy_final.vo.SearchVO;

@Repository
public class NoticeDao {
	@Autowired
	private SqlSession sqlSession;
	
	//등록
	public NoticeDto insert(NoticeDto noticeDto) {
		long sequence = sqlSession.selectOne("notice.sequence");
		noticeDto.setNoticeNo(sequence);
		sqlSession.insert("notice.write", noticeDto);
		return sqlSession.selectOne("notice.detail", sequence);
	}
	
	//삭제
	public boolean delete(long noticeNo) {
		return sqlSession.delete("notice.delete", noticeNo) > 0;
	}
	
	//목록 조회
	public List<NoticeDto> selectList(){
		return sqlSession.selectList("notice.list");
	}
	//상세 조회
	public NoticeDto selectOne(long noticeNo) {
		return sqlSession.selectOne("notice.detail", noticeNo);
	}
	
	//검색 결과 수 조회
	public int count(SearchVO searchVO) {
		return sqlSession.selectOne("notice.count", searchVO);
	}
	//목록 + 검색 조회
	public List<NoticeDto> selectList(SearchVO searchVO){
		return sqlSession.selectList("notice.search", searchVO);
	}
	
	//첨부파일 연결
	public void connect(NoticeDto noticeDto, AttachmentDto attachmentDto) {
		Map<String, Object> params = new HashMap<>();
		params.put("noticeNo", noticeDto.getNoticeNo());
		params.put("attachmentNo", attachmentDto.getAttachmentNo());
		sqlSession.insert("notice.connect", params); //여기에 하나 밖에 못써서 위에서 map으로 하나로 합쳐서 보내야 함
	}
	//첨부파일 찾기
	public List<AttachmentDto> selectAttachList(long noticeNo) {
		return sqlSession.selectList("notice.findAttachList", noticeNo);
	}
	
	//서머노트 이미지 연결
	public void connectEditor(long noticeNo, int attachmentNo) {
		Map<String, Object> params = new HashMap<>();
		params.put("noticeNo", noticeNo);
		params.put("attachmentNo", attachmentNo);
		sqlSession.insert("notice.connectEditor", params); //여기에 하나 밖에 못써서 위에서 map으로 하나로 합쳐서 보내야 함
	}
		
	//첨부파일 번호 찾기
	public List<Integer> findNoticeImageAttachmentNoList(long noticeNo) {
	    return sqlSession.selectList("notice.findNoticeImageAttachmentNoList", noticeNo);
	}
	public List<Integer> findEditorAttachmentNoList(long noticeNo) {
	    return sqlSession.selectList("notice.findEditorAttachmentNoList", noticeNo);
	}

	//첨부파일 연결 해제
	public void deleteNoticeImageConnections(long noticeNo) {
	    sqlSession.delete("notice.deleteNoticeImageConnections", noticeNo);
	}
	
	//서머노트 이미지 연결 해제
	public void deleteEditorImageConnections(long noticeNo) {
	    sqlSession.delete("notice.deleteEditorImageConnections", noticeNo);
	}

}
