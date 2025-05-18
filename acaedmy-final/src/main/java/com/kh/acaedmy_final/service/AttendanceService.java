package com.kh.acaedmy_final.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kh.acaedmy_final.dao.AttendanceDao;
import com.kh.acaedmy_final.dao.PolicyDao;
import com.kh.acaedmy_final.dto.AttendanceLogDto;
import com.kh.acaedmy_final.dto.AttendanceResultDto;
import com.kh.acaedmy_final.dto.PolicyDto;

@Service
public class AttendanceService {
	public static final int policyNo = 1;
	@Autowired
	private AttendanceDao attendanceDao;
	@Autowired
	private PolicyDao policyDao;
	
	LocalDate now = LocalDate.now();
	LocalDate monthStart = LocalDate.of(now.getYear(), now.getMonthValue(), 1);
	LocalDate monthEnd = LocalDate.of(now.getYear(), now.getMonthValue(), now.lengthOfMonth());
	
	LocalDateTime today = LocalDateTime.now();
	LocalDateTime startDay = LocalDateTime.of(today.getYear(), today.getMonthValue(), today.getDayOfMonth(), 0, 0, 0);
	LocalDateTime endDay = LocalDateTime.of(today.getYear(), today.getMonthValue(), today.getDayOfMonth(), 23, 59, 59);
	

	
	
	public void result(long memberNo) {
		PolicyDto policy = policyDao.selectOne(policyNo);
		System.out.println("policy");
		System.out.println(policy.getPolicyType());
		List<AttendanceLogDto> inTimeList = attendanceDao.getInDay(memberNo, startDay, endDay);
		List<AttendanceLogDto> outTimeList = attendanceDao.getOutDay(memberNo, startDay, endDay);

		AttendanceLogDto first = inTimeList.get(0);
		AttendanceLogDto last = outTimeList.getLast();
		System.out.println("first " + first); 
//		System.out.println("last " + last);
		LocalDate day = today.toLocalDate();
	//	getLateMinute(first);
//		getLateMinute();
		
		Map<String, Object> map = getOptions();
		LocalDateTime standardInTime = (LocalDateTime)map.get("standard");
		LocalDateTime standardOutTime = standardInTime.plusMinutes(policy.getPolicyWorkTime() + policy.getPolicyLunchTime() );
//		System.err.println("퇴근ㅇ시간 : "+standardOutTime);
//		System.out.println("업무시간 : " + policy.getPolicyWorkTime() );
//		System.out.println("점심시간 : " + policy.getPolicyLunchTime() );
		
		LocalDateTime realOut = last.getAttendanceLogOutTime().toLocalDateTime();
		LocalDateTime realIn = first.getAttendanceLogInTime().toLocalDateTime();
		Duration standardWork = Duration.between(standardInTime, standardOutTime);
		Duration realWork = Duration.between(realIn, realOut);
		long workMin = realWork.toMinutes();
//		long workHour = realWork.toHours();
		long overTime = 0;/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		LocalDateTime arrangeTime = (LocalDateTime)map.get("arrange");
		System.out.println("workTime");
//		System.out.println(workHour + " : " + workMin);
		
		// 정상근무 
		if(workMin > policy.getPolicyWorkTime() + policy.getPolicyLunchTime() ) {
//			workMin = 
			 
			
			if(workMin < policy.getPolicyWorkTime() + policy.getPolicyLunchTime() + policy.getPolicyDinnerTime()) {				
				overTime = 0;
			}
			if(workMin > policy.getPolicyWorkTime() + policy.getPolicyLunchTime() + policy.getPolicyDinnerTime()) {
				overTime = workMin - policy.getPolicyLunchTime() - policy.getPolicyDinnerTime() - policy.getPolicyWorkTime();
//				workMin = overTime + workMin;
			}
			workMin = policy.getPolicyWorkTime();
		}
	//	System.out.println("real work Time : " + overTime);
		
		AttendanceResultDto todayResult = new AttendanceResultDto();
//		AttendanceResultDto findDto = new AttendanceResultDto();
		
		boolean noDup = attendanceDao.validDup(day,memberNo);
		System.err.println(noDup);
		if(policy.getPolicyType().equals( "자율")) {
			int early = earlyLeave(realOut, realIn);
			if(early >= policy.getPolicyWorkTime()) {
				early = 0;
			}
			else {
				early = policy.getPolicyWorkTime() - early;
			}
			int late = 0;
			if(realIn.isAfter(arrangeTime)) {
				late = (int)Duration.between( arrangeTime, realIn).toMinutes();
			}
			todayResult = 
				AttendanceResultDto.builder()
					//.attendanceResultNo(attendanceDao.sequenceResult())
					.attendanceResultDay(day)
					.attendanceResultInTime(first.getAttendanceLogInTime())
					.attendanceResultOutTime(last.getAttendanceLogOutTime())
					.attendanceResultLateMinute(late)
					.attendanceResultEarlyLeave(early)
					.attendanceResultWorkTime((int)workMin)
					.attendanceResultOverTime((int)overTime)
					.memberNo(memberNo)
				.build();
		}
	
		if(policy.getPolicyType().equals( "고정")) {
			todayResult = 
			AttendanceResultDto.builder()
				//.attendanceResultNo(attendanceDao.sequenceResult())
				.attendanceResultDay(day)
				.attendanceResultInTime(first.getAttendanceLogInTime())
				.attendanceResultOutTime(last.getAttendanceLogOutTime())
				.attendanceResultLateMinute(lateMinFix((LocalDateTime) map.get("standard"), first.getAttendanceLogInTime().toLocalDateTime(), policy.getPolicyGraceTime()))
				.attendanceResultEarlyLeave(earlyLeave(standardOutTime, last.getAttendanceLogOutTime().toLocalDateTime()))
				.attendanceResultWorkTime((int)workMin)
				.attendanceResultOverTime((int)overTime)
				.memberNo(memberNo)
			.build();
	}
//		getOptions();
		if(policy.getPolicyType().equals( "고정")) {
			if(todayResult.getAttendanceResultEarlyLeave() > policy.getPolicyGraceTime()) {
				todayResult.setAttendanceResultState("지각");
				if(todayResult.getAttendanceResultEarlyLeave() > 0) {
					todayResult.setAttendanceResultState("지각, 조퇴");
				}
			}		
			else if(todayResult.getAttendanceResultEarlyLeave() > 0) {
				todayResult.setAttendanceResultState("조퇴");
			}
			else {
				todayResult.setAttendanceResultState("정상 근무");
			}
		}
		else if(policy.getPolicyType().equals( "자율")){
			if(todayResult.getAttendanceResultLateMinute() > 0) {
				todayResult.setAttendanceResultState("지각");
				if(todayResult.getAttendanceResultEarlyLeave() > 0) {
					todayResult.setAttendanceResultState("지각, 조퇴");
				}
			}
			else if(todayResult.getAttendanceResultEarlyLeave() > 0) {
				todayResult.setAttendanceResultState("조퇴");
			}
		else {
			todayResult.setAttendanceResultState("정상 근무");
		}
		
		}
		
		System.out.println("todayResult " + todayResult);
		if(noDup == true) {
			//System.out.println("ruerueuretueru3eruteurt");
			todayResult.setAttendanceResultNo(attendanceDao.sequenceResult());
			attendanceDao.reportDay(todayResult);			
		}
		else {
			//System.out.println("falflfslfaslflasfl");
			attendanceDao.update(todayResult);
		}
		System.out.println("결과 ");
		System.out.println(attendanceDao.selectResult(day, memberNo));
	}
		
