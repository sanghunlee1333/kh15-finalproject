package com.kh.acaedmy_final.restcontroller;

import java.util.List;

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

import com.kh.acaedmy_final.dao.PlanDao;
import com.kh.acaedmy_final.dao.PlanReceiveDao;
import com.kh.acaedmy_final.dto.PlanDto;
import com.kh.acaedmy_final.dto.PlanReceiveDto;
import com.kh.acaedmy_final.error.TargetNotFoundException;
import com.kh.acaedmy_final.service.TokenService;
import com.kh.acaedmy_final.vo.ClaimVO;
import com.kh.acaedmy_final.vo.PlanRequestVO;
import com.kh.acaedmy_final.vo.PlanWithReceiversVO;

@RestController
@RequestMapping("/api/plan")
public class PlanRestController {

	@Autowired
	private PlanDao planDao;
	
	@Autowired
	private PlanReceiveDao planReceiveDao;
	
	@Autowired
	private TokenService tokenService;
	
	//등록(일정)
	@Transactional //일정 등록 + 수신자 등록 중 하나라도 실패 시 전체 롤백 처리 목적
	@PostMapping("/receiver")
	public void insertWithReceiver(@RequestBody PlanRequestVO vo, @RequestHeader("Authorization") String bearerToken) { //(참고)void를 쓰면 성공 시 HTTP 상태 200 OK만 반환. 	클라이언트(React 등)는 응답 본문 없이 성공 여부만 알 수 있음
		//1. 로그인 사용자 추출
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken); //bearerToken = HTTP 요청 헤더의 "Authorization" 값. Bearer 뒷 부분이 JWT토큰. 이 메서드는 JWT 토큰을 파싱해서 사용자 정보를 뽑아줌
		long memberNo = claimVO.getMemberNo(); //현재 로그인한 사용자의 고유번호(memberNo)를 가져오는 부분
		
		long planNo = planDao.sequence();
		
		//2. PlanDto 생성 및 저장
		PlanDto planDto = PlanDto.builder()
					.planNo(planNo)
					.planSenderNo(memberNo)
					.planType(vo.getPlanType())
					.planTitle(vo.getPlanTitle())
					.planContent(vo.getPlanContent())
					.planStartTime(vo.getPlanStartTime())
					.planEndTime(vo.getPlanEndTime())
				.build();
		
		//3. 등록
		planDao.insert(planDto);
		
		//4. 수신자 리스트 저장
		for(Long receiverNo : vo.getReceivers()) {
			PlanReceiveDto planReceiveDto = PlanReceiveDto.builder()
						.planReceiveNo(planNo)
						.planReceiveReceiverNo(receiverNo)
						.planReceiveIsAccept("N")
					.build();
			planReceiveDao.insert(planReceiveDto);
		}
		
		//5. (구현 예정) 수신자들에게 WebSocket 알림 발송
		
	}
	
	//등록(To do) *DB 및 DTO, 매핑 등 수정 필요
	@PostMapping("/")
	public void insert(@RequestBody PlanDto planDto) {

	}
	
	//삭제(일정)
	@DeleteMapping("/{planNo}")
	public void delete(@PathVariable long planNo) {
		PlanDto planDto = planDao.selectOne(planNo);
		if(planDto == null) throw new TargetNotFoundException();
		planDao.delete(planNo);
	}
	
	//전체 조회(일정)
	@GetMapping("/list")
	public List<PlanWithReceiversVO> getMyPlans(@RequestHeader("Authorization") String bearerToken) {
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		long memberNo = claimVO.getMemberNo();
		
		List<PlanDto> planList = planDao.selectList(memberNo);
		if(planList == null) throw new TargetNotFoundException();
		
		//PlanDto -> PlanWithReceiversVO 변환
	    List<PlanWithReceiversVO> result = planList.stream().map(plan -> {
	        PlanWithReceiversVO vo = new PlanWithReceiversVO();
	        vo.setPlanNo(plan.getPlanNo());
	        vo.setPlanTitle(plan.getPlanTitle());
	        vo.setPlanContent(plan.getPlanContent());
	        vo.setPlanStartTime(plan.getPlanStartTime());
	        vo.setPlanEndTime(plan.getPlanEndTime());
	        vo.setReceivers(planReceiveDao.selectReceiverList(plan.getPlanNo())); // 참여자 번호들
	        return vo;
	    }).toList();
	    
		return result;
	}
	
	//상세 조회(일정)
	@GetMapping("/{planNo}")
	public PlanDto find(@PathVariable long planNo) {
		PlanDto planDto = planDao.selectOne(planNo);
		if(planDto == null) throw new TargetNotFoundException();
		return planDto;
	}
	
	//수정(일정 달성 여부)
	@PatchMapping("/{planNo}")
	public void editUnit(@PathVariable long planNo, @RequestBody PlanDto planDto) {
		PlanDto targetDto = planDao.selectOne(planNo);
		if(targetDto == null) throw new TargetNotFoundException();
		planDao.updateStatus(planNo, planDto.getPlanStatus());
	}
}
