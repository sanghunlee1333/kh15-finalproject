package com.kh.acaedmy_final.restcontroller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.acaedmy_final.dao.NoticeDao;
import com.kh.acaedmy_final.dto.NoticeDto;
import com.kh.acaedmy_final.error.TargetNotFoundException;
import com.kh.acaedmy_final.vo.SearchVO;

@CrossOrigin
@RestController
@RequestMapping("/api/notice")
public class NoticeRestController {

	@Autowired
	private NoticeDao noticeDao;
	
	//등록
	@PostMapping("/")
	public void insert(@RequestBody NoticeDto noticeDto) {
		noticeDao.insert(noticeDto);
	}
	
	//삭제
	@DeleteMapping("/{noticeNo}")
	public void delete(@PathVariable long noticeNo) {
		NoticeDto noticeDto = noticeDao.selectOne(noticeNo);
		if(noticeDto == null) {
			throw new TargetNotFoundException(); //없으면 404
		}
		noticeDao.delete(noticeNo); //있으면 200
	}
	
	//목록
	@GetMapping("/")
	public List<NoticeDto> list(){
		return noticeDao.selectList();
	}
	
	//검색 조회(컬럼-키워드)
	@GetMapping("/column/{column}/keyword/{keyword}")
	public List<NoticeDto> list(@PathVariable String column, String keyword){
		return noticeDao.selectList(column, keyword);
	}
	//검색 조회
	@PostMapping("/search")
	public List<NoticeDto> list(@RequestBody SearchVO searchVO){
		return noticeDao.selectList(searchVO);
	}
	
	
	
}
