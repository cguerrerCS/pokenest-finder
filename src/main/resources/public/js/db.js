
$( document ).ready(function() {

	console.log("DB JavaScript loaded.");

	$('.db-list-item').click(function() {
		this.each( function( index, element ){
    		console.log( $( this ).text() );
		});
	});
	
	// TODO: add check listeners to list items

		// TODO: on click display nest details modal

		// TODO: give option to delete if password is stored in a cookie
});