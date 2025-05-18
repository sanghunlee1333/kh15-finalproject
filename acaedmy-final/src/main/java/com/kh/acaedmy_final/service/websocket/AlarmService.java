package com.kh.acaedmy_final.service.websocket;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.academy_final.constant.AlarmType;
import com.kh.acaedmy_final.dao.websocket.AlarmDao;
import com.kh.acaedmy_final.dto.websocket.AlarmDto;
import com.kh.acaedmy_final.vo.PlanReceiverStatusVO;
import com.kh.acaedmy_final.vo.PlanWithReceiversVO;
import com.kh.acaedmy_final.vo.websocket.AlarmResponseVO;
import com.kh.acaedmy_final.websocket.AlarmSender;

/*
	* Service = 비즈니스 로직을 담당하는 계층
	(참고)Controller는 요청 받고 결과만 전달. DAO는 DB 작업만
	=> Service는 그 사이에서 필요한 계산, 분기, 조건 처리를 맡음
	
	- Controller가 요청을 전달
	- 여러 DAO를 조합해 처리 가능
	- 트랜잭션 관리가 주로 여기에 붙음 (@Transactional)
	- 테스트와 유지보수에 유리
*/

/*
	(참고)Service 클래스 안에서는 new 써도 괜찮음
	- Spring이 관리하는 Bean은 @Component, @Service, @Repository 등으로 등록한 것들이고,	AlarmDto는 단순 데이터 전송 객체(POJO) 이므로 Spring이 관리할 필요가 없음
	=> 즉, new AlarmDto()는 직접 생성해서 쓰는 게 정석
	=> 하지만 AlarmDao, AlarmService 같은 Bean 객체들은 @Autowired로 주입받아야 함
	=> new AlarmDao() 이런 건 절대 X
*/
@Service
public class AlarmService { //알림을 생성하고 DB에 저장하는 비즈니스 로직을 담당하는 역할
	
	@Autowired
	private AlarmDao alarmDao;
	
	@Autowired
	private AlarmSender alarmSender;
	
	//공통 알림 전송 메소드
	public void sendAlarm(long receiverNo, long alarmSenderNo, long planNo, AlarmType alarmType, String alarmMessage) {
		//중복 알림 방지: 동일한 유형/일정/수신자 조합이 이미 존재하면 skip
		if (alarmDao.existsByTypeAndPlanAndReceiver(alarmType.name(), planNo, receiverNo)) {
		    return; // 이미 존재하면 알림 보내지 않음
		}
		
		//1. AlarmDto 생성
		long alarmNo = alarmDao.sequence();
		
		AlarmDto alarmDto = new AlarmDto();
		alarmDto.setAlarmNo(alarmNo);
		alarmDto.setAlarmReceiverNo(receiverNo);
		alarmDto.setAlarmSenderNo(alarmSenderNo);
		alarmDto.setAlarmType(alarmType.name());
		alarmDto.setAlarmMessage(alarmMessage);
		alarmDto.setAlarmPlanNo(planNo);
		alarmDto.setAlarmRead("N");
		alarmDto.setAlarmCreateTime(Timestamp.valueOf(LocalDateTime.now()));
		//LocalDateTime.now() -> 현재 시간을 가져옴 (예: 2025-05-15T22:45:00)
		//Timestamp.valueOf(...) -> 이 시간을 DB에 넣을 수 있도록 java.sql.Timestamp 객체로 변환
		
		//2. DB에 저장
		alarmDao.insert(alarmDto);
		
		//3. 응답용 VO 생성 (AlarmResponseVO) - WebSocket으로 보내기 위해
		AlarmResponseVO alarmResponseVO = alarmDao.getAlarm(alarmDto.getAlarmNo());
		if(alarmResponseVO == null) return;
		
		//4. WebSocket 전송
		alarmSender.send(receiverNo, alarmResponseVO); 
		//alarm/{receiverNo}라는 WebSocket 구독 경로로 alarmResponseVO 데이터를 전송
		//이 메시지는 프론트에서 stompClient.subscribe("/alarm/123") 처럼 구독하고 있으면 실시간으로 받아짐
	}
	
	//일정 등록 시 수신자들에게 알림 보내는 메소드
	public void sendPlanCreateAlarm(long alarmSenderNo, List<Long> receiverList, long planNo, String alarmSenderName, String alarmSenderDepartment, String planTitle) {
		String alarmMessage = alarmSenderName + "(" + alarmSenderDepartment + ") 님이 [" + planTitle + "] 일정에 초대했습니다.";
		AlarmType alarmType = AlarmType.PLAN_CREATE;
		
		for (Long receiver : receiverList) {
			sendAlarm(receiver, alarmSenderNo, planNo, alarmType, alarmMessage);
		}
	}
	
