
public class SecurityUtil {

	/**
	 * Function that checks for minimal security strength proposed password.
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
