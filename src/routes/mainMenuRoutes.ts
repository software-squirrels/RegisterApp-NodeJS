import express from "express";
import { RouteLookup } from "../controllers/lookups/routingLookup";
import * as mainMenuRouteController from "../controllers/mainMenuRouteController";

function mainMenuRoutes(server: express.Express) {
	// TODO: Route for initial page load
	server.get(RouteLookup.mainMenu, mainMenuRouteController.start);
}

module.exports.routes = mainMenuRoutes;
