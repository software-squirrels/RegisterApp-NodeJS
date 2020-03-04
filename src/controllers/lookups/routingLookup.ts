export enum ParameterLookup {
	ProductId = "productId",
	EmployeeId = "employeeId"
}

export enum QueryParameterLookup {
	ErrorCode = "errorCode"
}

export enum ViewNameLookup {
	SignIn = "signIn",
	MainMenu = "mainMenu",
	ProductDetail = "productDetail",
	ProductListing = "productListing",
	EmployeeDetail = "employeeDetail",
	SignIn = "signIn"
}

export enum RouteLookup {
	// Page routing
	SignIn = "/",
	SignOut = "/signOut",
	MainMenu = "/mainMenu",
	ProductDetail = "/productDetail",
	ProductListing = "/productListing",
	EmployeeDetail = "/employeeDetail",
	Employee = "/employee",

	// Page routing - parameters
	ProductIdParameter = "/:productId",
	EmployeeIdParameter = "/:employeeId",
	// End page routing - parameters
	// End page routing

	// API routing
	API = "/api",
	// End API routing
}
