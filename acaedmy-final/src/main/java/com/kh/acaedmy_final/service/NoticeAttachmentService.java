package com.kh.acaedmy_final.service;


import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kh.acaedmy_final.dao.NoticeDao;

@Service
public class NoticeAttachmentService {
	 
	@Autowired
    private NoticeDao noticeDao;
	
	@Autowired
	private AttachmentService attachmentService;

    public void deleteNoticeImages(long noticeNo) {
    	 //1. 먼저 연결된 첨부파일 번호 조회
        List<Integer> attachmentNoList = noticeDao.findNoticeImageAttachmentNoList(noticeNo);

        //2. 연결 해제
        noticeDao.deleteNoticeImageConnections(noticeNo);

        //3. 첨부파일 삭제
        Set<Integer> uniqueAttachmentNos = new HashSet<>(attachmentNoList);
        for (int attachmentNo : uniqueAttachmentNos) {
            attachmentService.delete(attachmentNo);
        }
    }
    
    public void deleteEditorImages(long noticeNo) {
    	List<Integer> attachmentNoList = noticeDao.findEditorAttachmentNoList(noticeNo);

        // 먼저 연결 테이블 삭제 (안하면 attachment에서 delete 못함)
        noticeDao.deleteEditorImageConnections(noticeNo); // delete from notice_editor_image

        // 그리고 attachment 삭제 (여기서 실제 파일도 지워짐)
        for (int attachmentNo : attachmentNoList) {
            attachmentService.delete(attachmentNo);
        }
    }
}
