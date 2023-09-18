import fs from 'fs-extra';
import path from 'path';
import glob from 'glob';

export default async function ({
  rootDir = '/',
  baseDir = '/base', // ソースの格納元・ファイル階層の基準
  dist = '_null', // 出力先
  convertor = false, // ファイル変換function
  modifier = false, // ファイル名装飾
  ignore = [], // 除外対象
  ext = false, // 拡張子
}, convertorOption = false) {
  // console.log(`- module[fileOutputAsync]: start...`);

  const target = path.posix.join(baseDir, '**/[^_]*'); // バックスラッシュだとglob`でエラー。posix使用
  const files = glob.sync(target, {ignore, dot: true});

  await Promise.all(files.map(async (file) => {
    // フォルダの場合離脱
    if(fs.statSync(file).isDirectory()) {
      return false;
    }

    // ファイル取得 (+ コンパイル)
    let buffer = fs.readFileSync(path.resolve(file));
    if(convertor) {
      try {
        buffer = await convertor(buffer, file, arguments[0], arguments[1]);
      } catch(e) {
        console.log(`------- module[fileOutputAsync]: convertor_error`);
        console.log(file);
        console.log(e.message);
        return false;
      }
    }

    // 出力先定義
    const baseToFile = path.relative(baseDir, file);
    let distPath = path.join(dist, baseToFile);
    if(modifier || ext) {
      distPath = path.format({
        dir: path.dirname(distPath),
        name: path.parse(distPath).name,
        ext: (ext)? `.${ext}`: path.extname(distPath),
      });
    }

    // フォルダ生成
    if(!fs.existsSync(path.dirname(distPath))) {
      fs.mkdirsSync(path.dirname(distPath));
    }

    // 出力
    fs.writeFileSync(distPath, buffer, (e) => {
      console.log(`- module[fileOutputAsync]: writeFile_error`);
      console.log(e);
    });
  }));

  // console.log(`- module[fileOutputAsync]: ...complete`);
  return true;
}
