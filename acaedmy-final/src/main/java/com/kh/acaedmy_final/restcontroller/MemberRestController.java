package com.kh.acaedmy_final.restcontroller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.acaedmy_final.dao.MemberDao;
import com.kh.acaedmy_final.dto.MemberDto;
import com.kh.acaedmy_final.vo.LoginVO;

@CrossOrigin
@RestController
@RequestMapping("/api/member")
public class MemberRestController {
	
	@Autowired
	private MemberDao memberDao;

	//PasswordEncoder encoder;
	
	@PostMapping("/login")
	public ResponseEntity<String> login(@RequestBody LoginVO loginVO){
		String memberId = loginVO.getMemberId();
		MemberDto targetDto = memberDao.selectOne(memberId);
		if(memberDao.selectOne(memberId) == null) {
			return ResponseEntity
					.status(HttpStatus.NOT_FOUND)
			        .body("not exists member");
		}
		
		// 비밀번호 검사 
		// 아직
//		encoder.matches(loginVO.getMemberPw(), targetDto.getMemberPw());
		// join 할때 encoder.encode(pw);
		
		return ResponseEntity.ok("성공");
	}
	
	
	
}


















