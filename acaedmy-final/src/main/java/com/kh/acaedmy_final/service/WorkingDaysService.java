package com.kh.acaedmy_final.service;

import java.io.IOException;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import javax.xml.parsers.ParserConfigurationException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.xml.sax.SAXException;

import com.kh.acaedmy_final.dao.AdminDateDao;
import com.kh.acaedmy_final.dto.AdminDateDto;
import com.kh.acaedmy_final.utill.HolidayGenerator;
import com.kh.acaedmy_final.vo.WorkingdaysResponseVO;

@Service
public class WorkingDaysService {
	@Autowired
	private HolidayGenerator holidayGenerator;
	@Autowired
	private AdminDateDao adminDateDao;
	List<WorkingdaysResponseVO> holidayList = new LinkedList<>();
	
	// 모든 공휴일
	public List<WorkingdaysResponseVO> getHolidaysDate() throws IOException, ParserConfigurationException, SAXException {
		 LocalDate now = LocalDate.now();
		 int year = now.getYear();
		 String yearSt = String.valueOf(year);
		
		  
		  return holidayGenerator.getRestDays(yearSt);
	}
	 
//	 @PostConstruct // 스케쥴러 걸린 애를 서버를 킬때마다 실행 시켜줌
//	 public void initHoliday() throws IOException, ParserConfigurationException, SAXException, ParseException {
//		 saveOneYearHolidays();
//	 }



	// 총 근무 일수
	public int getWorkingDays(int year, int month) throws IOException, ParserConfigurationException, SAXException {
		//LocalDate now = LocalDate.now();
//		int year = now.getYear();
//		int month = now.getMonthValue();
		LocalDate now = LocalDate.of(year, month,1);
		int index = now.lengthOfMonth();
		
		int count = 0;
		for(int i = 1 ; i <= index; i++) {
			if(LocalDate.of(year, month, i).getDayOfWeek() !=DayOfWeek.SATURDAY  && 
					LocalDate.of(year, month, i).getDayOfWeek() != DayOfWeek.SUNDAY) {
				count++;
			}
		}
		
		
		 List<AdminDateDto> list = getHolidaysByYearAndMonth(year, month);
		 for (AdminDateDto day : list) {  
			 
			    if(day.getHolidayDate().toLocalDateTime().toLocalDate().getDayOfWeek() !=DayOfWeek.SATURDAY  && 
			    		day.getHolidayDate().toLocalDateTime().toLocalDate().getDayOfWeek() != DayOfWeek.SUNDAY) {
					count--;
				}
			}
		 
		 Map<Object, Object> map = new HashMap<>();
		 for(AdminDateDto day : list) {
			 map.put(day.getHolidayDate(), day.getHolidayName());
		 }
		 if(map.size() < list.size()) {
			 //System.err.println(map.size() + " mapSIZE " + list.size() + " listSIZE");
			 count = count + (list.size() - map.size());
		 }
		return count;
	}

	public void saveOneYearHolidays() throws IOException, ParserConfigurationException, SAXException, ParseException {
		LocalDate now = LocalDate.now();
		int year = now.getYear();
		String yearSt = String.valueOf(year);
		List<WorkingdaysResponseVO> list = holidayGenerator.getRestDays(yearSt);
		List<AdminDateDto> save = new LinkedList<>();
		for(WorkingdaysResponseVO vo : list) {
			AdminDateDto dto = AdminDateDto.builder()
			.holidayNo(adminDateDao.sequence())
			.holidayName(vo.getDateName())
			.holidayDate(toTimestamp(vo.getLocDate()))
			.build();
			save.add(dto);
		}
			boolean is = adminDateDao.add(save);
	}
	
	public Timestamp toTimestamp(String target) throws ParseException {
		SimpleDateFormat dateFormat  = new SimpleDateFormat("yyyyMMdd");
		Date parsedDate = dateFormat.parse(target);
        Timestamp timestamp = new Timestamp(parsedDate.getTime());
        return timestamp;
	}
	
	public List<AdminDateDto> getHolidaysByYearAndMonth(int year, int month){
//		LocalDate now = LocalDate.now();
//		int year = now.getYear();
//		int month = now.getMonthValue();
		return adminDateDao.selectByMonth(year, month);
	}
	
}

























