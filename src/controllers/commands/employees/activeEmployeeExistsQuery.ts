import { EmployeeModel } from "../models/employeeModel";
import { Resources, ResourceKey } from "../../../resourceLookup";
import * as EmployeeRepository from "../models/employeeModel";
import { CommandResponse, Employee } from "../../typeDefinitions";
import * as EmployeeHelper from "./helpers/employeeHelper";

export const execute = async (): Promise<CommandResponse<Employee>> => {
	return EmployeeRepository.queryActiveExists()
	.then((queriedActiveUser: (EmployeeModel | null)): CommandResponse<Employee> => {
		if (queriedActiveUser) {
			return <CommandResponse<Employee>>{
				status: 200,
				data: EmployeeHelper.mapEmployeeData(queriedActiveUser)};
			}

			return <CommandResponse<Employee>>{
				status: 404,
				message: Resources.getString(ResourceKey.EMPLOYEES_UNABLE_TO_QUERY)
			};
		});
	};
