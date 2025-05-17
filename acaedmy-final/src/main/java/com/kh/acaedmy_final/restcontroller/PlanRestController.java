package com.kh.acaedmy_final.restcontroller;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.acaedmy_final.dao.MemberDao;
import com.kh.acaedmy_final.dao.PlanDao;
import com.kh.acaedmy_final.dao.PlanReceiveDao;
import com.kh.acaedmy_final.dto.MemberDto;
import com.kh.acaedmy_final.dto.PlanDto;
import com.kh.acaedmy_final.dto.PlanReceiveDto;
import com.kh.acaedmy_final.error.TargetNotFoundException;
import com.kh.acaedmy_final.service.TokenService;
import com.kh.acaedmy_final.service.websocket.AlarmService;
import com.kh.acaedmy_final.vo.ClaimVO;
import com.kh.acaedmy_final.vo.PlanReceiverStatusVO;
import com.kh.acaedmy_final.vo.PlanRequestVO;
import com.kh.acaedmy_final.vo.PlanStatusUpdateRequestVO;
import com.kh.acaedmy_final.vo.PlanWithReceiversVO;


@RestController
@RequestMapping("/api/plan")
public class PlanRestController {

	@Autowired
	private PlanDao planDao;
	
	@Autowired
	private PlanReceiveDao planReceiveDao;
	
	@Autowired
	private MemberDao memberDao;
	
	@Autowired
	private AlarmService alarmService;
	
	@Autowired
	private TokenService tokenService;
	
	private boolean isAllDay(Timestamp start, Timestamp end) {
		if (start == null || end == null) return false;
		boolean startIsMidnight = start.toLocalDateTime().toLocalTime().equals(LocalTime.MIDNIGHT);
		boolean endIsMidnight = end.toLocalDateTime().toLocalTime().equals(LocalTime.MIDNIGHT);
	
		long hours = Duration.between(start.toLocalDateTime(), end.toLocalDateTime()).toHours();
		
		return startIsMidnight && endIsMidnight && hours >= 24;
	}
	
	//등록(개인-Todo)
	@Transactional
	@PostMapping("/personal")
	public void insertPersonalPlan(@RequestBody PlanDto planDto, @RequestHeader("Authorization") String bearerToken) {
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		long planNo = planDao.sequence();
		planDto.setPlanNo(planNo);
		planDto.setPlanSenderNo(claimVO.getMemberNo());
		planDto.setPlanType("개인");
		planDto.setPlanStatus("미달성");
		
		planDto.setPlanIsAllDay(
				isAllDay(planDto.getPlanStartTime(), planDto.getPlanEndTime()) ? "Y" : "N"
		);
		planDao.insert(planDto);
		
//		PlanReceiveDto writerDto = PlanReceiveDto.builder()
//			    .planReceivePlanNo(planNo)
//			    .planReceiveReceiverNo(claimVO.getMemberNo())
//			    .planReceiveIsWriter("Y")
//			    .planReceiveIsAccept("Y")
//			    .planReceiveStatus("미달성")
//			    .build();
//		planReceiveDao.insert(writerDto);
	}
	
	//등록(팀-일정)
	@Transactional //일정 등록 + 수신자 등록 중 하나라도 실패 시 전체 롤백 처리 목적
	@PostMapping("/team")
	public void insertWithReceiver(@RequestBody PlanRequestVO vo, @RequestHeader("Authorization") String bearerToken) { //(참고)void를 쓰면 성공 시 HTTP 상태 200 OK만 반환. 	클라이언트(React 등)는 응답 본문 없이 성공 여부만 알 수 있음
		//1. 로그인 사용자 추출
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken); //bearerToken = HTTP 요청 헤더의 "Authorization" 값. Bearer 뒷 부분이 JWT토큰. 이 메서드는 JWT 토큰을 파싱해서 사용자 정보를 뽑아줌
		long memberNo = claimVO.getMemberNo(); //현재 로그인한 사용자의 고유번호(memberNo)를 가져오는 부분
		long planNo = planDao.sequence();
		
		//2. PlanDto 생성 및 저장
		PlanDto planDto = PlanDto.builder()
					.planNo(planNo)
					.planSenderNo(memberNo)
					.planStatus("미달성")
					.planType(vo.getPlanType()) //"팀"
					.planTitle(vo.getPlanTitle())
					.planContent(vo.getPlanContent())
					.planColor(vo.getPlanColor())
					.planStartTime(vo.getPlanStartTime())
					.planEndTime(vo.getPlanEndTime())
					.planIsAllDay(isAllDay(vo.getPlanStartTime(), vo.getPlanEndTime()) ? "Y" : "N")
				.build();
		
