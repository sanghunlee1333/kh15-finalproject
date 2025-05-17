package com.kh.academy_final.constant;

/*
	* constant = 변하지 않는 값(상수)
	- 자바의 상수는 2가지가 존재
		- public static final String 방식 -> 단순 문자열 상수
		- enum -> 고정된 "종류"가 있는 값일 때 사용(이 방식이 더 객체지향적)
	ex) 문자열 "plan_create"로 사용하는 것보다 AlarmType.PLAN_CREATE로 사용하는 게 더 안전하고 명확!
	=> constant 패키지 = 열거형(enum)이나 상수 클래스를 모아두기 위한 디렉터리
*/
/*
	* enum = 열거형. 정해진 값들의 집합을 정의할 때 사용하는 클래스
	- 값이 고정된 이름으로 관리됨
	- 오타/문자열 비교 없이 타입 안정성 보장 
	- switch-case, equals 없이 가독성 좋아짐
	=> enum 클래스는 종류를 명확히 구분하고, 오타나 로직 오류를 방지하기 위해서 만듦. 정해진 값들만 사용하는 고정된 유형을 표현할 때 씀
	ex) 나쁜 예시
		alarm.setType("plancreate"); // 오타 가능성 있음
	ex) 좋은 예시
		alarm.setType(AlarmType.PLAN_CREATE); // 컴파일 에러로 잡힘
	-> 조건 분기 시에도 가독성 좋음
	ex)
		if (alarm.getType() == AlarmType.PLAN_ACCEPT) {
		    // 수락 처리
		}
*/
public enum AlarmType { //알림 유형 관리용
	PLAN_CREATE, //일정 생성
	PLAN_ACCEPT, //수신자가 일정 수락
	PLAN_REJECT, //수신자가 일정 거절
	PLAN_COMPLETE, //모든 일정 참여자 일정 달성 -> 일정 완료
	PLAN_SOON, //일정 시작 30분 전
	PLAN_START, //일정 시작일 지남
	PLAN_END, //일정 종료일 지남
	PLAN_DELETE //작성자가 일정 삭제
}
