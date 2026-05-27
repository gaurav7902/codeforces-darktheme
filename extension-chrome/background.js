(() => {
    'use strict';

    const STORAGE_KEY = 'enabled';

    function getActionApi() {
        if (typeof chrome !== 'undefined' && chrome.action) {
            return chrome.action;
        }
        if (typeof browser !== 'undefined' && browser.action) {
            return browser.action;
        }
        return null;
    }

    function getStorageArea() {
        if (
            typeof chrome !== 'undefined' &&
            chrome.storage &&
            chrome.storage.local
        ) {
            return chrome.storage.local;
        }
        if (
            typeof browser !== 'undefined' &&
            browser.storage &&
            browser.storage.local
        ) {
            return browser.storage.local;
        }
        return null;
    }

    function getRuntimeApi() {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            return chrome.runtime;
        }
        if (typeof browser !== 'undefined' && browser.runtime) {
            return browser.runtime;
        }
        return null;
    }

    function getIconPaths(enabled) {
        const state = enabled ? 'on' : 'off';

        return {
            16: `icons/toggle-${state}16.png`,
            32: `icons/toggle-${state}32.png`,
            48: `icons/toggle-${state}48.png`,
            128: `icons/toggle-${state}128.png`,
        };
    }

    function setActionIcon(enabled) {
        const action = getActionApi();
        if (!action || !action.setIcon) return;

        action.setIcon({ path: getIconPaths(enabled) });
    }

    function syncIconFromStorage() {
        const storage = getStorageArea();
        if (!storage) {
            setActionIcon(true);
            return;
        }

        try {
            const result = storage.get({ [STORAGE_KEY]: true });
            if (result && typeof result.then === 'function') {
                result
                    .then((items) => {
                        setActionIcon(items[STORAGE_KEY] !== false);
                    })
                    .catch(() => setActionIcon(true));
                return;
            }
        } catch (error) {}

        storage.get({ [STORAGE_KEY]: true }, (items) => {
            setActionIcon(items[STORAGE_KEY] !== false);
        });
    }

    syncIconFromStorage();

    const runtime = getRuntimeApi();
    if (runtime && runtime.onInstalled) {
        runtime.onInstalled.addListener(syncIconFromStorage);
    }

    if (runtime && runtime.onStartup) {
        runtime.onStartup.addListener(syncIconFromStorage);
    }

    const storage = getStorageArea();
    if (storage && storage.onChanged && storage.onChanged.addListener) {
        storage.onChanged.addListener((changes, areaName) => {
            if (
                areaName === 'local' &&
                changes &&
                Object.prototype.hasOwnProperty.call(changes, STORAGE_KEY)
            ) {
                setActionIcon(changes[STORAGE_KEY].newValue !== false);
            }
        });
    }
})();
