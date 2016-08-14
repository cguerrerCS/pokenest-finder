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
import com.heroku.sdk.jdbc.DatabaseUrl;

public class Pokedex {
	
	private Connection conn;
	private Set<String> pokenames;
	
	public Pokedex() {
		
		try {
			this.conn = DatabaseUrl.extract().getConnection();
			
			// Fill in schema to create a table called Pokedex
			String schema = "CREATE TABLE IF NOT EXISTS pokedex(" + "id TEXT," + "pokemon TEXT,"
					+ "lat DECIMAL," + "lng DECIMAL," + "time TIMESTAMP,"
					+ "confirmed SMALLINT);";

			Statement stmt = conn.createStatement();
			stmt.executeUpdate(schema);
						
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		// add all names
		List<String> pokenamesAsList = Arrays.asList(
				"Bulbasaur",
				"Charmander", 
				"Squirtle", 
				"Caterpie", 
				"Spearow", 
				"Ekans", 
				"Pikachu", 
				"Sandshrew", 
				"Nidoran♀", 
				"Nidoran♂", 
				"Clefairy", 
				"Vulpix", 
				"Jigglypuff",
				"Zubat", 
				"Oddish", 
				"Paras", 
				"Venonat", 
				"Diglett", 
				"Meowth", 
				"Psyduck", 
				"Mankey", 
				"Growlithe",
				"Poliwag", 
				"Abra", 
				"Machop", 
				"Bellsprout",
				"Tentacool", 
				"Geodude", 
				"Ponyta", 
				"Slowpoke", 
				"Magnemite", 
				"Farfetch'd",
				"Doduo", 
				"Seel", 
				"Grimer", 
				"Shellder", 
				"Gastly", 
				"Onix", 
				"Drowzee", 
				"Krabby", 
				"Voltorb", 
				"Exeggcute", 
				"Cubone", 
				"Lickitung",
				"Koffing", 
				"Rhyhorn", 
				"Chansey", 
				"Tangela", 
				"Horsea", 
				"Goldeen", 
				"Staryu", 
				"Scyther", 
				"Jynx", 
				"Electabuzz", 
				"Magmar", 
				"Pinsir", 
				"Magikarp", 
				"Eevee"
		);
		
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
		String schema = "INSERT INTO pokedex VALUES(?,?,?,?,?,?);";					
		PreparedStatement prep = conn.prepareStatement(schema);
		prep.setString(1, generateID());
		prep.setString(2, pokemon);
		prep.setDouble(3, lat);
		prep.setDouble(4, lng);
		prep.setTimestamp(5, timestamp);
		prep.setInt(6, 0);
		prep.executeUpdate();

		// Close the PreparedStatement
		prep.close();
	}
	
	public boolean ContainsNestID(String nestID) throws SQLException {
		
		// Fill in schema to create a table called pokedex
		boolean result = false;
		String schema = "SELECT * FROM pokedex WHERE id = ?;";					
		PreparedStatement prep = conn.prepareStatement(schema);
		prep.setString(1, nestID);
		ResultSet rs = prep.executeQuery();
		if (rs.next()) {
			result = true;
		}
		// Close the PreparedStatement
		prep.close();
		return result;
	}
	
	public void Remove(String id) throws SQLException {
		
		// Fill in schema to create a table called pokedex
		String schema = "DELETE FROM pokedex WHERE id = ?;";					
		PreparedStatement prep = conn.prepareStatement(schema);
		prep.setString(1, id);
		prep.executeUpdate();

		// Close the PreparedStatement
		prep.close();
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
			
		    String query = "SELECT * FROM pokedex WHERE "
		        + "lat >= ? AND lat <= ? "
		        + "AND lng >= ? AND lng <= ?;";

		    PreparedStatement prep = conn.prepareStatement(query);
		    prep.setDouble(1, minlat);
		    prep.setDouble(2, maxlat);
		    prep.setDouble(3, minlng);
		    prep.setDouble(4, maxlng);
		    ResultSet rs = prep.executeQuery();

			while (rs.next()) {
				String id = rs.getString("id");
				String name = rs.getString("pokemon");
				String lat = rs.getString("lat");
				String lng = rs.getString("lng");
				String timestamp = rs.getString("time");
			
				Map<String, Object> data = new HashMap<>();
				data.put("id", id);
				data.put("pokemon", name);
				data.put("lat", lat);
				data.put("lng", lng);
				data.put("timestamp", timestamp);
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
			ResultSet rs = stmt.executeQuery("SELECT * FROM pokedex;");
			while (rs.next()) {
				String id = rs.getString("id");
				String name = rs.getString("pokemon");
				String lat = rs.getString("lat");
				String lng = rs.getString("lng");
				String time = rs.getString("time");
				String confirmed = rs.getString("confirmed");
				String data = String.format("<p>" + "id: %s<br>"
						+ "pokemon: %s<br>" + "lat: %s<br>" + "lng: %s<br>"
						+ "time: %s<br>" + "confirmed: %s</p>", id, name, lat,
						lng, time, confirmed);
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
		String unique = UUID.randomUUID().toString();
		// check for collision..?
		return unique;
	}
}
