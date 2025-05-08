package com.kh.acaedmy_final.vo;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.Data;

@Data
public class HolidayResponseVO {
	private Response response; 

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class Response { //응답 본문을 구성하는 중간 계층
		private Header header;
		private Body body;
	}

	@Data
	public static class Header { //성공 여부를 나타냄
		private String resultCode; //결과코드 ex)00
		private String resultMsg; //결과메시지 ex)OK
	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class Body { //진짜 데이터가 들어있는 부분	
		private Object items; // items는 실제 공휴일 리스트
		//Object items; -> API가 때때로 item을 배열(List)로 보내기도 하고, 단일 객체(Map)으로 보내기도 하기 때문 -> 그래서 Object로 받아서 내부에서 instanceof로 분기 처리함

		private int numOfRows; //한 페이지 결과 수
		private int pageNo; //페이지 번호
		private int totalCount; //전체 결과 수
		
		//공공데이터 API는 다음 두 가지 특성을 가짐:
		//1. item이 1개일 땐 배열이 아니라 Map 형태로 줌 -> 일반적인 List<HolidayInfoVO>로는 에러남
		//2. items가 아예 없을 수도 있음 -> null, "", [] 등 다양한 케이스가 나옴
		//-> 그래서 getItemList()처럼 직접 타입 분기를 해주는 메서드가 꼭 필요
		
		/*
			ex1) 응답이 여러 개일 때, item instanceof List<?> 이므로 리스트 반환 
			"items": {
  				"item": [ {dateName: "어린이날"}, {...} ]
			}
			
			ex2) 응답이 하나일 때, item instanceof Map<?, ?> 이므로 수동으로 HolidayInfoVO 만들어서 리스트로 감쌈. 아무것도 없거나 "": -> 빈 리스트 반환
			"items": {
			  	"item": {dateName: "어린이날"}
			}
		*/
		
		//items 필드가 List일 수도 있고 Map일 수도 있으니, 어떤 경우든 안전하게 List<HolidayInfoVO> 형태로 꺼내기 위한 유틸 메서드
		public List<HolidayInfoVO> getItemList() {
			 if (items instanceof Map<?, ?> map) {
		        Object item = map.get("item");

		        ObjectMapper mapper = new ObjectMapper();
		        mapper.configure(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY, true);
			
		        if (item instanceof List<?> list) {
		            JavaType type = mapper.getTypeFactory().constructCollectionType(List.class, HolidayInfoVO.class);
		            return mapper.convertValue(list, type);
		        }

		        if (item instanceof Map<?, ?> single) {
		            HolidayInfoVO vo = mapper.convertValue(single, HolidayInfoVO.class);
		            return List.of(vo);
		        }
			}
			// items가 ""(빈 문자열)인 경우 포함해서 전부 여기로 빠짐
			return List.of();
		}
	}
}
