
import credentials from './credentials.ts';

export function setupAcmeRoutes(app)
{
  app.get('/.well-known/acme-challenge/:token', async (req, res) => {
    const token = req.params.token;
    const result = await embodied_cs_database.getAcmeChallenge(token);
    console.log(`getAcmeChallenge... token=${token} result=${result}`);
    if (result) {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end(result);
      return;
    }
  });

  if (credentials.magicSSLRefreshPath) {
    app.get(credentials.magicSSLRefreshPath, async (req, res) => {
      handleSSLCertificateRequest(req, res);
      return;
    });
  }
}
