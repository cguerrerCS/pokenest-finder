<!DOCTYPE html>
<html>

<head>
  <#include "header.ftl">
</head>

<body>

<div id="mapid"></div>

<!-- Bootstrap Modal -->
<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        
        <h4 class="modal-title" id="myModalLabel">

			<img src='../img/pokeball.png' alt='Pokeball Icon' height='40' width='40'>
        	Geotag Pokenest!</h4>
      </div>
      <div class="modal-body">

      	<div id="pokemon-typeahead">
  			<input id="pokemon-modal-input" class="typeahead form-control" type="text" placeholder="Pokémon species">
		</div>

		<!-- Modal map used to mark Pokemon sighting location-->
        <div id="sitemapid" style="height:280px"></div>

      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button id="submitbtn" type="button" class="btn btn-primary">Report</button>
      </div>
    </div>
  </div>
</div>

<!-- Bootstrap Pokevision modal -->
<div class="modal fade" id="myMarkerModal" tabindex="-1" role="dialog" aria-labelledby="myMarkerModalLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
      
        <h4 class="modal-title" id="myMarkerModalLabel">
            <img src='../img/pokeball.png' alt='Pokeball Icon' height='40' width='40'>
          Pokemarker Data!</h4>

      </div>
      <div class="modal-body">

      <!-- Load in pokevision realtime arial view -->
      <div id="sitemapid" style="height:280px"></div>

      </div>
      
    </div>
  </div>
</div>

</body>
</html>
