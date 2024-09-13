# Lely End2End test technical documentation

## A detailed log of almost all of the major architectural decisions that have been made can be found [here](./docs/adr/index.md)

## Table of contents:

- [Introduction](#introduction)
- [Setup instructions](#setup-instructions)
- [Project structure](#project-structure)
- [Application structure](./docs/adr/img/lelyAppStructure.png)
- [Why WebdriverIO](#why-webdriverio)
- [Available scripts](#available-scripts)
- [Browser configuration](#browser-configuration)
- [How to debug a test](#how-to-debug-a-test)
- [BDD approach](#bdd-approach)


## Introduction

> The goal of this document is to provide detailed information on some of the architectural aspects and decisions behind the E2E testing framwrork deisgned for Lely.

## Setup instructions

> Install Node (this will also install npm which is needed for the next step)
> Open a terminal from the project terminal and execute `npm install`.  


## Project structure

|			|                   |                   |
| --------- | ----------------- | ----------------- |
| AppBDDs/	|                   |                   |
|			| .babelrc          |                   |
|			| .eslintignore     |                   |
|			| .eslintrc         |                   |
|			| .gitignore        |                   |
|			| README.md         |                   |
|			| package_lock.json |                   |
|			| package.json      |                   |
|			| wdio.conf.js	    |                   |
|			| allure-report/    |                   |
|			| docs/             |                   |
|			| node_modules/     |                   |
|			| src/              |                   |
|			| 	                | features/         |
|			| 	                | pageObjects/      |
|			| 	                | reports/	        |
|			| 	                | stepDefinitions/  |

## Why WebdriverIO

[More information on that topic here](./docs/adr/0001-why-wdio.md)

## Available Scripts

### `runTestsWin.ps1`

> This script is located in the root folder and it can be run in powershell.

> The script executes all tests with retries as they are executed in gitlab. At the end of the test run allure report is generated with the results of the tests.

> The script only runs tests against the local environment and requires to have set up in advance a local environment with running FE and BE.

### `npm run test:chrome`

> Executes the entire test suite of E2E tests on chrome browser.

### `npm run test:firefox`

> Executes the entire test suite of E2E tests on firefox browser.

### `npm run testSingleFeature:chrome *.feature`

> Executes single feature file on chrome browser.

### `npm run testSingleFeature:firefox *.feature`

> Executes single feature file on firefox browser.

### `npm run allure-report`

> Generates and runs allure report from the last test run.

### `npm run lint`

> Runs ESLint report.

### `npm run selenium-start`

> Starts selenium server manually (for troubleshooting).

## Browser configuration
[More information on that topic here](./docs/adr/0007-browser-configuration.md)

## How to debug a test
[More information on that topic here](./docs/adr/0004-how-to-debug.md)

## BDD approach
[More information on that topic here](./docs/adr/0011-BDD-approach.md)

