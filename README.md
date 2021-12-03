# esbuild-plugin-bundle

An esbuild plugin that bundles modules before importing them.

This is useful for scenarios where you need nested JavaScript files (such as a server that serves a service worker that serves a web application) but want to keep your app in one dependency graph without multiple build steps.

## Usage