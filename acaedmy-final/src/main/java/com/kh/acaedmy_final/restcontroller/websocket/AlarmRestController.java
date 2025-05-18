package com.kh.acaedmy_final.restcontroller.websocket;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kh.acaedmy_final.dao.websocket.AlarmDao;
import com.kh.acaedmy_final.service.TokenService;
import com.kh.acaedmy_final.vo.ClaimVO;
import com.kh.acaedmy_final.vo.websocket.AlarmResponseVO;

@RestController
@RequestMapping("/api/alarm")
public class AlarmRestController {

	@Autowired
	private AlarmDao alarmDao;
	
	@Autowired
	private TokenService tokenService;

	//알림 삭제(1개)
	@DeleteMapping("/{alarmNo}")
	public boolean delete(@PathVariable long alarmNo) {
		return alarmDao.delete(alarmNo);
	}
	
	//알림 삭제(전체)
	@DeleteMapping("/all")
	public boolean deleteAll(@RequestHeader("Authorization") String bearerToken) {
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		long receiverNo = claimVO.getMemberNo();
		
		return alarmDao.deleteAll(receiverNo);
	}
	
	//전체 알림 조회(수신자 기준)
	@GetMapping("/")
	public List<AlarmResponseVO> getAlarms(@RequestHeader("Authorization") String bearerToken) {
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken); //ClaimVO = 사용자 정보 파싱용 객체. TokenService.parseBearerToken()이 JWT 토큰을 파싱해서 반환하는 객체
		long receiverNo = claimVO.getMemberNo();
		
		return alarmDao.selectListByReceiver(receiverNo);
	}
	
	//알림 전체 읽음 처리
	@PatchMapping("/")
	public void readAll(@RequestHeader("Authorization") String bearerToken) {
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		long receiverNo = claimVO.getMemberNo();
		
		alarmDao.updateReadByReceiver(receiverNo);
	}
	
	//안 읽은 알림 개수 세기
	@GetMapping("/count")
	public int countUnRead(@RequestHeader("Authorization") String bearerToken) {
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		long receiverNo = claimVO.getMemberNo();
		
		return alarmDao.countUnRead(receiverNo);
	}
	
	//알림 조회(무한 스크롤)
	@GetMapping("/scroll")
	public List<AlarmResponseVO> getAlarmScroll(@RequestHeader("Authorization") String bearerToken, @RequestParam int offset, @RequestParam int size) {
		ClaimVO claimVO = tokenService.parseBearerToken(bearerToken);
		long receiverNo = claimVO.getMemberNo();
		
		return alarmDao.selectListByReceiverWithPaging(receiverNo, offset, size);
	}
	
}
