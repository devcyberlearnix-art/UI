const eps = require('./extracted_inventory.json');
eps.forEach((e, idx) => {
  console.log(`${idx + 1}. [${e.service}] ${e.method} ${e.path} (${e.name}) - Auth: ${e.auth} - Status: ${e.status}`);
});
