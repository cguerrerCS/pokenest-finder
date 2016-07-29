import java.sql.*;
import java.util.Calendar;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.net.URI;
import java.net.URISyntaxException;

import spark.QueryParamsMap;
import spark.Spark;
import spark.template.freemarker.FreeMarkerEngine;
import spark.ModelAndView;

import com.heroku.sdk.jdbc.DatabaseUrl;
import com.google.gson.Gson;

public class Main {
	
  private final static Gson GSON = new Gson();

  public static void main(String[] args) {
	  new Main(args).run();
  }
  
  private String[] args;
  
  private Main(String[] args) {
	  this.args = args;
  }
  
  private void run() {
	runSparkServer();
  }

	private void runSparkServer() {

		Spark.staticFileLocation("/public");
		Spark.port(Integer.valueOf(System.getenv("PORT")));

		Spark.get("/hello", (req, res) -> "Pokemon is a go!");

		Spark.get("/", (request, response) -> {
			Map<String, Object> attributes = new HashMap<>();
			attributes.put("title", "This sucks!");
			return new ModelAndView(attributes, "index.ftl");
		}, new FreeMarkerEngine());

		Spark.post("/nearby", (request, response) -> {

			List<String> results = new ArrayList<String>();

			// QueryParamsMap queryMap = request.queryMap();
			// double minlat =
			// Double.parseDouble(queryMap.value("southWestLat"));
			// double maxlat =
			// Double.parseDouble(queryMap.value("northEastLat"));
			// double minlng =
			// Double.parseDouble(queryMap.value("southWestLat"));
			// double maxlng =
			// Double.parseDouble(queryMap.value("southWestLat"));

				results.add("Charmander");
				results.add("Charmeleon");
				results.add("Charizard");

				return GSON.toJson(results);
			});

		Spark.get(
				"/db",
				(req, res) -> {
					Connection connection = null;
					Map<String, Object> attributes = new HashMap<>();
					try {
						connection = DatabaseUrl.extract().getConnection();
						
						
						// Fill in schema to create a table called pokedex
						String schema = "CREATE TABLE IF NOT EXISTS pokedex(" + "id TEXT," + "pokemon TEXT,"
								+ "lat DECIMAL," + "lng DECIMAL," + "time TIMESTAMP,"
								+ "confirmed SMALLINT);";

						Statement stmt = connection.createStatement();
						stmt.executeUpdate(schema);
						
						// insert some dummy values
						schema = "INSERT INTO pokedex VALUES(?,?,?,?,?,?);";
						
						// java.sql.Timestamp currentTimestamp = new java.sql.Timestamp();
						
						//Date date = resultSet.getTimestamp("columnname");
						//long milis = date.getTime() ; 
						
						java.sql.Timestamp currentTimestamp = new java.sql.Timestamp(Calendar.getInstance().getTime().getTime());
						PreparedStatement prep = connection.prepareStatement(schema);
						prep.setString(1, generateID());
						prep.setString(2, "Dratini");
						prep.setDouble(3, 29.61499068217801);
						prep.setDouble(4, -95.17674922943117);
						prep.setTimestamp(5, currentTimestamp);
						prep.setInt(6, 0);
						prep.executeUpdate();
						
						
						ResultSet rs = stmt
								.executeQuery("SELECT pokemon FROM pokedex;");

						ArrayList<String> output = new ArrayList<String>();
						while (rs.next()) {
							output.add("Read from DB: "
									+ rs.getString("pokemon"));
						}

						attributes.put("results", output);
						attributes.put("title", "This sucks!");
						
						return new ModelAndView(attributes, "db.ftl");
					} catch (Exception e) {
						attributes.put("message", "There was an error: " + e);
						attributes.put("title", "This sucks!");
						return new ModelAndView(attributes, "error.ftl");
					} finally {
						if (connection != null)
							try {
								connection.close();
							} catch (SQLException e) {
							}
					}
				}, new FreeMarkerEngine());
    
	} 
	
	private String generateID() {
		String unique = UUID.randomUUID().toString();
		// check for collision..?
		return unique;
	}
}
