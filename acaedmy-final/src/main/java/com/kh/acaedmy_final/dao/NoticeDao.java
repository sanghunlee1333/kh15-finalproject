package com.kh.acaedmy_final.dao;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.kh.acaedmy_final.dto.NoticeDto;
import com.kh.acaedmy_final.vo.SearchVO;

@Repository
public class NoticeDao {
	@Autowired
	private SqlSession sqlSession;
	
	//등록
	public int sequence() {
		return sqlSession.selectOne("notice.sequence");
	}
	public void insert(NoticeDto noticeDto) {
		sqlSession.insert("notice.write", noticeDto);
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
	//(미사용)검색 조회(컬럼-키워드)
	public List<NoticeDto> selectList(String column, String keyword){
		Map<String, Object> param = new HashMap<>();
		param.put("column", column);
		param.put("keyword", keyword);
		return sqlSession.selectList("notice.listOrSearch", param);
	}
	//검색 결과 수 조회
	public int count(SearchVO searchVO) {
		return sqlSession.selectOne("notice.count", searchVO);
	}
	//목록 + 검색 조회
	public List<NoticeDto> selectList(SearchVO searchVO){
		return sqlSession.selectList("notice.search", searchVO);
	}
	
	
	
}
