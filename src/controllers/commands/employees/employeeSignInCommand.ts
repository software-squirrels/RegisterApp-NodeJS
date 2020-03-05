import { EmployeeModel } from "../models/employeeModel";
import { Resources, ResourceKey } from "../../../resourceLookup";
import * as EmployeeRepository from "../models/employeeModel";
import { CommandResponse, UserSignInRequest, ActiveUser } from "../../typeDefinitions";
import { ActiveUserModel } from "../models/activeUserModel";
import * as ActiveUserRepository from "../models/activeUserModel";
import * as DatabaseConnection from "../models/databaseConnection";
import * as Helper from "../helpers/helper";
import * as EmployeeHelper from "./helpers/employeeHelper";

export const execute = async (userSignInRequest: UserSignInRequest, session: Express.Session): Promise<CommandResponse<ActiveUser>> => {
	if (Helper.isBlankString(userSignInRequest.employeeId) || !Helper.isValidUUID(userSignInRequest.employeeId)) {
		return Promise.reject(<CommandResponse<ActiveUser>>{
			status: 404,
			message: Resources.getString(ResourceKey.EMPLOYEE_RECORD_ID_INVALID)
		});
	}
	else if (Helper.isBlankString(userSignInRequest.password)) {
		return Promise.reject(<CommandResponse<ActiveUser>>{
			status: 404,
			message: Resources.getString(ResourceKey.EMPLOYEE_PASSWORD_INVALID)
		});
	}

	return EmployeeRepository.queryByEmployeeId(parseInt(userSignInRequest.employeeId))
	.then(async (employeeModel: (EmployeeModel | null)): Promise<CommandResponse<ActiveUser>> => {

		if (employeeModel && (parseInt(userSignInRequest.employeeId) == employeeModel.employeeId) && (EmployeeHelper.hashString(userSignInRequest.password) == employeeModel.password.toString("utf8"))) {
			ActiveUserRepository.queryByEmployeeId(userSignInRequest.employeeId, await DatabaseConnection.createTransaction())
			.then((activeUserModel: (ActiveUserModel | null)): Promise<CommandResponse<ActiveUser>> => {
				if (activeUserModel) {
					activeUserModel.sessionKey = session.id;
					activeUserModel.update(activeUserModel);
				}
				else {
					activeUserModel = new ActiveUserModel(employeeModel);
					activeUserModel.sessionKey = session.id;
					ActiveUserModel.create(activeUserModel);
				}

				return Promise.resolve(<CommandResponse<ActiveUser>>{
					status: 200,
					data: activeUserModel
				});
			})
			.catch((error: any): Promise<CommandResponse<ActiveUser>> => {
				return Promise.reject(<CommandResponse<ActiveUser>>{
					status: 404,
					message: (error.message
						||
						Resources.getString(ResourceKey.EMPLOYEE_UNABLE_TO_QUERY))
					});
				});
			}

			return Promise.reject(<CommandResponse<ActiveUser>>{
				status: 400,
				message: Resources.getString(ResourceKey.USER_SIGN_IN_CREDENTIALS_INVALID)
			});
		}).catch((error: any): Promise<CommandResponse<ActiveUser>> => {
			return Promise.reject(<CommandResponse<ActiveUser>>{
				status: 404,
				message: (
					error.message
					||
					Resources.getString(ResourceKey.USER_SIGN_IN_CREDENTIALS_INVALID))
				});
			});
		};
