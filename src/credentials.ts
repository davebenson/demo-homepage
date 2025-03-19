import { readEncryptedYaml } from './crypt';

const app_env = process.env.APP_ENV;
const key = await fs.readFile(`config/${app_env}.key`);

export default await readEncryptedYaml(key, `config/${app_env}.enc`);
