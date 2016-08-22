import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import com.google.common.collect.ImmutableMap;
import com.heroku.sdk.jdbc.DatabaseUrl;

public class Pokedex {
	
	private Connection conn;
	private Set<String> pokenames;
	
	public Pokedex() {

		try {

			// Get database URL directly from Heroku
			this.conn = DatabaseUrl.extract().getConnection();

			// Fill in schema to create a table to store nest data
			String schema = "CREATE TABLE IF NOT EXISTS pokenest("
					+ "nestid TEXT," + "pokemon TEXT," + "lat DECIMAL,"
					+ "lng DECIMAL," + "time TIMESTAMP,"
					+ "confirmed SMALLINT," + "upvotes SMALLINT,"
					+ "downvotes SMALLINT);";
			Statement stmt = conn.createStatement();
			stmt.executeUpdate(schema);

			// Fill in schema to create a table to store voting data
			schema = "CREATE TABLE IF NOT EXISTS votes(" + "nestid TEXT,"
					+ "username TEXT," + "vote SMALLINT);";
			stmt = conn.createStatement();
			stmt.executeUpdate(schema);

			// Fill in schema to create a table to store trainer login details
			schema = "CREATE TABLE IF NOT EXISTS users(" + "username TEXT,"
					+ "salt TEXT," + "password TEXT);";
			stmt = conn.createStatement();
			stmt.executeUpdate(schema);
			
			// Fill in schema to create a table to store trainer login sessions
			schema = "CREATE TABLE IF NOT EXISTS sessions(" + "username TEXT,"
					+ "token TEXT," + "created INT);";
			stmt = conn.createStatement();
			stmt.executeUpdate(schema);

		} catch (Exception e) {
			e.printStackTrace();
		}

		// add all names
		List<String> pokenamesAsList = Arrays.asList("Bulbasaur", "Charmander",
				"Squirtle", "Caterpie", "Spearow", "Ekans", "Pikachu",
				"Sandshrew", "Nidoran♀", "Nidoran♂", "Clefairy", "Vulpix",
				"Jigglypuff", "Zubat", "Oddish", "Paras", "Venonat", "Diglett",
				"Meowth", "Psyduck", "Mankey", "Growlithe", "Poliwag", "Abra",
				"Machop", "Bellsprout", "Tentacool", "Geodude", "Ponyta",
				"Slowpoke", "Magnemite", "Farfetch'd", "Doduo", "Seel",
				"Grimer", "Shellder", "Gastly", "Onix", "Drowzee", "Krabby",
				"Voltorb", "Exeggcute", "Cubone", "Lickitung", "Koffing",
				"Rhyhorn", "Chansey", "Tangela", "Horsea", "Goldeen", "Staryu",
				"Scyther", "Jynx", "Electabuzz", "Magmar", "Pinsir",
				"Magikarp", "Eevee");

		pokenames = new HashSet<String>(pokenamesAsList);
	}
	
