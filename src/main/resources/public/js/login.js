
/* code for form validation hints */
var defaultHeight = $("#signup-password-container").height();
var passwordError = false;
var hints = 0;
var HINT_HEIGHT = 22; // height + margin

$( document ).ready(function() {

	$('#inputPassword').keyup(function(e) {

		/* get user password */
    	var password = $('#inputPassword').val();

    	/* recount hints, reset error bool */
    	hints = 0;
    	passwordError = false;

		/* check for invalid password length */
    	if ( password.length < 8 ) {

    		/* increment number of hints to show and display error */
    		passwordError = true;
    		hints++;
    		
    		/* add hint if it does not exist */
    		if($('#passhint1').length == 0) { 
    			
    			$("#password-hints").append("<span id='passhint1' class='help-block'> Be at least 8 characters </span>");
    			$("#signup-password-container").css("height", ($("#signup-password-container").height() + HINT_HEIGHT) + "px");
    		}
    		
		} else {

			/* remove hint if it exists */
			if($('#passhint1').length != 0) { 
    			$("#passhint1").remove();
    			$("#signup-password-container").css("height", ($("#signup-password-container").height() - HINT_HEIGHT) + "px");
    		}

		}

		/* check for at least one digit */
		if ( !password.match(/\d/) ) {
			
			/* increment number of hints to show and display error */
			passwordError = true;
			hints++; 

			/* add hint if it does not exist */
    		if($('#passhint2').length == 0) { 
    			$("#password-hints").append("<span id='passhint2' class='help-block'> At least one digit </span>");
    			$("#signup-password-container").css("height", ($("#signup-password-container").height() + HINT_HEIGHT) + "px");
    		}

		} else {

			/* remove hint if it exists */
			if($('#passhint2').length != 0) { 
    			$("#passhint2").remove();
    			$("#signup-password-container").css("height", ($("#signup-password-container").height() - HINT_HEIGHT) + "px");
    		}

		}

		/* check for at least one capital letter */
		if ( !password.match(/[A-Z]/) ) {
		
			/* increment number of hints to show and display error */
			passwordError = true;
			hints++; 

			/* add hint if it does not exist */
    		if($('#passhint3').length == 0) { 
    			$("#password-hints").append("<span id='passhint3' class='help-block'> At least one capital letter </span>");
    			$("#signup-password-container").css("height", ($("#signup-password-container").height() + HINT_HEIGHT) + "px");
    		}

		} else {

			/* remove hint if it exists */
			if($('#passhint3').length != 0) { 
    			$("#passhint3").remove();
    			$("#signup-password-container").css("height", ($("#signup-password-container").height() - HINT_HEIGHT) + "px");
    		}

		}

		/* check for at least one lowercase letter */
		if ( !password.match(/[a-z]/) ) {

			/* increment number of hints to show and display error */
			passwordError = true;
			hints++; 

			/* add hint if it does not exist */
    		if($('#passhint4').length == 0) { 
    			$("#password-hints").append("<span id='passhint4' class='help-block'> At least one lowercase letter </span>");
    			$("#signup-password-container").css("height", ($("#signup-password-container").height() + HINT_HEIGHT) + "px");
    		}
			
		} else {

			/* remove hint if it exists */
			if($('#passhint4').length != 0) { 
    			$("#passhint4").remove();
    			$("#signup-password-container").css("height", ($("#signup-password-container").height() - HINT_HEIGHT) + "px");
    		}

		}

		if (passwordError) {
			$( "#signup-password-container" ).addClass( "has-error" );
		}

		
    	
	}).focus(function(e) {
		// e.preventDefault();

		if (passwordError) {

			/* restore height and add fluff if error persists  */ 
			$("#signup-password-container").css("height", (defaultHeight + (HINT_HEIGHT * hints)) + "px" );
		}

	}).blur(function(e) {
		// e.preventDefault();

		if (passwordError) {
			$( "#signup-password-container" ).addClass( "has-error" );
		}
    	    	
    	/* reset element height to default */
    	$("#signup-password-container").css("height", defaultHeight);
	});

} 