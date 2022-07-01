
"use strict";
const moment = require("moment");


class Subscription {
	constructor(name, id) {
		this._name = name;
		this._id = id;
	}

	static getByName(name) {}
	static getById(id) {}
}

class Resource {
	/**
	 * @param {string} name
	 * @param {string} type
	 * @param {function(Deployment)} [callback=null]
	 * @param {Object} [options=null]
	 */
	constructor(name, type, callback = null, options = null) {
		this._type = type;
		this._version = null;
		this._name = name;
		this._location = null;
		this._tags = new Set();
		this._new = true;
		this._options = options;
		/**@type{Function}*/this._prepareCallback = callback;

		/**@type{Function}*/this._beforeCallback = null;
		/**@type{Function}*/this._afterCallback = null;
		/**@type{Function}*/this._actionCallback = null;

	}
	/**@type{boolean}*/get isNew() {return this._new;}
	/**@type{string}*/get name() {return this._name;}
	set name(name) {this._name = name;}
	get location() {return this._location;}
	set location(loc) {this._location = loc;}
	/**@return{Array<string>}*/get tags() {return this._tags;}
	/**
	 * @param {Deployment} deployment
	 */
	prepare(deployment) {
		if(this._prepareCallback != null)
			this._prepareCallback.call(this, deployment);
	}
	/**
	 * @param {function(Resource?)} [callback=null]
	 */
	setBeforeCallback(callback = null) {
		if(this._beforeCallback != null)
			throw new Error("A resource can only perform an Before action only once.");
		this._beforeCallback = callback;
	}
	/**
	 * @param {function(Resource?)} [callback=null]
	 */
	setAfterCallback(callback = null) {
		if(this._afterCallback != null)
			throw new Error("A resource can only perform an After action only once.");
		this._afterCallback = callback;
	}
	/**
	 * @param {function(Resource?)} [callback=null]
	 */
	setCreateOrUpdateCallback (callback = null) {
		if(this._actionCallback != null)
			throw new Error("A resource can only perform a Create Or Update, or Remove action only once.");
		this._actionCallback = callback;
	}
	/**
	 * @param {function(Resource?)} [callback=null]
	 */
	setRemoveCallback (callback = null) {
		// TODO: On load of the resource manager, check for this callback, if resource not found in azure but this
		//  callback specified do we error?
		if(this._actionCallback != null)
			throw new Error("A resource can only perform a Create Or Update, or Remove action only once.");
		this._actionCallback = callback;
	}
}

class ResourceGroup extends Resource {
	constructor(name, location) {
		super(name, location);
	}
	/**
	 * @param {Resource} resource
	 */
	add(resource) {

	}
}
/**
 * Deployment
 * @author Robert R Murrell
 */
class Deployment {
	/**
	 * @param {string} name
	 * @param {function(Deployment)} callback
	 * @param {Object} [options=null]
	 */
	constructor(name, callback, options = null) {
		/**@type{(null|string)}*/this._subname = null;
		/**@type{(null|string)}*/this._rgname = null;
		/**@type{Subscription}*/this._subscription = null;
		/**@type{ResourceGroup}*/this._resourceGroup = null;
		this._name = name;
		/**@type{Function}*/this._prepareCallback = callback;
		/**@type{Function}*/this._startCallback = null;
		/**@type{Function}*/this._finishCallback = null;
		this._opts = options
		/**@type{Array<Resource>}*/this._resources = [];
		/**@type{Resource}*/this._context = null;
	}
	/**@return{string}*/get name() {return this._name;}
	/**@return{Object}*/get options() {return this._opts;}
	/**@return{Subscription}*/get subscription() {return this._subscription;}
	/**@return{ResourceGroup}*/get resourceGroup() {return this._resourceGroup;}
	/**
	 * @param {string} name
	 */
	setSubscription(name) {
		if(typeof name !== "string" || name.trim().length === 0)
			throw new Error("Argument 'name' is required when setting a subscription.");
		this._subname = name;
	}
	/**
	 * @param {string} name
	 */
	setResourceGroup(name) {
		if(typeof name !== "string" || name.trim().length === 0)
			throw new Error("Argument 'name' is required when setting a resource group.");
		this._rgname = name;
	}
	/**
	 * @param {string} name
	 * @param {string} type
	 * @param {(Object|function(Resource?))} [optOrCallback=null]
	 * @param {function(Resource?)} [callback=null]
	 */
	addResource(name, type, optOrCallback = null, callback = null) {
		if(typeof name !== "string" || name.trim().length === 0)
			throw new Error("Argument 'name' is required.");
		if(typeof type !== "string" || type.trim().length === 0)
			throw new Error("Argument 'type' is required.");

		let _options = null;
		let _callback = null;

		if(typeof optOrCallback === "function")
			_callback = optOrCallback
		else if(typeof callback === "function") {
			_callback = callback;
			_options = optOrCallback;
		}

		this._resources.push(new Resource(name, type, _callback, _options));
	}
	/**
	 * @brief
	 */
	prepare() {
		this._prepareCallback.call(this, this);
	}
	/**
	 * @brief
	 */
	prepareResources() {
		for(const _resource of this._resources) {
			this._context = _resource;
			_resource.prepare(this);
		}
	}
	/**
	 * @param {function(Resource?)} [callback=null]
	 */
	setContextBeforeCallback(callback = null) {
		this._context.setBeforeCallback(callback);
	}
	/**
	 * @param {function(Resource?)} [callback=null]
	 */
	setBeforeEachCallback(callback = null) {
		//
	}
	/**
	 * @param {function(Resource?)} [callback=null]
	 */
	setContextAfterCallback(callback = null) {
		this._context.setAfterCallback(callback);
	}
	/**
	 * @param {function(Resource?)} [callback=null]
	 */
	setAfterEachCallback(callback = null) {

	}
	/**
	 * @param {function(Resource?)} [callback=null]
	 */
	setContextCreateOrUpdateCallback (callback = null) {
		this._context.setCreateOrUpdateCallback(callback);
	}
	/**
	 * @param {function(Resource?)} [callback=null]
	 */
	setContextRemoveCallback (callback = null) {
		this._context.setRemoveCallback(callback);
	}
	/**
	 *
	 */
	run() {
		// Lookup the default subscription and resource group.
		// TODO: Lookup (GET) Subscription meta from ResourceManager.
		// TODO: Lookup (GET) ResourceGroup meta from ResourceManager.


		if(this._startCallback != null)
			this._startCallback.call(this, this);

		// Resolve the resources.
		// Loop through the resources and run those.

		if(this._finishCallback != null)
			this._finishCallback.call(this, this);
	}
	/**
	 * @param {function(Deployment?)} [callback=null]
	 */
	setStartCallback(callback) {
		this._startCallback = callback;
	}
}

