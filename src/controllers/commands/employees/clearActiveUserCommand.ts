import { ActiveUserModel } from "../models/activeUserModel";
import { Resources, ResourceKey } from "../../../resourceLookup";
import * as ActiveUserRepository from "../models/activeUserModel";
import { CommandResponse, ActiveUser } from "../../typeDefinitions";
import * as DatabaseConnection from "../models/databaseConnection";

export const execute = async (sessionKey: string): Promise<CommandResponse<ActiveUser>> => {
	return ActiveUserRepository.queryBySessionKey(sessionKey, await DatabaseConnection.createTransaction())
	.then((activeUser: (ActiveUserModel | null)): Promise<CommandResponse<ActiveUser>> => {
		if (activeUser) {
			return Promise.resolve(<CommandResponse<ActiveUser>>{
				status: 200
			});
		}
		return Promise.reject(<CommandResponse<ActiveUser>>{
			status: 404,
			message: Resources.getString(ResourceKey.USER_SESSION_NOT_FOUND)
		});
	});
};
