/**
 * Web entry: use localStorage-backed DB so expo-sqlite is not loaded in the browser.
 * Metro resolves this file when building for web.
 */
export * from './dbWeb';
