document.addEventListener("DOMContentLoaded", () => {
});

function validateForm() {
	var employeeID = document.getElementById("employeeID").value;
	var pass = document.getElementById("password").value;

	if((isNaN(employeeID)) || (employeeID == ""))
	{
		alert("Enter a valid ID number")
		return false;
	}

	if(pass == "")
	{
		alert("Enter a password")
		return false;
	}

	return true;
};
