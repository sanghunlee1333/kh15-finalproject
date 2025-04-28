package com.kh.acaedmy_final.dao;

import java.util.List;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Repository;

import com.kh.acaedmy_final.dto.MemberDto;

@Repository
public class MemberDao {
	@Autowired
	private SqlSessionTemplate sqlSession;
	@Autowired
	private PasswordEncoder encoder;
	
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
		//System.out.println("nonononononno");
		memberDto.setMemberNo(memberNo);
		//System.out.println(memberNo);
		//System.out.println(memberDto.getMemberPw() + "  "+ memberDto.getMemberJoin());
		//System.out.println(encoder.encode(memberDto.getMemberResidentNo()));
		//System.out.println(memberId);
		memberDto.setMemberPw(encoder.encode(memberDto.getMemberPw()));
		memberDto.setMemberResidentNo(encoder.encode(memberDto.getMemberResidentNo()));
		String memberId = memberDto.getMemberId() + memberNo;
		memberDto.setMemberId(memberId);
		return sqlSession.insert("member.join", memberDto)> 0;
	}
	public List<MemberDto> seachContacts(String search) {
		return sqlSession.selectList("member.search", search); 
	}
	
}
