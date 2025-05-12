package com.kh.acaedmy_final.dao;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Repository;

import com.kh.acaedmy_final.dto.MemberDto;
import com.kh.acaedmy_final.vo.AdminMemberListVO;
import com.kh.acaedmy_final.vo.MemberDetailResponseVO;

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
	public MemberDetailResponseVO selectOneDetail(long memberNo) {
		return sqlSession.selectOne("member.findForDetail", memberNo);
	}

	public boolean insert(MemberDto memberDto) {
		long memberNo = sqlSession.selectOne("member.sequence");
		memberDto.setMemberNo(memberNo);
		memberDto.setMemberPw(encoder.encode(memberDto.getMemberPw()));
		memberDto.setMemberResidentNo(encoder.encode(memberDto.getMemberResidentNo()));
		String memberId = memberDto.getMemberId() + memberNo;
		memberDto.setMemberId(memberId);
		return sqlSession.insert("member.join", memberDto) > 0;
	}


	public boolean delete(long memberNo) {
		return sqlSession.delete("member.remove", memberNo) > 0;
	}

	public int count(AdminMemberListVO adminMemberListVO) {
		return sqlSession.selectOne("member.count", adminMemberListVO);
	}

	public List<AdminMemberListVO> selectIntegratedList(AdminMemberListVO adminMemberListVO) {
		return sqlSession.selectList("member.integratedList", adminMemberListVO);
	}

	public List<MemberDto> seachContacts(String search) {
		return sqlSession.selectList("member.search", search); 
	}
	
	//검색2
	public List<MemberDto> search(String search) {
		return sqlSession.selectList("member.search2", search); 
	}

	public boolean editAll(long memberNo, MemberDto memberDto) {
		Map<String, Object> params = new HashMap<>();
		params.put("memberNo", memberNo);
		params.put("memberDto", memberDto);
		return sqlSession.update("member.editAll", params) > 0;
	}
	public boolean editPart( MemberDto memberDto) {
		return sqlSession.update("member.editPart", memberDto) > 0;
	}

	public boolean resetPw(MemberDto memberDto) {
		return sqlSession.update("member.resetPw", memberDto) > 0;
	}

	public List<MemberDto> selectInvitableContacts(long roomNo, long myNo) {
		Map<String, Object> params = new HashMap<>();
		params.put("roomNo", roomNo);
		params.put("myNo", myNo);
		return sqlSession.selectList("member.selectInvitableContacts", params);
	}

	public List<MemberDto> searchInvitableContacts(long roomNo, Long myNo, String search) {
		Map<String, Object> params = new HashMap<>();
		params.put("roomNo", roomNo);
		params.put("myNo", myNo);
		params.put("search", search);
		return sqlSession.selectList("member.searchInvitableContacts", params);
	}
}
