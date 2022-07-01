/*
 * Copyright (c) 2021, KRI, LLC.
 *
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
/**
 * @author Robert R Murrell
 * @copyright Robert R Murrell
 * @license MIT
 */
"use strict";

const axios  = require("axios").default;

/**
 * Subscription
 * @author Robert R Murrell
 */
class Subscription {
	/**
	 * @param {string} name
	 * @param {string} id
	 * @param {string} tenantId
	 * @param {Object} tags
	 */
	constructor(name, id, tenantId, tags = null) {
		this._name = name;
		this._id = id;
		this._tenantId = tenantId;
		this._tags = tags;
	}
	/**@type{string}*/get name() {return this._name;}
	/**@type{string}*/get id() {return this._id;}
	/**@type{string}*/get tenantId() {return this._tenantId;}
	/**@type{Object}*/get tags() {return this._tags;}
}
/**
 * ResourceGroup
 * @author Robert R Murrell
 */
class ResourceGroup {
	/**
	 * @param {string} name
	 * @param {string} id
	 * @param {string} type
	 * @param {string} location
	 * @param {Object} tags
	 */
	constructor(name, id, type, location, tags) {
		this._name = name;
		this._id = id;
		this._type = type;
		this._location = location;
		this._tags = tags;
	}
	/**@type{string}*/get name() {return this._name;}
	/**@type{string}*/get id() {return this._id;}
	/**@type{string}*/get type() {return this._type;}
	/**@type{string}*/get location() {return this._location;}
	/**@type{Object}*/get tags() {return this._tags;}
}


/**
 * ResourceManager
 * @author Robert R Murrell
 */
class ResourceManager {
	static RESOURCE_GROUP_CREATE = "https://management.azure.com/subscriptions/{subscriptionId}/resourcegroups/{resourceGroupName}/providers/{resourceProviderNamespace}/{parentResourcePath}/{resourceType}/{resourceName}?api-version=2021-04-01"
	static RESOURCE_GROUP_GET_URL = "https://management.azure.com/subscriptions/{subscriptionId}/resourcegroups/{resourceGroupName}?api-version=2021-04-01";
	static SUBSCRIPTION_LIST_URL = "https://management.azure.com/subscriptions?api-version=2020-01-01";

	/**
	 * @brief
	 */
	constructor() {
		this._options = {}
	}
	/**
	 * @param {string} name
	 * @param {Subscription} subscription
	 * @return {Promise<ResourceGroup>}
	 */
	async getResourceGroup(name, subscription) {
		let rg = null;
		try {
			let _url = ResourceManager.RESOURCE_GROUP_GET_URL.replaceAll("{subscriptionId}", subscription.id);
			_url = _url.replaceAll("{resourceGroupName}", name);
			let response = await axios.get(_url);
			if(response.status === 200) {
				let _rg = response.data;
				rg = new ResourceGroup(name, _rg.id, _rg.type, _rg.location, _rg.tags);
			}
			else {
				// do something else.
			}
		}
		catch(aex) {
			// Non-200 responses.
			throw new Error("Non-200 response from Azure Resource Manager.");
		}
		if(rg == null) throw new Error("No resource group found by name '" + name + "'. Please check the name or that " +
			                           "the credential used has permissions to access this resource group.");
		return rg;
	}
	/**
	 * @param {string} name
	 * @return {Promise<Subscription>}
	 */
	async getSubscription(name) {
		let sub = null;
		try {
			let response = await axios.get(ResourceManager.SUBSCRIPTION_LIST_URL);
			if(response.status === 200) {
				let _subscriptions = response.data;
				for(let _subscription of _subscriptions) {
					if(name === _subscription.displayName) {
						sub = new Subscription(name, _subscription.id, _subscription.tenantId,
							                   _subscription.tags);
						break;
					}
				}
			}
			else {
				// do something else.
			}
		}
		catch(aex) {
			// Non-200 responses.
			throw new Error("Non-200 response from Azure Resource Manager.");
		}

		if(sub == null) throw new Error("No subscription found by name '" + name + "'. Please check the name or that " +
			                            "the credential used has permissions to access this subscription.");
		return sub;
	}
}

module.exports = {
	Subscription: Subscription,
	ResourceGroup: ResourceGroup,
	ResourceManager: ResourceManager
};
