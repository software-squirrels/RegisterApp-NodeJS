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

	return EmployeeRepository.queryByEmployeeId(parseInt(userSignInRequest.employeeId))
	.then(async (employeeModel: (EmployeeModel | null)): Promise<CommandResponse<ActiveUser>> => {

		if (employeeModel && (parseInt(userSignInRequest.employeeId) == employeeModel.employeeId) && (EmployeeHelper.hashString(userSignInRequest.password) == employeeModel.password.toString("utf8"))) {
			ActiveUserRepository.queryByEmployeeId(userSignInRequest.employeeId)
			.then((activeUserModel: (ActiveUserModel | null)): Promise<CommandResponse<ActiveUser>> => {
				let createTransaction: Sequelize.Transaction;

				return DatabaseConnection.createTransaction()
				.then((createdTransaction: Sequelize.Transaction): Promise<ActiveUserModel> =>{
					createTransaction = createdTransaction;
					let activeUserToCreate: any;
					if (activeUserModel) {
						activeUserModel.sessionKey = session.id;
						activeUserToCreate = activeUserModel;
						return ActiveUserModel.update(
							activeUserModel,
							<Sequelize.UpdateOptions>{
								transaction: createdTransaction
							}
						);
					}
					else {
						activeUserToCreate = {
							name: employeeModel.firstName,
							employeeId: employeeModel.employeeId,
							sessionKey: session.id,
							classification: employeeModel.classification,
							id: employeeModel.id,
							createdOn: employeeModel.createdOn
						};

						return ActiveUserModel.create(
							activeUserModel,
							<Sequelize.CreateOptions>{
								transaction: createdTransaction
							}
						);
					}
				}).then((activeUserModel: ActiveUserModel): CommandResponse<ActiveUser> =>{
					createTransaction.commit();

					return <CommandResponse<ActiveUser>>{
						status: 201,
						data: <ActiveUser>{
							id: activeUserModel.id,
							name: activeUserModel.name,
							employeeId: activeUserModel.employeeId,
							classification: activeUserModel.classification
						}
					};
				}).catch((error: any): Promise<CommandResponse<ActiveUser>> =>{
					if (createTransaction != null) {
						createTransaction.rollback();
					}

					return Promise.reject(<CommandResponse<ActiveUser>>{
						status: (error.status || 500),
						message: (error.message
							|| Resources.getString(ResourceKey.USER_UNABLE_TO_SIGN_IN))
					});
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
				message: Resources.getString(ResourceKey.EMPLOYEE_UNABLE_TO_SAVE)
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
