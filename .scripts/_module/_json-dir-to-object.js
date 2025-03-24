// package
import fs from 'fs';
import path from 'path';

const jsonToObject = (src) => {
  try {
    return JSON.parse(fs.readFileSync(src, 'utf8')); // requireだと結果がキャッシュされてしまう
  } catch(e) {
    console.log('- module[compileDataInit]: json_error');
    console.log(e.message);
  }
  return {};
};

const dirToObject = (dir) => {
  const files = fs.readdirSync(dir);
  let data = {};
  for (let filename of files) {
    const filePath = path.join(dir, filename);
    if(fs.statSync(filePath).isDirectory()) {
      data[filename] = dirToObject(filePath);
    } else if(filename.match('.json')) {
      const basename = path.basename(filename, '.json');
      data[basename] = jsonToObject(filePath);
    }
  }
  return data;
};

export default (dir) => {
  return dirToObject(dir);
};
