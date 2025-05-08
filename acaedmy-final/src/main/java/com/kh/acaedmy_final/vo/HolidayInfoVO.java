package com.kh.acaedmy_final.vo;

import lombok.Data;

//응답데이터 - https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15012690
/*
	(참고) 공공데이터 API 응답은 <item> 안에 여러 필드가 있을 수 있어도, 실제로 쓸 데이터만 VO에 정의하면 됨
	ex)
	<item>
	  <dateKind>01</dateKind>
	  <dateName>어린이날</dateName>
	  <isHoliday>Y</isHoliday>
	  <locdate>20250505</locdate>
	  <seq>1</seq>
	  <extra1>무시해도 되는 필드</extra1>
	  <extra2>이것도</extra2>
	</item>
	-> 응답데이터가 위처럼 온다고 해도, 아래처럼 필요한 것만 뽑아써도 됨.
*/

@Data
public class HolidayInfoVO { //공공데이터 API의 한 item을 담는 자바 객체
	private String dateKind; //날짜의 종류. 01 -> 일반 공휴일을 의미
    private String dateName; //공휴일 이름
    private String isHoliday; //공휴일 여부 -> Y/N
    private String locdate; //날짜 (yyyyMMdd)
    private int seq; //같은 날짜에 여러 공휴일이 있을 경우 순서를 구분해줌 (1, 2, 3...)
}