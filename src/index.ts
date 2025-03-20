import express from 'express';
import proxy from = 'express-http-proxy';

import {setupAcmeRoutes} from './acme.ts';
import credentials from './credentials.ts';


const app_insecure = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
//app_insecure.get('/', (req, res) => {
//  res.send('hello world');
//});
setupAcmeRoutes(app_insecure);
app_insecure.listen(port);

console.log('setup acme routes?');

let app;
if (process.env.PORT_SECURE) {
  app = express();
  const port = process.env.PORT_SECURE ? parseInt(process.env.PORT_SECURE) : 3001;
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  });
  https.createServer({
      key: privateKey,
      cert: certificate
  }, app).listen(port);
} else {
  app = app_insecure;
}
console.log('setting up static routes');
app.use(express.static('../homepage-frontend/dist'));

function dropPermissions(user, group) {
  try {
    if (process.getuid() === 0) {
      process.setgid(group);
      process.setuid(user);
      console.log(`Process permissions dropped to user: ${user}, group: ${group}`);
    } else {
      console.log("Script not started with root privileges, cannot drop permissions.");
    }
  } catch (err) {
    console.error("Failed to drop permissions:", err);
    process.exit(1);
  }
}

if (credentials.drop_permissions) {
  const id = credentials.drop_permissions;
  dropPermissions(id,id);
}

if (credentials.robogen_proxy) {
  app.use('/robogen', proxy(`http://localhost:${credentials.robogen_proxy}/robogen`));
}

