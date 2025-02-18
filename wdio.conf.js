let instances = 15;
if (
  process.env.CONTEXT != 'PRD' &&
  process.env.CONTEXT != 'STG' &&
  process.env.CONTEXT != 'DEV'
) {
  process.env.CONTEXT = 'LOCAL';
  instances = 7;
}
if (process.env.USE_BROWSER != 'firefox') {
  process.env.USE_BROWSER = 'chrome';
}

console.log('Executing tests on browser: ' + process.env.USE_BROWSER);
console.log('Tests are running on env: ' + process.env.CONTEXT);

if (process.env.CONTEXT == 'LOCAL') {
  console.log('LOCAL env is set on https://localhost:3000/');
}

const rerun = require('./rerunWDIO-v8');

const { v5: uuidv5 } = require('uuid');
const drivers = {
  chrome: { version: 'latest' }, // https://chromedriver.chromium.org/
  firefox: { version: 'latest' }, // https://github.com/mozilla/geckodriver/releases
};

// Set browser capabilities
let capabilitiesFirefox = [
  {
    maxInstances: 1,
    browserName: 'firefox',
    'moz:firefoxOptions': {
      // flag to activate Firefox headless mode (see https://github.com/mozilla/geckodriver/blob/master/README.md#firefox-capabilities for more details about moz:firefoxOptions)
      args: ['--headless', '--width=1920', '--height=1080'],
    },
  },
];
let capabilitiesChrome = [
  {
    maxInstances: instances,
    browserName: 'chrome',
    'goog:chromeOptions': {
      // run in headless mode, to run in UI uncommnet the bellow line
      args: [
        '--headless=new',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1920,1080',
        '--disable-web-security',
        '--no-sandbox',
        '--ignore-certificate-errors',
      ],
    },
  },
];
// Set browser capabilities from environment varaiable
let capabilitiesGeneral;
if (process.env.USE_BROWSER == 'firefox') {
  capabilitiesGeneral = capabilitiesFirefox;
} else {
  capabilitiesGeneral = capabilitiesChrome;
}

//set timeout time
let timeoutValue = 50000;

// Set prd|stg env
let contextUrl;
let retry = 0;
process.env.contextUrl = contextUrl;

let envRules;
if (process.env.CONTEXT == 'STG' || process.env.CONTEXT == 'DEV') {
  envRules = 'not @not_stg';
  if (process.env.USE_BROWSER == 'firefox') {
    envRules = 'not @not_stg and @firefox';
  }
} else if (process.env.CONTEXT == 'PRD') {
  envRules = '@prod';
  if (process.env.USE_BROWSER == 'firefox') {
    envRules = '@prod and @firefox';
  }
} else if (process.env.CONTEXT == 'LOCAL') {
  envRules = 'not @not_local';
  if (process.env.USE_BROWSER == 'firefox') {
    envRules = 'not @not_local and @firefox';
  }
}

let testPath;
if (process.env.TESTS == 'RUN1') {
  testPath = './src/features/testRun1/*.feature';
} else if (process.env.TESTS == 'RUN2') {
  testPath = './src/features/testRun2/*.feature';
} else if (process.env.TESTS == 'RUN3') {
  testPath = './src/features/testRun3/*.feature';
} else if (process.env.TESTS == 'RUN4') {
  testPath = './src/features/testRun4/*.feature';
} else {
  testPath = './src/features/*/*.feature';
}

console.log('Current test path is: ' + testPath);

