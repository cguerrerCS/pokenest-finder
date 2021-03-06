
/* code for form validation hints */
var defaultHeight = undefined; 
var repeatDefaultHeight = undefined;

/* types of signup errors */
var usernameError = false;
var repeatPasswordError = false;

/* variables used by validate password */
var hints = 0;
var passwordError = false;
var HINT_HEIGHT = 22; 

$( document ).ready(function() {

	/* load session information */

	if (haveSessionCookie()) {

		// user is presumed to have a valid login token
		setLoggedInState();

	} else {

		// user have not not logged in or signed up, show options
		setNotLoggedInState();
	}

	/* ************************************************************** */
	/* ** SIGN UP *************************************************** */
	/* ************************************************************** */

	defaultHeight = $("#signup-password-container").height();
	repeatDefaultHeight = $("#repeat-password-container").height();

	$('#signup-trigger').on('click', function() {

		// clear modal test boxes
		$('#inputUsername').val("");
		$('#inputPassword').val("");
		$('#inputPasswordRepeat').val("");

		// disable or enable btn accordingly
		updateSignupBtnState();

		// reset state variables
		passwordError = false;
		repeatPasswordError = false;
		hints = 0;

		// clean up any leftover error classes
		$( '#signup-password-container' ).removeClass( "has-error" );
		$( '#repeat-password-container' ).removeClass( "has-error" );

		// remove existent password hints
		clearPasswordHints();

		// open up signup modal
		$("#signupModal").modal();

	});

	$('#signupbtn').on('click', function() {

		// get textbox values form sign in modal
		var username = $('#inputUsername').val();
		var password = $('#inputPassword').val();
		var repeatedPassword = $('#inputPasswordRepeat').val();

		// perform logical validation for password and repeat
		validatePasswordLogical();
		validatePasswordRepeatLogical();

		if (passwordError) {
			$( "#signup-password-container" ).addClass( "has-error" );
		}

		if (repeatPasswordError) {
			$( "#repeat-password-container" ).addClass( "has-error" );
		}

		// send request if there are no apparent errors
		if (!passwordError && !repeatPasswordError) {

			// send sign up post request to the server
			var postParameters = {username: username, password: password};
			$.post("/signup", postParameters, function(responseJSON){

				var responseObject = JSON.parse(responseJSON);
				var success = responseObject.success;
				var error = responseObject.error;
				var sessionCookie = responseObject.sessionCookie;
				
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

				// hide modal
				if (success) {
					$("#signupModal").modal('hide');

					// TODO: set session cookie info
					setSessionCookie(sessionCookie);
					showSessionCookie();

					// TODO: hide login and sign up buttons, instead show logged in as 'username'
					setLoggedInState();
				}
			});

		}

	});

	$( '#inputUsername' ).keyup(function() {

		/* update btn state according to form fields */
		updateSignupBtnState();

	});

	$( '#inputPassword' ).keyup(function() {

		/* update btn state according to form fields */
		updateSignupBtnState();

    	/* check password and add corresponding hints */
    	validatePasswordGraphical();

	}).focus(function() {
	
		if (passwordError) {
			/* restore height and add fluff if error persists  */ 
			$("#signup-password-container").css("height", (defaultHeight + (HINT_HEIGHT * hints)) + "px" );
		}

	}).blur(function() {
		
    	/* reset element height to default */
    	$("#signup-password-container").css("height", defaultHeight);

	});

	$( '#inputPasswordRepeat' ).keyup( function(e) {

		/* update btn state according to form fields */
		updateSignupBtnState();

		/* check confirmation password and add corresponding hints */
		validatePasswordRepeatGraphical();

	}).focus( function() {

		if (repeatPasswordError) {
			/* restore height and add fluff if error persists  */ 
			$("#repeat-password-container").css("height", (repeatDefaultHeight + HINT_HEIGHT) + "px" );
		}

	}).blur( function() {

		/* reset element height to default */
    	$("#repeat-password-container").css("height", repeatDefaultHeight);

	});

	/* ************************************************************** */
	/* ** LOG IN **************************************************** */
	/* ************************************************************** */

	$('#login-trigger').on('click', function() {

		// clear modal test boxes
		$( '#login-username' ).val("");
		$( '#login-password' ).val("");

		// disable or enable btn accordingly
		updateLoginBtnState();

		// open up login modal
		$("#loginModal").modal();

	});

	$('#loginbtn').on('click', function() {

		// get form input information
		var username = $( '#login-username' ).val();
		var password = $( '#login-password' ).val();

		// send sign up post request to the server
		var postParameters = {username: username, password: password};
		$.post("/login", postParameters, function(responseJSON){

			var responseObject = JSON.parse(responseJSON);
			var success = responseObject.success;
			var error = responseObject.error;
			var sessionCookie = responseObject.sessionCookie;

			// add notification for user
			var options =  {
    			content: "", 		// text of the snackbar
    			style: "snackbar",  // add a custom class to your snackbar
    			timeout: 3000 		// time in milliseconds after the snackbar autohides, 0 is disabled
			}
			if (success) {
				options['content'] = "Trainer '" + username + "' now logged in";
			} else {
				options['content'] = "Error: " + error;
			}
			$.snackbar(options);

			// TODO: set session cookie info
			setSessionCookie(sessionCookie);
			showSessionCookie();

			// hide modal
			if (success) {
				$("#loginModal").modal('hide');
				setLoggedInState();
			}
		});

	});

	$( '#login-username' ).keyup(function() {

		/* update btn state according to form fields */
		updateLoginBtnState();

	});

	$( '#login-password' ).keyup(function() {

		/* update btn state according to form fields */
		updateLoginBtnState();

	});

	/* ************************************************************** */
	/* ** LOG OUT *************************************************** */
	/* ************************************************************** */

	$( '#logout-btn' ).on( 'click' , function() {
		logout();
		
	});
});

