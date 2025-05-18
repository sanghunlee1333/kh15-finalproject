package com.kh.acaedmy_final.dao;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.kh.acaedmy_final.dto.PolicyDto;

@Repository
public class PolicyDao {
	@Autowired
	private SqlSession sqlSession;
	public static final int policyNo = 1;
	
	public boolean insert(PolicyDto policyDto) {
		policyDto.setPolicyNo(policyNo);
//		System.out.println("DOAODAODAO");
//		System.err.println(policyDto);
		return sqlSession.insert("attendance.addPolicy", policyDto)>0;
	}
	
	public boolean update(PolicyDto policyDto) {
		policyDto.setPolicyNo(policyNo);
		return sqlSession.update("attendance.updatePolicy", policyDto)>0;
	}
	
	public PolicyDto selectOne(int policyNo) {
	//	System.err.println(policyNo);
		return sqlSession.selectOne("attendance.getPolicy", policyNo);
	}
}