let serviceParam;
if (
  (process.env.USE_BROWSER == 'chrome' && process.env.CONTEXT == 'STG') ||
  (process.env.USE_BROWSER == 'chrome' && process.env.CONTEXT == 'PRD') ||
  (process.env.USE_BROWSER == 'chrome' && process.env.CONTEXT == 'DEV')
) {
  serviceParam = [
    'chromedriver',
    {
      chromedriverCustomPath: '/usr/local/bin/chromedriver',
    },
    'selenium-standalone',
    {
      logPath: 'logs',
      installArgs: { drivers }, // drivers to install
      args: { drivers }, // drivers to use
    },
  ];
} else if (
  (process.env.USE_BROWSER == 'firefox' && process.env.CONTEXT == 'STG') ||
  (process.env.USE_BROWSER == 'firefox' && process.env.CONTEXT == 'PRD') ||
  (process.env.USE_BROWSER == 'firefox' && process.env.CONTEXT == 'DEV')
) {
  serviceParam = [
    'geckodriver',
    {
      customGeckoDriverPath: '/usr/local/bin/geckodriver',
    },
    'selenium-standalone',
    {
      logPath: 'logs',
      installArgs: { drivers }, // drivers to install
      args: { drivers }, // drivers to use
    },
  ];
}

let serviceRunner;
if (process.env.CONTEXT == 'LOCAL') {
  serviceRunner = [[rerun]];
} else {
  serviceRunner = [serviceParam, [rerun]];
}