/* wipe session info and switch to not logged in state */
function logout() {

	/* remove existing session related cookies */
	setCookie("session-username", "", 1);
	setCookie("session-token", "", 1);
	setCookie("session-created", "", 1);

	/* adjust navbar state */
	setNotLoggedInState();
}

/* show logout options, hide sign up and log in options */
function setLoggedInState() {

	$( '#option-signup' ).hide();
	$( '#option-login' ).hide();
	$( '#option-account' ).show();
	$( '#loggedin-username' ).text( getCookie("session-username") );
}

/* show login and sign up options, hide logout */
function setNotLoggedInState() {

	$( '#option-signup' ).show();
	$( '#option-login' ).show();
	$( '#option-account' ).hide();
}

/* check if user has a preexisting stored session cookie */
function haveSessionCookie() {

	if ((getCookie("session-username") == "") || (getCookie("session-token") == "") || (getCookie("session-created") == "")) {
		return false;
	}

	return true;
}

/* display saved session infomation to the console */
function showSessionCookie() {

	console.log(getSessionCookie());
}

/* save session cookie info using browser cookies */
function setSessionCookie(sessionCookie) {

	/* session cookie defined like so, {username, token, created} */
	setCookie("session-username", sessionCookie.username, 1);
	setCookie("session-token", sessionCookie.token, 1);
	setCookie("session-created", sessionCookie.created, 1);
}

/* get session cookie info stored in browser cookies */
function getSessionCookie() {

	var sessionCookie = {username: "", token: "", created: 0};
	sessionCookie.username = getCookie("session-username");
	sessionCookie.token = getCookie("session-token");
	sessionCookie.created = parseInt(getCookie("session-created"));
	return sessionCookie;
}

/* disable signup button if any field is empty */
function updateSignupBtnState() {

	var username  = $('#inputUsername').val().trim();
	var password1 = $('#inputPassword').val().trim();
	var password2 = $('#inputPasswordRepeat').val().trim();

	/* if any fields are left unfilled disable signup btn */
	if ((username == "") || (password1 == "") || (password2 == "")) {
		disableSignupBtn();
	} else {
		enableSignupBtn();
	}
}

/* disable login if any login field is left empty */
function updateLoginBtnState() {

	var username = $( '#login-username' ).val().trim();
	var password = $( '#login-password' ).val().trim();

	/* if any fields are left unfilled disable login btn */
	if ((username == "") || (password == "")) {
		disableLoginButton();
	} else {
		enableLoginButton();
	}
}

/* validate, add hints, no height adjustments */
function validatePasswordLogical() {

	/* perform regular validation */
	validatePasswordGraphical();

	/* undo any graphical changes */
    $("#signup-password-container").css("height", defaultHeight);
}

/* validate, add hints, height adjusted accordingly (called on keyup) */
function validatePasswordGraphical() {

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

	/* check for at least one special character */
	if ( !password.match(/[^a-zA-Z0-9]/) ) {
	
		/* increment number of hints to show and display error */
		passwordError = true;
		hints++; 

		/* add hint if it does not exist */
		if($('#passhint5').length == 0) { 
			$("#password-hints").append("<span id='passhint5' class='help-block'> Include at least one special character </span>");
			$("#signup-password-container").css("height", ($("#signup-password-container").height() + HINT_HEIGHT) + "px");
		}

	} else {

		/* remove hint if it exists */
		if($('#passhint5').length != 0) { 
			$("#passhint5").remove();
			$("#signup-password-container").css("height", ($("#signup-password-container").height() - HINT_HEIGHT) + "px");
		}
	}
}

/* validate, add hints, no height adjustments */
function validatePasswordRepeatLogical() {

	/* perform regular validation */
	validatePasswordRepeatGraphical();

	/* undo any graphical changes */
	$("#repeat-password-container").css("height", repeatDefaultHeight);
}

/* validate, add hints, height adjusted accordingly (called on keyup) */
function validatePasswordRepeatGraphical() {

	/* get user inputted passwords */
	var password1 = $('#inputPassword').val();
	var password2 = $('#inputPasswordRepeat').val();

	/* reset default password repeat error val */
	repeatPasswordError = false;

	/* compare password and repeat */
	if (password1 != password2) {

		/* switch to error state */
		repeatPasswordError = true;
		$( "#repeat-password-container" ).addClass( "has-error" );

		/* add hint if it does not exist */
		if( $( '#passhint6' ).length == 0) { 
			$("#repeat-password-hints").append("<span id='passhint6' class='help-block'> Repeated password does not match </span>");
			$("#repeat-password-container").css("height", ($("#repeat-password-container").height() + HINT_HEIGHT) + "px");
		} 

	} else {

		/* remove hint if it exists (if no error) */
		if ( $( '#passhint6' ).length != 0) { 
			$( '#passhint6' ).remove();
			$( '#repeat-password-container' ).css("height", ($("#repeat-password-container").height() - HINT_HEIGHT) + "px");
		}
	}
}

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

/* enable and revert style to login button */
function enableLoginButton() {

	// disable signup button
	$( '#loginbtn' ).prop('disabled', false);

	// remove all style classes temporarily
	$( '#loginbtn' ).addClass( 'btn-raised' );
	$( '#loginbtn' ).addClass( 'btn-info' );
}

/* disable and style accordingly */
function disableLoginButton() {

	// disable signup button
	$( '#loginbtn' ).prop('disabled', true);

	// remove all style classes temporarily
	$( '#loginbtn' ).removeClass( 'btn-raised' );
	$( '#loginbtn' ).removeClass( 'btn-info' );
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

    /* hide repeat password matching hint */
}
