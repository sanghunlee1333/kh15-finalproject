package com.kh.acaedmy_final.dao;

import java.util.List;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.kh.acaedmy_final.dto.MemberDto;

@Repository
public class MemberDao {
	@Autowired
	private SqlSessionTemplate sqlSession;
	
	public List<MemberDto> selectList() {
		return sqlSession.selectList("member.all");
	}
	public MemberDto selectOne(MemberDto memberDto) {
		return sqlSession.selectOne("member.find", memberDto);
	}
	public MemberDto selectOne(String memberId) {
		return sqlSession.selectOne("member.find", memberId);
	}
	public MemberDto selectOne(long memberNo) {
		return sqlSession.selectOne("member.findByNo", memberNo);
	}
	public boolean insert(MemberDto memberDto) {
		long memberNo = sqlSession.selectOne("member.sequence");
		memberDto.setMemberNo(memberNo);
		return sqlSession.insert("member.join", memberDto)> 0;
	}
	
}
