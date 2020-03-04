import { EmployeeModel } from "../models/employeeModel";
import { Resources, ResourceKey } from "../../../resourceLookup";
import * as EmployeeRepository from "../models/employeeModel";
import { CommandResponse, Employee } from "../../typeDefinitions";

export const execute = async (): Promise<CommandResponse<Employee>> => {
	return EmployeeRepository.queryActiveExists()
	.then((queriedActiveUser: (EmployeeModel | null)): Promise<CommandResponse<Employee>> => {
		if (queriedActiveUser) {
			return Promise.resolve(<CommandResponse<Employee>>{
				status: 200,
				data: <Employee>{
					id: queriedActiveUser.id,
					active: queriedActiveUser.active,
					lastName: queriedActiveUser.lastName,
					createdOn: queriedActiveUser.createdOn,
					firstName: queriedActiveUser.firstName,
					managerId: queriedActiveUser.managerId,
					employeeId: queriedActiveUser.employeeId.toString(),
					classification: queriedActiveUser.classification,
				}});
			}

			return Promise.reject(<CommandResponse<Employee>>{
				status: 404,
				message: Resources.getString(ResourceKey.EMPLOYEES_UNABLE_TO_QUERY)
			});
		});
	};
