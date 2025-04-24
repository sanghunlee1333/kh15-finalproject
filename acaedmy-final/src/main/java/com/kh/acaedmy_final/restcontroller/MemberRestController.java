package com.kh.acaedmy_final.restcontroller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.acaedmy_final.configuration.TokenProperties;
import com.kh.acaedmy_final.dao.MemberDao;
import com.kh.acaedmy_final.dao.TokenDao;
import com.kh.acaedmy_final.dto.MemberDto;
import com.kh.acaedmy_final.service.TokenService;
import com.kh.acaedmy_final.vo.ClaimVO;
import com.kh.acaedmy_final.vo.LoginResponseVO;
import com.kh.acaedmy_final.vo.LoginVO;

@CrossOrigin
@RestController
@RequestMapping("/api/member")
public class MemberRestController {
	
	@Autowired
	private MemberDao memberDao;
	@Autowired
	private TokenService tokenService; 
	@Autowired
	private TokenProperties tokenProperties;
	@Autowired
	private TokenDao tokenDao;
	
	
	//PasswordEncoder encoder;
	
	@PostMapping("/login")
	public LoginResponseVO login(@RequestBody LoginVO loginVO){
	//	System.out.println(loginVO);
		String memberId = loginVO.getMemberId();
		MemberDto targetDto = memberDao.selectOne(memberId);
		if(memberDao.selectOne(memberId) == null) {
			return null;
		}
		
		// 비밀번호 검사 
		// 아직
//		encoder.matches(loginVO.getMemberPw(), targetDto.getMemberPw());
		// join 할때 encoder.encode(pw);
		return LoginResponseVO.builder()
			.memberNo(targetDto.getMemberNo())
			.memberDepartment(targetDto.getMemberDepartment())
			.accessToken(tokenService.generateAccessToken(targetDto))
			.refreshToken(tokenService.generateRefreshToken(targetDto))
		.build();
	}
	
	
	@GetMapping("/logout")
	public boolean logout(@RequestHeader ("Authorization") String beareToken) {
		ClaimVO claimVO = tokenService.parseBearerToken(beareToken);
		return tokenDao.deleteByTarget(claimVO.getMemberNo());
	}
	
	@GetMapping("/refresh")
	public LoginResponseVO refresh(@RequestHeader ("Authorization") String refreshToken) {
		ClaimVO claimVO = tokenService.parseBearerToken(refreshToken);
		boolean isValid = tokenService.checkBearerToken(claimVO, refreshToken);
		if(!isValid) {
			//에러
		}
		MemberDto memberDto = memberDao.selectOne(claimVO.getMemberNo());
		
		return LoginResponseVO.builder()
					.memberNo(claimVO.getMemberNo())
					.memberDepartment(claimVO.getMemberDepartment())
					.accessToken(tokenService.generateAccessToken(memberDto))
					.refreshToken(tokenService.generateRefreshToken(memberDto))
				.build();
	}
	
	
}




















