package com.kh.acaedmy_final.restcontroller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.acaedmy_final.dao.PlanReceiveDao;
import com.kh.acaedmy_final.vo.PlanReceiveResponseVO;
import com.kh.acaedmy_final.vo.PlanStatusUpdateRequestVO;

//수신자 입장에서 받은 일정 목록을 조회하는 API
@RestController
@RequestMapping("/api/plan/receive")
public class PlanReceiveRestController {

	@Autowired
	private PlanReceiveDao planReceiveDao;
	
	//수신자(memberNo)가 수신한 일정 목록을 가져오겠다는 요청
	//List<PlanReceiveResponseVO> 형태로 JSON 리턴
	@GetMapping("/{memberNo}")
	public List<PlanReceiveResponseVO> receiveList(@PathVariable long memberNo){
		return planReceiveDao.listReceived(memberNo);
	}
	
	//수신자가 일정을 수락하는 API
	@PatchMapping("/{planNo}/receiverNo/{planReceiverNo}/accept")
	public void accept(@PathVariable long planNo, @PathVariable long planReceiverNo) {
	    planReceiveDao.accept(planNo, planReceiverNo);
	}
	
	@GetMapping("/accepted/{memberNo}")
	public List<PlanReceiveResponseVO> acceptedList(@PathVariable long memberNo){
		return planReceiveDao.listAccepted(memberNo);
	}
	
}
