(() => {
    'use strict';

    const STORAGE_KEY_ENABLED = 'enabled';
    const { storageGet, storageSet } = window.CFDarkThemeUtils;

    function getToggleIconPath(enabled, size) {
        return `icons/icon${size}.png`;
    }

    function updateUI(enabled) {
        document.body.classList.toggle('disabled', !enabled);
        const label = document.getElementById('state-label');
        const status = document.getElementById('status-text');
        const brandIcon = document.getElementById('brand-icon');
        const helpIcon = document.getElementById('help-icon');
        const contributeIcon = document.getElementById('contribute-icon');

        if (label) label.textContent = enabled ? 'Enabled' : 'Disabled';
        if (status) {
            status.innerHTML = enabled
                ? '<strong>Active.</strong> Dark theme styling is enabled.'
                : '<strong>Paused.</strong> Dark theme styling is disabled.';
        }
        if (brandIcon) {
            brandIcon.src = getToggleIconPath(enabled, 128);
        }
        if (helpIcon) {
            helpIcon.src = getToggleIconPath(enabled, 16);
        }
        if (contributeIcon) {
            contributeIcon.src = getToggleIconPath(enabled, 16);
        }
    }

    document.addEventListener('DOMContentLoaded', async () => {
        const toggle = document.getElementById('enabled-toggle');
        const versionText = document.getElementById('version-text');

        // Load version from manifest
        try {
            const manifestResponse = await fetch(chrome.runtime.getManifest());
            const manifest = await manifestResponse.json();
            if (versionText) {
                versionText.textContent = `v${manifest.version}`;
            }
        } catch (e) {
            console.error('Could not load version from manifest', e);
        }

        const defaults = {
            [STORAGE_KEY_ENABLED]: true,
        };
        const items = await storageGet(defaults);
        const enabled = items[STORAGE_KEY_ENABLED] !== false;

        if (toggle) {
            toggle.checked = enabled;
            toggle.addEventListener('change', async () => {
                const nextEnabled = toggle.checked;
                updateUI(nextEnabled);
                await storageSet({ [STORAGE_KEY_ENABLED]: nextEnabled });
            });
        }

        updateUI(enabled);
    });
})();
