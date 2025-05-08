package com.kh.acaedmy_final.restcontroller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kh.acaedmy_final.configuration.HolidayApiProperties;
import com.kh.acaedmy_final.service.HolidayService;
import com.kh.acaedmy_final.vo.HolidayInfoVO;

/*
	1. [Controller]
	프론트에서 /api/holiday/2025/05 같은 요청을 보냄
	
	2. [Service]
	해당 연도/월로 공공데이터 API를 호출
	
	3. [API 응답 처리]
	XML로 응답이 오지만 내부적으로는 Jackson으로 JSON 형태로 변환해 처리
	
	4. [VO 구조]
	HolidayResponseVO -> Body -> items -> item -> HolidayInfoVO
	
	5. [Service 결과 반환 -> Controller -> 프론트 전송]
*/

@RestController
@RequestMapping("/api")
public class HolidayRestController {
	
	@Autowired
    private HolidayService holidayService;

    @GetMapping("/holidays")
    public List<HolidayInfoVO> getHolidays(@RequestParam int year, @RequestParam int month) throws Exception {
        return holidayService.getHolidays(year, month); //해당 연, 월의 공휴일 리스트를 반환
    }
    
}
