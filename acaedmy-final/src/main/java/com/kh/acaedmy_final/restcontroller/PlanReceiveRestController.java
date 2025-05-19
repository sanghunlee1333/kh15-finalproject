package com.kh.acaedmy_final.restcontroller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.acaedmy_final.dao.MemberDao;
import com.kh.acaedmy_final.dao.PlanDao;
import com.kh.acaedmy_final.dao.PlanReceiveDao;
import com.kh.acaedmy_final.dto.MemberDto;
import com.kh.acaedmy_final.dto.PlanDto;
import com.kh.acaedmy_final.service.websocket.AlarmService;
import com.kh.acaedmy_final.vo.PlanReceiveResponseVO;
import com.kh.acaedmy_final.vo.PlanStatusUpdateRequestVO;

//수신자 입장에서 받은 일정 목록을 조회하는 API
@RestController
@RequestMapping("/api/plan/receive")
public class PlanReceiveRestController {

	@Autowired
	private PlanReceiveDao planReceiveDao;
	
	@Autowired
	private PlanDao planDao;
	
	@Autowired
	private MemberDao memberDao;
	
	@Autowired
	private AlarmService alarmService;
	
	//수신자가 일정을 수락하는 API
	@PatchMapping("/planNo/{planNo}/receiverNo/{planReceiverNo}/response")
	public void respond(@PathVariable long planNo, @PathVariable long planReceiverNo, @RequestBody PlanStatusUpdateRequestVO vo) {

		//1. 작성자, 일정 조회 및 일정 삭제 체크
	    PlanDto planDto = planDao.selectOne(planNo); //작성자 정보, 일정 제목
	    if (planDto == null) return;	
		
		//2. 수락/거절 처리
		boolean accepted = "Y".equalsIgnoreCase(vo.getPlanStatus());
		if(accepted) {
			planReceiveDao.accept(planNo, planReceiverNo); 
		}
		else {
			planReceiveDao.reject(planNo, planReceiverNo); 
		}
		
		//3. 수신자 정보 조회
		MemberDto receiverDto = memberDao.selectOne(planReceiverNo); //수신자 정보
		
		//4. 알림 전송
		alarmService.sendPlanResponseAlarm(planReceiverNo, planDto.getPlanSenderNo(), planNo, receiverDto.getMemberName(), receiverDto.getMemberDepartment(), planDto.getPlanTitle(), accepted);
	}
	
	//수신자(memberNo)가 수신한 일정 목록을 가져오겠다는 요청(수락하지 않은 일정 제외) -> 사용
	@GetMapping("/accepted/{memberNo}")
	public List<PlanReceiveResponseVO> acceptedList(@PathVariable long memberNo){
		return planReceiveDao.listAccepted(memberNo);
	}
	
	//수신자(memberNo)가 수신한 일정 목록을 가져오겠다는 요청(수락하지 않은 일정 포함) -> 미사용
	//List<PlanReceiveResponseVO> 형태로 JSON 리턴
	@GetMapping("/{memberNo}")
	public List<PlanReceiveResponseVO> receiveList(@PathVariable long memberNo){
		return planReceiveDao.listReceived(memberNo);
	}
	
}
