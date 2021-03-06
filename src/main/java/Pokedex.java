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
					+ "token TEXT," + "created BIGINT);";
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
				"Rhyhorn", "Tangela", "Horsea", "Goldeen", "Staryu",
				"Scyther", "Jynx", "Electabuzz", "Magmar", "Pinsir",
				"Magikarp", "Eevee", "Omanyte", "Kabuto");

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
		String nestid = SecurityUtil.GenerateRandString();
		while (this.ContainsNestID(nestid) == true) {
			nestid = SecurityUtil.GenerateRandString();
		}
		
		// fill in prepared statement data
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
	
	/**
	 * Check if pokenest database table contains specified nest id.
	 * @param nestid specified nest id
	 * @return true if pokenest table contains nest id, false otherwise
	 * @throws SQLException
	 */
	public boolean ContainsNestID(String nestid) throws SQLException {
		
		// Fill in schema to check if nest id already exists
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
	
	/**
	 * Check if username already exists in the users database table.
	 * @param username user provided username
	 * @return true is username is taken, false otherwise
	 * @throws SQLException
	 */
	public boolean ContainsUsername(String username) throws SQLException {
		
		// Fill in schema to check if username is already taken
		String schema = "SELECT exists (SELECT 1 from users where username = ? LIMIT 1);";			
		PreparedStatement prep = conn.prepareStatement(schema);
		prep.setString(1, username);
		ResultSet rs = prep.executeQuery();
		rs.next();
		boolean result = rs.getBoolean("exists");
		
		// Close the PreparedStatement
		prep.close();
		
		return result;
	}
	
	public boolean ContainsToken(String token) throws SQLException {
		
		// Fill in schema to check if username is already taken
		String schema = "SELECT exists (SELECT 1 from sessions where token = ? LIMIT 1);";			
		PreparedStatement prep = conn.prepareStatement(schema);
		prep.setString(1, token);
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
		
		// Remove all votes related to nest id
		schema = "DELETE FROM votes WHERE nestid = ?;";					
		prep = conn.prepareStatement(schema);
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
	
	public void Refute(String nestid) throws SQLException {
		
		// Fill in schema to create a table called pokedex
		String schema = "UPDATE pokenest SET confirmed = ? WHERE nestid = ?;";					
		PreparedStatement prep = conn.prepareStatement(schema);
		prep.setInt(1, 0);
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
	
	public List<String> GetDatabaseRowsAsStrings() throws SQLException {

		ArrayList<String> output = new ArrayList<String>();

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
			sb.append(String.format("<p class='db-data'>upvotes: %s</p>",
					upvotes));
			sb.append(String.format("<p class='db-data'>downvotes: %s</p>",
					downvotes));
			sb.append(String.format("<p class='db-data'>confirmed: %s</p>",
					confirmed));
			String data = sb.toString();
			output.add(data);
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
					
	public void AddTrainer(String username, String salt, String password, String token, long created) throws SQLException {
		
		// Fill in schema to create a table called users
		String schema = "INSERT INTO users VALUES(?,?,?);";					
		PreparedStatement prep = conn.prepareStatement(schema);
		prep.setString(1, username);
		prep.setString(2, salt);
		prep.setString(3, password);
		prep.executeUpdate();
		
		// Close the PreparedStatement
		prep.close();
		
		// Fill in schema to create a table called users
		schema = "INSERT INTO sessions VALUES(?,?,?);";					
		prep = conn.prepareStatement(schema);
		prep.setString(1, username);
		prep.setString(2, token);
		prep.setLong(3, created);
		prep.executeUpdate();
				
		// Close the PreparedStatement
		prep.close();
	}
	
	public String GetUserPassword(String username) throws SQLException {
		
		String password = "";
		String schema = "SELECT password FROM users WHERE username = ?;";					
		PreparedStatement prep = conn.prepareStatement(schema);
		prep.setString(1, username);
		ResultSet rs = prep.executeQuery();
		if (rs.next()) {
			password = rs.getString("password");
		}
		
		return password;
	}
	
	/**
	 * Get user's salted and hashed session token from the database
	 * @param username
	 * @return
	 * @throws SQLException 
	 */
	public String GetUserSessionToken(String username) throws SQLException {
		
		String token = "";
		String schema = "SELECT token FROM sessions WHERE username = ?;";					
		PreparedStatement prep = conn.prepareStatement(schema);
		prep.setString(1, username);
		ResultSet rs = prep.executeQuery();
		if (rs.next()) {
			token = rs.getString("token");
		}
		return token;
	}
	
	public boolean UserSessionExists(String username) throws SQLException {
		return !GetUserSessionToken(username).equals("");
	}
	
	public void UpdateUserSession(String username, String saltedAndHashedToken, long created) throws SQLException {
		
		if (UserSessionExists(username)) {
			
			// update existing session information 
			String schema = "UPDATE sessions SET token = ?, created = ? WHERE username = ?;";					
			PreparedStatement prep = conn.prepareStatement(schema);
			prep.setString(1, saltedAndHashedToken);
			prep.setLong(2, created);
			prep.setString(3, username);
			prep.executeUpdate();

			// Close the PreparedStatement
			prep.close();
			
		} else {

			// existing session may have expired, add a new one
			String schema = "INSERT INTO sessions VALUES(?,?,?);";					
			PreparedStatement prep = conn.prepareStatement(schema);
			prep.setString(1, username);
			prep.setString(2, saltedAndHashedToken);
			prep.setLong(3, created);
			prep.executeUpdate();
			
			// Close the PreparedStatement
			prep.close();
		}	
	}
	
	public String GetUserSalt(String username) throws SQLException {
		
		String salt = "";
		String schema = "SELECT salt FROM users WHERE username = ?;";					
		PreparedStatement prep = conn.prepareStatement(schema);
		prep.setString(1, username);
		ResultSet rs = prep.executeQuery();
		
		if (rs.next()) {
			salt = rs.getString("salt");
		}
		
		return salt;
	}
		
	public boolean ValidCredentials(String username, String password) throws SQLException {
		String salt = this.GetUserSalt(username);
		String saltedAndHashedPassword = SecurityUtil.SlowSaltAndHashPassword(salt, password);
		String storedPassword = this.GetUserPassword(username);
		return saltedAndHashedPassword.equals(storedPassword);
	}
	
	public boolean UserAuthenticated(String username, String token) throws SQLException {
		String salt = this.GetUserSalt(username);
		String saltedAndHashedSessionToken = SecurityUtil.StandardSaltAndHashInput(salt, token);
		String storedSessionToken = this.GetUserSessionToken(username);
		return saltedAndHashedSessionToken.equals(storedSessionToken);
	}
	
	public boolean UniqueSessionToken(String token) throws SQLException {
		return !this.ContainsToken(token);
	}
	
	public int getTrainerVote(String username, String nestid) throws SQLException {
		
		String schema = "SELECT vote FROM votes WHERE username = ? AND nestid = ?;";					
		PreparedStatement prep = conn.prepareStatement(schema);
		prep.setString(1, username);
		prep.setString(2, nestid);
		ResultSet rs = prep.executeQuery();
		
		if (rs.next()) {
			
			// return cast vote (+1/-1)
			return rs.getInt("vote");
			
		} else {
			
			// a vote has not yet been cast by specified user
			return 0;
		}
	}
	
	public Map<String, Object> SubmitVote(String username, String nestid, int vote) throws SQLException {
		
		// default return is success
		Map<String, Object> results = ImmutableMap.of("success", true, "error", "");

		// disallow redundant votes
		if (getTrainerVote(username, nestid) == vote) {
			results = ImmutableMap.of("success", false, "error",
					"redundant votes disallowed");
			return results;
		}

		this.ApplyVote(username, nestid, vote); 
		return results;
	}	
	
	private int GetNestDownvotes(String nestid) throws SQLException {
		
		int downvotes = 0;
		String schema = "SELECT downvotes FROM pokenest WHERE nestid = ?;";					
		PreparedStatement prep = conn.prepareStatement(schema);
		prep.setString(1, nestid);
		ResultSet rs = prep.executeQuery();
		if (rs.next()) {
			downvotes = rs.getInt("downvotes");
		}
		return downvotes;
	}
	
	private void SetNestDownvotes(String nestid, int downvotes) throws SQLException {
		
		String schema = "UPDATE pokenest SET downvotes = ? WHERE nestid = ?;";					
		PreparedStatement prep = conn.prepareStatement(schema);
		prep.setInt(1, downvotes);
		prep.setString(2, nestid);
		prep.executeUpdate();

		// Close the PreparedStatement
		prep.close();
	}
	
	private int GetNestUpvotes(String nestid) throws SQLException {
		
		int upvotes = 0;
		String schema = "SELECT upvotes FROM pokenest WHERE nestid = ?;";					
		PreparedStatement prep = conn.prepareStatement(schema);
		prep.setString(1, nestid);
		ResultSet rs = prep.executeQuery();
		if (rs.next()) {
			upvotes = rs.getInt("upvotes");
		}
		return upvotes;
	}
	
	private void SetNestUpvotes(String nestid, int upvotes) throws SQLException {
		
		String schema = "UPDATE pokenest SET upvotes = ? WHERE nestid = ?;";					
		PreparedStatement prep = conn.prepareStatement(schema);
		prep.setInt(1, upvotes);
		prep.setString(2, nestid);
		prep.executeUpdate();

		// Close the PreparedStatement
		prep.close();
	}

	private void ApplyVote(String username, String nestid, int vote) throws SQLException {
		
		// get trainers last recorded vote for specified nest nest
		int oldVote = getTrainerVote(username, nestid);
		
		// if no trainer vote data exists for nest, create some, otherwise, update existing data
		if (oldVote == 0) {
						
			// if vote does not exist in database add it
			String schema = "INSERT INTO votes VALUES(?,?,?);";					
			PreparedStatement prep = conn.prepareStatement(schema);
			prep.setString(1, nestid);
			prep.setString(2, username);
			prep.setInt(3, vote);
			prep.executeUpdate();
			
			// Close the PreparedStatement
			prep.close();
			
			// update pokenest up votes, down votes
			if ( vote == +1 ) {
				// increment upvotes for nest
				SetNestUpvotes(nestid, (GetNestUpvotes(nestid) + 1));
			}
			
			if ( vote == -1 ) {
				// increment downvotes for nest
				SetNestDownvotes(nestid, (GetNestDownvotes(nestid) + 1));
			}
			
		} else { 
			
			if (vote == 0) {
				
				// remove previous vote info, now neutral
				String schema = "DELETE FROM votes WHERE nestid = ? AND username = ?;";					
				PreparedStatement prep = conn.prepareStatement(schema);
				prep.setString(1, nestid);
				prep.setString(2, username);
				prep.executeUpdate();

				// Close the PreparedStatement
				prep.close();
				
				// undo previous vote
				if (oldVote == +1) {
					SetNestUpvotes(nestid, (GetNestUpvotes(nestid) - 1));
				}
				
				if (oldVote == -1) {
					SetNestDownvotes(nestid, (GetNestDownvotes(nestid) - 1));
				}
				
			} else {
				
				// update existing vote information
				String schema = "UPDATE votes SET vote = ? WHERE nestid = ? AND username = ?;";					
				PreparedStatement prep = conn.prepareStatement(schema);
				prep.setInt(1, vote);
				prep.setString(2, nestid);
				prep.setString(3, username);
				prep.executeUpdate();

				// Close the PreparedStatement
				prep.close();
				
				if (vote == +1) {
					// old vote must be -1 at this point
					SetNestUpvotes(nestid, (GetNestUpvotes(nestid) + 1));
					SetNestDownvotes(nestid, (GetNestDownvotes(nestid) - 1));
				}
				
				if (vote == -1) {
					// old vote must be +1 at this point
					SetNestDownvotes(nestid, (GetNestDownvotes(nestid) + 1));
					SetNestUpvotes(nestid, (GetNestUpvotes(nestid) - 1));
				}
			}
		}
	} 
}