		//3. 등록
		planDao.insert(planDto);
		
		//4. 작성자도 참여자 테이블에 추가
		PlanReceiveDto writerDto = PlanReceiveDto.builder()
		        .planReceivePlanNo(planNo)
		        .planReceiveReceiverNo(memberNo)
		        .planReceiveIsWriter("Y")
		        .planReceiveIsAccept("Y") // 작성자는 자동 수락
		        .planReceiveStatus("미달성")
		        .build();
		planReceiveDao.insert(writerDto);
		
		//4. 수신자 리스트 저장 + 수신자들에게 WebSocket 알림 발송
		for(Long receiverNo : vo.getReceivers()) {
			//수신자 리스트 저장
			PlanReceiveDto planReceiveDto = PlanReceiveDto.builder()
						.planReceivePlanNo(planNo)
						.planReceiveReceiverNo(receiverNo)
						.planReceiveIsWriter("N")
						.planReceiveIsAccept(null)
						.planReceiveStatus("미달성")
					.build();
			planReceiveDao.insert(planReceiveDto);
		}	
		
		//5. 알림 전송
		MemberDto senderDto = memberDao.selectOne(memberNo);
		alarmService.sendPlanCreateAlarm(memberNo, vo.getReceivers(), planNo, senderDto.getMemberName(), senderDto.getMemberDepartment(),planDto.getPlanTitle());
	}
	
	//전체 조회(개인 + 팀)
	@GetMapping("all")
	public List<PlanDto> getAllPlans(@RequestHeader("Authorization") String bearerToken) {
		long memberNo = tokenService.parseBearerToken(bearerToken).getMemberNo();
        List<PlanDto> allPlans = planDao.selectAllList(memberNo); 
		return allPlans;
	}
	
	//전체 조회(개인-Todo)
	@GetMapping("/personal")
	public List<PlanDto> getPersonalPlans(@RequestHeader("Authorization") String bearerToken) {
		long memberNo = tokenService.parseBearerToken(bearerToken).getMemberNo();
        List<PlanDto> myplans = planDao.selectPersonalList(memberNo);
		return myplans;
	}
	
	//전체 조회(팀-일정)
	@GetMapping("/team")
	public List<PlanWithReceiversVO> getTeamPlans(@RequestHeader("Authorization") String bearerToken) {
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		long memberNo = claimVO.getMemberNo();
		List<PlanDto> planList = planDao.selectTeamList(memberNo);
		if(planList == null) throw new TargetNotFoundException();
		
		//PlanDto -> PlanWithReceiversVO 변환
	    List<PlanWithReceiversVO> result = planList.stream().map(plan -> {
	        PlanWithReceiversVO vo = new PlanWithReceiversVO();
	        vo.setPlanNo(plan.getPlanNo());
	        vo.setPlanSenderNo(plan.getPlanSenderNo());
	        vo.setPlanStatus(plan.getPlanStatus());
	        vo.setPlanTitle(plan.getPlanTitle());
	        vo.setPlanContent(plan.getPlanContent());
	        vo.setPlanColor(plan.getPlanColor());
	        vo.setPlanStartTime(plan.getPlanStartTime());
	        vo.setPlanEndTime(plan.getPlanEndTime());
	        vo.setPlanIsAllDay(plan.getPlanIsAllDay());
	        vo.setReceivers(planReceiveDao.selectReceiverList(plan.getPlanNo())); //수신자 상태
	        
	        MemberDto writerDto = memberDao.selectOne(plan.getPlanSenderNo());
	        vo.setPlanSenderName(writerDto.getMemberName());
	        vo.setPlanSenderDepartment(writerDto.getMemberDepartment());
	        
	        return vo;
	    }).toList();
	    
		return result;
	}
	
	//상세 조회
	@GetMapping("/{planNo}")
