<!DOCTYPE html>
<html>
<head>
  <#include "db-header.ftl">
</head>

<body>

	<div class="container">
		<h1>Database Contents</h1>
		<ul id="database-list" class="list-group">
		<#list results as x>
		  <li class="list-group-item db-list-item"> 
		  	${x}
		  </li>
		</#list>
		</ul>
	</div>

	<!-- Bootstrap Modal for Pokenest Datapoint Info -->
	<div class="modal fade" id="myDetailsModal" tabindex="-1" role="dialog" aria-labelledby="myMarkerModalLabel">
	  <div class="modal-dialog" role="document">
	    <div class="modal-content">
	      
	      <div class="modal-header">
	        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
	        <img src='../img/pokeball.png' alt='Pokeball Icon'>
	        <h4 class="modal-title" id="markerdata-header">Pokemarker Data!</h4>
	      </div>

	      <div class="modal-body">

	        <!-- Modal map used to provide arial zoomed in view of selected nest -->
	        <div id="infomapid" style="height:280px; width: 100%;"></div>

	      </div>

	      <div class="modal-footer">
	        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
	        <button id="removeEntryBtn" type="button" class="btn btn-primary btn-raised btn-danger">Remove</button>
	        <button id="confirmEntryBtn" type="button" class="btn btn-primary btn-raised btn-danger">Remove</button>
	      </div>

	    </div>
	  </div>
	</div>

</body>
</html>
