package com.kh.acaedmy_final.service;

import java.util.Calendar;
import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kh.acaedmy_final.configuration.TokenProperties;
import com.kh.acaedmy_final.dao.TokenDao;
import com.kh.acaedmy_final.dto.MemberDto;
import com.kh.acaedmy_final.dto.TokenDto;
import com.kh.acaedmy_final.vo.ClaimVO;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

@Service
public class TokenService {

	@Autowired
	private TokenProperties tokenProperties;
	@Autowired
	private TokenDao tokenDao;
	
	public String generateAccessToken(MemberDto memberDto) {
		Calendar c = Calendar.getInstance();
		Date now = c.getTime();
		c.add(Calendar.MINUTE,tokenProperties.getAccessLimit());
		Date limit = c.getTime();
		
		return Jwts.builder()
				.signWith(tokenProperties.getKey())
				.expiration(limit)
				.issuer(tokenProperties.getIssuer())
				.issuedAt(now)
				.claim("memberNo", memberDto.getMemberNo())
				.claim("memberDepartment", memberDto.getMemberDepartment())
			.compact();
	}
	
	public String generateRefreshToken(MemberDto memberDto) {
		Calendar c = Calendar.getInstance();
		Date now = c.getTime();
		c.add(Calendar.MINUTE,tokenProperties.getRefreshLimit());
		Date limit = c.getTime();
		
		String value =  Jwts.builder()
				.signWith(tokenProperties.getKey())
				.expiration(limit)
				.issuer(tokenProperties.getIssuer())
				.issuedAt(now)
				.claim("memberNo", memberDto.getMemberNo())
				.claim("memberDepartment", memberDto.getMemberDepartment())
			.compact();
		
		
		
		tokenDao.insert(TokenDto.builder()
					.tokenTarget(memberDto.getMemberNo())
					.tokenValue(value)
				.build());
		
		
		
		return value;
	}
	
	public ClaimVO parse(String token) {
		Claims claims = (Claims) Jwts.parser()
				.verifyWith(tokenProperties.getKey())
				.requireIssuer(tokenProperties.getIssuer())
			.build()
				.parse(token)
				.getPayload();
		
		return ClaimVO.builder()
					.memberNo((String) claims.get("memberNo"))
					.memberDepartment((String) claims.get("memberDepartment"))
				.build();
	}
	
	public ClaimVO parseBearerToken(String bearerToken) {
		String token = bearerToken.substring(7);
		return parse(token);
	}
	
}


























