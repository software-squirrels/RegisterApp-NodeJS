import { EmployeeModel } from "../models/employeeModel";
import { Resources, ResourceKey } from "../../../resourceLookup";
import * as EmployeeRepository from "../models/employeeModel";
import { CommandResponse, UserSignInRequest, ActiveUser } from "../../typeDefinitions";
import { ActiveUserModel } from "../models/activeUserModel";
import * as ActiveUserRepository from "../models/activeUserModel";
import * as DatabaseConnection from "../models/databaseConnection";
import * as Helper from "../helpers/helper";
import * as EmployeeHelper from "./helpers/employeeHelper";
import Sequelize from "sequelize";

export const execute = async (userSignInRequest: UserSignInRequest, session: Express.Session): Promise<CommandResponse<ActiveUser>> => {
	if (Helper.isBlankString(userSignInRequest.employeeId)) {
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

	const employeeModel: (EmployeeModel | null) = await EmployeeRepository.queryByEmployeeId(parseInt(userSignInRequest.employeeId));

	if (employeeModel && (parseInt(userSignInRequest.employeeId) == employeeModel.employeeId) && (EmployeeHelper.hashString(userSignInRequest.password) == employeeModel.password.toString("utf8"))) {
		const activeUserModel: any = await ActiveUserRepository.queryByEmployeeId(employeeModel.id).catch(console.error);

		const createdTransaction: Sequelize.Transaction = await DatabaseConnection.createTransaction();
		let activeUserToCreate: any = activeUserModel;
		if (activeUserModel) {
			activeUserModel.sessionKey = session.id;
			activeUserToCreate = activeUserModel;
			await ActiveUserModel.update(
				activeUserModel,
				<Sequelize.UpdateOptions>{
					transaction: createdTransaction
				}
			);
		}
		else {
			activeUserToCreate = {
				name: employeeModel.firstName,
				employeeId: employeeModel.id,
				sessionKey: session.id,
				classification: employeeModel.classification,
				id: employeeModel.id,
				createdOn: employeeModel.createdOn
			};

			await ActiveUserModel.create(
				activeUserToCreate,
				<Sequelize.CreateOptions>{
					transaction: createdTransaction
				}
			);
		}
		createdTransaction.commit();

		return <CommandResponse<ActiveUser>>{
			status: 201,
			data: <ActiveUser>{
				id: activeUserToCreate.id,
				name: activeUserToCreate.name,
				employeeId: activeUserToCreate.employeeId,
				classification: activeUserToCreate.classification
			}
		};
	}
	return Promise.reject(<CommandResponse<ActiveUser>>{
		status: 404,
		message: (
			Resources.getString(ResourceKey.USER_SIGN_IN_CREDENTIALS_INVALID)
		)
	});
};