console.log('----- .npm_scripts/env.js: run -----');

// package
import fs from 'fs-extra';
import path from 'path';
import {deleteSync} from 'del';
import glob from 'glob';
// module
import command from './_module/_command.js'

const _COMMAND = command();

const gitigoreList = fs.readFileSync('.gitignore', 'utf-8')
  .split('\n')
  .filter((item) => {
    // 空白、コメントを除外
    if(item === '' || item.startsWith('#')) {
      return false
    }
    return true;
  });
gitigoreList.push('docs') // docsのみ例外的に追加
const ignoreList = gitigoreList
  .map((item) => {
    // 相対パスに変換。※fs.copyが正常に動かない
    if(path.isAbsolute(item)) {
      item = path.relative('/', item);
    }
    return item;
  });
// --min
// srcも一旦削除
if(_COMMAND.option.min) {
  ignoreList.push('src');
}

// 出力先生成
deleteSync('_env', {force: false});
if(!fs.existsSync('_env')) {
  fs.mkdirsSync("_env");
}

// 出力
const files = glob.sync('*', {
  ignore: ignoreList,
  dot: true,
});
await Promise.all(files.map(async (file) => {
  const distFilePath = path.join('_env', file);
  await fs.copy(file, distFilePath);
}));

// --min
// 最低限のディレクトリを生成
if(_COMMAND.option.min) {
  const files = [
    'src/.module',
    'src/.database',
    'src/pug/base',
    'src/ejs/base',
    'src/scss/base',
    'src/img/base',
    'src/pure/base',
  ];
  await Promise.all(files.map(async (file) => {
    const distDirPath = path.join('_env', file);
    await fs.mkdirs(distDirPath);
  }));
}
