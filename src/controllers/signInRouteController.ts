import { Request, Response } from "express";
import { Resources, ResourceKey } from "../resourceLookup";
import { ViewNameLookup, QueryParameterLookup, RouteLookup } from "./lookups/routingLookup";
import { ApiResponse, PageResponse, UserSignInRequest, Employee, CommandResponse } from "./typeDefinitions";
import * as EmployeeExists from "./commands/employees/employeeExistsQuery";
import * as EmployeeSignIn from "./commands/employees/employeeSignInCommand";
import * as ClearActiveUser from "./commands/employees/clearActiveUserCommand";

const processSignInError = (res: Response, error: any): void => {
	let errorMessage: (string | undefined) = "";
	if ((error.status != null) && (error.status >= 500)) {
		errorMessage = error.message;
	}

	return res.status((error.status || 500))
	.render(
		ViewNameLookup.SignIn,
		<PageResponse>{
			errorMessage: (error.message
			||
			Resources.getString(ResourceKey.EMPLOYEE_UNABLE_TO_QUERY))
		});
};

export const start = async (req: Request, res: Response): Promise<void> => {
	return EmployeeExists.execute()
	.then((employeeQueryCommandResponse: CommandResponse<Employee>): void => {
		return res.render(ViewNameLookup.SignIn);
}).catch((error: any): void => {
		return res.redirect(RouteLookup.EmployeeDetail);
	});
};

export const signIn = async (req: Request, res: Response): Promise<void> => {
	const signInRequest: UserSignInRequest = { employeeId: req.body["employeeId"], password: req.body["password"] };
	return EmployeeSignIn.execute(signInRequest, req.session!)
	.then((): void => {
		return res.redirect(ViewNameLookup.MainMenu);
}).catch((error: any): void => {
		return processSignInError(res, error);
});
};

export const clearActiveUser = async (req: Request, res: Response): Promise<void> => {
	return ClearActiveUser.execute((<Express.Session>req.session).id)
	.then((): void => {
		res.send(<ApiResponse>{
			redirectUrl: RouteLookup.SignIn
		});
	}).catch((error: any): void => {
		res.send(<ApiResponse>{
			errorMessage: error.message
		});
	});
};