	//수신자가 일정 수락/거절 시 작성자에게 알림 보내는 메소드
	public void sendPlanResponseAlarm(long responseMemberNo, long writerMemberNo, long planNo, String responseMemberName, String responseMemberDepartment, String planTitle, boolean accepted) {
		String alarmMessage = responseMemberName + "(" + responseMemberDepartment + ") 님이 [" + planTitle + "] 일정을 " + (accepted ? "수락" : "거절") + "했습니다.";
		AlarmType alarmType = accepted ? AlarmType.PLAN_ACCEPT : AlarmType.PLAN_REJECT;
		
		sendAlarm(writerMemberNo, responseMemberNo, planNo, alarmType, alarmMessage);
	}
	
	//모든 수신자가 일정을 달성하여 일정이 완료되었을 때 모든 수신자에게 알림 보내는 메소드
	public void sendPlanAllCompleteAlarm(long alarmSenderNo, List<Long> receiverList, long planNo, String planTitle) {
		String alarmMessage = "[" + planTitle + "] 일정이 완료되었습니다.";
		AlarmType alarmType = AlarmType.PLAN_COMPLETE;
		
		for(Long receiver : receiverList) {
			sendAlarm(receiver, alarmSenderNo, planNo, alarmType, alarmMessage);
		}
	}
	
	//작성자가 일정을 삭제했을 때, 관련 일정 알림들을 삭제하고, 모든 수신자에게 삭제 알림을 보내는 메소드
	public void sendPlanDeleteAlarm(long alarmSenderNo, List<Long> receiverList, long planNo, String planTitle) {
		//1. 새 알림 전송
		String alarmMessage = "[" + planTitle + "] 일정이 삭제되었습니다.";
		AlarmType alarmType = AlarmType.PLAN_DELETE;
		
		//2. 삭제 알림 생성
		for(Long receiver : receiverList) {
			long alarmNo = alarmDao.sequence();
			
			AlarmDto alarmDto = new AlarmDto();
			alarmDto.setAlarmNo(alarmNo);
			alarmDto.setAlarmReceiverNo(receiver);
			alarmDto.setAlarmSenderNo(alarmSenderNo);
			alarmDto.setAlarmPlanNo(planNo);
			alarmDto.setAlarmMessage(alarmMessage);
			alarmDto.setAlarmType(alarmType.name());
			alarmDto.setAlarmRead("N");
			alarmDto.setAlarmCreateTime(Timestamp.valueOf(LocalDateTime.now()));
			
			//3. DB insert
	        alarmDao.insert(alarmDto);

	        //4. WebSocket 전송
	        AlarmResponseVO vo = alarmDao.getAlarm(alarmNo);
	        if (vo != null) {
	            alarmSender.send(receiver, vo);
	        }
		}
			
	}
	
	//alarm 테이블에 insert하고, WebSocket으로 전송까지 수행하는 메소드
	public void sendPlanTimedAlarm(PlanWithReceiversVO plan, AlarmType alarmType, String alarmMessage) {
		for (PlanReceiverStatusVO receiver : plan.getReceivers()) {
			//중복 알림 방지: 동일한 유형/일정/수신자 조합이 이미 존재하면 skip
			boolean exists = alarmDao.existsByTypeAndPlanAndReceiver(alarmType.name(), plan.getPlanNo(), receiver.getPlanReceiveReceiverNo());
	        if (exists) continue;
	        
			//1. 알림 정보 설정
			long alarmNo = alarmDao.sequence();
			AlarmDto alarmDto = new AlarmDto();
			alarmDto.setAlarmNo(alarmNo);
			alarmDto.setAlarmReceiverNo(receiver.getPlanReceiveReceiverNo()); //알림 수신자
			alarmDto.setAlarmSenderNo(plan.getPlanSenderNo());
			alarmDto.setAlarmType(alarmType.name());
			alarmDto.setAlarmMessage(alarmMessage);
			alarmDto.setAlarmPlanNo(plan.getPlanNo());
			alarmDto.setAlarmRead("N");
			alarmDto.setAlarmCreateTime(Timestamp.valueOf(LocalDateTime.now()));
			
			//2. DB저장
			alarmDao.insert(alarmDto);
			
			//3. VO로 다시 조회 
			AlarmResponseVO alarmResponseVO = alarmDao.getAlarm(alarmDto.getAlarmNo());
			
			//4. WebSocket 전송
			if(alarmResponseVO != null) {
				alarmSender.send(receiver.getPlanReceiveReceiverNo(), alarmResponseVO);
			}
		}
	}
	
	
}
