package com.kh.acaedmy_final.configuration;

import java.io.File;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@Data
@Component
@ConfigurationProperties(prefix = "custom.fileupload")
public class FileuploadProperties {
	private String root;
	
	public File getRootDir() {
		return new File(root);
	}
}
