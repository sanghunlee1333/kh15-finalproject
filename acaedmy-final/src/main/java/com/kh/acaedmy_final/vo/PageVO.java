package com.kh.acaedmy_final.vo;

import lombok.Data;

@Data
public class PageVO {
	private String page; //요청한 페이지 번호
	private String size; //한 페이지에 몇 개씩 보여줄 건지
	private String column;
	private String keyword;
}
