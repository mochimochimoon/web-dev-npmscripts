// package
import path from 'path';
import sass from 'sass';
import globImporter from 'node-sass-glob-importer';
// module
import compileDataInitAsync from '../_compile-data-init-async.js';
import objToSassVariable from '../_obj-to-sass-variable.js';

export default async (buffer, filePath, {rootDir}, convertorOption) => {
  let template = buffer.toString();

  const data = await compileDataInitAsync();
  template = objToSassVariable(data) + template;

  const result = sass.renderSync({
    // data: template,
    file: filePath,
    includePaths: ['src/scss'],
    precision: 12, // 小数点以下桁数上限
    importer: [
      globImporter(),
    ],
  })

  return new Buffer(result.css);
};

// render非推奨だけど、importerが融通聞かなくてcompile使えない；；；；
// ↑compile>importer prev引数がないので相対パス関連の処理ができない；；；；
