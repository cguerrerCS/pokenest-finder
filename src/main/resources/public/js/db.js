
$( document ).ready(function() {

	$('.db-list-item').each( function(index, li) {
		li.click(function() {
			console.log("list item clicked");
		});
	});

	// TODO: add check listeners to list items

		// TODO: on click display nest details modal

		// TODO: give option to delete if password is stored in a cookie
});