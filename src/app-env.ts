
function getAppEnv() {
  if (process.env.APP_ENV)
    return process.env.APP_ENV;

  console.log(`assuming APP_ENV=local`);
  return 'local';
}

export default getAppEnv();