	public void cleanExit() {
		if (conn != null) {
			try {
				conn.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
	}
	
	public void Add(String pokemon, double lat, double lng, java.sql.Timestamp timestamp)
			throws SQLException {

		// Fill in schema to create a table called pokedex
		String schema = "INSERT INTO pokenest VALUES(?,?,?,?,?,?,?,?);";					
		PreparedStatement prep = conn.prepareStatement(schema);

		// Generate a nest id, loop until collision free 
		String nestid = generateID();
		while (this.ContainsNestID(nestid) == true) {
			nestid = generateID();
		}

		prep.setString(1, nestid);
		prep.setString(2, pokemon);
		prep.setDouble(3, lat);
		prep.setDouble(4, lng);
		prep.setTimestamp(5, timestamp);
		prep.setInt(6, 0);
		prep.setInt(7, 0);
		prep.setInt(8, 0);
		prep.executeUpdate();

		// Close the PreparedStatement
		prep.close();
	}
	
	public boolean ContainsNestID(String nestid) throws SQLException {
		
		// Fill in schema to create a table called pokedex
		String schema = "SELECT exists (SELECT 1 from pokenest where nestid = ? LIMIT 1);";			
		PreparedStatement prep = conn.prepareStatement(schema);
		prep.setString(1, nestid);
		ResultSet rs = prep.executeQuery();
		rs.next();
		boolean result = rs.getBoolean("exists");
		
		// Close the PreparedStatement
		prep.close();
		
		return result;
	}
	
	public void Remove(String nestid) throws SQLException {
		
		// Fill in schema to create a table called pokedex
		String schema = "DELETE FROM pokenest WHERE nestid = ?;";					
		PreparedStatement prep = conn.prepareStatement(schema);
		prep.setString(1, nestid);
		prep.executeUpdate();

		// Close the PreparedStatement
		prep.close();
	}
	
	public void Confirm(String nestid) throws SQLException {
		
		// Fill in schema to create a table called pokedex
		String schema = "UPDATE pokenest SET confirmed = ? WHERE nestid = ?;";					
		PreparedStatement prep = conn.prepareStatement(schema);
		prep.setInt(1, 1);
		prep.setString(2, nestid);
		prep.executeUpdate();

		// Close the PreparedStatement
		prep.close();
	}
	
	public boolean isConfirmed(String nestid) throws SQLException {
		
		// Fill in schema to create a table called pokedex
		boolean result = false;
		String schema = "SELECT confirmed FROM pokenest WHERE nestid = ?;";					
		PreparedStatement prep = conn.prepareStatement(schema);
		prep.setString(1, nestid);
		ResultSet rs = prep.executeQuery();
		if (rs.next()) {
			int confirmed = rs.getInt("confirmed");
			if (confirmed == 1) {
				result = true;
			}
		}
		// Close the PreparedStatement
		prep.close();
		return result;
	}
		
	public List<Map<String, Object>> betterNearby(double southWestLat,
			double southWestLng, double northEastLat, double northEastLng) {

		List<Map<String, Object>> results = new ArrayList<Map<String, Object>>();
		
		/* bounds */
	    double minlat = southWestLat;
	    double maxlat = northEastLat;
	    double minlng = southWestLng;
	    double maxlng = northEastLng;

		try {
			
		    String query = "SELECT * FROM pokenest WHERE "
		        + "lat >= ? AND lat <= ? "
		        + "AND lng >= ? AND lng <= ?;";

		    PreparedStatement prep = conn.prepareStatement(query);
		    prep.setDouble(1, minlat);
		    prep.setDouble(2, maxlat);
		    prep.setDouble(3, minlng);
		    prep.setDouble(4, maxlng);
		    ResultSet rs = prep.executeQuery();

			while (rs.next()) {
				String nestid = rs.getString("nestid");
				String name = rs.getString("pokemon");
				String lat = rs.getString("lat");
				String lng = rs.getString("lng");
				String timestamp = rs.getString("time");
				int confirmed = rs.getInt("confirmed");
				int upvotes = rs.getInt("upvotes");
				int downvotes = rs.getInt("downvotes");
			
				Map<String, Object> data = new HashMap<>();
				data.put("nestid", nestid);
				data.put("pokemon", name);
				data.put("lat", lat);
				data.put("lng", lng);
				data.put("timestamp", timestamp);
				data.put("upvotes", upvotes);
				data.put("downvotes", downvotes);
				data.put("confirmed", confirmed);
				results.add(data);
			}

		} catch (SQLException e) {
			e.printStackTrace();
		}

		return results;
	}
	
	public List<String> GetDatabaseRowsAsStrings() {

		ArrayList<String> output = new ArrayList<String>();

		try {
			Statement stmt = conn.createStatement();
			ResultSet rs = stmt.executeQuery("SELECT * FROM pokenest;");
			while (rs.next()) {
				String id = rs.getString("nestid");
				String name = rs.getString("pokemon");
				String lat = rs.getString("lat");
				String lng = rs.getString("lng");
				String time = rs.getString("time");
				String confirmed = rs.getString("confirmed");
				String upvotes = rs.getString("upvotes");
				String downvotes = rs.getString("downvotes");
				StringBuilder sb = new StringBuilder();
				sb.append(String.format("<p class='db-data'>id: %s</p>", id));
				sb.append(String.format("<p class='db-data'>pokemon: %s</p>", name));
				sb.append(String.format("<p class='db-data'>lat: %s</p>", lat));
				sb.append(String.format("<p class='db-data'>lng: %s</p>", lng));
				sb.append(String.format("<p class='db-data'>time: %s</p>", time));
				sb.append(String.format("<p class='db-data'>upvotes: %s</p>", upvotes));
				sb.append(String.format("<p class='db-data'>downvotes: %s</p>", downvotes));
				sb.append(String.format("<p class='db-data'>confirmed: %s</p>", confirmed));
				String data = sb.toString();
				output.add(data);
			}

		} catch (SQLException e) {
			e.printStackTrace();
		}

		return output;
	}
	
	public boolean validPokemon(String pokename) {

		if (pokenames.contains(pokename)) {
			return true;
		} else {
			return false;
		}
	}
	
	private String generateID() {
		return UUID.randomUUID().toString();
	}
		
	public Map<String, Object> signUpHandler(String username, String password) {
		
		
		
		/* TODO: make sure password is secure */
		
		/* TODO: make sure username is unique */
		
		/* TODO: make sure username uses "safe" characters */
		
		/* TODO: generate session token */
		
		/* TODO: generate a salt for the new user (secures password) */
		
		/* TODO: make sure session token is unique */
		
		Map<String, Object> results = ImmutableMap.of("success", true, "error", "", "token", "");
		return results;
	}
	
	public void addUser() {
		
		/* TODO: insert into 'users' database table */
		
		/* TODO: insert into 'sessions' database table */	
	}
	
	private static String saltAndHashInput(String input, byte[] salt) {
		
		String generatedPassword = null;
        try {
            // Create MessageDigest instance for MD5
            MessageDigest md = MessageDigest.getInstance("MD5");
            //Add password bytes to digest
            md.update(salt);
            //Get the hash's bytes 
            byte[] bytes = md.digest(input.getBytes());
            //This bytes[] has bytes in decimal format;
            //Convert it to hexadecimal format
            StringBuilder sb = new StringBuilder();
            for(int i=0; i< bytes.length ;i++)
            {
                sb.append(Integer.toString((bytes[i] & 0xff) + 0x100, 16).substring(1));
            }
            //Get complete hashed password in hex format
            generatedPassword = sb.toString();
        } 
        catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
        return generatedPassword;
	}
	
	/**
	 * Generates random salt.
	 */
	private static String generateSalt() {
		StringBuilder buf = new StringBuilder();
		SecureRandom sr = new SecureRandom();
		// log2(52^6)=34.20... so, this is about 32bit strong (entropy).
		for (int i = 0; i < 6; i++) {
			boolean upper = sr.nextBoolean();
			char ch = (char) (sr.nextInt(26) + 'a');
			if (upper)
				ch = Character.toUpperCase(ch);
			buf.append(ch);
		}
		return buf.toString();
	}
	
	private boolean usernameIsUnique() {
		return true;
	}		
	
	private static boolean passwordIsSecure(String password) {
		return true;
	}
	
	private static boolean usesSafeCharacters(String s) {
		return true;
	}
}
