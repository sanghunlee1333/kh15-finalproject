package com.kh.acaedmy_final.websocket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.kh.acaedmy_final.dto.websocket.AlarmDto;
import com.kh.acaedmy_final.vo.websocket.AlarmResponseVO;

@Component
public class AlarmSender { //WebSocket 전송 역할

	@Autowired
	private SimpMessagingTemplate simpMessagingTemplate;
	
	//AlarmDTO 용
	public void send(Long receiverNo, AlarmDto alarmDto) {
		simpMessagingTemplate.convertAndSend("/alarm/" + receiverNo, alarmDto);
	}
	
	//AlarmResponseVO 용 *메소드 오버로딩
	public void send(Long receiverNo, AlarmResponseVO responseVO) {
        simpMessagingTemplate.convertAndSend("/alarm/" + receiverNo, responseVO);
    }
}
