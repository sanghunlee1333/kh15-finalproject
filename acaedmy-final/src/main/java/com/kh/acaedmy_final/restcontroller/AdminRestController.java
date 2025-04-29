package com.kh.acaedmy_final.restcontroller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.acaedmy_final.dao.MemberDao;
import com.kh.acaedmy_final.error.TargetNotFoundException;
import com.kh.acaedmy_final.vo.AdminMemberListVO;
import com.kh.acaedmy_final.vo.MemberDetailResponseVO;

@CrossOrigin
@RestController
@RequestMapping("/api/admin")
public class AdminRestController {
	@Autowired
	private MemberDao memberDao;

//	@GetMapping("/member")
//	public List<MemberDto> list(){
//		
//		return memberDao.selectList();
//	}
	
	@DeleteMapping("/member/{memberNo}")
	public boolean delete(@PathVariable long memberNo) {
		if(memberDao.selectOne(memberNo) == null) throw new TargetNotFoundException();
		return memberDao.delete(memberNo);
	}
	@GetMapping("/member/{memberNo}")
	public Map<String, Object> selectOne(@PathVariable long memberNo) {
		Map<String, Object> ret = new HashMap<>();
		MemberDetailResponseVO vo =  memberDao.selectOneDetail(memberNo);
		ret.put("vo", vo);
		return ret;
	}
	
	
	@PostMapping("/member")
	public Map<String, Object> searchList(@RequestBody AdminMemberListVO adminMemberListVO){
		Map<String, Object> ret = new HashMap<>();
		
		if(adminMemberListVO.getColumn() != null) {	
		String columnSnakeCase = adminMemberListVO.toSnakeCase(adminMemberListVO.getColumn());
		adminMemberListVO.setColumn(columnSnakeCase);
		}

		System.out.println(adminMemberListVO.getOrder());
		List<AdminMemberListVO> list = memberDao.selectIntegratedList(adminMemberListVO);
		ret.put("list", list);
		int count = memberDao.count(adminMemberListVO);
		ret.put("count", count);
		

		return ret;
	}

}

























