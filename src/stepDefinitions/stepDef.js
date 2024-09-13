import { Given, When, Then } from '@wdio/cucumber-framework';

Given('some test step', async function () {
    console.log('Step 1');
});

Given('some other test step', async function () {
    console.log('Step 2');
});