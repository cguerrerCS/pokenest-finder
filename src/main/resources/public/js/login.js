
/* code for form validation hints */
var defaultHeight = undefined; 
var passwordError = false;
var hints = 0;
var HINT_HEIGHT = 22; // height + margin

$( document ).ready(function() {

	// get height of sign up password container 
	defaultHeight = $("#signup-password-container").height();

	$('#signup-trigger').on('click', function() {

		// clear modal test boxes
		$('#inputUsername').val("");
		$('#inputPassword').val("");
		$('#inputPasswordRepeat').val("");

		// reset state variables
		passwordError = false;
		hints = 0;

		// clean up any leftover error classes
		$( "#signup-password-container" ).removeClass( "has-error" );

		// remove existent password hints
		clearPasswordHints();

		// disable create account button by default
		// disableSignupBtn();

		// open up login modal
		$("#signupModal").modal();
	});

	$('#signupbtn').on('click', function() {

		// get textbox values form sign in modal
		var username = $('#inputUsername').val();
		var password = $('#inputPassword').val();
		var repeatedPassword = $('#inputPasswordRepeat').val();

		if (password != repeatedPassword) {

			var options =  {
    			content: "Repeated password does not match",
    			style: "snackbar",  // add a custom class to your snackbar
    			timeout: 3000 		// time in milliseconds after the snackbar autohides, 0 is disabled
			}
			$.snackbar(options);

		} else {

			// send sign up post request to the server
			var postParameters = {username: username, password: password};
			$.post("/signup", postParameters, function(responseJSON){

				var responseObject = JSON.parse(responseJSON);
				var success = responseObject.success;
				var error = responseObject.error;
				var sessionCookie = responseObject.sessionCookie;
				console.log(sessionCookie);

				// add notification for user
				var options =  {
	    			content: "", 		// text of the snackbar
	    			style: "snackbar",  // add a custom class to your snackbar
	    			timeout: 3000 		// time in milliseconds after the snackbar autohides, 0 is disabled
				}
				if (success) {
					options['content'] = "PokéNest account created for trainer '" + username + "'";
				} else {
					options['content'] = "Error: " + error;
				}
				$.snackbar(options);

				// TODO: hide login and sign up buttons, instead show logged in as 'username'

				// hide modal
				if (success) {
					$("#signupModal").modal('hide');
				}
			});
		}
	});

	$('#login-trigger').on('click', function() {
	});

	$('#inputPassword').keyup(function() {

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
    			
    			$("#password-hints").append("<span id='passhint1' class='help-block'> Must be at least 8 characters long </span>");
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
    			$("#password-hints").append("<span id='passhint2' class='help-block'> Include at least one digit </span>");
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
    			$("#password-hints").append("<span id='passhint3' class='help-block'> Include at least one capital letter </span>");
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
    			$("#password-hints").append("<span id='passhint4' class='help-block'> Include at least one lowercase letter </span>");
    			$("#signup-password-container").css("height", ($("#signup-password-container").height() + HINT_HEIGHT) + "px");
    		}
			
		} else {

			/* remove hint if it exists */
			if($('#passhint4').length != 0) { 
    			$("#passhint4").remove();
    			$("#signup-password-container").css("height", ($("#signup-password-container").height() - HINT_HEIGHT) + "px");
    		}

		}

		if ( !password.match(/[^a-zA-Z0-9]/) ) {
			console.log("includes special characters");

			/* increment number of hints to show and display error */
			passwordError = true;
			hints++; 

			/* add hint if it does not exist */
    		if($('#passhint5').length == 0) { 
    			$("#password-hints").append("<span id='passhint4' class='help-block'> Include at least one special character </span>");
    			$("#signup-password-container").css("height", ($("#signup-password-container").height() + HINT_HEIGHT) + "px");
    		}

		} else {

			/* remove hint if it exists */
			if($('#passhint5').length != 0) { 
    			$("#passhint5").remove();
    			$("#signup-password-container").css("height", ($("#signup-password-container").height() - HINT_HEIGHT) + "px");
    		}

		}

	}).focus(function() {
	
		if (passwordError) {

			/* restore height and add fluff if error persists  */ 
			$("#signup-password-container").css("height", (defaultHeight + (HINT_HEIGHT * hints)) + "px" );
		}

	}).blur(function() {
		
		// show red to indicate from info is invalid or missing
		if (passwordError) {
			$( "#signup-password-container" ).addClass( "has-error" );
		} 
    	    	
    	/* reset element height to default */
    	$("#signup-password-container").css("height", defaultHeight);
	});

}); 


/* enable and revert style */
function enableSignupBtn() {

	// disable signup button
	$( '#signupbtn' ).prop('disabled', false);

	// remove all style classes temporarily
	$( '#signupbtn' ).addClass( 'btn-raised' );
	$( '#signupbtn' ).addClass( 'btn-info' );
}

/* disable and style accordingly */
function disableSignupBtn() {

	// disable signup button
	$( '#signupbtn' ).prop('disabled', true);

	// remove all style classes temporarily
	$( '#signupbtn' ).removeClass( 'btn-raised' );
	$( '#signupbtn' ).removeClass( 'btn-info' );
}

/* clear password hints if they exist */
function clearPasswordHints() {

	/* password length hint */
	if( $('#passhint1').length != 0 ) { 
    	$("#passhint1").remove();
    }

	/* at least one digit hint */
	if( $('#passhint2').length != 0 ) { 
    	$("#passhint2").remove();
    }

    /* at least one capital letter hint */
	if( $('#passhint3').length != 0 ) { 
    	$("#passhint3").remove();
    }

    /* at least one lowercase letter hint */
	if( $('#passhint4').length != 0 ) { 
    	$("#passhint4").remove();
    }

    /* at least one special character hint */
	if( $('#passhint5').length != 0 ) { 
    	$("#passhint5").remove();
    }
}