package com.kh.acaedmy_final.utill;

import java.util.Random;

import org.springframework.stereotype.Component;

@Component
public class NewPWGenerator {
	
	public String random() {
		char[] ret = new char[8];
		for(int i = 0 ; i < 4; i ++) {
	Random r = new Random();
	char lowerCase = (char) ('a' + r.nextInt(26)); 
    char upperCase = (char) ('A' + r.nextInt(26)); 
    char digit = (char) ('0' + r.nextInt(10)); 
	int[] randomSpecial = {64, 33, 35, 36};
	int index =  r.nextInt(randomSpecial.length);
	char special = (char) randomSpecial[index];
	char[] randomList = {lowerCase, upperCase, digit, special};
	
	
		int randomIndex = r.nextInt(randomList.length);
		ret[i] = randomList[randomIndex];
	}
		Random rr = new Random();
		char lowerCase = (char) ('a' + rr.nextInt(26)); 
	    char upperCase = (char) ('A' + rr.nextInt(26)); 
	    char digit = (char) ('0' + rr.nextInt(10)); 
		int[] randomSpecial = {64, 33, 35, 36};
		int index =  rr.nextInt(randomSpecial.length);
		char special = (char) randomSpecial[index];
		ret[4] = lowerCase;
		ret[5] = upperCase;
		ret[6] = digit;
		ret[7] = special;
		return new String(ret);
	}
}
	