//	public PlanDto find(@PathVariable long planNo) {
	public PlanWithReceiversVO find(@PathVariable long planNo) {
		PlanDto planDto = planDao.selectOne(planNo);
		if(planDto == null) throw new TargetNotFoundException();
//		return planDto;
		
		//알림 컴포넌트에서 상세모달 구현으로 코드 변경
		MemberDto writer = memberDao.selectOne(planDto.getPlanSenderNo());

	    PlanWithReceiversVO vo = new PlanWithReceiversVO();
	    vo.setPlanNo(planDto.getPlanNo());
	    vo.setPlanSenderNo(planDto.getPlanSenderNo());
	    vo.setPlanSenderName(writer.getMemberName());
	    vo.setPlanSenderDepartment(writer.getMemberDepartment());
	    vo.setPlanStatus(planDto.getPlanStatus());
	    vo.setPlanTitle(planDto.getPlanTitle());
	    vo.setPlanContent(planDto.getPlanContent());
	    vo.setPlanColor(planDto.getPlanColor());
	    vo.setPlanStartTime(planDto.getPlanStartTime());
	    vo.setPlanEndTime(planDto.getPlanEndTime());
	    vo.setPlanIsAllDay(planDto.getPlanIsAllDay());
	    vo.setReceivers(planReceiveDao.selectPlanReceiverStatusList(planDto.getPlanNo()));
	    
	    return vo;
	}
	
	//삭제
	@Transactional
	@DeleteMapping("/{planNo}")
	public void delete(@PathVariable long planNo) {
		PlanDto planDto = planDao.selectOne(planNo);
		if(planDto == null) return;
		
		//참여자 목록 추출
		List<Long> receiverList = planReceiveDao.selectReceiverList(planNo)
				.stream()
				.map(PlanReceiverStatusVO::getPlanReceiveReceiverNo)
				.collect(Collectors.toList());
		
		//새 알림 전송
		alarmService.sendPlanDeleteAlarm(planDto.getPlanSenderNo(), receiverList, planDto.getPlanNo(), planDto.getPlanTitle());
		
		//일정 삭제
		planDao.delete(planNo);
	}
	
	//이 API의 역할은 "일정"의 상태를 업데이트하는 것이기 때문에 PlanReceiverRestController가 아닌 이 컨트롤러에 작성
	//수정(일정 달성 여부)
	@PatchMapping("/{planNo}/status")
	public void updateStatus(@PathVariable long planNo, @RequestBody PlanStatusUpdateRequestVO vo, @RequestHeader("Authorization") String bearerToken) {
		//1. 로그인 사용자 식별
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		long memberNo = claimVO.getMemberNo();

		//2. 수신자 일정 달성 상태 업데이트
		boolean updated = planReceiveDao.updateReceiveStatus(planNo, memberNo, vo.getPlanStatus());

	    //3. 개인 Todo는 plan_receive 테이블에 없을 수 있음
	    if (updated == false) {
	        planDao.updateStatus(planNo, vo.getPlanStatus()); //작성자의 개인 일정이라면 plan 테이블 직접 업데이트
	        return;
	    }
		
	    //4. 팀 일정은 모든 참여자(작성자+수신자)는 plan_receive에 있으므로 거기서 상태 업데이트
	    planReceiveDao.updateReceiveStatus(planNo, memberNo, vo.getPlanStatus());
	    
	    //5. 전체 완료 여부 확인
	    boolean isAllComplete = planReceiveDao.isAllComplete(planNo);
	    
	    //6. 전체 완료 여부 확인 되면, plan 테이블 상태 업데이트
	    planDao.updateStatus(planNo, isAllComplete ? "완료" : "미완료");
	    
	    //7. 이어서, 알림 전송
	    if(isAllComplete) {
	    	//특정 일정(planNo)의 모든 참여자(작성자 포함)의 회원 번호만 추출
	    	List<Long> receiverList = planReceiveDao.selectReceiverList(planNo) //plan_receive 테이블에서 plan_no에 해당하는 모든 참여자 정보를 가져옴
	    			.stream() //위 리스트를 스트림 형태로 변환해서, 순차적으로 가공할 수 있게 함
	    			.map(r -> r.getPlanReceiveReceiverNo()) //각 참여자 VO에서 planReceiveReceiverNo만 뽑아냄. 즉, PlanReceiverStatusVO -> Long 변환
	    			.collect(Collectors.toList()); //위에서 뽑은 Long 값들을 다시 List<Long> 형태로 모음
	    	
	    	//일정 작성자, 제목 조회
	    	PlanDto planDto = planDao.selectOne(planNo);
	    	
	    	//알림 전송
	    	alarmService.sendPlanAllCompleteAlarm(memberNo, receiverList, planNo, planDto.getPlanTitle());
	    }
	}
	
}
