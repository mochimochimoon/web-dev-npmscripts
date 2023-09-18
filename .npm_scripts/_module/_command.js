export default () => {
  const env = process.env;

  const options = {};
  for(let key in env) {
    if(key.startsWith('npm_config_')) {
      options[key.replace('npm_config_', '')] = process.env[key];
    }
  }

  // console.log(env);
  return {
    name: env['npm_lifecycle_event'],
    option: options,
  }
}
