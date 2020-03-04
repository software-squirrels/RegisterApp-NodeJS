import { EmployeeClassification } from '../../models/constants/entityTypes';
import { Employee } from "../../../typeDefinitions";
import { EmployeeModel } from "../../models/employeeModel";
import * as Helper from "../../helpers/helper";
import crypto from 'crypto';

export const hashString = (toHash: string): string => {
	return crypto.createHash('md5').update(toHash).digest('hex');
};

export const isElevatedUser = (employeeClassification: EmployeeClassification): boolean => {
	return false; // TODO: Determine if an employee is an elevated user by their classification
};

export const mapEmployeeData = (queriedEmployee: EmployeeModel): Employee => {
	return <Employee> {
		id: queriedEmployee.id,
		active: queriedEmployee.active,
		lastName: queriedEmployee.lastName,
		createdOn: queriedEmployee.createdOn,
		firstName: queriedEmployee.firstName,
		managerId: queriedEmployee.managerId,
		employeeId: queriedEmployee.employeeId.toString(),
		classification: queriedEmployee.classification
	};
};