exports.config = {
  //
  // ====================
  // Runner Configuration
  // ====================
  //
  //
  // ==================
  // Specify Test Files
  // ==================
  // Define which test specs should run. The pattern is relative to the directory
  // from which `wdio` was called.
  //
  // The specs are defined as an array of spec files (optionally using wildcards
  // that will be expanded). The test for each spec file will be run in a separate
  // worker process. In order to have a group of spec files run in the same worker
  // process simply enclose them in an array within the specs array.
  //
  // If you are calling `wdio` from an NPM script (see https://docs.npmjs.com/cli/run-script),
  // then the current working directory is where your `package.json` resides, so `wdio`
  // will be called from there.
  //

  specs: [testPath],
  // Patterns to exclude.
  exclude: [
    // 'path/to/excluded/files'
  ],
  //
  // ============
  // Capabilities
  // ============
  // Define your capabilities here. WebdriverIO can run multiple capabilities at the same
  // time. Depending on the number of capabilities, WebdriverIO launches several test
  // sessions. Within your capabilities you can overwrite the spec and exclude options in
  // order to group specific specs to a specific capability.
  //
  // First, you can define how many instances should be started at the same time. Let's
  // say you have 3 different capabilities (Chrome, Firefox, and Safari) and you have
  // set maxInstances to 1; wdio will spawn 3 processes. Therefore, if you have 10 spec
  // files and you set maxInstances to 10, all spec files will get tested at the same time
  // and 30 processes will get spawned. The property handles how many capabilities
  // from the same test should run tests.
  //
  maxInstances: 15,
  //
  // If you have trouble getting all important capabilities together, check out the
  // Sauce Labs platform configurator - a great tool to configure your capabilities:
  // https://docs.saucelabs.com/reference/platforms-configurator
  //
  capabilities: capabilitiesGeneral,
  //
  // ===================
  // Test Configurations
  // ===================
  // Define all options that are relevant for the WebdriverIO instance here
  //
  // Level of logging verbosity: trace | debug | info | warn | error | silent
  logLevel: 'warn',
  //
  // Set specific log levels per logger
  // loggers:
  // - webdriver, webdriverio
  // - @wdio/browserstack-service, @wdio/devtools-service, @wdio/sauce-service
  // - @wdio/mocha-framework, @wdio/jasmine-framework
  // - @wdio/local-runner
  // - @wdio/sumologic-reporter
  // - @wdio/cli, @wdio/config, @wdio/utils
  // Level of logging verbosity: trace | debug | info | warn | error | silent
  // logLevels: {
  //     webdriver: 'trace',
  //     '@wdio/local-runner': 'trace'
  // },
  //
  // If you only want to run your tests until a specific amount of tests have failed use
  // bail (default is 0 - don't bail, run all tests).
  bail: 0,
  //
  // Set a base URL in order to shorten url command calls. If your `url` parameter starts
  // with `/`, the base url gets prepended, not including the path portion of your baseUrl.
  // If your `url` parameter starts without a scheme or `/` (like `some/path`), the base url
  // gets prepended directly.
  baseUrl: contextUrl,
  //
  // Default timeout for all waitFor* commands.
  waitforTimeout: 20000,
  //
  // Default timeout in milliseconds for request
  // if browser driver or grid doesn't send response
  connectionRetryTimeout: 90000,
  //
  // Default request retries count
  connectionRetryCount: 3,
  //
  // Test runner services
  // Services take over a specific job you don't want to take care of. They enhance
  // your test setup with almost no effort. Unlike plugins, they don't add new
  // commands. Instead, they hook themselves up into the test process.
  services: serviceRunner,
  // Framework you want to run your specs with.
  // The following are supported: Mocha, Jasmine, and Cucumber
  // see also: https://webdriver.io/docs/frameworks
  //
  // Make sure you have the wdio adapter package for the specific framework installed
  // before running any tests.
  framework: 'cucumber',
  //
  // The number of times to retry the entire specfile when it fails as a whole
  // specFileRetries: 1,
  //
  // Delay in seconds between the spec file retry attempts
  // specFileRetriesDelay: 0,
  //
  // Whether or not retried specfiles should be retried immediately or deferred to the end of the queue
  // specFileRetriesDeferred: false,
  //
  // Test reporter for stdout.
  // The only one supported by default is 'dot'
  // see also: https://webdriver.io/docs/dot-reporter
  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: './src/reports/allure-results/',
        disableWebdriverStepsReporting: false,
        disableWebdriverScreenshotsReporting: false,
      },
    ],
  ],

  //
  // If you are using Cucumber you need to specify the location of your step definitions.
  cucumberOpts: {
    paths: ['./src/features/**/*.feature'],
    require: ['./src/stepDefinitions/**/*.js'], // <string[]> (file/dir) require files before executing features
    backtrace: false, // <boolean> show full backtrace for errors
    requireModule: [], // <string[]> ("extension:module") require files with the given EXTENSION after requiring MODULE (repeatable)
    dryRun: false, // <boolean> invoke formatters without executing steps
    failFast: false, // <boolean> abort the run on first failure
    format: ['pretty'], // <string[]> (type[:path]) specify the output format, optionally supply PATH to redirect formatter output (repeatable)
    colors: true, // <boolean> disable colors in formatter output
    snippets: true, // <boolean> hide step definition snippets for pending steps
    source: true, // <boolean> hide source uris
    profile: [], // <string[]> (name) specify the profile to use
    strict: false, // <boolean> fail if there are any undefined or pending steps
    tags: envRules, // <string> (expression) only execute the features or scenarios with tags matching the expression
    timeout: timeoutValue, // <number> timeout for step definitions
    ignoreUndefinedDefinitions: false, // <boolean> Enable this config to treat undefined definitions as warnings.
  },

  //
  // =====
  // Hooks
  // =====
  // WebdriverIO provides several hooks you can use to interfere with the test process in order to enhance
  // it and to build services around it. You can either apply a single function or an array of
  // methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
  // resolved to continue.
  /**
   * Gets executed once before all workers get launched.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   */
  // onPrepare: function (config, capabilities) {
  // },
  /**
   * Gets executed before a worker process is spawned and can be used to initialise specific service
   * for that worker as well as modify runtime environments in an async fashion.
   * @param  {String} cid      capability id (e.g 0-0)
   * @param  {[type]} caps     object containing capabilities for session that will be spawn in the worker
   * @param  {[type]} specs    specs to be run in the worker process
   * @param  {[type]} args     object that will be merged with the main configuration once worker is initialised
   * @param  {[type]} execArgv list of string arguments passed to the worker process
   */
  // onWorkerStart: function (cid, caps, specs, args, execArgv) {
  // },
  /**
   * Gets executed just before initialising the webdriver session and test framework. It allows you
   * to manipulate configurations depending on the capability or spec.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that are to be run
   */
  // beforeSession: function (config, capabilities, specs) {
  // },
  /**
   * Gets executed before test execution begins. At this point you can access to all global
   * variables like `browser`. It is the perfect place to define custom commands.
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs        List of spec file paths that are to be run
   * @param {Object}         browser      instance of created browser/device session
   */
  // before: function (capabilities, specs) {
  // },
  before: function (capabilities, specs) {
    require('@babel/register');
  },
  /**
   * Runs before a WebdriverIO command gets executed.
   * @param {String} commandName hook command name
   * @param {Array} args arguments that command would receive
   */
  // beforeCommand: function (commandName, args) {
  // },
  /**
   * Cucumber Hooks
   *
   * Runs before a Cucumber Feature.
   * @param {String}                   uri      path to feature file
   * @param {GherkinDocument.IFeature} feature  Cucumber feature object
   */
  // beforeFeature: function (uri, feature) {
  // },
  /**
   *
   * Runs before a Cucumber Scenario.
   * @param {ITestCaseHookParameter} world world object containing information on pickle and test step
   */
  // beforeScenario: function (world) {
  // },
  /**
   *
   * Runs before a Cucumber Step.
   * @param {Pickle.IPickleStep} step     step data
   * @param {IPickle}            scenario scenario pickle
   */
  // beforeStep: function (step, scenario) {
  // },
  /**
   *
   * Runs after a Cucumber Step.
   * @param {Pickle.IPickleStep} step     step data
   * @param {IPickle}            scenario scenario pickle
   * @param {Object}             result   results object containing scenario results
   * @param {boolean}            result.passed   true if scenario has passed
   * @param {string}             result.error    error stack if scenario failed
   * @param {number}             result.duration duration of scenario in milliseconds
   */
  // afterStep: function (step, scenario, result) {
  // },
  // Take screenshot of failed tests
  // afterStep: function (step, scenario, result) {
  //     if (!result.passed) {
  //         console.log('there is an error!')
  //         console.log(step.step.scenario.name)
  //         console.log(step.step.step.location)
  //         let random = uuidv5(`${Date.now()}`, '6ba7b810-9dad-11d1-80b4-00c04fd430c8');
  //         console.log('The screenshot is: '+random+'.png');
  //         browser.saveScreenshot("../AppBDDs/logs/"+random+".png");
  //     }
  // },
  /**
   *
   * Runs before a Cucumber Scenario.
   * @param {ITestCaseHookParameter} world  world object containing information on pickle and test step
   * @param {Object}                 result results object containing scenario results
   * @param {boolean}                result.passed   true if scenario has passed
   * @param {string}                 result.error    error stack if scenario failed
   * @param {number}                 result.duration duration of scenario in milliseconds
   */
  // afterScenario: function (world, result) {
  // },
  async afterScenario() {
    await browser.reloadSession();
  },
  /**
   *
   * Runs after a Cucumber Feature.
   * @param {String}                   uri      path to feature file
   * @param {GherkinDocument.IFeature} feature  Cucumber feature object
   */
  // afterFeature: function (uri, feature) {
  // },

  /**
   * Runs after a WebdriverIO command gets executed
   * @param {String} commandName hook command name
   * @param {Array} args arguments that command would receive
   * @param {Number} result 0 - command success, 1 - command error
   * @param {Object} error error object if any
   */
  // afterCommand: function (commandName, args, result, error) {
  // },
  /**
   * Gets executed after all tests are done. You still have access to all global variables from
   * the test.
   * @param {Number} result 0 - test pass, 1 - test fail
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  // after: function (result, capabilities, specs) {
  // },
  /**
   * Gets executed right after terminating the webdriver session.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  // afterSession: function (config, capabilities, specs) {
  // },
  /**
   * Gets executed after all workers got shut down and the process is about to exit. An error
   * thrown in the onComplete hook will result in the test run failing.
   * @param {Object} exitCode 0 - success, 1 - fail
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {<Object>} results object containing test results
   */
  // onComplete: function(exitCode, config, capabilities, results) {
  // },
  /**
   * Gets executed when a refresh happens.
   * @param {String} oldSessionId session ID of the old session
   * @param {String} newSessionId session ID of the new session
   */
  //onReload: function(oldSessionId, newSessionId) {
  //}
};
