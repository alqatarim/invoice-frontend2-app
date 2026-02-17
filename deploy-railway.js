#!/usr/bin/env node
/**
 * Deploy Frontend to Railway
 * 1. Checks for existing Railway deployments
 * 2. Kills them if any exist
 * 3. Deploys the latest frontend code
 *
 * Requires: Railway CLI (npm i -g @railway/cli) and railway link
 * Usage: npm run deploy:railway
 *        npm run deploy:railway -- "Custom deploy message"
 */

const { execSync } = require('child_process');
const SERVICE_NAME = 'invoice-frontend-app';

function run(cmd, options = {}) {
  return execSync(cmd, {
    encoding: 'utf8',
    stdio: options.silent ? 'pipe' : 'inherit',
    shell: true,
    ...options,
  });
}

function main() {
  console.log('=== Railway Frontend Deploy ===\n');

  try {
    // 1. Check for deployments
    console.log('1. Checking for existing deployments...');
    try {
      const listOutput = run(
        `railway deployment list --service ${SERVICE_NAME} --limit 5 --json`,
        { silent: true }
      );
      const deployments = JSON.parse(listOutput.trim());
      const count = Array.isArray(deployments) ? deployments.length : 0;
      if (count > 0) {
        console.log(`   Found ${count} deployment(s), will remove before deploy.`);
      } else {
        console.log('   No active deployments found.');
      }
    } catch (e) {
      console.log('   Could not list (may have no deployments), proceeding...');
    }

    // 2. Kill any existing deployment
    console.log('\n2. Removing current deployment...');
    try {
      run(`railway down --service ${SERVICE_NAME} -y`);
      console.log('   Deployment removed.');
    } catch (e) {
      if (e.message && /no deployment|not found/i.test(e.message)) {
        console.log('   Nothing to remove.');
      } else {
        console.log('   Proceeding (down may have completed)...');
      }
    }

    // 3. Deploy latest code
    console.log('\n3. Deploying latest frontend code...');
    const deployMsg = process.argv.slice(2).join(' ') || 'Deploy frontend';
    run(`railway up --detach -m "${deployMsg}" --service ${SERVICE_NAME}`);
    console.log('\n=== Deploy initiated successfully ===');
  } catch (err) {
    console.error('\nDeploy failed:', err.message);
    process.exit(1);
  }
}

main();
