import { EmployeeClassification } from '../../models/constants/entityTypes';
import crypto from 'crypto';

export const hashString = (toHash: string): string => {
	return crypto.createHash('md5').update(toHash).digest('hex');
};

export const isElevatedUser = (employeeClassification: EmployeeClassification): boolean => {
	return false; // TODO: Determine if an employee is an elevated user by their classification
};
