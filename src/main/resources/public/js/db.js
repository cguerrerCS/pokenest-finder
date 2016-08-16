
$( document ).ready(function() {

	// TODO: add check listeners to list items
	$('.db-list-item').click(function() {
		
		// TODO: extract nest id from selected DOM element
		var id = (this.children[0].innerText.split(':')[1]).trim();

		// TODO: extract user's password from saved cookies
		var password = getCookie("passwd");

		// TODO: on click display nest details modal

		// TODO: give option to delete if password is stored in a cookie
		console.log(id);
		console.log(password);
	});
});

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}