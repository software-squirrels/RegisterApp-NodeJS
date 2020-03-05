import Sequelize from "sequelize";
import { EmployeeModel } from "../models/employeeModel";
import * as EmployeeRepository from "../models/employeeModel";
import { Resources, ResourceKey } from "../../../resourceLookup";
import * as DatabaseConnection from "../models/databaseConnection";
import { CommandResponse, Employee, EmployeeSaveRequest } from "../../typeDefinitions";
import * as EmployeeHelper from "./helpers/employeeHelper";

const validateSaveRequest = (
	saveEmployeeRequest: EmployeeSaveRequest
): CommandResponse<Employee> => {

	let errorMessage: string = "";

	if (!saveEmployeeRequest.firstName) {
		errorMessage = Resources.getString(ResourceKey.EMPLOYEE_FIRST_NAME_INVALID);
	} else if (!saveEmployeeRequest.lastName) {
		errorMessage = Resources.getString(ResourceKey.EMPLOYEE_LAST_NAME_INVALID);
	} else if (!saveEmployeeRequest.password) {
		errorMessage = Resources.getString(ResourceKey.EMPLOYEE_PASSWORD_INVALID);
	}

	return ((errorMessage === "")
		? <CommandResponse<Employee>>{ status: 200 }
		: <CommandResponse<Employee>>{
			status: 422,
			message: errorMessage
		});
};

export const execute = async (
	saveEmployeeRequest: EmployeeSaveRequest
): Promise<CommandResponse<Employee>> => {

	const validationResponse: CommandResponse<Employee> =
		validateSaveRequest(saveEmployeeRequest);
	if (validationResponse.status !== 200) {
		return Promise.reject(validationResponse);
	}

	const employeeToCreate: EmployeeModel = <EmployeeModel>{
		id: saveEmployeeRequest.id,
		active: saveEmployeeRequest.active,
		lastName: saveEmployeeRequest.lastName,
		firstName: saveEmployeeRequest.firstName,
		managerId: saveEmployeeRequest.managerId,
		classification: saveEmployeeRequest.classification,
		password: Buffer.from(EmployeeHelper.hashString(saveEmployeeRequest.password), "utf8")
		};

	let createTransaction: Sequelize.Transaction;

	return DatabaseConnection.createTransaction()
		.then((createdTransaction: Sequelize.Transaction): Promise<EmployeeModel> => {
			createTransaction = createdTransaction;

			return EmployeeModel.create(
				employeeToCreate,
				<Sequelize.CreateOptions>{
					transaction: createTransaction
				}
			);
		}).then((createdEmployee: EmployeeModel): CommandResponse<Employee> => {
			createTransaction.commit();

			return <CommandResponse<Employee>>{
				status: 201,
				data: <Employee> {
					id: createdEmployee.id,
					active: createdEmployee.active,
					lastName: createdEmployee.lastName,
					createdOn: createdEmployee.createdOn,
					firstName: createdEmployee.firstName,
					managerId: createdEmployee.managerId,
					employeeId: createdEmployee.employeeId.toString(),
					classification: createdEmployee.classification
				}
			};
		}).catch((error: any): Promise<CommandResponse<Employee>> => {
			if (createTransaction != null) {
				createTransaction.rollback();
			}

			return Promise.reject(<CommandResponse<Employee>>{
				status: (error.status || 500),
				message: (error.message
					|| Resources.getString(ResourceKey.EMPLOYEE_UNABLE_TO_SAVE))
			});
		});
};
