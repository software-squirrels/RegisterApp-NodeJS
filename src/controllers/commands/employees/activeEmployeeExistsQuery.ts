import { EmployeeModel } from "../models/employeeModel";
import { Resources, ResourceKey } from "../../../resourceLookup";
import * as EmployeeRepository from "../models/employeeModel";
import { CommandResponse } from "../../typeDefinitions";

export const execute = async (): Promise<CommandResponse<EmployeeModel>> => {
	return EmployeeRepository.queryActiveExists()
	.then((queriedActiveUser: (EmployeeModel | null)): Promise<CommandResponse<EmployeeModel>> => {
		if (queriedActiveUser) {
			return Promise.resolve(<CommandResponse<EmployeeModel>>{
				status: 200,
				data: queriedActiveUser});
			}

			return Promise.reject(<CommandResponse<EmployeeModel>>{
				status: 404,
				message: Resources.getString(ResourceKey.EMPLOYEES_UNABLE_TO_QUERY)
			});
		});
	};
