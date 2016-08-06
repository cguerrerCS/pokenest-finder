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
        <button id="submitbtn" type="button" class="btn btn-primary">Report</button>
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

      <div class="modal-body"></div>

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

          <div class="togglebutton">
              <label>
                Follow Location
                <input type="checkbox" checked="">
              </label>
          </div>

        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button id="applysettingsbtn" type="button" class="btn btn-primary">Apply</button>
      </div>

    </div>
  </div>
</div>

</body>
</html>
