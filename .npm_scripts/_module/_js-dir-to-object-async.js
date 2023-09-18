// package
import fs from 'fs';
import path from 'path';
import {createRequire} from 'module'; // ES6でrequireを使用
const requireFunc = createRequire(import.meta.url);

const importJsAsync = async (src) => {
  src = path.resolve(src); // 絶対パスに変換しないとエラーでたので変換
  let errors = [];
  try {
    return requireFunc(src);
  } catch(e) {
    errors.push(e);
  }
  try {
    return Object.assign({}, await import(src)); // モジュール名前空間オブジェクトというものが読み込まれるので、普通のオブジェクトに変換。
  } catch(e) {
    errors.push(e);
  }
  console.log(errors.join('¥n'));
  return {};
};

const dirToObjectAsync = async (dir) => {
  const files = fs.readdirSync(dir);
  let data = {};
  for (let filename of files) {
    const filePath = path.join(dir, filename);
    if(fs.statSync(filePath).isDirectory()) {
      data[filename] = dirToObjectAsync(filePath);
    } else if (filename.match('.js')) {
      const basename = path.basename(filename, '.js');
      data[basename] = await importJsAsync(filePath);
    }
  }
  return data;
};

export default async (dir) => {
  return await dirToObjectAsync(dir);
};
