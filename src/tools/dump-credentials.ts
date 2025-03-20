import { encrypt, decrypt } from '../crypt.ts';
import childProcess from 'node:child_process';
import fs from 'node:fs/promises';
import yaml from 'yaml';

async function dumpCredentials(env: string): Promise<void>
{
  const password = (await fs.readFile(`config/${env}.key`, 'utf8')).trim();
  const encryptedOrig = await fs.readFile(`config/${env}.enc`);
  const plainOrig = await decrypt(password, encryptedOrig);
  console.log(plainOrig.toString());
}

const env = process.argv[2];
await dumpCredentials(env);
