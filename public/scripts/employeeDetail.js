let hideEmployeeSavedAlertTimer = undefined;

document.addEventListener("DOMContentLoaded", () => {
	// TODO: Things that need doing when the view is loaded
	getSaveActionElement().addEventListener("click", saveActionClick);
});

// Save
function saveActionClick(event) {
	// TODO: Actually save the employee via an AJAX call
	displayEmployeeSavedAlertModal();
}


function validateSave() {
	const employeeFirstName = getEmployeeFirstName();
	if ((employeeFirstName == null) || (employeeFirstName.trim() === "")) {
		displayError("Please provide your first name.");
		return false;
	}

	const employeeLastName = getEmployeeLastName();
	if ((employeeLastName == null) || (employeeLastName.trim() === "")) {
		displayError("Please provide your last name.");
		return false;
	}
	
	const employeePassword = getEmployeePassword();
	if ((employeePassword == null) || (employeePassword.trim() === "") || (employeePassword != getEmployeeConfirmPassword())) {
		displayError("The password you entered is not correct.");
		return false;
	}
	
	const employeeType = getEmployeeType();

	return true;
}

function displayEmployeeSavedAlertModal() {
	if (hideEmployeeSavedAlertTimer) {
		clearTimeout(hideEmployeeSavedAlertTimer);
	}

	const savedAlertModalElement = getSavedAlertModalElement();
	savedAlertModalElement.style.display = "none";
	savedAlertModalElement.style.display = "block";

	hideEmployeeSavedAlertTimer = setTimeout(hideEmployeeSavedAlertModal, 1200);
}

function hideEmployeeSavedAlertModal() {
	if (hideEmployeeSavedAlertTimer) {
		clearTimeout(hideEmployeeSavedAlertTimer);
	}

	getSavedAlertModalElement().style.display = "none";
}
// End save

// Getters and setters
function getSaveActionElement() {
	return document.getElementById("saveButton");
}

function getSavedAlertModalElement() {
	return document.getElementById("employeeSavedAlertModal");
}

function getEmployeeFirstName() {
	return getEmployeeFirstNameElement().value;
}

function getEmployeeFirstNameElement() {
	return document.getElementById("employeeFirstName");
}

function getEmployeeLastName() {
	return getEmployeeLastNameElement().value;
}

function getEmployeeLastNameElement() {
	return document.getElementById("employeeLastName");
}

function getEmployeePassword() {
	return getEmployeePasswordElement().value;
}

function getEmployeePasswordElement() {
	return document.getElementById("employeePassword");
}

function getEmployeeConfirmPassword() {
	return getEmployeeConfirmPasswordElement().value;
}

function getEmployeeConfirmPasswordElement() {
	return document.getElementById("employeeConfirmPassword");
}
