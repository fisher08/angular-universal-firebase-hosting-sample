"use strict";
const functions = require("firebase-functions");
const express = require("express");
const angular_universal_express_1 = require("angular-universal-express");
/**
 * Create a Cloud Function HTTPS Trigger configured to generate
 * Angular Universal responses.
 * @param config
 */
exports.trigger = functions.https.onRequest(createExpressApp({
    cdnCacheExpiry: 1200,
    browserCacheExpiry: 600,
    enableProdMode: true,
    index: __dirname + '/dist-server/index.html',
    main: __dirname + '/dist-server/main.bundle'
}));
/**
 * Create an express app configued to generate Angular Universal
 * responses. Note: a static directory that contains your static
 * Angular assets must be supplied. Otherwise each asset request
 * will trigger a dynamic response.
 * @param config
 */
function createExpressApp(config) {
    console.log("Create Express app");
    const router = express();
    /**
     * An express static directory is not usually neccessary when
     * in use with Firebase Hosting. Hosting will always prefer
     * existing static assets to dynamic routes.
     */
    if (valueExists(config.staticDirectory)) {
        router.use(express.static(config.staticDirectory));
    }
    const cacheControlValue = getCacheControlHeader(config);
    // middleware that applies a Cache-Control header to each dynamic response
    router.use((req, res, next) => {
        res.set('Cache-Control', cacheControlValue);
        next();
    });
    router.get('/*', angular_universal_express_1.angularUniversal(config));
    return router;
}
function valueExists(value) {
    return !(typeof value === 'undefined' || value === null);
}
/**
 * Checks a given configuration for Cache-Control header values
 * and either returns the supplied values or the default values (0).
 * @param config
 */
function checkCacheControlValue(config) {
    let cdnCacheExpiry = 0;
    let browserCacheExpiry = 0;
    let staleWhileRevalidate = 0;
    if (valueExists(config.cdnCacheExpiry)) {
        cdnCacheExpiry = config.cdnCacheExpiry;
    }
    if (valueExists(config.browserCacheExpiry)) {
        browserCacheExpiry = config.browserCacheExpiry;
    }
    if (valueExists(config.staleWhileRevalidate)) {
        staleWhileRevalidate = config.staleWhileRevalidate;
    }
    return { cdnCacheExpiry, browserCacheExpiry, staleWhileRevalidate };
}
/**
 * Returns the Cache-Control header value given a config object.
 * @param config
 */
function getCacheControlHeader(config) {
    const { cdnCacheExpiry, browserCacheExpiry, staleWhileRevalidate } = checkCacheControlValue(config);
    return `public, max-age=${browserCacheExpiry}, s-maxage=${cdnCacheExpiry}, stale-while-revalidate=${staleWhileRevalidate}`;
}
