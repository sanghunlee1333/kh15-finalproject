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
		
		//1. 시작 30분 전 알림
		List<PlanWithReceiversVO> soonList = planDao.findPlansStartingSoon(Timestamp.valueOf(now.plusMinutes(30)));
		for (PlanWithReceiversVO vo : soonList) {
			List<PlanReceiverStatusVO> receivers = planReceiveDao.selectPlanReceiverStatusList(vo.getPlanNo());
			vo.setReceivers(receivers);
			alarmService.sendPlanTimedAlarm(vo, AlarmType.PLAN_SOON, "[" + vo.getPlanTitle() + "]이 시작하기 30분 전 입니다.");
		}
		
		//2. 시작 알림
		List<PlanWithReceiversVO> startList = planDao.findPlansStartingAt(Timestamp.valueOf(now));
		for (PlanWithReceiversVO vo : startList) {
			List<PlanReceiverStatusVO> receivers = planReceiveDao.selectPlanReceiverStatusList(vo.getPlanNo());
			vo.setReceivers(receivers);
			alarmService.sendPlanTimedAlarm(vo, AlarmType.PLAN_START, "[" + vo.getPlanTitle() + "]이 시작되었습니다.");
		}
		
		//3. 종료 알림
		List<PlanWithReceiversVO> endList = planDao.findPlansEndingAt(Timestamp.valueOf(now));
		for (PlanWithReceiversVO vo : endList) {
			List<PlanReceiverStatusVO> receivers = planReceiveDao.selectPlanReceiverStatusList(vo.getPlanNo());
			vo.setReceivers(receivers);
			alarmService.sendPlanTimedAlarm(vo, AlarmType.PLAN_END, "[" + vo.getPlanTitle() + "]이 종료되었습니다.");
		}
	}
}