const Azure = {
	locations: {
		eastus: "eastus"
	}
}

class DeploymentManager {
	static PHASE = {IDLE: "IDLE", PREPARE_DEPLOYMENTS: "PREPARE DEPLOYMENTS", PREPARE_RESOURCES: "PREPARE RESOURCES"}
	constructor() {
		/**@type{Array<Deployment>}*/this._deployments = [];
		/**@type{Deployment}*/this._context = null;
		this._dependencies = [];
		this._phase = DeploymentManager.PHASE.IDLE;
	}
	/**
	 * @param {string} name
	 * @param {(Object|function(Deployment?))} [optOrCallback=null]
	 * @param {function(Deployment?)} [callback=null]
	 */
	add(name, optOrCallback, callback) {
		if(typeof name !== "string" || name.trim().length === 0)
			throw new Error("Argument 'name' is required.");

		let _options = null;
		let _callback = null;

		if(typeof optOrCallback === "function")
			_callback = optOrCallback
		else if(typeof callback === "function") {
			_callback = callback;
			_options = optOrCallback;
		}
		else
			throw new Error("Deployment '" + name + "' is missing the required callback function.");

		this._deployments.push(new Deployment(name, _callback, _options));
	}
	/**@return{Array<Deployment>}*/get deployments() {return this._deployments;}
	/**@return{Deployment}*/get context() {return this._context;}

	/**
	 * @param {string} name
	 */
	setContextSubscription(name) {
		if(this._context == null)
			throw new Error("Invalid state exception. Attempting to set a deployment subscription outside of a deployment.");
		this._context.setSubscription(name);
	}
	/**
	 * @param {string} name
	 */
	setContextResourceGroup(name) {
		if(this._context == null)
			throw new Error("Invalid state exception. Attempting to set a deployment subscription outside of a deployment.");
		this._context.setResourceGroup(name);
	}
	/**
	 * @param {function(Deployment?)} [callback=null]
	 */
	setContextStartCallback(callback) {
		this._context.setStartCallback(callback);
	}
	/**
	 * @param {string} name
	 * @param {string} type
	 * @param {(Object|function(Resource?))} [optOrCallback=null]
	 * @param {function(Resource?)} [callback=null]
	 */
	addContextResource(name, type, optOrCallback = null, callback = null) {
		this._context.addResource(name, type, optOrCallback, callback);
	}
	/**
	 * @param {string} name
	 */
	setDependency(name) {
		// if(typeof name !== "string" || name.trim().length === 0)
		// 	throw new Error("Argument 'name' is required.");
		// if(this._phase === DeploymentManager.PHASE.PREPARE_DEPLOYMENTS)
		// 	this._dependencies.push({deployment: this._context.name, dependsOn: name});
		// else if(this._phase === DeploymentManager.PHASE.PREPARE_DEPLOYMENTS)
	}


