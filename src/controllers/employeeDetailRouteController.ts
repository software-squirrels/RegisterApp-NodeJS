import { Request, Response } from "express";
import * as Helper from "./helpers/routeControllerHelper";
import { Resources, ResourceKey } from "../resourceLookup";
import * as EmployeeHelper from "./commands/employees/helpers/employeeHelper";
import * as EmployeeQuery from "./commands/employees/employeeQuery";
import * as EmployeeCreateCommand from "./commands/employees/employeeCreateCommand";
import * as EmployeeUpdateCommand from "./commands/employees/employeeUpdateCommand";
import { ViewNameLookup, ParameterLookup, RouteLookup } from "./lookups/routingLookup";
import * as ValidateActiveUser from "./commands/activeUsers/validateActiveUserCommand";
import * as ActiveEmployeeExistsQuery from "./commands/employees/activeEmployeeExistsQuery";
import { ApiResponse, CommandResponse, Employee, EmployeeSaveRequest, ActiveUser, PageResponse } from "./typeDefinitions";

interface CanCreateEmployee {
	employeeExists: boolean;
	isElevatedUser: boolean;
}

const determineCanCreateEmployee = async (req: Request): Promise<CanCreateEmployee> => {
	return ActiveEmployeeExistsQuery.execute()
	.then((activeUserCommandResponse: CommandResponse<Employee>): Promise<CanCreateEmployee> => {

		return ValidateActiveUser.execute((req.session!).id)
		.then((activeUser: CommandResponse<ActiveUser>): CanCreateEmployee => {
			if (EmployeeHelper.isElevatedUser(activeUser.data!.classification)) {
				return <CanCreateEmployee> { employeeExists: true, isElevatedUser: true };
			}

			return <CanCreateEmployee> { employeeExists: true, isElevatedUser: false };
		}).catch((error: any): CanCreateEmployee => {
			return <CanCreateEmployee> { employeeExists: true, isElevatedUser: false};
		});
	}).catch((error: any): CanCreateEmployee => {
			return <CanCreateEmployee>{ employeeExists: false, isElevatedUser: false };
		});

	};

export const start = async (req: Request, res: Response): Promise<void> => {
	if (Helper.handleInvalidSession(req, res)) {
		return;
	}

	return determineCanCreateEmployee(req)
	.then((canCreateEmployee: CanCreateEmployee): void => {
		if (canCreateEmployee.employeeExists
			&& !canCreateEmployee.isElevatedUser) {
				return res.redirect(Helper.buildNoPermissionsRedirectUrl());
			}

			return res.render(ViewNameLookup.EmployeeDetail);
		}).catch((error: any): void => {
			return res.redirect(Helper.invalidSessionRedirectUrl);
		});
	};

export const startWithEmployee = async (req: Request, res: Response): Promise<void> => {
	if (Helper.handleInvalidSession(req, res)) {
		return;
	}

	return ValidateActiveUser.execute((<Express.Session>req.session).id)
	.then((activeUserCommandResponse: CommandResponse<ActiveUser>): Promise<CommandResponse<Employee>> => {
		if (!EmployeeHelper.isElevatedUser((<ActiveUser>activeUserCommandResponse.data).classification)) {
			return Promise.reject(<CommandResponse<Employee>>{
				status: 403,
				message: Resources.getString(ResourceKey.USER_NO_PERMISSIONS)
			});
		}

		return EmployeeQuery.queryById(activeUserCommandResponse.data!.id);
	}).then((employeeCommandResponse: CommandResponse<Employee>): void => {
		return res.render(ViewNameLookup.EmployeeDetail, employeeCommandResponse.data);
	}).catch((error: any): void => {
		res.send(<ApiResponse>{
			errorMessage: error.message,
			redirectUrl: RouteLookup.SignIn
		});
	});
};

const saveEmployee = async (
	req: Request,
	res: Response,
	performSave: (
		employeeSaveRequest: EmployeeSaveRequest,
		isInitialEmployee?: boolean
	) => Promise<CommandResponse<Employee>>
): Promise<void> => {

	if (Helper.handleInvalidApiSession(req, res)) {
		return;
	}

	let employeeExists: boolean;

	return determineCanCreateEmployee(req)
	.then((canCreateEmployee: CanCreateEmployee): Promise<CommandResponse<Employee>> => {
		if (canCreateEmployee.employeeExists
			&& !canCreateEmployee.isElevatedUser) {

				return Promise.reject(<CommandResponse<boolean>>{
					status: 403,
					message: Resources.getString(ResourceKey.USER_NO_PERMISSIONS)
				});
			}

			employeeExists = canCreateEmployee.employeeExists;

			return performSave(req.body, !employeeExists);
		}).then((saveEmployeeCommandResponse: CommandResponse<Employee>): void => {
			res.status(saveEmployeeCommandResponse!.status)
			.send(<ApiResponse>{
				redirectUrl: RouteLookup.SignIn + "?id=" + saveEmployeeCommandResponse.data!.id
			});
		}).catch((error: any): void => {
			return Helper.processApiError(
				error,
				res,
				<Helper.ApiErrorHints>{
					defaultErrorMessage: Resources.getString(
						ResourceKey.EMPLOYEE_UNABLE_TO_SAVE)
					});
				});
			};

export const updateEmployee = async (req: Request, res: Response): Promise<void> => {
	return saveEmployee(req, res, EmployeeUpdateCommand.execute);
};

export const createEmployee = async (req: Request, res: Response): Promise<void> => {
	return saveEmployee(req, res, EmployeeCreateCommand.execute);
};
