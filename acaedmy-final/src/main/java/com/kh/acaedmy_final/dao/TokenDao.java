package com.kh.acaedmy_final.dao;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.kh.acaedmy_final.dto.TokenDto;

@Repository
public class TokenDao {
	@Autowired
	private SqlSessionTemplate sqlSession;
	
	public boolean insert(TokenDto tokenDto) {
		long tokenNo = sqlSession.selectOne("token.sequence");
		tokenDto.setTokenNo(tokenNo);
		return sqlSession.insert("token.generate", tokenDto) > 0;
	}
}
