import { readEncryptedYaml } from './crypt.ts';
import fs from 'node:fs/promises';
import app_env from './app-env.ts';

const key = (await fs.readFile(`config/${app_env}.key`, 'utf-8')).trim();

export default await readEncryptedYaml(key, `config/${app_env}.enc`);
