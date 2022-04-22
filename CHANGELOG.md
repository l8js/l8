# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.5.6](https://github.com/l8js/l8/compare/v0.5.5...v0.5.6) (2022-04-22)


### Bug Fixes

* l8.load does not throw error if resource was not found ([49bf801](https://github.com/l8js/l8/commit/49bf8011bf17b498bd697ec9e03a5fec8b44a5ee)), closes [l8js/l8#31](https://github.com/l8js/l8/issues/31)

### [0.5.5](https://github.com/l8js/l8/compare/v0.5.4...v0.5.5) (2021-11-19)


### Bug Fixes

* add make() of esix StringTemplate to exports ([f8e25d4](https://github.com/l8js/l8/commit/f8e25d4e8188efc85e0bcdda1ce8d6cfff227e94)), closes [l8js/l8#25](https://github.com/l8js/l8/issues/25)
* esix template-variables must not contain hyphens ([a7a165c](https://github.com/l8js/l8/commit/a7a165c6d974a16799d76c02b407dd219fbe578d)), closes [l8js/l8#26](https://github.com/l8js/l8/issues/26)
* read out response text to prevent "failed to load" ([2a5a0ef](https://github.com/l8js/l8/commit/2a5a0eff16467906b5f342c0e968c83654bf7c92)), closes [l8js/l8#24](https://github.com/l8js/l8/issues/24)

### [0.5.4](https://github.com/l8js/l8/compare/v0.5.3...v0.5.4) (2021-11-09)


### Features

* add l8.obj() for creating objects based on null object ([144600a](https://github.com/l8js/l8/commit/144600a13d241adbaf0fca7ea1bd32888c7ab598))

### [0.5.3](https://github.com/l8js/l8/compare/v0.5.2...v0.5.3) (2021-10-14)


### Features

* add extract to array-module ([07ae577](https://github.com/l8js/l8/commit/07ae5773c0909c32845856f3ed29714584edbca6))


### Bug Fixes

* subsequent pre-commit hooks execute if the previous succeeds ([64ef822](https://github.com/l8js/l8/commit/64ef8220dcd627ac9df9240dac939b5e0a919e87))


### [0.5.2](https://github.com/l8js/l8/compare/v0.5.1...v0.5.2) (2021-10-07)

### [0.5.1](https://github.com/l8js/l8/compare/v0.5.0...v0.5.1) (2021-10-07)

## 0.5.0 (2021-10-06)

* - enhancement: added jest-fetch-mock for mocking fetch() ([185bdb4](https://github.com/l8js/l8/commit/185bdb4))
* - enhancement: added make() for StringTemplate ([9de8e4b](https://github.com/l8js/l8/commit/9de8e4b))
* - enhancement: added optional third argument to unify() for excluding specific patterns from unifyin ([73673d3](https://github.com/l8js/l8/commit/73673d3))
* - enhancement: added refactorings of transformer classes ([49ecf6f](https://github.com/l8js/l8/commit/49ecf6f))
* - enhancement: added testcase for unify ([31c4a5f](https://github.com/l8js/l8/commit/31c4a5f))
* - enhancement: added tests for core/request ([c4ad63f](https://github.com/l8js/l8/commit/c4ad63f))
* - enhancement: codeCoverage disabled ([c9abc36](https://github.com/l8js/l8/commit/c9abc36))
* - enhancement: refactored FileLoader into functional entities ([cc96fe8](https://github.com/l8js/l8/commit/cc96fe8))
* - enhancement: refactored transformers into functional entities ([3117fd5](https://github.com/l8js/l8/commit/3117fd5))
* - enhancement: updated docs ([3e2d359](https://github.com/l8js/l8/commit/3e2d359))
* - enhancement: updated module exports ([a6726e1](https://github.com/l8js/l8/commit/a6726e1))
* - fixed: fixed an issue where the target string would need sanitizing before considering tokens to i ([a4b5f65](https://github.com/l8js/l8/commit/a4b5f65))
* - fixed: fixed an issue where unify could be called with empty string for token to unify ([818e1be](https://github.com/l8js/l8/commit/818e1be))
* 0.5.0 ([2c6e3b0](https://github.com/l8js/l8/commit/2c6e3b0))



## <small>0.4.2 (2021-09-28)</small>

* - enhancement: minor housekeeping ([7448765](https://github.com/l8js/l8/commit/7448765))
* 0.4.2 ([cb1cd49](https://github.com/l8js/l8/commit/cb1cd49))



## <small>0.4.1 (2021-09-28)</small>

* - fixed: reverted script type ([b0f4849](https://github.com/l8js/l8/commit/b0f4849))
* 0.4.1 ([f18ba0f](https://github.com/l8js/l8/commit/f18ba0f))



## 0.4.0 (2021-09-28)

* - enhancement: workflow updates ([eb90a55](https://github.com/l8js/l8/commit/eb90a55))
* 0.4.0 ([d4a2732](https://github.com/l8js/l8/commit/d4a2732))



## <small>0.3.9 (2021-09-27)</small>

* - fixed: removed prepare in favor of postinstall ([830e82d](https://github.com/l8js/l8/commit/830e82d))
* 0.3.9 ([1bdcdff](https://github.com/l8js/l8/commit/1bdcdff))



## <small>0.3.8 (2021-09-27)</small>

* - enhancement: moved build to prepare ([fecf93a](https://github.com/l8js/l8/commit/fecf93a))
* 0.3.8 ([39e55d9](https://github.com/l8js/l8/commit/39e55d9))



## <small>0.3.7 (2021-09-27)</small>

* - enhancement: package updates ([3ea2417](https://github.com/l8js/l8/commit/3ea2417))
* 0.3.7 ([fae947e](https://github.com/l8js/l8/commit/fae947e))



## <small>0.3.6 (2021-09-27)</small>

* - enhancement: housekeeping ([97c53f9](https://github.com/l8js/l8/commit/97c53f9))
* 0.3.6 ([00b52c0](https://github.com/l8js/l8/commit/00b52c0))



## <small>0.3.5 (2021-09-27)</small>

* - fixed: regex fix for tags ([bfe2f32](https://github.com/l8js/l8/commit/bfe2f32))
* 0.3.5 ([00c6d5d](https://github.com/l8js/l8/commit/00c6d5d))



## <small>0.3.4 (2021-09-27)</small>

* - enhancement: package updates ([845ec5a](https://github.com/l8js/l8/commit/845ec5a))
* 0.3.3 ([6ec1029](https://github.com/l8js/l8/commit/6ec1029))
* 0.3.4 ([b073a43](https://github.com/l8js/l8/commit/b073a43))



## <small>0.3.3 (2021-09-26)</small>

* - draft: workflow changes ([5096cbc](https://github.com/l8js/l8/commit/5096cbc))
* - draft: workflow changes ([9628b97](https://github.com/l8js/l8/commit/9628b97))
* - enhancement: added "override" option to chain() ([47c2957](https://github.com/l8js/l8/commit/47c2957))
* - enhancement: added assign() to assign specific key/values from one object to another ([f507ecc](https://github.com/l8js/l8/commit/f507ecc))
* - enhancement: added code coverage and API doc generation, updated docs, removed aliases ([15fce25](https://github.com/l8js/l8/commit/15fce25))
* - enhancement: added dist postionstall, changed object.visit() so that the path is returned as an ar ([8550e17](https://github.com/l8js/l8/commit/8550e17))
* - enhancement: added findFirst() ([d627838](https://github.com/l8js/l8/commit/d627838))
* - enhancement: added isNot ([4a1c541](https://github.com/l8js/l8/commit/4a1c541))
* - enhancement: added isPlainObject/isRegExp ([19efd4f](https://github.com/l8js/l8/commit/19efd4f))
* - enhancement: functionality improvements ([ea0329b](https://github.com/l8js/l8/commit/ea0329b))
* - enhancement: housekeeping, added workflows ([9c3f623](https://github.com/l8js/l8/commit/9c3f623))
* - enhancement: migrated lib-cn_core-templates to l8.js ([d0ce63e](https://github.com/l8js/l8/commit/d0ce63e))
* - enhancement: migrated text.transformer.html from lib-cn_core into l8, minor file-naming changes ([27e644d](https://github.com/l8js/l8/commit/27e644d))
* - enhancement: minor code layout updates, removed doc fragments ([36cbb61](https://github.com/l8js/l8/commit/36cbb61))
* - enhancement: minor doc updates ([da91dfe](https://github.com/l8js/l8/commit/da91dfe))
* - enhancement: namespacing, file renaming, added various methods, FileLoader ([cadace3](https://github.com/l8js/l8/commit/cadace3))
* - enhancement: package organization changes, functionality tweaks ([be034fc](https://github.com/l8js/l8/commit/be034fc))
* - enhancement: package updates ([95152ae](https://github.com/l8js/l8/commit/95152ae))
* - enhancement: project setup enhancements ([3a8e0a0](https://github.com/l8js/l8/commit/3a8e0a0))
* - enhancement: removed webpack-dependencies, added rollup ([cdb23de](https://github.com/l8js/l8/commit/cdb23de))
* - enhancement: tagged 0.2.0 ([7f884c0](https://github.com/l8js/l8/commit/7f884c0))
* - enhancement: updated dependencies ([4ef8694](https://github.com/l8js/l8/commit/4ef8694))
* - enhancement: updated eslint config, added pre-commit hook ([9354703](https://github.com/l8js/l8/commit/9354703))
* - enhancement: workflow changes ([f050f2c](https://github.com/l8js/l8/commit/f050f2c))
* - enhancement: workflow enhancements ([4fe1c5f](https://github.com/l8js/l8/commit/4fe1c5f))
* - enhancement: workflow fixes ([7a5b495](https://github.com/l8js/l8/commit/7a5b495))
* - enhancement: workflow updates ([6ace67c](https://github.com/l8js/l8/commit/6ace67c))
* - enhancement: workflow updates ([377eb89](https://github.com/l8js/l8/commit/377eb89))
* - enhancement: workflow updates ([2900e3a](https://github.com/l8js/l8/commit/2900e3a))
* - enhancement: workflow updates ([babffeb](https://github.com/l8js/l8/commit/babffeb))
* - enhancement: workflow updates ([cec184f](https://github.com/l8js/l8/commit/cec184f))
* - enhancement: workflow updates ([c5de113](https://github.com/l8js/l8/commit/c5de113))
* - fixed: eslint fixes ([4a914bd](https://github.com/l8js/l8/commit/4a914bd))
* - fixed: fixed an issue where the tests for FileLoader would not properly consider asynchronous cont ([fe4be5c](https://github.com/l8js/l8/commit/fe4be5c))
* - fixed: version ([48b14be](https://github.com/l8js/l8/commit/48b14be))
* - fixed: workflow fixes ([58b601d](https://github.com/l8js/l8/commit/58b601d))
* - fixed: workflow fixes ([501b2dd](https://github.com/l8js/l8/commit/501b2dd))
* - fixed: workflow fixes ([980f80d](https://github.com/l8js/l8/commit/980f80d))
* - fixed: workflow fixes ([18a34c8](https://github.com/l8js/l8/commit/18a34c8))
* - fixed: workflow fixes ([65f2c73](https://github.com/l8js/l8/commit/65f2c73))
* - fixed: workflow fixes ([238a14e](https://github.com/l8js/l8/commit/238a14e))
* - fixed: yml fixes ([9e29edb](https://github.com/l8js/l8/commit/9e29edb))
* 0.2.6 ([720ca31](https://github.com/l8js/l8/commit/720ca31))
* 0.2.7 ([db4ede4](https://github.com/l8js/l8/commit/db4ede4))
* 0.2.8 ([6de083c](https://github.com/l8js/l8/commit/6de083c))
* 0.2.8 ([83fd7b7](https://github.com/l8js/l8/commit/83fd7b7))
* 0.2.9 ([67a752e](https://github.com/l8js/l8/commit/67a752e))
* 0.3.0 ([bd5bd60](https://github.com/l8js/l8/commit/bd5bd60))
* 0.3.1 ([f9e255c](https://github.com/l8js/l8/commit/f9e255c))
* 0.3.1 ([8701565](https://github.com/l8js/l8/commit/8701565))
* 0.3.2 ([765fdbe](https://github.com/l8js/l8/commit/765fdbe))
* 0.3.3 ([6a13468](https://github.com/l8js/l8/commit/6a13468))
* initial commit ([ebe37a5](https://github.com/l8js/l8/commit/ebe37a5))
* Initial commit ([840b261](https://github.com/l8js/l8/commit/840b261))
