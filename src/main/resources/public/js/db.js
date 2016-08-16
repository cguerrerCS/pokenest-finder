
$( document ).ready(function() {

	// TODO: add check listeners to list items
	$('.db-list-item').click(function() {
		
		// TODO: extract data from DOM element
		console.log(this.children[0].innerText);
		var id = (this.children[0].innerText.split(':')[1]).trim();
		console.log("selected nest id: '" + id +"'");

		// TODO: on click display nest details modal

		// TODO: give option to delete if password is stored in a cookie

	});
	
	

	

	
});