package com.kh.acaedmy_final.utill;

import java.io.IOException;
import java.text.ParseException;
import java.time.LocalDate;

import javax.xml.parsers.ParserConfigurationException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.xml.sax.SAXException;

import com.kh.acaedmy_final.service.WorkingDaysService;

@Component
public class HolidayScheduler {
	@Autowired
	private WorkingDaysService workingDaysService;
	
	@Scheduled(cron = "0 0 0 1 1 ?")
	public void getOneYearHolidays() throws IOException, ParserConfigurationException, SAXException, ParseException {
		workingDaysService.saveOneYearHolidays();
	}
}
