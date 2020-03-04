import { Request, Response } from "express";
import { Resources, ResourceKey } from "../resourceLookup";
import { ViewNameLookup, QueryParameterLookup } from "./lookups/routingLookup";
import { ApiResponse, PageResponse } from "./typeDefinitions";
import * as ActiveEmployeeExists from "./commands/employees/activeEmployeeExistsQuery";
import * as EmployeeSignIn from "./commands/employees/employeeSignInCommand";
import * as ClearActiveUser from "./commands/employees/clearActiveUserCommand";

const processSignInError = (res: Response, error: any): void => {
	let errorMessage: (string | undefined) = "";
	if ((error.status != null) && (error.status >= 500)) {
		errorMessage = error.message;
	}

	return res.status((error.status || 500))
	.render(
		ViewNameLookup.MainMenu,
		<PageResponse>{
			errorMessage: (error.message
			||
			Resources.getString(ResourceKey.EMPLOYEE_UNABLE_TO_QUERY))
		});
};

export const start = async (req: Request, res: Response): Promise<void> => {
	return ActiveEmployeeExists.execute()
	.then((): void => {
		return res.render(ViewNameLookup.SignIn);
	}).catch((): void => {
		return res.render(ViewNameLookup.MainMenu);
});
};

export const signIn = async (req: Request, res: Response): Promise<void> => {
	return EmployeeSignIn.execute(req.body, req.session!)
	.then((): void => {
		return res.render(ViewNameLookup.MainMenu);
}).catch((error: any): void => {
		return processSignInError(res, error);
});
};

export const clearActiveUser = async (req: Request, res: Response): Promise<void> => {
	return ClearActiveUser.execute((<Express.Session>req.session).id)
	.then((): void => {
		return res.render(ViewNameLookup.SignIn, <ApiResponse>{
			redirectUrl: ViewNameLookup.SignIn,
			errorMessage: Resources.getString(req.query[QueryParameterLookup.ErrorCode])
		});
	}).catch((error: any): void => {
		return res.status((error.status || 500))
		.render(
			ViewNameLookup.MainMenu,
			<PageResponse>{
				errorMessage: error.message
			});
	});
};
