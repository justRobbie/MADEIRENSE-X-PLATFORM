import env from "env";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ClientRequestService } from "@Madeirense/shared";

import { AppClients } from "./api/clients";

import dependencies from "./dependencies";

import { CrossPlatformStorageManager } from "services/storage/managers";

// ***************************************************************************************************************

type constructorOptions = {
	APIConnectURL?: string,
	baseURL?: string,
	frontUnicoURL?: string,
};

type configurationsType = {
	dependencies: typeof dependencies
};

class App {
	private static instance: App;
	private static instanceName: string = "";

	public readonly Base: AppClients;

	public readonly Storage: CrossPlatformStorageManager;

	public readonly configurations: configurationsType;

	constructor(
		name = "App",
		{
			baseURL = `${env.API_URL}/v1`,
		}: constructorOptions = {}
	) {
		App.instanceName = name;

		this.Base = AppClients.getInstance({
			baseURL: baseURL || "/api/v1/",
			name: "Base"
		});

		this.configurations = {
			dependencies
		};

		this.Storage = new CrossPlatformStorageManager();
	}

	public static getInstance(name = "App", options: constructorOptions = {}): App {
		if (App.instanceName !== name) {
			App.instance = new App(name, options);
		}

		return App.instance;
	}
};

/**
 * # App
 * 
 * - Type: `Singleton`
 * - Version: `1.0`
 * 
 * ---
 * 
 * - Features: 
 *   - API clients;
 *     - {@link AppClients | Base}: contains example requests for `GET`, `PATCH`, `POST`, `PUT` & `DELETE` calls using the local `fetch` API abstraction.
 *   - Services;
 *   - Default configurations;
 *   - Utilities;
 * 
 * ---
 * 
 * Primarily useful for accessing any app-relevant object @ runtime as any changed value can be updated and tracked across the entire project.
 */
const MXP$App = App.getInstance();

export default MXP$App;