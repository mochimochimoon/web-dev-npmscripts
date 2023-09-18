// package
import browserSync from 'browser-sync';
import url from 'url';
import path from 'path';
import fs from 'fs';

export default (_SETTING, _DIST) => {
  const middleware = async (req, res, next) => {
    const requestUrl = url.parse(req.url).pathname;
    // .html以外は脱出
    if(!requestUrl.match(/.html$/g)) {
      return next();
    }

    // htmlと同名htmlTemplate(pug, ejs)があるかを検索
    const findTemplateResult = (() => {
      for (let templateSetting of _SETTING.htmlTemplateSettings) {
        const requestRelativeUrl = path.relative('/', requestUrl);
        const filePath = path.join(templateSetting.baseDir, requestRelativeUrl).replace(/\.[^.]+$/, `.${templateSetting.ext}`);
        try {

          const buffer = fs.readFileSync(filePath);
          console.log(`-middleware: render[${filePath}]`);
          return {
            buffer,
            filePath,
            templateSetting,
          };
        } catch(e) {
          console.log(e.message);
        }
      }
      return false;
    })();
    // 存在しない場合は脱出
    if(!findTemplateResult) {
      return next();
    }

    let buffer = findTemplateResult.buffer;
    const filePath = findTemplateResult.filePath;
    const templateSetting = findTemplateResult.templateSetting;
    try {
      buffer = await templateSetting.convertor(buffer, filePath, templateSetting);
    } catch(e) {
      console.log(e.message);
      return next();
    }

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(buffer.toString());
    res.end();
  }

  const bs = browserSync.create();
  bs.init({
    open: true,
    ghostMode: false,
    server: {
      baseDir: _DIST,
      directory: true,
      middleware: [middleware],
    }
  })
  return bs;
}
