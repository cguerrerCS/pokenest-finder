
<nav class="navbar navbar-default navbar-fixed-top">

  <div class="container">

	<div class="navbar-header">
		<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-warning-collapse">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
        </button>
		<!-- <a href="javascript:void(0)" class="pokenest-logo-img"><img src='../img/eggs.png' alt="logo" height="38" width="44"></a> -->
		<a href="javascript:void(0)" class="pokenest-logo-txt">PokéNest</a>
	</div>

	<div class="navbar-collapse collapse navbar-warning-collapse">
	 	<ul class="nav navbar-nav navbar-right">
	  		<li>
	  			<a id="signup-trigger" class="pokenest-signup" data-toggle="collapse" data-target=".navbar-warning-collapse.in" href="javascript:void(0)"><span class="glyphicon glyphicon-user"></span> Sign Up</a>
	  		</li>
	  		<li>
	  			<a id="login-trigger" class="pokenest-login"  data-toggle="collapse" data-target=".navbar-warning-collapse.in" href="javascript:void(0)"><span class="glyphicon glyphicon-log-in"></span> Login</a>
	  		</li>

	  		<li id="account-dropdown" class="dropdown">
                <a href="bootstrap-elements.html" data-target="#" class="dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><span class="glyphicon glyphicon-user"></span> Username
                  <b class="caret"></b><div class="ripple-container"></div></a>
                <ul class="dropdown-menu">
                  <li><a href="javascript:void(0)">Action</a></li>
                  <li class="divider"></li>
                  <li><a href="javascript:void(0)">Logout</a></li>
                </ul>
            </li>
            
		</ul>
    </div>
  </div>

  <div id="pokenest-progress-container" class="progress">
  	<div id="pokenest-progress-bar" class="progress-bar"></div>
  </div>
  
</nav>
