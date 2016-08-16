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
	  <li class="db-list-item"> 
	  	${x}
	  </li>
	</#list>
	</ul>
</div>

</body>
</html>
