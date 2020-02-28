import { Request, Response } from "express";
import { Resources, ResourceKey } from "../resourceLookup";
import * as Helper from "./helpers/routeControllerHelper";
import { ViewNameLookup, QueryParameterLookup } from "./lookups/routingLookup";
import { CommandResponse, MainMenuPageResponse } from "./typeDefinitions";

const processStartSigninError = (res: Response, error: any): void => {
	res.setHeader(
		"Cache-Control",
		"no-cache, max-age=0, must-revalidate, no-store");

	return res.status((error.status || 500))
	.render(
		ViewNameLookup.MainMenu,
		<PageResponse>{
			errorMessage: (error.message
			||
			Resources.getString(ResourceKey.EMPLOYEES_UNABLE_TO_QUERY))
		});
};

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

const processSignOutError = (res: Response, error: any): void => {
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
	return
	//CHECK IF EMPLOYEE EXISTS -- TASK 5//
	.then((employeesCommandResponse: boolean): void => {
		if(!employeesCommandResponse){
			return res.render(ViewNameLookup.MainMenu);
		}
			return res.render(ViewNameLookup.SignIn);
	}).catch((error: any): void => {
		return processStartSigninError(res, error);
});
};

export const signIn = async (req: Request, res: Response): Promise<void> => {
	// TODO: Use the credentials provided in the request body (req.body)
	//  and the "id" property of the (Express.Session)req.session variable
	//  to sign in the user

	return
	//CHECK IF USER AND PASSWORD EXISTS//
	.then((employeeCommandResponse: CommandResponse<ActiveUser>): void => {
		if(!employeeCommandResponse){
			return res.render(ViewNameLookup.SignIn, (): void => {
				res.send(Resources.getString(ResourceKey.UseUSER_NOT_FOUND));
			}
		}
		//ADD SESSION ID AND USER TO ACTIVE USER TABLE//
		return res.render(ViewNameLookup.MainMenu);
}).catch((error: any): void => {
		return processSignInError(res, error);
});
};

export const clearActiveUser = async (req: Request, res: Response): Promise<void> => {
	// TODO: Sign out the user associated with req.session.id

	return
	//DELETE USER ASSOCIATED WITH SESSION ID//
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
