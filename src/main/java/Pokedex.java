import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import spark.ModelAndView;

import com.heroku.sdk.jdbc.DatabaseUrl;


public class Pokedex {
	
	private Connection conn;
	
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

		schema = "INSERT INTO pokedex VALUES(?,?,?,?,?,?);";						
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
				String data = String.format("[%s:%s:%s:%s:%s:%s]", id, name, lat, lng, time, confirmed);
				output.add(data);
			}
			
		} catch (SQLException e) {
			e.printStackTrace();
		}
		
		return output;
	}
	
	private String generateID() {
		String unique = UUID.randomUUID().toString();
		// check for collision..?
		return unique;
	}
}