	public Map<String, Object> getOptions() {
		Map<String, Object> map = new HashMap<>();
		PolicyDto policy = policyDao.selectOne(policyNo);
		String inTime =  policy.getPolicyInTime() ;
		LocalTime standardInTime = LocalTime.parse(inTime);
		int arrange = policy.getPolicyArrange();

		LocalTime updatedArrange = standardInTime.plusMinutes(arrange);
		
		int grace = policy.getPolicyGraceTime();
		
		LocalTime updatedGraceTime = standardInTime.plusMinutes(grace);
		
		LocalDateTime standardArrange = LocalDateTime.of(today.toLocalDate(), updatedArrange);
		
		LocalDateTime standardGraceTime = LocalDateTime.of(today.toLocalDate(), updatedGraceTime);
		LocalDateTime standard = LocalDateTime.of(today.toLocalDate(), standardInTime);
	
		
		System.err.println("standard : " + standard);
		System.err.println("granceTime : " + standardGraceTime );
		System.err.println("arrange : " + standardArrange);
		map.put("standard", standard);
		map.put("graceTime", standardGraceTime);
		map.put("arrange", standardArrange);
		
		//LocalDateTime standardEnd = LocalDateTime,.of(today.toLocalDate(), )
		//if(dto.getAttendanceLogInTime())
		return map;
	}
	
	public int lateMinFlex(LocalDateTime standard, LocalDateTime real, int arrange) {
		return 1;
	}
	
	public int lateMinFix(LocalDateTime standard, LocalDateTime real, int grace) {
//		System.out.println(standard);
//		System.out.println(grace);
		if(real.isBefore(standard) ) {
			return 0;
		}
		if(real.isEqual(standard)) {
			return 1;
		}
		int hour = (int)Duration.between(standard, real).toHours() * 60;
		int min = (int)Duration.between(standard, real).toMinutesPart();
		int total = hour + min;
		if(total < grace) return 0;
		return total;
	}
	
//	public int earlyLeave(LocalDateTime )
	public int earlyLeave(LocalDateTime standard, LocalDateTime real) {
		if(real.isAfter(standard) || real.isEqual(standard)) {
			return 0;
		}
		
		
		int min = (int)Duration.between(real, standard).toMinutes();
		return min;
	}

	public AttendanceResultDto getState(AttendanceResultDto dto) {
		if(dto.getAttendanceResultLateMinute() > 0) {
			dto.setAttendanceResultState("지각");
		}
		if(dto.getAttendanceResultEarlyLeave() > 0) {
			dto.setAttendanceResultState("조퇴");
		}
		if(dto.getAttendanceResultLateMinute() > 0 && dto.getAttendanceResultEarlyLeave() > 0) {
			dto.setAttendanceResultState("지각, 조퇴");
		}
		
		return null;
	}

}





























