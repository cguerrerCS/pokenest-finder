import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.UUID;
import org.mindrot.jbcrypt.BCrypt;
import com.google.common.hash.Hashing;

public class SecurityUtil {
	
	/**
	 * Slow hash for password salting (prevent brute force attack).
	 * @param salt provided salt value
	 * @param password user provided password
	 * @return user's salted and hashed password
	 */
	public static String SlowSaltAndHashPassword(String salt, String password) {
		return BCrypt.hashpw(password, salt);
	}
	
	/**
	 * Quickly salt and hash some input.
	 * @param salt provided salt value
	 * @param input provided input
	 * @return salted and hashed input
	 */
	public static String StandardSaltAndHashInput(String salt, String input) {
		String saltedInput = String.format("%s%s", salt, input);
		String hashedAndSaltedInput = Hashing.sha256()
				.hashString(saltedInput, StandardCharsets.UTF_8).toString();
		return hashedAndSaltedInput;
	}
	
	/**
	 * Generate a high entropy random string.
	 * @return String version of UUID
	 */
	public static String GenerateRandString() {
		return UUID.randomUUID().toString();
	}
	
	/**
	 * Generates random salt.
	 * @return salt as a String (32 bit entropy)
	 */
	public static String GenerateSalt() {
		StringBuilder buf = new StringBuilder();
		SecureRandom sr = new SecureRandom();
		// log2(52^6)=34.20, approximately 32 bit entropy.
		for (int i = 0; i < 6; i++) {
			boolean upper = sr.nextBoolean();
			char ch = (char) (sr.nextInt(26) + 'a');
			if (upper)
				ch = Character.toUpperCase(ch);
			buf.append(ch);
		}
		return buf.toString();
	}
	
	/**
	 * Function that checks for minimal security strength proposed password.
	 * 
	 * Password not deemed secure if:
	 * 		- less than eight characters long
	 * 		- contains no numbers
	 * 		- contains no upper case letters
	 * 		- contains no lower case letters
	 * 		- contains no special characters
	 * 
	 * @param password user provided password at sign up
	 * @return true if password meets minimal security requirements, false otherwise
	 */
	public static boolean PasswordIsSecure(String password) {
		String pattern = "^(.{0,7}|[^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*)$";
		return !password.matches(pattern);
	}
}
