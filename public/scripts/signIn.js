document.addEventListener("DOMContentLoaded", () => {
	// TODO: Anything you want to do when the page is loaded?
});

function validateForm() {
	// TODO: Validate the user input
	var employeeID = document.getElementById("employeeID").value;
	var password = document.getElementById("password").value;
	
	if(isNaN(employeeID))
	{
		alert("Enter a valid ID number")
		return false;
	}

	if(password == "")
	{
		alert("Enter a password")
		return false;
	}

	return true;
}
