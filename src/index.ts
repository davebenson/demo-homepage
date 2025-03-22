import express from 'express';
import proxy from 'express-http-proxy';

import {setupAcmeRoutes} from './acme.ts';
import credentials from './credentials.ts';
import https from 'node:https';
import httpProxy from 'http-proxy';
import fs from 'node:fs/promises';


const app_insecure = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
//app_insecure.get('/', (req, res) => {
//  res.send('hello world');
//});
setupAcmeRoutes(app_insecure);

function doListen(app, port)
{
  return new Promise((res,rej) => {
    app.listen(port, () => res());
  });
  app.on('connect', () => console.log(`got connection on port ${port}`));
}

await doListen(app_insecure, port);

console.log('setup acme routes?');

let app;
if (process.env.PORT_SECURE) {
  app = express();
  const port = process.env.PORT_SECURE ? parseInt(process.env.PORT_SECURE) : 3001;
  //app.listen(port, () => {
  //  console.log(`Example app listening on port ${port}`)
  //});
  await doListen(https.createServer({
      key: credentials.ssl_cert.key.replaceAll("\n","\r\n"),
      cert: credentials.ssl_cert.cert.replaceAll("\n","\r\n")
  }, app), port);
} else {
  app = app_insecure;
}
console.log('setting up static routes');
app.use(express.static('../homepage-frontend/dist'));

await fs.writeFile('server.pid', `${process.pid}\n`);

function dropPermissions(user, group) {
  try {
	  console.log(`dropPermissions: getuid=${process.getuid()}`);
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

if (credentials.robogen_proxy) {
  const target = `http://localhost:${credentials.robogen_proxy}`;
  const proxy = httpProxy.createProxyServer({ target  }); // See (†)
  app.use((req,res,next) => {
    if (req.host.toLowerCase() === 'robogen.thedavebenson.com') {
      proxy.web(req, res, {target});
      ///app.use('/robogen', proxy(`http://localhost:${credentials.robogen_proxy}/robogen`));
    } else {
      next();
    }
  });
}

if (credentials.drop_permissions) {
  const id = credentials.drop_permissions;
  dropPermissions(id,id);
}
