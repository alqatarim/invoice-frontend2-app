// Run this in browser console to clear theme storage
console.log('Clearing theme storage...');

// Clear localStorage
const keys = Object.keys(localStorage);
keys.forEach(key => {
  if (key.includes('materio') || key.includes('mui')) {
    console.log('Removing localStorage key:', key);
    localStorage.removeItem(key);
  }
});

// Clear sessionStorage
const sessionKeys = Object.keys(sessionStorage);
sessionKeys.forEach(key => {
  if (key.includes('materio') || key.includes('mui')) {
    console.log('Removing sessionStorage key:', key);
    sessionStorage.removeItem(key);
  }
});

// Clear cookies
document.cookie.split(";").forEach(function(c) { 
  if (c.includes('materio')) {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  }
});

console.log('Theme storage cleared. Please refresh the page.');