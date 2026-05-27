(function () {
    'use strict';

    var STORAGE_KEY = 'enabled';
    var themeEnabled = true;
    var themeInitialized = false;
    var cleanupCallbacks = [];
    var resourceNodes = [];
    var originalStyleAttributes =
        typeof WeakMap != 'undefined' ? new WeakMap() : null;

    var colors = {
        whiteTextColor: 'rgb(220, 220, 220)',
        redColorJustPassesA11Y: '#ff3333',
    };

    function getRuntimeURL(path) {
        try {
            if (
                typeof chrome !== 'undefined' &&
                chrome.runtime &&
                chrome.runtime.getURL
            )
                return chrome.runtime.getURL(path);
            if (
                typeof browser !== 'undefined' &&
                browser.runtime &&
                browser.runtime.getURL
            )
                return browser.runtime.getURL(path);
        } catch (e) {}
        return path;
    }

    function getStorageArea() {
        try {
            if (
                typeof chrome !== 'undefined' &&
                chrome.storage &&
                chrome.storage.local
            )
                return chrome.storage.local;
            if (
                typeof browser !== 'undefined' &&
                browser.storage &&
                browser.storage.local
            )
                return browser.storage.local;
        } catch (e) {}
        return null;
    }

    function storageGet(defaults) {
        var area = getStorageArea();

        if (!area) return Promise.resolve(defaults);

        try {
            var result = area.get(defaults);
            if (result && typeof result.then == 'function') return result;
        } catch (e) {}

        return new Promise(function (resolve) {
            area.get(defaults, function (items) {
                resolve(items || defaults);
            });
        });
    }

    function addCleanup(fn) {
        cleanupCallbacks.push(fn);
    }

    function clearCleanupCallbacks() {
        while (cleanupCallbacks.length > 0) {
            var fn = cleanupCallbacks.pop();
            try {
                fn();
            } catch (e) {}
        }
    }

    function removeInjectedResources() {
        while (resourceNodes.length > 0) {
            var node = resourceNodes.pop();
            try {
                if (node && node.parentNode) node.parentNode.removeChild(node);
            } catch (e) {}
        }
    }

    function injectResource(tagName, attrs) {
        var parent = document.head || document.documentElement;
        if (!parent) return null;

        var node = document.createElement(tagName);
        for (var key in attrs) {
            if (Object.prototype.hasOwnProperty.call(attrs, key)) {
                node.setAttribute(key, attrs[key]);
            }
        }
        parent.appendChild(node);
        resourceNodes.push(node);
        return node;
    }

    function loadLocalStyles() {
        injectResource('link', {
            rel: 'stylesheet',
            href: getRuntimeURL('darktheme.css'),
            'data-codeforces-darktheme': 'true',
        });
        injectResource('link', {
            rel: 'stylesheet',
            href: getRuntimeURL('desert.css'),
            'data-codeforces-darktheme': 'true',
        });
        injectResource('link', {
            rel: 'stylesheet',
            href: getRuntimeURL('monokai.css'),
            'data-codeforces-darktheme': 'true',
        });
    }

    function overrideStyleAttribute(elm, prop, value) {
        try {
            if (originalStyleAttributes && !originalStyleAttributes.has(elm)) {
                originalStyleAttributes.set(elm, elm.getAttribute('style'));
                addCleanup(function () {
                    try {
                        var originalStyle = originalStyleAttributes.get(elm);
                        if (originalStyle === null) {
                            elm.removeAttribute('style');
                        } else if (typeof originalStyle != 'undefined') {
                            elm.setAttribute('style', originalStyle);
                        }
                        originalStyleAttributes.delete(elm);
                    } catch (e) {}
                });
            }
            elm.setAttribute(
                'style',
                (elm.getAttribute('style') || '') +
                    `; ${prop}: ${value} !important; `,
            );
        } catch (e) {
            // ignore
        }
    }

    function applyFuncWhenElmLoaded(sel, func) {
        if (!themeEnabled) return;

        var elm = document.querySelectorAll(sel);
        if (!elm || elm.length == 0)
            return setTimeout(applyFuncWhenElmLoaded, 100, sel, func);
        for (let i = 0, len = elm.length; i < len; i++) {
            if (!themeEnabled) return;
            func(elm[i]);
        }
    }

    function addClassWithCleanup(elm, className) {
        var hadClass = elm.classList.contains(className);
        elm.classList.add(className);
        if (!hadClass) {
            addCleanup(function () {
                try {
                    elm.classList.remove(className);
                } catch (e) {}
            });
        }
    }

    function setStylePropertyWithCleanup(elm, prop, value, priority) {
        var previousValue = elm.style.getPropertyValue(prop);
        var previousPriority = elm.style.getPropertyPriority(prop);
        elm.style.setProperty(prop, value, priority || '');
        addCleanup(function () {
            try {
                if (previousValue) {
                    elm.style.setProperty(
                        prop,
                        previousValue,
                        previousPriority,
                    );
                } else {
                    elm.style.removeProperty(prop);
                }
            } catch (e) {}
        });
    }

    function setAttributeWithCleanup(elm, name, value) {
        var hadAttribute = elm.hasAttribute(name);
        var previousValue = elm.getAttribute(name);
        elm.setAttribute(name, value);
        addCleanup(function () {
            try {
                if (hadAttribute) {
                    elm.setAttribute(name, previousValue);
                } else {
                    elm.removeAttribute(name);
                }
            } catch (e) {}
        });
    }

    function enableTheme() {
        if (themeInitialized) return;
        themeInitialized = true;
        loadLocalStyles();

        applyFuncWhenElmLoaded(
            '#pageContent div div h3 a, .comment-table.highlight-blue .right .ttypography p, .comment-table.highlight-blue .right .info',
            function (elm) {
                if (!themeEnabled) return;
                var obs = new MutationObserver(function (
                    mutationList,
                    observer,
                ) {
                    if (!themeEnabled) {
                        observer.disconnect();
                        return;
                    }
                    mutationList.forEach(function (mutation) {
                        if (
                            mutation.type == 'attributes' &&
                            mutation.attributeName == 'style'
                        ) {
                            elm.setAttribute(
                                'style',
                                (elm.getAttribute('style') || '') +
                                    '; color: white !important; ',
                            );
                        }
                    });
                });
                overrideStyleAttribute(elm, 'color', 'white');

                obs.observe(elm, { attributes: true });
                addCleanup(function () {
                    try {
                        obs.disconnect();
                    } catch (e) {}
                });
            },
        );

        applyFuncWhenElmLoaded('.datatable div:nth-child(5)', function (elm) {
            if (!themeEnabled) return;
            addClassWithCleanup(elm, 'dark');
        });

        applyFuncWhenElmLoaded('.unread td', function (elm) {
            if (!themeEnabled) return;
            try {
                setStylePropertyWithCleanup(
                    elm,
                    'background-color',
                    '#13203a',
                    'important',
                );
            } catch (e) {}
        });

        (function detect404Page() {
            applyFuncWhenElmLoaded('body > h3', function (elm) {
                if (!themeEnabled) return;
                if (
                    elm.innerText &&
                    elm.innerText.startsWith(
                        'The requested URL was not found on this server.',
                    )
                ) {
                    addClassWithCleanup(document.body, 'notfoundpage');
                }
            });
        })();

        (function fixLavaMenu() {
            // Remove external image usage; keep existing styling but do not set remote resources.
            applyFuncWhenElmLoaded(
                '.second-level-menu-list li.backLava',
                function (elm) {
                    if (!themeEnabled) return;
                    try {
                        setStylePropertyWithCleanup(
                            elm,
                            'background-image',
                            'url(' +
                                getRuntimeURL('imgs/lava-right2.png') +
                                ')',
                        );
                        if (elm.firstElementChild)
                            setStylePropertyWithCleanup(
                                elm.firstElementChild,
                                'background-image',
                                'url(' +
                                    getRuntimeURL('imgs/lava-left2.png') +
                                    ')',
                            );
                    } catch (e) {}
                },
            );
        })();

        (function fixAceEditor() {
            applyFuncWhenElmLoaded('#editor', function (elm) {
                if (!themeEnabled) return;
                var aceChromeClass = 'ace-chrome';
                var aceMonokaiClass = 'ace-monokai';
                var hadChromeClass = elm.classList.contains(aceChromeClass);
                var hadMonokaiClass = elm.classList.contains(aceMonokaiClass);

                function applyAceTheme() {
                    if (!themeEnabled) return;
                    elm.classList.remove(aceChromeClass);
                    elm.classList.add(aceMonokaiClass);
                }

                applyAceTheme();
                var observer = new MutationObserver(applyAceTheme);
                observer.observe(elm, {
                    attributes: true,
                    attributeFilter: ['class'],
                });
                addCleanup(function () {
                    try {
                        observer.disconnect();
                        if (hadChromeClass) {
                            elm.classList.add(aceChromeClass);
                        } else {
                            elm.classList.remove(aceChromeClass);
                        }
                        if (!hadMonokaiClass) {
                            elm.classList.remove(aceMonokaiClass);
                        }
                    } catch (e) {}
                });
            });
        })();

        (function fixColorRedGreenContrast() {
            if (document.readyState != 'complete') {
                return setTimeout(fixColorRedGreenContrast, 100);
            }

            if (!themeEnabled) return;

            var elms = document.querySelectorAll('*');
            for (let i = 0, len = elms.length; i < len; i++) {
                try {
                    if (getComputedStyle(elms[i]).color == 'rgb(0, 128, 0)') {
                        overrideStyleAttribute(elms[i], 'color', '#00c700');
                    }
                } catch (e) {}
            }

            elms = document.querySelectorAll('font');
            for (let i = 0, len = elms.length; i < len; i++) {
                try {
                    if (elms[i].getAttribute('color') == 'red') {
                        setAttributeWithCleanup(
                            elms[i],
                            'color',
                            colors.redColorJustPassesA11Y,
                        );
                    }
                } catch (e) {}
            }
        })();

        (function fixBlackTextInRightTableDuringContest() {
            applyFuncWhenElmLoaded('.rtable span', function (elm) {
                if (!themeEnabled) return;
                if (elm.style && elm.style.color == 'rgb(0, 0, 0)')
                    overrideStyleAttribute(elm, 'color', colors.whiteTextColor);
            });
        })();

        (function improveLinkColorInGreenAlerts() {
            applyFuncWhenElmLoaded('div.alert-success a', function (elm) {
                if (!themeEnabled) return;
                overrideStyleAttribute(elm, 'color', '#004794');
            });
        })();

        (function improveTestCaseBgColor() {
            const TEST_LINE_CLASS = 'test-example-line';

            function applyBGToTestCaseLine(elm) {
                const prop = 'cssText';
                if (elm.style[prop] === '') {
                    return;
                }
                if (
                    !elm.style[prop].includes('(26') &&
                    !elm.style[prop].includes('#1a')
                ) {
                    setStylePropertyWithCleanup(
                        elm,
                        'background-color',
                        'rgb(26, 26, 26)',
                        'important',
                    );
                }
            }

            function mutationCallback(mutationList, observer) {
                if (!themeEnabled) {
                    observer.disconnect();
                    return;
                }
                mutationList.forEach((mutation) => {
                    const target = mutation.target;
                    if (
                        target.classList &&
                        target.classList.contains(TEST_LINE_CLASS)
                    ) {
                        applyBGToTestCaseLine(target);
                    }
                });
            }
            const observer = new MutationObserver(mutationCallback);

            applyFuncWhenElmLoaded('.' + TEST_LINE_CLASS, function (elm) {
                if (!themeEnabled) return;
                observer.observe(document.body, {
                    subtree: true,
                    attributeFilter: ['style'],
                });
                addCleanup(function () {
                    try {
                        observer.disconnect();
                    } catch (e) {}
                });
            });
        })();
    }

    function disableTheme() {
        if (!themeInitialized) {
            removeInjectedResources();
            return;
        }

        themeInitialized = false;
        clearCleanupCallbacks();
        removeInjectedResources();
    }

    function setThemeEnabled(enabled) {
        themeEnabled = enabled !== false;

        if (themeEnabled) {
            enableTheme();
        } else {
            disableTheme();
        }
    }

    storageGet({ [STORAGE_KEY]: true })
        .then(function (items) {
            setThemeEnabled(items[STORAGE_KEY] !== false);
        })
        .catch(function () {
            setThemeEnabled(true);
        });

    var storageArea = getStorageArea();
    if (
        storageArea &&
        storageArea.onChanged &&
        storageArea.onChanged.addListener
    ) {
        storageArea.onChanged.addListener(function (changes) {
            if (
                changes &&
                Object.prototype.hasOwnProperty.call(changes, STORAGE_KEY)
            ) {
                var nextEnabled = changes[STORAGE_KEY].newValue !== false;
                setThemeEnabled(nextEnabled);
            }
        });
    }
})();
