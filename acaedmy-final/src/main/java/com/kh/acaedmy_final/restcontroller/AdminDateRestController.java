package com.kh.acaedmy_final.restcontroller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.xml.parsers.ParserConfigurationException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.xml.sax.SAXException;

import com.kh.acaedmy_final.dao.AdminDateDao;
import com.kh.acaedmy_final.dao.PlanDao;
import com.kh.acaedmy_final.dto.AdminDateDto;
import com.kh.acaedmy_final.dto.PlanDto;
import com.kh.acaedmy_final.service.TokenService;
import com.kh.acaedmy_final.service.WorkingDaysService;
import com.kh.acaedmy_final.vo.ClaimVO;
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
	@Autowired
	private PlanDao planDao;
	@Autowired
	private TokenService tokenService;
	
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
    public boolean insert(@RequestBody AdminDateDto dto, @RequestHeader ("Authorization") String bearerToken) {
        dto.setHolidayNo(adminDateDao.sequence());
        dto.setHolidayAdmin('Y');
        System.err.println(dto);
        boolean adminValid = adminDateDao.add(dto);

        ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);

        PlanDto planDto = new PlanDto();

        long planNo = planDao.sequence();
        planDto.setPlanTitle(dto.getHolidayName());
        planDto.setPlanNo(planNo);
        planDto.setPlanStartTime(dto.getHolidayDate());
        planDto.setPlanEndTime(dto.getHolidayDate());
        planDto.setPlanType("전체");
        planDto.setPlanStatus("완료");
        planDto.setPlanIsAllDay("Y");
        planDto.setPlanColor("#dc3545");
        planDto.setPlanSenderNo(claimVO.getMemberNo());
        planDto.setPlanContent("");
        boolean planValid = planDao.insertByAdmin(planDto);
        //return true;
        System.out.println(planDto);
        return adminValid && planValid;
    }
	@DeleteMapping("/date/{holidayNo}")
	public boolean delete(@PathVariable long holidayNo) {
		
		return adminDateDao.delete(holidayNo);
	}
	
}























