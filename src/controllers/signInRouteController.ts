import { Request, Response } from "express";
import { Resources } from "../resourceLookup";
import * as Helper from "./helpers/routeControllerHelper";
import { ViewNameLookup, QueryParameterLookup } from "./lookups/routingLookup";
import * as ValidateActiveUser from "./commands/activeUsers/validateActiveUserCommand";
import { PageResponse, CommandResponse, MainMenuPageResponse, ActiveUser } from "./typeDefinitions";

export const start = async (req: Request, res: Response): Promise<void> => {
	if (Helper.handleInvalidSession(req, res)) {
		return;
	}

	return res.render(
		ViewNameLookup.SignIn,
		<PageResponse>{
			errorMessage:
			Resources.getString(req.query[QueryParameterLookup.ErrorCode])
		});
};

export const signIn = async (req: Request, res: Response): Promise<void> => {
	// TODO: Use the credentials provided in the request body (req.body)
	//  and the "id" property of the (Express.Session)req.session variable
	//  to sign in the user
	if (Helper.handleInvalidSession(req, res)) {
		return;
	}

	return ValidateActiveUser.execute((<Express.Session>req.session).id).then((activeUserCommandResponse: CommandResponse<ActiveUser>): void => {
		const isElevatedUser: boolean = true;

		return res.render(
			ViewNameLookup.MainMenu,
			<MainMenuPageResponse>{
				isElevatedUser: isElevatedUser,
				errorMessage:
				Resources.getString(req.query[QueryParameterLookup.ErrorCode])
		});
	}).catch((error: any): void => {
		if (Helper.processStartError(error, res)) {
			return res.render(
				ViewNameLookup.SignIn,
				<PageResponse>{ errorMessage: error.message});
		}
	});
};

export const clearActiveUser = async (req: Request, res: Response): Promise<void> => {
	// TODO: Sign out the user associated with req.session.id
};
