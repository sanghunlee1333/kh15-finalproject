package com.kh.acaedmy_final.vo;

import lombok.Data;

@Data
public class SearchVO {
	private String column;
	private String keyword;
}

/*
	- VO(Value Object) = "값을 담는 상자" 같은 것
	- VO는 "데이터 덩어리" 객체로, @RequestBody를 통해 들어오는 JSON을 필드 단위로 깔끔하게 담아 주는 역할
	- 예를 들어, 클라이언트가 JSON으로 { "username": "...", "password": "...", "email": "..." } 보내면 스프링이 알아서 이 VO에 딱 집어넣어줌
	- 코드 가독성 & 유지보수성 -> 여러 요청 파라미터를 하나씩 받지 않고, VO 한 개만 받으면 메서드 시그니처가 깔끔해지고 관리하기 쉬워짐
	

 	- 예: 회원 가입할 때 필요한 정보만 담은 VO
 	//@Data나 @Getter/@Setter로
	public class SignupVO {
	    private String username;  // 아이디
	    private String password;  // 비밀번호
	    private String email;     // 이메일
	    // -> getter / setter만 있고, 특별한 계산 로직은 없음
	}
	-> 우체국 소포에 받는 사람 주소/이름/전화번호를 한꺼번에 담아 보내듯이, 여러 값을 한 클래스에 모아두는 역할
	
	
	#DTO와 VO의 차이
	1. DTO (Data Transfer Object)
	- 계층 간(ex) Controller <-> Service, Service <-> Repository)으로 데이터 주고받을 때 쓰는 객체
	- 보통 DB 테이블 컬럼 구조를 반영해서, 영속화 레이어와 맞춰 쓰는 경우가 많음

	2. VO (Value Object)
	- 단순히 값(value)만 담는 용도로 더 가볍게 쓰는 객체
	- 주로 클라이언트 <-> 서버 간 JSON 바인딩용(@RequestBody)이나, 내부 계산 결과를 묶어 반환할 때 사용
*/ 
