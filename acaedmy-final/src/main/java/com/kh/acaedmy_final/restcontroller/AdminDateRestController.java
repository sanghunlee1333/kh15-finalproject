package com.kh.acaedmy_final.restcontroller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.xml.parsers.ParserConfigurationException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.xml.sax.SAXException;

import com.kh.acaedmy_final.dao.AdminDateDao;
import com.kh.acaedmy_final.dto.AdminDateDto;
import com.kh.acaedmy_final.service.WorkingDaysService;
import com.kh.acaedmy_final.vo.RequestDateVO;

@CrossOrigin
@RestController
@RequestMapping("/api/admin")
public class AdminDateRestController {
	@Autowired
	private WorkingDaysService workingDaysService;
	@Autowired
	RestTemplate restTemplate = new RestTemplate();
	@Autowired
	private AdminDateDao adminDateDao;
	
	@PostMapping("/date2") // 휴일 받기
	public Map<String, Object> getWorkingDays(@RequestBody RequestDateVO vo) throws IOException, ParserConfigurationException, SAXException  {
		Map<String, Object> map = new HashMap<>();
		//System.err.println(vo);
		map.put("totalWorkingDays", workingDaysService.getWorkingDays(vo.getYear(), vo.getMonth()));
		workingDaysService.getHolidaysDate();
		//System.err.println(map.get("totalWorkingDays"));
		map.put("holidayList", workingDaysService.getHolidaysByYearAndMonth(vo.getYear(), vo.getMonth()));
		return map;
	}
	@PostMapping("/date")// 일정등록
	public boolean insert(@RequestBody AdminDateDto dto) {
		dto.setHolidayNo(adminDateDao.sequence());
		dto.setHolidayAdmin('Y');
		System.err.println(dto);
		return adminDateDao.add(dto);
		//return true;
	} 
	@DeleteMapping("/date/{holidayNo}")
	public boolean delete(@PathVariable long holidayNo) {
		
		return adminDateDao.delete(holidayNo);
	}
	
}























