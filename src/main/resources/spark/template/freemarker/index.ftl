<!DOCTYPE html>
<html>

<head>
  <#include "header.ftl">
</head>

<body>

<!-- Bootstrap navbar for displaying service logo -->
<#include "nav.ftl">

<div id="content">
  <div id="mapid"></div>
</div>

<!-- Bootstrap Modal for submitting Pokenest locations -->
<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <img src='../img/pokeball.png' alt='Pokeball Icon'>  
        <h4 class="modal-title" id="myModalLabel">Geotag Pokenest!</h4>	
      </div>

      <div class="modal-body">

        <!-- Twitter Typeahead for Pokemon autocorrect -->
      	<div id="pokemon-typeahead">
  			 <input id="pokemon-modal-input" class="typeahead form-control" type="text" placeholder="Pokémon species">
		    </div>

        <!-- Modal map used to mark Pokemon sighting location-->
        <div id="sitemapid" style="height:280px; width: 100%;"></div>

      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button id="submitbtn" type="button" class="btn btn-primary btn-raised btn-success">Report</button>
      </div>

    </div>
  </div>
</div>

<!-- Bootstrap Modal for Pokenest Marker Info -->
<div class="modal fade" id="myMarkerModal" tabindex="-1" role="dialog" aria-labelledby="myMarkerModalLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <img src='../img/pokeball.png' alt='Pokeball Icon'>
        <h4 class="modal-title" id="markerdata-header">Pokemarker Data!</h4>
      </div>

      <div class="modal-body">

        <div class="row">

          <div class="col-sm-8" style="background-color:lavender;">

            <!-- Modal map used to provide arial zoomed in view of selected nest -->
            <div id="infomapid" style="height:280px; width: 100%;"></div>

            <!-- ID information regarding selected Pokenest -->
            <h4 id="markerdata-id"></h4>

            <!-- Confirmation information regarding selected Pokenest -->
            <h4 id="markerdata-confirmed"></h4>

            <!-- Distance information regarding selected Pokenest -->
            <h4 id="markerdata-distance"></h4>

            <!-- Link to Google Maps directions -->
            <h4 id="markerdata-googlemap-directions"> <a id="markerdata-googlemap-directions-link" target="_blank" href="#">Get Directions</a></h4>

          </div>

          <div class="col-sm-4" style="background-color:lavenderblush;">

            <!-- voting info put here dynamically -->
            <div id="pokenest-votes" ></div>

          </div>

        </div>
    
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button id="removeEntryBtn" type="button" class="btn btn-primary btn-raised btn-danger">Remove</button>
        <button id="confirmEntryBtn" type="button" class="btn btn-primary btn-raised btn-success">Confirm</button>
      </div>

    </div>
  </div>
</div>

<!-- Bootstrap Modal for Pokenest User Settings -->
<div class="modal fade" id="mySettingsModal" tabindex="-1" role="dialog" aria-labelledby="myMarkerModalLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <img src='../img/pokeball.png' alt='Pokeball Icon'>
        <h4 class="modal-title" id="markerdata-header">Settings</h4>
      </div>

      <div class="modal-body">

        <div class="form-group">
          <h4>Location</h4>
          <div class="togglebutton">
              <label>
                Follow Location
                <input id="follow-setting" type="checkbox">
              </label>
          </div>
          <hr>
        </div>

        <div class="form-group">
          <h4>PokéNest Search Filter</h4>
          <div class="radio">
            <label>
              <input id="marker-filter-radio-1" type="radio" name="marker-filter" value="verified">
              Only show verified PokéNests
            </label>
          </div>

          <div class="radio">
            <label>
              <input id="marker-filter-radio-2" type="radio" name="marker-filter" value="nonverified">
              Only show non verified PokéNests
            </label>
          </div>

          <div class="radio">
            <label>
              <input id="marker-filter-radio-3" type="radio" name="marker-filter" value="all">
              Show all reported PokéNests
            </label>
          </div>
          <hr>
        </div>

        <div class="form-group">
          <h4>Access</h4>
          <div class="togglebutton">
              <label id="access-toggle">
                Privileged Mode
                <input id="access-setting" type="checkbox">
              </label>
          </div>
          <input id="access-password" class="form-control" type="password" placeholder="Access Password">
          <hr>
        </div>

      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button id="applysettingsbtn" type="button" class="btn btn-primary btn-raised btn-info">Apply</button>
      </div>

    </div>
  </div>
</div>

<!-- Bootstrap Modal for trainer signup -->
<div class="modal fade" id="signupModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <img src='../img/pokeball.png' alt='Pokeball Icon'>  
        <h4 class="modal-title" id="myModalLabel">Trainer Sign up</h4> 
      </div>

      <div class="modal-body">

          <!-- Username input box --> 
          <div class="form-group signup-form-group">
            <label for="inputUsername" class="col-md-2 control-label">Username</label>
            <div class="col-md-10">
              <input type="text" class="form-control" id="inputUsername" placeholder="Username">
            </div>
          </div>
        
          <!-- Password input box -->
          <div id="signup-password-container" class="form-group signup-form-group">
            <label for="inputPassword" class="col-md-2 control-label">Password</label>
            <div class="col-md-10">
              <input type="password" class="form-control" id="inputPassword" placeholder="Password">
              <div id="password-hints"></div>
            </div>
          </div>

          <!-- Repeat password for usability -->
          <div id="repeat-password-container" class="form-group signup-form-group">
            <label for="inputPasswordRepeat" class="col-md-2 control-label">Confirm</label>
            <div class="col-md-10">
              <input type="password" class="form-control" id="inputPasswordRepeat" placeholder="Retype Password">
              <div id="repeat-password-hints"></div>
            </div>
          </div>

      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
        <button id="signupbtn" type="submit" class="btn btn-primary btn-raised btn-info">Create Account</button>
      </div>

    </div>
  </div>
</div>

<!-- Bootstrap Modal for trainer login -->
<div class="modal fade" id="loginModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <img src='../img/pokeball.png' alt='Pokeball Icon'>  
        <h4 class="modal-title" id="myModalLabel">Trainer Log In</h4> 
      </div>

      <div class="modal-body">

          <!-- Username input box --> 
          <div class="form-group login-form-group">
            <label for="login-username" class="col-md-2 control-label">Username</label>
            <div class="col-md-10">
              <input id="login-username" type="text" class="form-control" placeholder="Username">
            </div>
          </div>
        
          <!-- Password input box -->
          <div class="form-group login-form-group">
            <label for="login-password" class="col-md-2 control-label">Password</label>
            <div class="col-md-10">
              <input id="login-password" type="password" class="form-control" placeholder="Password">
            </div>
          </div>

      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
        <button id="loginbtn" type="submit" class="btn btn-primary btn-raised btn-info">Log In</button>
      </div>

    </div>
  </div>
</div>

</body>
</html>
