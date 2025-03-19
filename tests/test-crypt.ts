import { encrypt, decrypt } from '../src/crypt.ts';
import test from 'node:test';
import assert from 'node:assert';

test('encrypt/decrypt work', async (t) => {
  const password = 'hello';
  const plaintext = Buffer.from('hi mom');
  const enc = await encrypt(password, plaintext);
  const dec = await decrypt(password, enc);
  assert(dec.compare(plaintext) === 0);
  
  const enc2 = await encrypt(password, plaintext);
  const dec2 = await decrypt(password, enc);
  assert(dec2.compare(plaintext) === 0);
  assert(enc.compare(enc2) !== 0);
});
