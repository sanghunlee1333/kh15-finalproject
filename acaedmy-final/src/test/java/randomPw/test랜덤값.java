package randomPw;

import java.util.Random;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class test랜덤값 {
	@Test
	public void test() {
		StringBuffer buff = new StringBuffer();
		Random r = new Random();
		char lowerCase = (char) ('a' + r.nextInt(26)); 
        char upperCase = (char) ('A' + r.nextInt(26)); 
        char digit = (char) ('0' + r.nextInt(10)); 
		int[] randomSpecial = {65, 64, 67,68};
		int index =  r.nextInt(randomSpecial.length);
		char special = (char) randomSpecial[index];
		char[] randomList = {lowerCase, upperCase, digit, special};
		int randomIndex = r.nextInt(randomList.length);
		char[] ret = new char[8];
		for(int i = 0 ; i < 8; i ++) {
			ret[i] = randomList[randomIndex];
		}
		System.out.println(ret);
	}
}
