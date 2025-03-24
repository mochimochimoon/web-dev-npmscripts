// package
import pug from 'pug';
import pugIncludeGolb from 'pug-include-glob';
import ejs from 'ejs';
// module
import compileDataInitAsync from '../_compile-data-init-async.js';

export async function convertorPugAsync (buffer, filePath, {rootDir}) {
  const data = await compileDataInitAsync();

  return pug.render(
    buffer,
    {
      basedir: rootDir,
      filename: filePath,
      pretty: true,
      doctype: 'html', // 未設定だと閉じタグない要素が/>締めになる
      plugin: [pugIncludeGolb()],
      data, // data変数追加
    }
  )
};

export async function convertorEjsAsync (buffer, filePath, {rootDir}) {
  const data = await compileDataInitAsync();
  return ejs.render(
    buffer.toString(),
    {
      data, // data変数追加
      filename: filePath, // filename変数追加（pugと同じ変数名を定義）
    },
    {
      rootDir,
      filename: filePath,
    }
  )
};
