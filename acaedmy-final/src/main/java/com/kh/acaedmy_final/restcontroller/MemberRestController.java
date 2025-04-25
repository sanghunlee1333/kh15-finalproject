package com.kh.acaedmy_final.restcontroller;

import java.util.ArrayList;
import java.util.List;

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
import com.kh.acaedmy_final.vo.ContactVO;
import com.kh.acaedmy_final.vo.LoginResponseVO;
import com.kh.acaedmy_final.vo.LoginVO;

import lombok.extern.slf4j.Slf4j;

@Slf4j
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

//	PasswordEncoder encoder;
	
	@PostMapping("/")
	public boolean join(@RequestBody MemberDto memberDto) {
		
		System.out.println("ggwgwgwgw");
		System.out.println(memberDto);
		
		// 유효성 검사
		boolean isValid = memberDao.insert(memberDto);
		//String newNo = encoder.encode(memberDto.getMemberResidentNo());
		
		return isValid;
	}
	
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
	public boolean logout(@RequestHeader ("Authorization") String bearerToken) {
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
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

	@GetMapping("/contact")
	public List<ContactVO> getContacts() {
		    
	    List<MemberDto> members = memberDao.selectList();
	    
	    // ContactVO 리스트를 생성하여 반환
	    List<ContactVO> contacts = new ArrayList<>();
	    
	    for (MemberDto memberDto : members) {
	        ContactVO contact = ContactVO.builder()
	                	.memberNo(memberDto.getMemberNo())
	                	.memberName(memberDto.getMemberName())
	                	.memberDepartment(memberDto.getMemberDepartment())
	                	.memberContact(memberDto.getMemberContact())
	                	.memberEmail(memberDto.getMemberEmail())
	                .build();
	        
	        contacts.add(contact);  // 생성한 ContactVO 객체를 리스트에 추가
	    }
	    
	    return contacts;  // 연락처 리스트 반환
	}
}




















