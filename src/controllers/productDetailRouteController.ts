import { Request, Response } from "express";
import { Resources, ResourceKey } from "../resourceLookup";
import * as ProductQuery from "./commands/products/productQuery";
import { ViewNameLookup, ParameterLookup, RouteLookup } from "./lookups/routingLookup";
import * as ProductCreateCommand from "./commands/products/productCreateCommand";
import * as ProductDeleteCommand from "./commands/products/productDeleteCommand";
import * as ProductUpdateCommand from "./commands/products/productUpdateCommand";
import { CommandResponse, Product, ProductDetailPageResponse, ApiResponse, ProductSaveResponse, ProductSaveRequest } from "./typeDefinitions";

//Other Imports
import * as ValidateActiveUser from "./commands/activeUsers/validateActiveUserCommand";

const processStartProductDetailError = (res: Response, error: any): void => {
	let errorMessage: (string | undefined) = "";
	if ((error.status != null) && (error.status >= 500)) {
		errorMessage = error.message;
	}

	res.status((error.status || 500))
		.render(
			ViewNameLookup.ProductDetail,
			<ProductDetailPageResponse>{
				product: <Product>{
					id: "",
					count: 0,
					lookupCode: ""
				},
				errorMessage: errorMessage
			});
};

export const start = async (req: Request, res: Response): Promise<void> => {
	if (Helper.handleInvalidSession(req, res)) {
		return;
	}
	
	let isElevatedUser: boolean;
	
	return ValidateActiveUser.execute((<Express.Session>req.session).id)
		.then((activeUserCommandResponse: CommandResponse<ActiveUser>): Promise<CommandResponse<Product[]>> => {
			isElevatedUser =
				EmployeeHelper.isElevatedUser(
					(<ActiveUser>activeUserCommandResponse.data).classification);

	
	return ProductQuery.queryById(req.params[ParameterLookup.ProductId])
		}).then((productsCommandResponse: CommandResponse<Product>): void => {
			
			return res.render(
				ViewNameLookup.ProductDetail,
				<ProductDetailPageResponse>{
					isElevatedUser: isElevatedUser,
					product: productsCommandResponse.data
				});
		}).catch((error: any): void => {
			return processStartProductDetailError(res, error);
		});
};

const saveProduct = async (
	req: Request,
	res: Response,
	performSave: (productSaveRequest: ProductSaveRequest) => Promise<CommandResponse<Product>>
): Promise<void> => {

	return performSave(req.body)
		.then((createProductCommandResponse: CommandResponse<Product>): void => {
			res.status(createProductCommandResponse.status)
				.send(<ProductSaveResponse>{
					product: <Product>createProductCommandResponse.data
				});
		}).catch((error: any): void => {
			res.status(error.status || 500)
				.send(<ApiResponse>{
					errorMessage: (error.message
						|| Resources.getString(ResourceKey.PRODUCT_UNABLE_TO_SAVE))
				});
		});
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
	return saveProduct(req, res, ProductUpdateCommand.execute);
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
	return saveProduct(req, res, ProductCreateCommand.execute);
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
	return ProductDeleteCommand.execute(req.params[ParameterLookup.ProductId])
		.then((deleteProductCommandResponse: CommandResponse<void>): void => {
			res.status(deleteProductCommandResponse.status)
				.send(<ApiResponse>{
					redirectUrl: RouteLookup.ProductListing
				});
		}).catch((error: any): void => {
			res.status(error.status || 500)
				.send(<ApiResponse>{
					errorMessage: (error.message
						|| Resources.getString(ResourceKey.PRODUCT_UNABLE_TO_DELETE))
				});
		});
};
