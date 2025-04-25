package com.kh.acaedmy_final.vo;

import lombok.Data;

@Data
public class SearchVO {
	private int page = 1; //요청한 페이지 번호
	private int size = 10; //한 페이지에 몇 개씩 보여줄 건지
	private String column;
	private String keyword;
	
	public int getBeginRow() {
		return (page - 1) * size + 1;
	}
	public int getEndRow() {
		return page * size;
	}
}
