package com.kh.acaedmy_final.utill;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.kh.academy_final.constant.AlarmType;
import com.kh.acaedmy_final.dao.PlanDao;
import com.kh.acaedmy_final.dao.PlanReceiveDao;
import com.kh.acaedmy_final.service.websocket.AlarmService;
import com.kh.acaedmy_final.vo.PlanReceiverStatusVO;
import com.kh.acaedmy_final.vo.PlanWithReceiversVO;

@Component
public class PlanAlarmScheduler {

	@Autowired
	private PlanDao planDao; //일정 목록 가져오는 DAO
	
	@Autowired
	private PlanReceiveDao planReceiveDao;
	
	@Autowired
	private AlarmService alarmService;
	
	@Scheduled(cron = "0 * * * * *")
	public void work() {
		
		LocalDateTime now = LocalDateTime.now();
		Timestamp base = Timestamp.valueOf(now);
		Timestamp plus1min = Timestamp.valueOf(now.plusMinutes(1));
		Timestamp plus30min = Timestamp.valueOf(now.plusMinutes(30));
		Timestamp plus31min = Timestamp.valueOf(now.plusMinutes(31));
		
		//1. 시작 30분 전 알림
		List<PlanWithReceiversVO> soonList = planDao.findPlansStartingSoon(plus30min, plus31min);
		for (PlanWithReceiversVO vo : soonList) {
			List<PlanReceiverStatusVO> receivers = planReceiveDao.selectPlanReceiverStatusList(vo.getPlanNo());
			
			//일정 수락한 사람만 필터링
			List<PlanReceiverStatusVO> accepted = receivers.stream()
					.filter(r -> "Y".equals(r.getPlanReceiveIsAccept()))
					.toList();
			
			vo.setReceivers(accepted);
			alarmService.sendPlanTimedAlarm(vo, AlarmType.PLAN_SOON, "[" + vo.getPlanTitle() + "] 시작 30분 전 입니다.");
		}
		
		//2. 시작 알림
		List<PlanWithReceiversVO> startList = planDao.findPlansStartingAt(base, plus1min);
		for (PlanWithReceiversVO vo : startList) {
			List<PlanReceiverStatusVO> receivers = planReceiveDao.selectPlanReceiverStatusList(vo.getPlanNo());
			
			//일정 수락한 사람만 필터링
			List<PlanReceiverStatusVO> accepted = receivers.stream()
					.filter(r -> "Y".equals(r.getPlanReceiveIsAccept()))
					.toList();
			
			vo.setReceivers(accepted);
			alarmService.sendPlanTimedAlarm(vo, AlarmType.PLAN_START, "[" + vo.getPlanTitle() + "] 일정이 시작되었습니다.");
		}
		
		//3. 종료 알림
		List<PlanWithReceiversVO> endList = planDao.findPlansEndingAt(base, plus1min);
		for (PlanWithReceiversVO vo : endList) {
			List<PlanReceiverStatusVO> receivers = planReceiveDao.selectPlanReceiverStatusList(vo.getPlanNo());
			
			//일정 수락한 사람만 필터링
			List<PlanReceiverStatusVO> accepted = receivers.stream()
					.filter(r -> "Y".equals(r.getPlanReceiveIsAccept()))
					.toList();
			
			vo.setReceivers(accepted);
			alarmService.sendPlanTimedAlarm(vo, AlarmType.PLAN_END, "[" + vo.getPlanTitle() + "] 일정이 종료되었습니다.");
		}
		
	}
}
