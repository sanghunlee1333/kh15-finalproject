package com.kh.acaedmy_final.service;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kh.acaedmy_final.configuration.HolidayApiProperties;
import com.kh.acaedmy_final.vo.HolidayInfoVO;
import com.kh.acaedmy_final.vo.HolidayResponseVO;

@Service
public class HolidayService { //API에서 JSON 데이터를 받아와 List<HolidayInfoVO> 형태로 반환하는 역할
							  //공휴일 API에 실제로 요청을 보내고, 파싱해서 결과를 컨트롤러에 전달하는 핵심 역할
	
	//application.properties 파일에서 API URL과 서비스 키를 가져오는 설정 클래스
	@Autowired
	private HolidayApiProperties holidayApiProperties;

	//연도, 월을 받아 해당 월의 공휴일 정보를 외부 API에서 가져오는 메서드
    public List<HolidayInfoVO> getHolidays(int year, int month) throws Exception {
    	// 1. API URL 구성
        String urlStr = UriComponentsBuilder.fromHttpUrl(holidayApiProperties.getBaseUrl()) //UriComponentsBuilder로 가독성 좋고 안정적으로 URL을 구성
		                .queryParam("ServiceKey", holidayApiProperties.getServiceKey())
		                .queryParam("solYear", year) //solYear, solMonth는 API의 요청 파라미터
		                .queryParam("solMonth", String.format("%02d", month)) //solMonth는 반드시 01, 02 같은 두 자리 형식으로 넘겨야 함
		                .queryParam("_type", "json") //_type=json을 지정해서 XML이 아닌 JSON 응답을 받도록 설정
		            .build()
                .toString();

        // 2. API 호출
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection(); //커넥션 객체를 통해 응답을 읽을 준비
        conn.setRequestMethod("GET"); //HttpURLConnection을 이용해 실제 API 서버에 GET 요청을 보냄

        InputStream in = conn.getInputStream();
        String body = new String(in.readAllBytes(), StandardCharsets.UTF_8); //서버에서 응답받은 InputStream을 UTF-8 문자열로 변환. body는 JSON 형식의 응답 데이터 문자열
        ObjectMapper mapper = new ObjectMapper(); //Jackson에서 JSON을 Java 객체로 변환해주는 도구
        HolidayResponseVO result = mapper.readValue(body, HolidayResponseVO.class); //응답 JSON을 미리 만든 HolidayResponseVO 구조에 맞게 자동으로 매핑
        /*
			(참고) 응답 구조는 다음과 같은 중첩 구조
			{
			  "response": {
			    "body": {
			      "items": {
			        "item": [...]
			      }
			    }
			  }
			}
			-> 그래서 .getResponse().getBody().getItemList()를 통해 실제 공휴일 리스트인 List<HolidayInfoVO>만 추출해서 반환
			-> (참고)getItemList()는 내부에서 Object 타입으로 받은 items를 리스트/단일객체 케이스에 맞게 분기 처리하는 유틸 메서드
        */
        
        // 3. 공휴일 + 국경일 필터링
        List<HolidayInfoVO> redDays = result.getResponse().getBody().getItemList().stream()
                .filter(vo -> "01".equals(vo.getDateKind()) || "03".equals(vo.getDateKind()))
                .collect(Collectors.toList());
        
        // 4. 일요일 계산해서 추가
        List<HolidayInfoVO> holidays = addSundays(redDays, year, month);

        // 5. 리스트 반환
        return holidays;
    }
    
    private List<HolidayInfoVO> addSundays(List<HolidayInfoVO> holidays, int year, int month) {
        List<HolidayInfoVO> result = new ArrayList<>(holidays);

        LocalDate firstDay = LocalDate.of(year, month, 1);
        int length = firstDay.lengthOfMonth();

        for (int day = 1; day <= length; day++) {
            LocalDate date = LocalDate.of(year, month, day);
            if (date.getDayOfWeek() == DayOfWeek.SUNDAY) {
                String formatted = date.format(DateTimeFormatter.BASIC_ISO_DATE); // yyyyMMdd
                boolean alreadyExists = holidays.stream()
                    .anyMatch(vo -> vo.getLocdate().equals(formatted));
                if (!alreadyExists) {
                    HolidayInfoVO sunday = new HolidayInfoVO();
                    sunday.setDateName("일요일");
                    sunday.setLocdate(formatted);
                    sunday.setDateKind("SUN"); // 구분용
                    sunday.setIsHoliday("Y");
                    result.add(sunday);
                }
            }
        }

        return result;
    }
    
}

