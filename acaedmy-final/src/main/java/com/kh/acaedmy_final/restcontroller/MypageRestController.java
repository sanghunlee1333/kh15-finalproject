package com.kh.acaedmy_final.restcontroller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.acaedmy_final.dao.MemberDao;
import com.kh.acaedmy_final.dto.MemberDto;
import com.kh.acaedmy_final.service.TokenService;
import com.kh.acaedmy_final.vo.ClaimVO;

@CrossOrigin
@RequestMapping("/api/mypage")
@RestController
public class MypageRestController {
	@Autowired
	private MemberDao memberDao;
	@Autowired
	private TokenService tokenService;
	@GetMapping("/")
	public MemberDto selectOne(@RequestHeader ("Authorization") String bearerToken ) {
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		MemberDto memberDto = memberDao.selectOne(claimVO.getMemberNo());
		return memberDto;
	}
}
















