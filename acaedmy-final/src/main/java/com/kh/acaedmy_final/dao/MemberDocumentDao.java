package com.kh.acaedmy_final.dao;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.kh.acaedmy_final.dto.UpdateMemberDocsDto;

@Repository
public class MemberDocumentDao {
	
	@Autowired
	private SqlSession sqlSession;
	
	
	public List<Integer> selectByMemberNoAndType(UpdateMemberDocsDto dto) {
		return sqlSession.selectList("member-docs.findByMemberAndType", dto);
	}
	public List<Integer> selectByMemberNoAndType(long memberNo, String memberDocumentType){
		UpdateMemberDocsDto dto = new UpdateMemberDocsDto();
		dto.setMemberNo(memberNo); dto.setMemberDocumentType(memberDocumentType);
		return sqlSession.selectList("member-docs.findByMemberAndType", dto);
	}
	public boolean connect(UpdateMemberDocsDto dto) {
		return  sqlSession.insert("member-docs.connectDocs",dto) > 0;
	}
	public boolean deleteAll(UpdateMemberDocsDto dto) {
		return sqlSession.delete("member-docs.deleteAll",dto)> 0;
	}
	public String selectName(int attachmentNo) {
		
		return sqlSession.selectOne("member-docs.findName", attachmentNo);
	}
	
}
