<!DOCTYPE html>
<html>
<head>
  <#include "header.ftl">
</head>

<body>

<div class="container">
	<h1>Database Output</h1>
	<ul id="database-list" class="list-group">
	<#list results as x>
	  <li class="list-group-item"> 
	  	${x} 
	  </li>
	</#list>
	</ul>
</div>

</body>
</html>
