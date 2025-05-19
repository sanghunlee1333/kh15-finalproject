package com.kh.acaedmy_final.utill;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class FileUtils {

    @Value("${custom.fileupload.root}")
    private String fileUploadRoot;

    public String save(MultipartFile file) {
        if (file.isEmpty()) return null;

        // 저장할 폴더 생성
        File dir = new File(fileUploadRoot);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        // 저장할 파일명 생성 (UUID)
        String uuid = UUID.randomUUID().toString();
        String extension = getExtension(file.getOriginalFilename());
        String savedName = uuid + (extension.isEmpty() ? "" : "." + extension);

        // 실제 저장할 경로
        File target = new File(dir, savedName);
        try {
            file.transferTo(target);
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패", e);
        }

        return savedName;
    }

    private String getExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        return (dot == -1) ? "" : filename.substring(dot + 1);
    }
}
