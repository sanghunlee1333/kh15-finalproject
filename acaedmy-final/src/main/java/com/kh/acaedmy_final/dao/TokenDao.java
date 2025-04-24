package com.kh.acaedmy_final.dao;

import java.util.HashMap;
import java.util.Map;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.kh.acaedmy_final.dto.TokenDto;
import com.kh.acaedmy_final.vo.ClaimVO;

@Repository
public class TokenDao {
	@Autowired
	private SqlSessionTemplate sqlSession;
	
	public boolean insert(TokenDto tokenDto) {
		long tokenNo = sqlSession.selectOne("token.sequence");
		tokenDto.setTokenNo(tokenNo);
		return sqlSession.insert("token.generate", tokenDto) > 0;
	}
	
	public boolean delete(TokenDto tokenDto) {
		return sqlSession.delete("token.delete",tokenDto) > 0;
	}
	public boolean delete(long tokenNo) {
		return sqlSession.delete("token.delete",tokenNo) > 0;
	}
	public boolean deleteByTarget(long memberNo) {
		return sqlSession.delete("token.deleteByTarget",memberNo) > 0;		
	}
	public boolean deleteByTarget(TokenDto tokenDto) {
		return sqlSession.delete("token.deleteByTarget", tokenDto) > 0;
	}
	
	public TokenDto selectOne(long tokenNo) {
		return sqlSession.selectOne("token.find",tokenNo);
	}
	public TokenDto selectOne(TokenDto tokenDto) {
		return sqlSession.selectOne("token.find",tokenDto);
	}
	
	public TokenDto selectOneByTargetAndValue(ClaimVO claimVO, String refreshToken ) {
	Map<String, Object> params = new HashMap<>();
		
		params.put("tokenTarget", claimVO.getMemberNo());
		params.put("tokenValue", refreshToken);
		
		return sqlSession.selectOne("token.findByTarget", params);
	}
	
	
}
