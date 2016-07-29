import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import spark.ModelAndView;

import com.heroku.sdk.jdbc.DatabaseUrl;


public class Pokedex {
	
	private Connection conn;
	
	public Pokedex() {
		
		Connection conn = null;
		
		try {
			conn = DatabaseUrl.extract().getConnection();
			
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
}
