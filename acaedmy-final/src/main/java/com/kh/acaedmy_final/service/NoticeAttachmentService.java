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

    public void connectEditorImages(long noticeNo, String noticeContent) {
        List<Integer> imageAttachmentNos = extractAttachmentNumbers(noticeContent);
        Set<Integer> uniqueAttachmentNos = new HashSet<>(imageAttachmentNos);

        for (int attachmentNo : uniqueAttachmentNos) {
            noticeDao.connectEditor(noticeNo, attachmentNo);
        }
    }

    private List<Integer> extractAttachmentNumbers(String html) {
        List<Integer> list = new ArrayList<>();
        Pattern pattern = Pattern.compile("/attachment/(\\d+)");
        Matcher matcher = pattern.matcher(html);
        while (matcher.find()) {
            list.add(Integer.parseInt(matcher.group(1)));
        }
        return list;
    }
}
