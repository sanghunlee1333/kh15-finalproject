package com.kh.acaedmy_final.restcontroller.websocket;

import java.io.File;
import java.io.FileInputStream;
import java.net.URLEncoder;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.kh.acaedmy_final.dao.AttachmentDao;
import com.kh.acaedmy_final.dto.AttachmentDto;
import com.kh.acaedmy_final.error.TargetNotFoundException;

import jakarta.servlet.http.HttpServletResponse;

@RestController
public class AttachmentDownloadRestController {

    @Autowired
    private AttachmentDao attachmentDao;

    // 저장 경로 (application.properties에서 설정)
    @Value("${custom.fileupload.root}")
    private String uploadPath;

    @GetMapping("/attachment/download/{attachmentNo}")
    public void download(@PathVariable int attachmentNo, HttpServletResponse response) throws Exception {
        // 1. DB에서 첨부파일 정보 조회
        AttachmentDto attachmentDto = attachmentDao.selectOne(attachmentNo);
        if (attachmentDto == null) {
            throw new TargetNotFoundException("해당 첨부파일이 존재하지 않습니다");
        }

        // 2. 실제 저장된 파일 경로는 번호 또는 UUID 기반으로 저장되어 있다고 가정
        File file = new File(uploadPath, String.valueOf(attachmentNo));
        if (!file.exists()) {
            throw new TargetNotFoundException("서버에 실제 파일이 존재하지 않습니다");
        }

        // 3. 다운로드용 응답 헤더 설정
        response.setContentType("application/octet-stream");
        String encodedName = URLEncoder.encode(attachmentDto.getAttachmentName(), "UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + encodedName + "\"");
        response.setContentLength((int) file.length());

        // 4. 실제 파일을 응답 스트림으로 전송
        try (FileInputStream in = new FileInputStream(file)) {
            byte[] buffer = new byte[8192];
            int count;
            while ((count = in.read(buffer)) != -1) {
                response.getOutputStream().write(buffer, 0, count);
            }
        }
    }
}
