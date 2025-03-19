import fs from 'node:fs/promises';
import { scrypt, randomFill, createCipheriv, createDecipheriv } from 'node:crypto';
import yaml from 'yaml';

export function encrypt(password, buf): Promise<Buffer>
{
  return new Promise((res, rej) => {
    scrypt(password, 'salt', 24, (err, key) => {
      if (err) { rej(err); return; }
      randomFill(new Uint8Array(16), (err, iv) => {
        if (err) { rej(err); return; }
        const pieces = [iv];
        const algorithm = 'aes-192-cbc';
        const cipher = createCipheriv(algorithm, key, iv);
        pieces.push(cipher.update(buf));
        pieces.push(cipher.final());
        res(Buffer.concat(pieces));
      });
    });
  });
}

export function decrypt(password, buf): Promise<Buffer>
{
  return new Promise((res, rej) => {
    const iv = buf.slice(0,16);
    const encrypted = buf.slice(16);
    scrypt(password, 'salt', 24, (err, key) => {
      if (err) { rej(err); return; }
      const algorithm = 'aes-192-cbc';
      const decipher = createDecipheriv(algorithm, key, iv);
      const pieces = [decipher.update(encrypted)];
      pieces.push(decipher.final());
      res(Buffer.concat(pieces));
    });
  });
}

export async function readEncryptedYaml(password, filename): Promise<any>
{
  const encdata = await fs.readFile(filename);
  const plaindata = await decrypt(password, encdata);
  const yml = yaml.parse(plaindata.toString());
  return yml;
}
  
export async function writeEncryptedYaml(password, filename, value): Promise<void>
{
  const plaindata = Buffer.from(yaml.stringify(value));
  const encdata = await encrypt(password, plaindata);
  await fs.writeFile(filename, encdata);
}
