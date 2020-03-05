let hideEmployeeSavedAlertTimer = undefined;

document.addEventListener("DOMContentLoaded", () => {
	// TODO: Things that need doing when the view is loaded
	getSaveActionElement().addEventListener("click", saveActionClick);
});

// Save
function saveActionClick(event) {
	// TODO: Actually save the employee via an AJAX call
	if (!validateSave()) {
		return;
	}

	const saveActionElement = event.target;
	saveActionElement.disabled = true;

	const employeeId = getEmployeeId();
	const employeeIdIsDefined = ((employeeId != null) && (employeeId.trim() !== ""));
	const saveActionUrl = ("/api/employeeDetail/"
		+ (employeeIdIsDefined ? employeeId : ""));
	const saveEmployeeRequest = {
		id: employeeId,
		firstName: getEmployeeFirstName(),
		lastName: getEmployeeLastName(),
		password: getEmployeePassword(),
		type: getEmployeeType()
	};

	if (employeeIdIsDefined) {
		ajaxPatch(saveActionUrl, saveEmployeeRequest, (callbackResponse) => {
			saveActionElement.disabled = false;

			if (isSuccessResponse(callbackResponse)) {
				displayEmployeeSavedAlertModal();
			}
		});
	} else {
		ajaxPost(saveActionUrl, saveEmployeeRequest, (callbackResponse) => {
			saveActionElement.disabled = false;

			if (isSuccessResponse(callbackResponse)) {
				displayEmployeeSavedAlertModal();

				if ((callbackResponse.data != null)
					&& (callbackResponse.data.employee != null)
					&& (callbackResponse.data.employee.id.trim() !== "")) {

					document.getElementById("deleteActionContainer").classList.remove("hidden");

					setEmployeeId(callbackResponse.data.employee.id.trim());
				}
			}
		});
	}
};



function validateSave() {
	const employeeFirstName = getEmployeeFirstName();
	if ((employeeFirstName == null) || (employeeFirstName.trim() === "")) {
		displayError("Please provide your first name.");
		employeeFirstName.focus();
		employeeFirstName.select();
		return false;
	}

	const employeeLastName = getEmployeeLastName();
	if ((employeeLastName == null) || (employeeLastName.trim() === "")) {
		displayError("Please provide your last name.");
		employeeLastName.focus();
		employeeLastName.select();
		return false;
	}
	
	const employeePassword = getEmployeePassword();
	if ((employeePassword == null) || (employeePassword.trim() === "") || (employeePassword != getEmployeeConfirmPassword())) {
		displayError("The password you entered is not correct.");
		employeePassword.focus();
		employeePassword.select();
		return false;
	}
	
	const employeeType = getEmployeeType();
	if ((employeeType == null) || (employeeType.trim() === "")) {
		displayError("Please provide a valid employee type.");
		employeeType.focus();
		employeeType.select();
		return false;
	}

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

function ajaxPost(resourceRelativeUri, data, callback) {
	return ajax(resourceRelativeUri, "POST", data, callback);
}

function ajaxPatch(resourceRelativeUri, data, callback) {
	return ajax(resourceRelativeUri, "PATCH", data, callback);
}

function ajax(resourceRelativeUri, verb, data, callback) {
	const httpRequest = new XMLHttpRequest();

	if (httpRequest == null) {
		return httpRequest;
	}

	httpRequest.onreadystatechange = () => {
		if (httpRequest.readyState === XMLHttpRequest.DONE) {
			if ((httpRequest.status >= 200) && (httpRequest.status < 300)) {
				handleSuccessResponse(httpRequest, callback);
			} else {
				handleFailureResponse(httpRequest, callback);
			}
		}
	};

	httpRequest.open(verb, resourceRelativeUri, true);
	if (data != null) {
		httpRequest.setRequestHeader('Content-Type', 'application/json');
		httpRequest.send(JSON.stringify(data));
	} else {
		httpRequest.send();
	}

	return httpRequest;
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

function getEmployeeType() {
	return getEmployeeTypeElement().value;
}

function getEmployeeTypeElement() {
	return document.getElementById("employeeType");
}

function getEmployeeId() {
	return getEmployeeIdElement().value;
}
function setEmployeeId(employeeId) {
	getEmployeeIdElement().value = employeeId;
}
function getEmployeeIdElement() {
	return document.getElementById("employeeId");
}

// End getters and setters