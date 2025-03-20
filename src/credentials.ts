import { readEncryptedYaml } from './crypt.ts';
import fs from 'node:fs/promises';
import app_env from './app-env.ts';


const env_name = `${app_env.toUpperCase()}_CREDENTIALS_PASSWORD`;
const key = (env_name in process.env)
          ? process.env[env_name]
          : (await fs.readFile(`config/${app_env}.key`, 'utf-8')).trim();

export default await readEncryptedYaml(key, `config/${app_env}.enc`);
