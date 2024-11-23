const { execSync } = require('child_process');
const depcheck = require('depcheck');

const options = {
  ignoreBinPackage: false, // Ignore the packages with bin entry
  skipMissing: false, // Skip calculation of missing dependencies
  ignoreDirs: [
    'sandbox',
    'dist',
    'bower_components'
  ], // These directories will be ignored
  ignoreMatches: [
    'grunt-*'
  ] // Ignore dependencies that match these globs
};

depcheck(process.cwd(), options, (unused) => {
  const { dependencies, devDependencies } = unused;

  if (dependencies.length === 0 && devDependencies.length === 0) {
    console.log('No unused dependencies found.');
    return;
  }

  const allUnused = [...dependencies, ...devDependencies];
  console.log('Removing unused dependencies:', allUnused);

  allUnused.forEach(dep => {
    execSync(`npm uninstall ${dep}`, { stdio: 'inherit' });
  });

  console.log('Unused dependencies removed.');
});