	/**
	 * @param {function(Resource?)} [callback=null]
	 */
	setContextBeforeCallback(callback = null) {
		this._context.setContextBeforeCallback(callback);
	}
	/**
	 * @param {function(Resource?)} [callback=null]
	 */
	setContextBeforeEachCallback(callback = null) {
		this._context.setBeforeEachCallback(callback);
	}
	/**
	 * @param {function(Resource?)} [callback=null]
	 */
	setContextAfterCallback(callback = null) {
		this._context.setContextAfterCallback(callback);
	}
	/**
	 * @param {function(Resource?)} [callback=null]
	 */
	setContextAfterEachCallback(callback = null) {
		this._context.setAfterEachCallback(callback);
	}
	/**
	 * @param {function(Resource?)} [callback=null]
	 */
	setContextCreateOrUpdateCallback (callback = null) {
		this._context.setContextCreateOrUpdateCallback(callback);
	}
	/**
	 * @param {function(Resource?)} [callback=null]
	 */
	setContextRemoveCallback (callback = null) {
		this._context.setContextRemoveCallback(callback);
	}
	/**
	 * @brief
	 */
	deploy() {
		this._prepareDeployments();
		this._prepareResources();

		// TODO: Resolve dependants

		this._runDeployments();
	}
	/**
	 * @private
	 */
	_prepareDeployments() {
		this._phase = DeploymentManager.PHASE.PREPARE_DEPLOYMENTS;
		for(const _deployment of this._deployments) {
			console.log("Preparing deployment '" + _deployment.name + "'.");
			this._context = _deployment;
			this._context.prepare();
		}
	}
	/**
	 * @private
	 */
	_prepareResources() {
		this._phase = DeploymentManager.PHASE.PREPARE_RESOURCES;
		for(const _deployment of this._deployments) {
			console.log("Preparing resources for deployment '" + _deployment.name + "'.");
			this._context = _deployment;
			this._context.prepareResources();
		}
	}
	/**
	 * @private
	 */
	_runDeployments() {
		for(const _deployment of this._deployments) {
			console.log("Running deployment '" + _deployment.name + "'.");
			this._context = _deployment;
			this._context.run();
		}
	}
}

class ResourceManager {
	constructor() {}
}


/**
 * @type {DeploymentManager}
 */
const _DeploymentManager_ = new DeploymentManager();

/**
 * @param {(string|Array<string>)} name
 */
function dependsOn(name) {
	if(Array.isArray(name)) {
		for(const _name of name) {
			_DeploymentManager_.setDependency(_name);
		}
	}
	else _DeploymentManager_.setDependency(name);
}

/**
 * @param {function()} [callback=null]
 */
function before(callback = null) {
	_DeploymentManager_.setContextBeforeCallback(callback);
}

/**
 * @param {function()} [callback=null]
 */
function after(callback = null) {
	_DeploymentManager_.setContextAfterCallback(callback);
}

/**
 * @param {function(Resource?)} [callback=null]
 */
function createOrUpdate(callback = null) {
	_DeploymentManager_.setContextCreateOrUpdateCallback(callback);
}

/**
 * @param {string} name
 */
function setSubscription(name) {
	_DeploymentManager_.setContextSubscription(name);
}

/**
 * @param {string} name
 */
function setResourceGroup(name) {
	_DeploymentManager_.setContextResourceGroup(name);
}

/**
 * @param {function(Deployment?)} [callback=null]
 */
function start(callback) {
	_DeploymentManager_.setContextStartCallback(callback);
}
/**
 * @param {function(Deployment?)} [callback=null]
 */
function finish(callback) {

}
/**
 * @param {function(Deployment?, Resource?)} [callback=null]
 */
function beforeEach(callback) {

}
/**
 * @param {function(Deployment?, Resource?)} [callback=null]
 */
function afterEach(callback) {

}

/**
 * @param {string} name
 * @param {(Object|function(Deployment?))} [optOrCallback=null]
 * @param {function(Deployment?)} [callback=null]
 */
function deployment(name, optOrCallback = null, callback = null) {
	_DeploymentManager_.add(name, optOrCallback, callback);
}

/**
 * @param {string} name
 * @param {string} type
 * @param {(Object|function(Resource?))} [optOrCallback=null]
 * @param {function(Resource?)} [callback=null]
 */
function resource(name, type, optOrCallback = null, callback = null) {
	_DeploymentManager_.addContextResource(name, type, optOrCallback, callback);
}

/**
 * @param {function(Resource?)} [callback=null]
 */
function remove(callback = null) {
	_DeploymentManager_.setContextRemoveCallback(callback);
}

/**
 * @param {Object} options
 */
function deploy(options = null) {
	console.log("Running deployments.");
	_DeploymentManager_.deploy();
}

module.exports = {
	Azure: Azure,
	Subscription: Subscription,
	Resource: Resource,
	ResourceGroup: ResourceGroup,
	DeploymentManager: DeploymentManager,
	ResourceManager: ResourceManager,
	setSubscription: setSubscription,
	setResourceGroup: setResourceGroup,
	start: start,
	finish: finish,
	beforeEach: beforeEach,
	afterEach: afterEach,
	before: before,
	after: after,
	dependsOn: dependsOn,
	createOrUpdate: createOrUpdate,
	remove: remove,
	resource: resource,
	deploy: deploy,
	deployment: deployment
}
