import java.sql.*;
import java.util.Calendar;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import spark.QueryParamsMap;
import spark.Spark;
import spark.template.freemarker.FreeMarkerEngine;
import spark.ModelAndView;

import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;

public class Main {
	
  private final static Gson GSON = new Gson();

  public static void main(String[] args) {
	  new Main(args).run();
  }
  
  // private String[] args;
  private Pokedex pokedex;
  
  private Main(String[] args) {
	  // this.args = args;
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

			Map<String, Object> results = ImmutableMap.of("success", true, "error", "");
			QueryParamsMap queryMap = request.queryMap();
			
			double lat;
			double lng;
			
			// make sure submitted coordinate contains a valid double pair
			try {
				lat = Double.parseDouble(queryMap.value("lat"));
				lng = Double.parseDouble(queryMap.value("lng"));
			} catch (NumberFormatException e) {
				e.printStackTrace();
				results = ImmutableMap.of("success", false, "error", "Submitted LatLng contains non-number.");
				return GSON.toJson(results);
			}
			
			// make sure submitted coordinate is valid (on earth)
			if ((lng < -180.0) || (lng > 180) || (lat < -90) || (lat > 90)) {
				results = ImmutableMap.of("success", false, "error", "Submitted LatLng is invalid.");
				return GSON.toJson(results);
			}
			
			// check if Pokemon name is valid
			String pokemon = queryMap.value("pokemon");
			if (!pokedex.validPokemon(pokemon)) {
				results = ImmutableMap.of("success", false, "error", String.format("Invalid Pokemon name '%s'", pokemon));
				return GSON.toJson(results);
			}
				
			java.sql.Timestamp timestamp = new java.sql.Timestamp(Calendar.getInstance().getTime().getTime());
			System.out.println(String.format("%s nest sighting reported.", pokemon));	
			pokedex.Add(pokemon, lat, lng, timestamp);
			return GSON.toJson(results);
		});
		
		Spark.post("/remove", (request, response) -> {

			Map<String, Object> results = new HashMap<String, Object>();
			QueryParamsMap queryMap = request.queryMap();
			String id = queryMap.value("id");
			String password = queryMap.value("password");
			
			if (!password.equals("password")) {
				results.put("success", false);
				results.put("error", "incorrect password");
			} else {
				boolean contains = true;
				
				try {
					contains = pokedex.ContainsNestID(id);
				} catch (SQLException e) {
					// throws error when no results are returned...?
					e.printStackTrace();
				}
				
				if (contains) {
					pokedex.Remove(id);	
					results.put("success", true);
					results.put("error", "");
				} else {
					results.put("success", false);
					results.put("error", String.format("DB does not contain ID: %s", id));
				}
			}
			return GSON.toJson(results);
		});
		
		Spark.post("/confirm", (request, response) -> {

			Map<String, Object> results = new HashMap<String, Object>();
			QueryParamsMap queryMap = request.queryMap();
			String id = queryMap.value("id");
			String password = queryMap.value("password");
			
			if (!password.equals("password")) {
				results.put("success", false);
				results.put("error", "incorrect password");
			} else {
				boolean contains = true;
				try {
					contains = pokedex.ContainsNestID(id);
				} catch (SQLException e) {
					e.printStackTrace();
					results.put("success", false);
					results.put("error", "Server error.");
					return GSON.toJson(results);
				}
				
				if (contains) {
					
					boolean confirmed = true;
					try {
						confirmed = pokedex.isConfirmed(id);
					} catch (SQLException e) {
						e.printStackTrace();
						results.put("success", false);
						results.put("error", "Server error.");
						return GSON.toJson(results);
					}
					
					if (!confirmed) {
						try { 
							pokedex.Confirm(id);
							results.put("success", true);
							results.put("error", "");
						} catch (SQLException e) {
							e.printStackTrace();
							results.put("success", false);
							results.put("error", "Server error.");
							return GSON.toJson(results);
						}
					} else {
						results.put("success", false);
						results.put("error", String.format("Nest [%s] already confirmed.", id));
						return GSON.toJson(results);
					}
					
					results.put("success", true);
					results.put("error", "");
					
				} else {
					results.put("success", false);
					results.put("error", String.format("DB does not contain ID: %s", id));
				}
			}
			return GSON.toJson(results);
		});
		
		Spark.post("/login", (request, response) -> {
//			QueryParamsMap queryMap = request.queryMap();
//			String username = queryMap.value("username");
//			String password = queryMap.value("password");
			Map<String, Object> sessionCookie = ImmutableMap.of("username", "", "token", "", "created", "");
			Map<String, Object> results = ImmutableMap.of("success", true, "error", "", "sessionCookie", sessionCookie);
			return GSON.toJson(results);
		});
		
		Spark.post("/signup", (request, response) -> {
			
			Map<String, Object> results;
			Map<String, Object> sessionCookie;
			QueryParamsMap queryMap = request.queryMap();
			String username = queryMap.value("username");
			String password = queryMap.value("password");

			// TODO: check if password meets security requirements
			boolean secure = SecurityUtil.PasswordIsSecure(password);
			if (!secure) {
				results = ImmutableMap.of("success", false,
						"error", "Provided password is not secure", "sessionCookie", "");
				return GSON.toJson(results);
			}

			sessionCookie = ImmutableMap.of("username",
					username, "token", "lool", "created", 1234);
			results = ImmutableMap.of("success", true,
					"error", "", "sessionCookie", sessionCookie);
			return GSON.toJson(results);
		});
		
		Spark.post("/nearby", (request, response) -> {

			QueryParamsMap queryMap = request.queryMap();
			double southWestLat = Double.parseDouble(queryMap.value("southWestLat"));
			double southWestLng = Double.parseDouble(queryMap.value("southWestLng"));
			double northEastLat = Double.parseDouble(queryMap.value("northEastLat"));
			double northEastLng = Double.parseDouble(queryMap.value("northEastLng"));
			List<Map<String, Object>> nests = new ArrayList<Map<String, Object>>();
			Map<String, Object> results;
			
			// TODO: error check provided bounds
			if ((southWestLng < -180.0) || (southWestLng > 180) || (southWestLat < -90) || (southWestLat > 90)) {
				results =  ImmutableMap.of("success", false, "error", "SouthWest [lat,lng] bound invalid.", "nests", nests);
				return GSON.toJson(results);
			}
			
			// TODO: error check provided bounds
			if ((northEastLng < -180.0) || (northEastLng > 180) || (northEastLat < -90) || (northEastLat > 90)) {
				results =  ImmutableMap.of("success", false, "error", "NorthEast [lat,lng] bound invalid.", "nests", nests);
				return GSON.toJson(results);
			}
						
			nests = pokedex.betterNearby(southWestLat, southWestLng, northEastLat, northEastLng);
			results = ImmutableMap.of("success", true, "error", "", "nests", nests);
			return GSON.toJson(results);
		});

		Spark.get("/db", (req, res) -> {
			Map<String, Object> attributes = new HashMap<>();
			attributes.put("title", "Pokenest");
			System.out.println(pokedex.GetDatabaseRowsAsStrings());
			attributes.put("results", pokedex.GetDatabaseRowsAsStrings());
			return new ModelAndView(attributes, "db.ftl");
		}, new FreeMarkerEngine());
	}
}
