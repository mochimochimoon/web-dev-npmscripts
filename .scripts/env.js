// package
import fs from 'fs-extra';
import path from 'path';
import {deleteSync} from 'del';
import glob from 'glob';
// module
import command from './_module/_command.js'
// task

// 処理本体
console.log('----- .npm_scripts/env.js: run -----');

const _COMMAND = command();

const _DIST = `_${_COMMAND.name || 'null'}`;

// 出力除外ファイルを定義
const ignoreList = (() => {
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
  // --min差分
  // srcも一旦削除
  if(_COMMAND.option.min) {
    gitigoreList.push('src');
  }
  return gitigoreList
    .map((item) => {
      // 相対パスに変換。※fs.copyが正常に動かないため
      if(path.isAbsolute(item)) {
        item = path.relative('/', item);
      }
      return item;
    });
})();

// 出力先生成
deleteSync(_DIST, {force: false});
if(!fs.existsSync(_DIST)) {
  fs.mkdirsSync(_DIST);
}

// 出力
const files = glob.sync('*', {
  ignore: ignoreList,
  dot: true,
});
await Promise.all(files.map(async (file) => {
  const distFilePath = path.join(_DIST, file);
  await fs.copy(file, distFilePath);
}));

// --min差分
// 最低限のディレクトリのみ生成
if(_COMMAND.option.min) {
  const files = [
    'src/.module',
    'src/.database',
  ];
  await Promise.all(files.map(async (file) => {
    const distDirPath = path.join(_DIST, file);
    await fs.mkdirs(distDirPath);
  }));
}
