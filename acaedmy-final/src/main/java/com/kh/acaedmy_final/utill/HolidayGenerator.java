package com.kh.acaedmy_final.utill;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.LinkedList;
import java.util.List;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import com.kh.acaedmy_final.configuration.WorkingDaysProperties;
import com.kh.acaedmy_final.vo.WorkingdaysResponseVO;
@Component
public class HolidayGenerator {
	@Autowired
	private WorkingDaysProperties holidayProperties; 
	@Autowired
	RestTemplate restTemplate = new RestTemplate();
	
	
	public List<WorkingdaysResponseVO> getRestDays(String year) throws IOException, ParserConfigurationException, SAXException {
	    

//		  StringBuilder urlBuilder = new StringBuilder("http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo"); /*URL*/
		  StringBuilder urlBuilder = new StringBuilder(holidayProperties.getBaseUrl()); /*URL*/
	        urlBuilder.append("?" + URLEncoder.encode("serviceKey","UTF-8") + "=" + holidayProperties.getKey()); /*Service Key*/
	        urlBuilder.append("&" + URLEncoder.encode("pageNo","UTF-8") + "=" + URLEncoder.encode("1", "UTF-8")); /*페이지번호*/
	        urlBuilder.append("&" + URLEncoder.encode("numOfRows","UTF-8") + "=" + URLEncoder.encode("100", "UTF-8")); /*한 페이지 결과 수*/
	        urlBuilder.append("&" + URLEncoder.encode("solYear","UTF-8") + "=" + URLEncoder.encode(year, "UTF-8")); /*연*/
	        //urlBuilder.append("&" + URLEncoder.encode("solMonth","UTF-8") + "=" + URLEncoder.encode(month, "UTF-8")); /*월*/
	        URL url = new URL(urlBuilder.toString());
//	        System.err.println(url);
	        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
	        conn.setRequestMethod("GET");
	        conn.setRequestProperty("Content-type", "application/json");
	        //System.err.println("Response code: " + conn.getResponseCode());
	       // System.err.println(conn.getContent());
	        BufferedReader rd;
	        if(conn.getResponseCode() >= 200 && conn.getResponseCode() <= 300) {
	            rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
	        } else {
	            rd = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
	        }
	        StringBuilder sb = new StringBuilder();
	        String line;
	        while ((line = rd.readLine()) != null) {
	            sb.append(line);
	        }
	        rd.close();
	        conn.disconnect();
	        //System.out.println(sb.toString());
	       
	        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
	        DocumentBuilder builder = factory.newDocumentBuilder();
	        InputSource is = new InputSource(new StringReader(sb.toString()));
	        Document doc = builder.parse(is);
	        doc.getDocumentElement().normalize();
	        // item 접근
	        //List<HolidayResponseWrapper> items = response.getResponse().getBody().getItems().getItem();
	        NodeList itemList = doc.getElementsByTagName("item");
	      //  System.err.println("restDay ");
	        List<WorkingdaysResponseVO> wrap = new LinkedList<>();
	        for (int i = 0; i < itemList.getLength(); i++) {
	            Node item = itemList.item(i);
	            if (item.getNodeType() == Node.ELEMENT_NODE) {
	                Element element = (Element) item;

	                String dateName = getTagValue("dateName", element);
	                String locdate = getTagValue("locdate", element);
	               String isHoliday = getTagValue("isHoliday", element);
//	                ret.setDateName(dateName);
//	                ret.setLocdate(locdate);
	               WorkingdaysResponseVO vo = new WorkingdaysResponseVO();
	               vo.setDateName(dateName);
	               vo.setLocDate(locdate);
	                wrap.add(vo);
	             //   System.out.println("휴일명: " + dateName + " / 날짜: " + locdate + " 공휴 " + isHoliday );
	             //   System.err.println(ret);
	            }
	        }
	       // System.err.println (wrap);
	       // System.err.println(wrap);
	        
	        return wrap;
	}
	
	
	
	 private static String getTagValue(String tag, Element element) {
	        NodeList nodeList = element.getElementsByTagName(tag);
	        if (nodeList != null && nodeList.getLength() > 0) {
	            Node node = nodeList.item(0);
	            return node.getTextContent();
	        }
	        return "";
	    }
}
