const fs = require('fs');
const { resolve } = require('path');
const routesFolder = resolve('./routes');

function camelCaseToDash(myStr) {
  return myStr.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

// HELPER FUNCTION TO GET ALL ROUTES PATH
const getAllRoutesPath = function () {
  const allRoutesPath = [];

  fs.readdirSync(routesFolder).forEach(file => {
    const fullPath = `${routesFolder}/${file}`;
    if (fs.existsSync(fullPath) && fullPath.endsWith('.route.js')) {
      allRoutesPath.push({
        fullPath: fullPath.replace('.js', ''),
        fileName: file.replace('.route.js', ''),
      });
    }
  });

  return allRoutesPath;
};

// MAIN FUNCTION TO REGISTER ALL ROUTES
const registerRoutes = function (expressInstance) {
  const allRoutesPath = getAllRoutesPath();
  // LOAD ALL NESTED ROUTES FILE
  for (const routeFile of allRoutesPath) {
    const router = require(routeFile.fullPath);
    if (routeFile.fileName === 'app') {
      expressInstance.use('/api', router);
    } else {
      expressInstance.use(
        `/api/${camelCaseToDash(routeFile.fileName)}`,
        router,
      );
    }
  }
};

module.exports = {
  registerRoutes,
};
