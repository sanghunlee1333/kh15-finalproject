package com.kh.acaedmy_final.restcontroller;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
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
import com.kh.acaedmy_final.error.TargetNotFoundException;
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

	@Autowired
	private PasswordEncoder encoder;
	
	@PostMapping("/")
	public boolean join(@RequestBody MemberDto memberDto) {
		
//		System.out.println("ggwgwgwgw");
//		System.out.println(memberDto);
		
		// 유효성 검사
		boolean isValid = memberDao.insert(memberDto);
		//String newNo = encoder.encode(memberDto.getMemberResidentNo());
		
		return isValid;
	}
	
	//PasswordEncoder encoder;
	
	@PostMapping("/login")
	public LoginResponseVO login(@RequestBody LoginVO loginVO){
	//	System.out.println(loginVO);
		if(loginVO == null) {
			return null;
		}
		String memberId = loginVO.getMemberId();
		MemberDto targetDto = memberDao.selectOne(memberId);
		if(memberDao.selectOne(memberId) == null) {
			return null;
		}
		
		// 비밀번호 검사 
		// 아직
		encoder.matches(loginVO.getMemberPw(), targetDto.getMemberPw());
		// join 할때 encoder.encode(pw);
		if(encoder.matches(loginVO.getMemberPw(), targetDto.getMemberPw()) == false){
			throw new TargetNotFoundException("로그인 X");
//			return null;
		}
		return LoginResponseVO.builder()
			.memberNo(targetDto.getMemberNo())
			.memberDepartment(targetDto.getMemberDepartment())
			.accessToken(tokenService.generateAccessToken(targetDto))
			.refreshToken(tokenService.generateRefreshToken(targetDto))
		.build();
	}
	
	@DeleteMapping("/logout")
	public boolean logout(@RequestHeader ("Authorization") String bearerToken) {
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
//		System.err.println(bearerToken);
//		System.out.println("claimVO");
//		System.err.println(claimVO);
//		System.out.println("nono");
//		System.err.println(claimVO.getMemberNo());
		return tokenDao.deleteByTarget(claimVO.getMemberNo());
	}
	
	@PostMapping("/refresh")
	public LoginResponseVO refresh(@RequestHeader ("Authorization") String refreshToken) {
		//System.err.println(refreshToken);
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
	public Map<String, List<MemberDto>> getContacts(@RequestParam(value = "search", required = false) String search,
																						@RequestHeader ("Authorization") String bearerToken) {
		// 로그인된 사용자의 정보 가져오기
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		Long loggedInMemberNo = claimVO.getMemberNo();
		
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
	    	//로그인된 사용자는 제외
	    	if (member.getMemberNo() == loggedInMemberNo) {
	    	    continue;
	    	}
	    	
	    	String department = member.getMemberDepartment() != null ? member.getMemberDepartment() : "미지정";
	    	
	    	// 해당 부서가 없으면 새로 리스트를 생성하고 있으면 기존 리스트에 추가
	    	groupByDepartment.putIfAbsent(department, new ArrayList<>());
	    	groupByDepartment.get(department).add(member);
	    }
	    
	    //부서별로 그룹화된 데이터 변환
	    return groupByDepartment;
	}
	
	//연락처 부서별로 전체 회원 목록 가져오기 (로그인 유저-포함)
	@GetMapping("/contactIncludeMe")
	public Map<String, List<MemberDto>> getContactsIncludeMe(@RequestParam(value = "search", required = false) String search,
				@RequestHeader ("Authorization") String bearerToken) {
		//로그인된 사용자의 정보 가져오기
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		
		//부서별로 그룹화
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
	
	// 본인 정보 조회
	@GetMapping("/contact/me")
	public MemberDto getMyInfo(@RequestHeader("Authorization") String bearerToken) {
	    ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
	    Long loggedInMemberNo = claimVO.getMemberNo();
	    return memberDao.selectOne(loggedInMemberNo);
	}
	
	@GetMapping("/contact/invitable/{roomNo}")
	public Map<String, List<MemberDto>> getInvitableContacts(
	        @PathVariable long roomNo,
	        @RequestParam(value = "search", required = false) String search,
	        @RequestHeader("Authorization") String bearerToken) {

	    ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
	    Long myNo = claimVO.getMemberNo();

	    // 검색 조건에 따라 조회 방식 변경
	    List<MemberDto> contacts;
	    if (search != null && !search.isEmpty()) {
	        contacts = memberDao.searchInvitableContacts(roomNo, myNo, search); 
	    } else {
	        contacts = memberDao.selectInvitableContacts(roomNo, myNo);
	    }

	    // 부서별로 그룹화
	    Map<String, List<MemberDto>> groupByDepartment = new LinkedHashMap<>();
	    for (MemberDto member : contacts) {
	        String dept = member.getMemberDepartment() != null ? member.getMemberDepartment() : "미지정";
	        groupByDepartment.putIfAbsent(dept, new ArrayList<>());
	        groupByDepartment.get(dept).add(member);
	    }

	    return groupByDepartment;
	}

	
}