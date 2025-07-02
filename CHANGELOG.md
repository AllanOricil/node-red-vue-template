# [2.0.0](https://github.com/AllanOricil/node-red-vue-template/compare/v1.3.0...v2.0.0) (2025-07-02)


### Features

* move icons and public folders to client ([a5da5bb](https://github.com/AllanOricil/node-red-vue-template/commit/a5da5bb5efcc0ef0b3fad758911b62404f4386a7))


### BREAKING CHANGES

* because icons and public folders are used by client code only
it makes more sense to put both under the client folder

locales, examples and schemas can be used by client and server code
so they stay on the root of the project structure

# [1.3.0](https://github.com/AllanOricil/node-red-vue-template/compare/v1.2.1...v1.3.0) (2025-07-01)


### Bug Fixes

* move close to base Node class ([d861d1a](https://github.com/AllanOricil/node-red-vue-template/commit/d861d1af252459ca7165d771248ad2cf6b323548))
* remove g property from config node schema ([21cadb5](https://github.com/AllanOricil/node-red-vue-template/commit/21cadb5f3c4c7cd8fd990389ec692179a9f76906))
* remove users from config node at runtime ([49cc227](https://github.com/AllanOricil/node-red-vue-template/commit/49cc22780fbac3ad203dda1e518a7f8057968ee0))
* set default value for _users to fix validation issues ([6d3d858](https://github.com/AllanOricil/node-red-vue-template/commit/6d3d858f8fd9ecf84b0d31c395c2a8d2bea444f6))
* tsc:server errors ([3a23faf](https://github.com/AllanOricil/node-red-vue-template/commit/3a23faf39613ff80c2c5d9e69d5df41c1bd28b7c))


### Features

* add onClose to config nodes ([621906b](https://github.com/AllanOricil/node-red-vue-template/commit/621906be94da0ce459f887e030d7c3ae51e9c67a))


### Reverts

* fix: remove users from config node at runtime ([7c35092](https://github.com/AllanOricil/node-red-vue-template/commit/7c35092276fdd45cde5bcca47ae6d7342402e430))

## [1.2.1](https://github.com/AllanOricil/node-red-vue-template/compare/v1.2.0...v1.2.1) (2025-06-02)


### Bug Fixes

* ensure language, stateId and value are updated with the latest value when editing and editor input ([1c3fdc8](https://github.com/AllanOricil/node-red-vue-template/commit/1c3fdc83c016b897faf0f39c8157f1ab67fe06d3))

# [1.2.0](https://github.com/AllanOricil/node-red-vue-template/compare/v1.1.0...v1.2.0) (2025-06-02)


### Bug Fixes

* bundle server to esm >= node 22 ([46bc958](https://github.com/AllanOricil/node-red-vue-template/commit/46bc95884aad88ee3545bcb5011707ed82496055))
* correct object type check to handle null values ([809d292](https://github.com/AllanOricil/node-red-vue-template/commit/809d29258dedb60555b2c5331648a3bccd340664))
* no-prototype-builtins rule ([e018d14](https://github.com/AllanOricil/node-red-vue-template/commit/e018d14a64a44dc40b69c419f2dbeb336f5fd705))
* set default values for props in core components ([02bf411](https://github.com/AllanOricil/node-red-vue-template/commit/02bf411c0c4239e7efc2c7a3bccb3523213b6718))


### Features

* add expand button to node-red-editor-input ([888b723](https://github.com/AllanOricil/node-red-vue-template/commit/888b7239bf0c724babba62a0a81fa9e5faeb9d8f))
* move client, server and schemas folder to root ([9fbda99](https://github.com/AllanOricil/node-red-vue-template/commit/9fbda992d01e3adbd78d2e2066023e07693a2e56))


### Reverts

* fix: bundle server to esm >= node 22 ([5357217](https://github.com/AllanOricil/node-red-vue-template/commit/535721713a1d867daea34b698cd60db7c0832cd2))

# [1.1.0](https://github.com/AllanOricil/node-red-vue-template/compare/v1.0.3...v1.1.0) (2025-05-24)


### Features

* add esbuild to build the server part of the node ([7b514fe](https://github.com/AllanOricil/node-red-vue-template/commit/7b514fe2fea89dbde503c01820143cf964180b00))

## [1.0.3](https://github.com/AllanOricil/node-red-vue-template/compare/v1.0.2...v1.0.3) (2025-05-22)


### Bug Fixes

* fix typo that accidentaly removed the examples folder from the distro ([bc9c489](https://github.com/AllanOricil/node-red-vue-template/commit/bc9c489a911477280a93a5cf2bdb91aa7f547f17))

## [1.0.2](https://github.com/AllanOricil/node-red-vue-template/compare/v1.0.1...v1.0.2) (2025-05-22)


### Bug Fixes

* labels and docs can be processed independently and some static files/folders will only be copied to distro if they exist ([96f8194](https://github.com/AllanOricil/node-red-vue-template/commit/96f8194812c5c81082249939dcc1462e5d8b30f9))

## [1.0.1](https://github.com/AllanOricil/node-red-vue-template/compare/v1.0.0...v1.0.1) (2025-05-22)


### Bug Fixes

* configure semantic release to upload zipped dist as the artifact for a github release ([36d801c](https://github.com/AllanOricil/node-red-vue-template/commit/36d801c500f2f85130678785be3730b603b47db9))

# 1.0.0 (2025-05-22)


### Features

* add compile- and runtime-safe Node-RED nodes using Vue 3 and TypeScript ([8ed02bd](https://github.com/AllanOricil/node-red-vue-template/commit/8ed02bdfe61d1720be71f5c71c5da2ce5ea5bf8a))
