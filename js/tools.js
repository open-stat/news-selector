
var tools = {


    /**
     * @returns {Promise<PermissionStatus|LockManagerSnapshot>}
     */
    getCurrentTab: async function () {

        let [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        return tab;
    },


    /**
     * @returns {Promise<PermissionStatus|LockManagerSnapshot>}
     */
    getActiveTabs: async function () {

        return await chrome.tabs.query({
            active: true
        });
    },


    /**
     * @returns {Promise<unknown>}
     */
    getStorage: async function (key) {

        return new Promise((resolve, reject) => {
            try {
                chrome.storage.local.get('storage', function(result) {
                    let storage = result.hasOwnProperty('storage') && result.storage || {};

                    if (key) {
                        let value = storage.hasOwnProperty(key) ? storage[key] : null;
                        resolve(value);
                    } else {
                        resolve(storage);
                    }
                });

            } catch (ex) {
                reject(ex);
            }
        });
    },


    /**
     * @param key
     * @param value
     */
    setStorage: async function (key, value) {

        return new Promise((resolve, reject) => {
            try {
                chrome.storage.local.get('storage', function(result) {
                    let storage = result.storage || {};
                    storage[key] = value;

                    chrome.storage.local.set({storage: storage}, function () {
                        resolve();
                    });
                });
            } catch (ex) {
                reject(ex);
            }
        });
    },


    /**
     * @param key
     * @returns {Promise<unknown>}
     */
    clearStorage: async function (key) {

        return new Promise((resolve, reject) => {
            try {
                chrome.storage.local.get('storage', function(result) {
                    let storage = result.hasOwnProperty('storage') && result.storage || {};

                    if (key) {
                        if (storage.hasOwnProperty(key)) {
                            delete storage[key];
                            chrome.storage.local.set({storage: storage}, function () {
                                resolve();
                            });

                        } else {
                            resolve();
                        }

                    } else {
                        chrome.storage.local.set({storage: {}}, function () {
                            resolve();
                        });
                    }
                });
            } catch (ex) {
                reject(ex);
            }
        });
    },


    /**
     *
     * @param tabId
     * @param action
     * @param data
     * @param responseCallback
     */
    sendMessageTab: function (tabId, action, data, responseCallback) {

        chrome.tabs.sendMessage(
            tabId,
            {
                action: action,
                data: data
            },
            function(response) {
                if (typeof responseCallback === 'function') {
                    responseCallback(response);
                }
            }
        );
    },


    /**
     * @param action
     * @param data
     * @param responseCallback
     */
    sendMessageRuntime: function (action, data, responseCallback) {

        chrome.runtime.sendMessage(
            null,
            {
                action: action,
                data: data
            },
            function(response) {
                if (typeof responseCallback === 'function') {
                    responseCallback(response);
                }
            }
        );
    }
}