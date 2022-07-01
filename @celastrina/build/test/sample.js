
const {deployment, deploy, resource, setSubscription, setResourceGroup, start, finish, before, after, dependsOn,
	   createOrUpdate, remove, Azure, beforeEach, afterEach} = require("../index");

// Set up some of the defaults.

/**
 * @brief Sample Application Deployment
 */
deployment("TestDeploymentName", () => {
	setSubscription("SampleSubscription");
	setResourceGroup("SampleResourceGroup");
	dependsOn("ADeploymentThatDoesntExist");

	start((/**@type{Deployment}*/deployment) => {
		// do something before create or delete
		console.log("starting '" + deployment.name + "'.");
	});

	beforeEach((dep, res) => {
		// Do something
	});

	afterEach((dep, res) => {
		// Do something
	});

	/**
	 * Example of an existing resource.
	 */
	resource("myProduct-vnet-test-eu", "Microsoft.Network/virtualNetworks@2021-08-01", (resource) => {
		// Do something when its resolved.
		// isNew = true because this doesnt exist.
	});

	/**
	 * @brief Creates the Web Host
	 */
	resource("myProductWeb-app-test-eu", "Microsoft.Web/sites@2021-03-01", (resource) => {
		dependsOn("myProduct-vnet-test-eu");
		before((/**@type{Resource}*/resource) => {
			// do something before create or delete
		});
		createOrUpdate((/**@type{Resource}*/resource) => {
			// Lets make this thing!
		});
		after((resource) => {
			// do something after create or delete
		});
	});

	/**
	 * @brief Creates the Web Experience API
	 */
	resource("myProductAPI-app-test-eu", "Microsoft.Web/sites@2021-03-01", () => {
		dependsOn("myProduct-vnet-test-eu");
		createOrUpdate((resource) => {
			//
		});
	});

	/**
	 * @brief Delete old Web Experience API
	 */
	resource("myProductOldAPI-app-test-eu", "Microsoft.Web/sites@2021-03-01", () => {
		remove((resource) => {
			//
		});
	});
});

deploy();
