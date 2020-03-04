import { Request, Response } from "express";
import * as Helper from "./helpers/routeControllerHelper";
import { Resources, ResourceKey } from "../resourceLookup";
import * as EmployeeHelper from "./commands/employees/helpers/employeeHelper";
import * as EmployeeQuery from "./commands/employees/employeeQuery";
import * as EmployeeCreateCommand from "./commands/employees/employeeCreateCommand";
import * as EmployeeUpdateCommand from "./commands/employees/employeeUpdateCommand";
import { ViewNameLookup, ParameterLookup, RouteLookup } from "./lookups/routingLookup";
import * as ValidateActiveUser from "./commands/activeUsers/validateActiveUserCommand";
import * as ActiveEmployeeExistsQuery from "./commands/employees/activeEmployeeExistsQuery"
import { CommandResponse, Employee, EmployeeSaveRequest, ActiveUser, PageResponse } from "./typeDefinitions";

interface CanCreateEmployee {
	employeeExists: boolean;
	isElevatedUser: boolean;
}

const determineCanCreateEmployee = async (req: Request): Promise<CanCreateEmployee> => {
	return ActiveEmployeeExists()
	.then((activeUserCommandResponse: CommandResponse<Employee>): Promise<CanCreateEmployee> => {
		return ValidateActiveUser(req.session.id)
		.then((activeUser: CommandResponse<ActiveUser>): Promise<CanCreateEmployee> => {
			if (EmployeeHelper.isElevatedUser(activeUser.data)) {
				return <CanCreateEmployee> { employeeExists: true, isElevatedUser: false };
			}

			return <CanCreateEmployee> { employeeExists: true, isElevatedUser: false }
		}).catch(()=>{
			return <CanCreateEmployee> { employeeExists: true, isElevatedUser: false};
		});
		return <CanCreateEmployee>{ employeeExists: true, isElevatedUser: false };
	}).catch((error: any): Promise<CanCreateEmployee> => {
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
			else if (!canCreateEmployee.employeeExists || canCreateEmployee.isElevatedUser) {
				return res.render(ViewNameLookup.EmployeeDetail);
			}

			return res.render(ViewNameLookup.SignIn, <PageResponse>{
				errorMessage: ResouResources.getString(ResourceKey.USER_SESSION_NOT_ACTIVE)
			});
		}).catch((error: any): void => {
			return res.render(ViewNameLookup.SignIn, <PageResponse>{
				errorMessage: Resources.getString(ResourceKey.USER_SESSION_NOT_FOUND)
			});
		});
	};

export const startWithEmployee = async (req: Request, res: Response): Promise<void> => {
	if (Helper.handleInvalidSession(req, res)) {
		return;
	}

	return ValidateActiveUser.execute((<Express.Session>req.session).id)
	.then((activeUserCommandResponse: CommandResponse<ActiveUser>): Promise<void> => {
		if (!EmployeeHelper.isElevatedUser((<ActiveUser>activeUserCommandResponse.data).classification)) {
			return Promise.reject(<CommandResponse<Employee>>{
				status: 403,
				message: Resources.getString(ResourceKey.USER_NO_PERMISSIONS)
			});
		}

		return EmployeeQuery.execute(activeUserCommandResponse.data.id);
	}).then((employee: Employee): void => {
		return res.render(ViewNameLookup.EmployeeDetail, employee);
	}).catch((error: any): void => {
		return res.redirect(RouteLookup.SignIn, <PageResponse>{
			errorMessage: error.message
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
			res.status(saveEmployeeCommandResponse.status)
			.send(<ApiResponse>{
				redirectUrl: RouteLookup.SignIn + "?id=" + saveEmployeeCommandResponse.data.id
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

	return saveEmployee(req, res, EmployeeSaveCommand.execute);
};
