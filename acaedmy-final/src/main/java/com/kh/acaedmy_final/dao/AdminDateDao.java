package com.kh.acaedmy_final.dao;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.kh.acaedmy_final.dto.AdminDateDto;

@Repository
public class AdminDateDao {
	@Autowired
	private SqlSession sqlSession;
	
	public long sequence() {
		return sqlSession.selectOne("admin-date.sequence");
	}
	public boolean add(List<AdminDateDto> dateList) {
		 try {
		        for (AdminDateDto date : dateList) {
		            int result = sqlSession.insert("admin-date.add", date);
		            if (result == 0) {
		                return false;
		            }
		        }
		        return true; 
		    } catch (Exception e) {
		        return false;
		    }
	}
	
	public boolean add(AdminDateDto dto) {
		return sqlSession.insert("admin-date.add", dto) > 0;
	}

	public List<AdminDateDto> selectByMonth(int year, int month){
			LocalDate beginDay =  LocalDate.of(year, month, 1);
			//LocalDate target = LocalDate.of(year, month);
			LocalDate endDay = beginDay.withDayOfMonth(beginDay.lengthOfMonth());
			Map<String,Object> map = new HashMap<>();
			LocalDateTime beginDateTime = beginDay.atStartOfDay();    
			LocalDateTime endDateTime = endDay.atTime(23, 59, 59);    
			map.put("beginDay", beginDateTime);
			map.put("endDay", endDateTime);
//			System.err.println(beginDateTime);
//			System.err.println(endDateTime);
			//System.err.println(last);
		return sqlSession.selectList("admin-date.listByMonth", map);
		//return null;
	}
	public boolean delete(long holidayNo) {
		return sqlSession.delete("admin-date.delete", holidayNo) > 0;
	}
	
	
	
}












