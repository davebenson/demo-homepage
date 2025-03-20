import { encrypt, decrypt } from '../crypt.ts';
import childProcess from 'node:child_process';
import fs from 'node:fs/promises';
import yaml from 'yaml';

function editFile(filename: string): Promise<boolean>
{
  return new Promise((res, rej) => {
    const cmd = process.env.EDITOR ?? 'vi';
    const cp = childProcess.spawn(cmd, [filename], { stdio: 'inherit' });
    cp.on('close', (code) => {
      res(code === 0);
    });
  });
}

async function editCredentials(env: string): Promise<void>
{
  const password = (await fs.readFile(`config/${env}.key`, 'utf8')).trim();
  let encryptedOrig;
  try {
    encryptedOrig = await fs.readFile(`config/${env}.enc`);
  } catch (err) {
    // TODO: check to see if not-found
  }
  const plainOrig = (!encryptedOrig || encryptedOrig.length === 0)
                  ? Buffer.from('')
                  : await decrypt(password, encryptedOrig);
  
  const tmpfilename = (process.env.HOME ?? '/tmp') + `/.ex${Date.now()}.${process.pid}.txt`;
  await fs.writeFile(tmpfilename, plainOrig);
  console.log('calling edit file');
  const ok = await editFile(tmpfilename);
  if (!ok) {
    await fs.unlink(tmpfilename);
    return false;
  }
  const plainNew = await fs.readFile(tmpfilename);
  await fs.unlink(tmpfilename);
  if (plainNew.compare(plainOrig) === 0) {
    console.log('no change: not rewriting file');
  } else {
    try {
      yaml.parse(plainNew.toString());
    } catch (err) {
      console.log('warning: error in yaml file');
      console.log(err);
    }
    const cryptNew = await encrypt(password, plainNew);
    await fs.writeFile(`config/${env}.enc`, cryptNew);
  }
}


const env =process.argv[2];
console.log(`editing credentials for ${env}`);
await editCredentials(env);
