//This script works with @wdio/cucumber-framework from 8.0.0
// Implementation is based on https://www.npmjs.com/package/wdio-rerun-service v2.0.7

'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const minimist_1 = __importDefault(require('minimist'));
const promises_1 = require('node:fs/promises');
const node_path_1 = require('node:path');
const node_process_1 = require('node:process');
const uuid_1 = require('uuid');
class RerunService {
  constructor(options = {}) {
    const {
      ignoredTags,
      rerunDataDir,
      rerunScriptPath,
      commandPrefix,
      customParameters,
    } = options;
    this.nonPassingItems = [];
    this.serviceWorkerId = '';
    this.ignoredTags = ignoredTags ?? [];
    this.rerunDataDir = rerunDataDir ?? './logs/rerun';
    this.rerunScriptPath =
      rerunScriptPath ??
      (node_process_1.platform === 'win32' ? 'rerun.bat' : 'rerun.sh');
    this.commandPrefix = commandPrefix ?? '';
    this.customParameters = customParameters ?? '';
    this.specFile = '';
    this.disabled = node_process_1.env['DISABLE_RERUN'] === 'true';
  }
  async before(_capabilities, specs) {
    if (this.disabled) {
      return;
    }
    this.specFile = specs[0] ?? '';
    // console.log(`Re-run service is activated. Data directory: ${this.rerunDataDir}`);
    await (0, promises_1.mkdir)(this.rerunDataDir, { recursive: true });
    this.serviceWorkerId = (0, uuid_1.v4)();
  }
  afterTest(_test, _context, results) {
    if (this.disabled) {
      return;
    }
    const { passed } = results;
    const config = browser.options;
    if (passed || config.framework === 'cucumber') {
      return;
    }
    // console.log(`Re-run service is inspecting non-passing test.`);
    // console.log(`Test location: ${this.specFile}`);
    const error = results.error;
    if (error?.message) {
      this.nonPassingItems.push({
        location: this.specFile,
        failure: error.message,
      });
    } else {
      // console.log("The non-passing test did not contain any error message, it could not be added for re-run.")
    }
  }
  // Executed after a Cucumber scenario ends.
  afterScenario(world) {
    if (this.disabled) {
      return;
    }
    const config = browser.options;
    const status = world.result?.status;
    if (
      config.framework !== 'cucumber' ||
      status === 'PASSED' ||
      status === 'SKIPPED'
    ) {
      return;
    }
    const scenario = world.gherkinDocument.feature?.children.filter((child) =>
      child.scenario
        ? world.pickle.astNodeIds.includes(child.scenario.id.toString())
        : false,
    )?.[0]?.scenario;
    let scenarioLineNumber = scenario?.location.line ?? 0;
    if (scenario && scenario.examples.length > 0) {
      let exampleLineNumber = 0;
      scenario.examples.find((example) =>
        example.tableBody.find((row) => {
          if (row.id === world.pickle.astNodeIds[1]) {
            exampleLineNumber = row.location.line;
            return true;
          }
          return false;
        }),
      );
      scenarioLineNumber = exampleLineNumber;
    }
    const scenarioLocation = `${world.pickle.uri}:${scenarioLineNumber}`;
    const tagsList = world.pickle.tags.map((tag) => tag.name);
    if (
      !Array.isArray(this.ignoredTags) ||
      !tagsList.some((ignoredTag) => this.ignoredTags.includes(ignoredTag))
    ) {
      this.nonPassingItems.push({
        location: scenarioLocation,
        failure: world.result?.message,
      });
    }
  }
  async after() {
    if (this.disabled) {
      return;
    }
    if (this.nonPassingItems.length === 0) {
      return; // console.log('Re-run service did not detect any non-passing scenarios or tests.');
    }
    await (0, promises_1.writeFile)(
      (0, node_path_1.join)(
        this.rerunDataDir,
        `rerun-${this.serviceWorkerId}.json`,
      ),
      JSON.stringify(this.nonPassingItems),
    );
  }
  async onComplete() {
    if (this.disabled) {
      return;
    }
    try {
      const files = await (0, promises_1.readdir)(this.rerunDataDir);
      const rerunFiles = files.filter((file) => file.endsWith('.json'));
      if (rerunFiles.length === 0) {
        return;
      }
      const parsedArgs = (0, minimist_1.default)(node_process_1.argv.slice(2));
      const args = parsedArgs._[0] ? parsedArgs._[0] + ' ' : '';
      const prefix = this.commandPrefix ? this.commandPrefix + ' ' : '';
      const disableRerun =
        node_process_1.platform === 'win32'
          ? 'set DISABLE_RERUN=true &&'
          : 'DISABLE_RERUN=true';
      let rerunCommand = `npx wdio ${args}${this.customParameters}`;
      const failureLocations = new Set();
      for (const file of rerunFiles) {
        const json = JSON.parse(
          await (0, promises_1.readFile)(
            (0, node_path_1.join)(this.rerunDataDir, file),
            'utf8',
          ),
        );
        json.forEach((failure) => {
          failureLocations.add(failure.location.replace(/\\/g, '/'));
        });
      }
      failureLocations.forEach((failureLocation) => {
        rerunCommand += ` --spec=${failureLocation}`;
      });
      console.log('??????????????????????????: ' + rerunCommand);
      await (0, promises_1.writeFile)(this.rerunScriptPath, rerunCommand, {
        mode: 0o755,
      });
      // console.log(`Re-run script has been generated @ ${this.rerunScriptPath}`);
    } catch (err) {
      // console.log(`Re-run service failed to generate re-run script: ${err}`);
    }
  }
}
module.exports = RerunService;
