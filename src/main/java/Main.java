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
import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;

public class Main {
	
  private final static Gson GSON = new Gson();

  public static void main(String[] args) {
	  new Main(args).run();
  }
  
  private String[] args;
  private Connection conn;
  private Pokedex pokedex;
  
  private Main(String[] args) {
	  this.args = args;
  }
  
  private void run() {
	pokedex = new Pokedex();
	runSparkServer();
  }

	private void runSparkServer() {
		
		Spark.staticFileLocation("/public");
		Spark.port(Integer.valueOf(System.getenv("PORT")));

		Spark.get("/hello", (req, res) -> "Pokemon is a go!");

		Spark.get("/", (request, response) -> {
			Map<String, Object> attributes = new HashMap<>();
			attributes.put("title", "Pokenest");
			return new ModelAndView(attributes, "index.ftl");
		}, new FreeMarkerEngine());

		Spark.post("/report", (request, response) -> {

			Map<String, Object> results = ImmutableMap.of("success", true);
			QueryParamsMap queryMap = request.queryMap();
			String pokemon = queryMap.value("pokemon");
			double lat = Double.parseDouble(queryMap.value("lat"));
			double lng = Double.parseDouble(queryMap.value("lng"));
			java.sql.Timestamp timestamp = new java.sql.Timestamp(Calendar.getInstance().getTime().getTime());
			System.out.println(String.format("%s nest sighting reported.", pokemon));	
			pokedex.Add(pokemon, lat, lng, timestamp);
			
			return GSON.toJson(results);
		});
		
		Spark.post("/remove", (request, response) -> {

			Map<String, Object> results = ImmutableMap.of("success", true);
			QueryParamsMap queryMap = request.queryMap();
			String id = queryMap.value("id");
			String password = queryMap.value("password");
			
			if (password != "password") {
				results.put("success", false);
			} else {
				pokedex.Remove(id);	
			}
			return GSON.toJson(results);
		});
		
		Spark.post("/nearby", (request, response) -> {

			List<Map<String, Object>> results = pokedex.nearby();
			
//			QueryParamsMap queryMap = request.queryMap();
//			String pokemon = queryMap.value("pokemon");
//			double lat = Double.parseDouble(queryMap.value("lat"));
//			double lng = Double.parseDouble(queryMap.value("lng"));
//			java.sql.Timestamp timestamp = new java.sql.Timestamp(Calendar.getInstance().getTime().getTime());
//			System.out.println(String.format("%s nest sighting reported.", pokemon));	
//			pokedex.Add(pokemon, lat, lng, timestamp);
			
			return GSON.toJson(results);
		});



		Spark.get("/db", (req, res) -> {
//					Connection connection = null;
					Map<String, Object> attributes = new HashMap<>();
//					try {
//						connection = DatabaseUrl.extract().getConnection();
//						
//						// Fill in schema to create a table called pokedex
//						String schema = "CREATE TABLE IF NOT EXISTS pokedex(" + "id TEXT," + "pokemon TEXT,"
//								+ "lat DECIMAL," + "lng DECIMAL," + "time TIMESTAMP,"
//								+ "confirmed SMALLINT);";
//
//						Statement stmt = connection.createStatement();
//						stmt.executeUpdate(schema);
						
						// insert some dummy values
//						schema = "INSERT INTO pokedex VALUES(?,?,?,?,?,?);";						
//						java.sql.Timestamp currentTimestamp = new java.sql.Timestamp(Calendar.getInstance().getTime().getTime());
//						PreparedStatement prep = connection.prepareStatement(schema);
//						prep.setString(1, generateID());
//						prep.setString(2, "Dratini");
//						prep.setDouble(3, 29.61499068217801);
//						prep.setDouble(4, -95.17674922943117);
//						prep.setTimestamp(5, currentTimestamp);
//						prep.setInt(6, 0);
//						prep.executeUpdate();
						
						
//						ResultSet rs = stmt
//								.executeQuery("SELECT * FROM pokedex;");
//
//						ArrayList<String> output = new ArrayList<String>();
//						while (rs.next()) {
//							
//							String id = rs.getString("id");
//							String name = rs.getString("pokemon");
//							String lat = rs.getString("lat");
//							String lng = rs.getString("lng");
//							String time = rs.getString("time");
//							String confirmed = rs.getString("confirmed");
//							String data = String.format("[%s:%s:%s:%s:%s:%s]", id, name, lat, lng, time, confirmed);
//							
//							output.add("Read from DB: "
//									+ data);
//						}

						attributes.put("title", "Pokenest");
						System.out.println(pokedex.GetDatabaseRowsAsStrings());
						attributes.put("results", pokedex.GetDatabaseRowsAsStrings());						
						return new ModelAndView(attributes, "db.ftl");

				}, new FreeMarkerEngine());
    
	} 
}
