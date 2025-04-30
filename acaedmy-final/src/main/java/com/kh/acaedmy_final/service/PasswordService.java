package com.kh.acaedmy_final.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.kh.acaedmy_final.dao.MemberDao;
import com.kh.acaedmy_final.dto.MemberDto;
import com.kh.acaedmy_final.utill.NewPWGenerator;

@Service
public class PasswordService {
	@Autowired
	private JavaMailSender sender;
	@Autowired
	private NewPWGenerator newPw;
	@Autowired
	private PasswordEncoder encoder;
	@Autowired
	private MemberDao memberDao;
	
	
	public String sendPw(long memberNo) {
		MemberDto target = memberDao.selectOne(memberNo);
		String memberEmail = target.getMemberEmail();
		
		String randomPw = newPw.random();
		
		SimpleMailMessage message = new SimpleMailMessage();
		message.setTo(memberEmail);
		message.setSubject("새로운 비밀번호 안내");
		message.setText("새로운 비밀번호는 " + randomPw + " 입니다. 로그인 하여 새로운 비밀번호로 바꿔주시길 바랍니다"  );
		sender.send(message);
		//randomPw = encoder.encode(randomPw);
		
		target.setMemberPw(randomPw);
//		boolean isValid = memberDao.editPart(target);
		memberDao.resetPw(target);
		//System.err.println(randomPw + " " + target.getMemberPw());
		
		return randomPw;
	}
}
