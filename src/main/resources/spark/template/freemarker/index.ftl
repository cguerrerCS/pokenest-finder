<!DOCTYPE html>
<html>

<head>
  <#include "header.ftl">
</head>

<body>

<!-- Bootstrap navbar for displaying service logo -->
<#include "nav.ftl">

<div id="mapid"></div>

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
      	<div id="pokemon-typeahead">
  			 <input id="pokemon-modal-input" class="typeahead form-control" type="text" placeholder="Pokémon species">
		    </div>
      </div>

		  <!-- Modal map used to mark Pokemon sighting location-->
      <div id="sitemapid" style="height:280px"></div>

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

</body>
</html>
