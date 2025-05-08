package com.kh.acaedmy_final.restcontroller;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kh.acaedmy_final.configuration.TokenProperties;
import com.kh.acaedmy_final.dao.MemberDao;
import com.kh.acaedmy_final.dao.TokenDao;
import com.kh.acaedmy_final.dto.MemberDto;
import com.kh.acaedmy_final.service.TokenService;
import com.kh.acaedmy_final.vo.ClaimVO;
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
	
	@PostMapping("/refresh")
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
	
	//연락처 부서별로 전체 회원 목록 가져오기
	@GetMapping("/contact")
	public Map<String, List<MemberDto>> getContacts(@RequestParam(value = "search", required = false) String search) {
	    //  부서별로 그룹화
	    Map<String, List<MemberDto>> groupByDepartment = new LinkedHashMap<>();
	    
	    //검색어가 있으면 검색 결과 , 없으면 전체 목록 불러오기
	    List<MemberDto> members;
	    if(search != null && !search.isEmpty()) {
	    	members = memberDao.seachContacts(search);
	    }
	    else {
	    	members = memberDao.selectList();//전체 목록 가져오기
	    }
	    
	    // 각 부서별로 회원 정보를 그룹화
	    for (MemberDto member : members) {
	    	String department = member.getMemberDepartment() != null ? member.getMemberDepartment() : "미지정";
	    	
	    	// 해당 부서가 없으면 새로 리스트를 생성하고 있으면 기존 리스트에 추가
	    	groupByDepartment.putIfAbsent(department, new ArrayList<>());
	    	groupByDepartment.get(department).add(member);
	    }
	    
	    //부서별로 그룹화된 데이터 변환
	    return groupByDepartment;
	}
	
	//전체 회원 목록 가져오기(+ 이름 or 연락처 검색 조회도 가능)
	@GetMapping("/")
	public List<MemberDto> list(@RequestParam(required = false) String search){
		if(search == null) return memberDao.selectList(); //경로 변수 없으면 전체 목록 조회
		else return memberDao.search(search); //이름 or 연락처 조회(검색2) 
	}
	
}




















