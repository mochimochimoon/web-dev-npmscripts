console.log('----- .npm_scripts/index.js: run -----');

// package
// import fs from 'fs';
import {deleteSync} from 'del';
import watch from 'glob-watcher';
// module
import command from './_module/_command.js';
import {convertorPugAsync, convertorEjsAsync} from './_module/_convertor/_convertor-html-template-async.js';
import convertorSassAsync from './_module/_convertor/_convertor-sass-async.js';
import convertorImgAsync from './_module/_convertor/_convertor-img-async.js';
import convertorJsAsync from './_module/_convertor/_convertor-js-async.js';
import fileOutputAsync from './_module/_file-output-async.js';
import browserSyncInit from './_module/_browser-sync-init.js';

const _SETTING = {
  htmlTemplateSettings: [
    {
      ext: 'ejs',
      rootDir: './src/ejs/',
      baseDir: './src/ejs/base/',
      convertor: convertorEjsAsync,
    },
    {
      ext: 'pug',
      rootDir: './src/pug/',
      baseDir: './src/pug/base/',
      convertor: convertorPugAsync,
    }
  ]
};

const _COMMAND = command();
console.log(`command_name: ${_COMMAND.name}`);

const _DIST = `${(!_COMMAND.option.deploy)? '_': ''}${_COMMAND.name || 'null'}`;

class Task {
  constructor(name, callback) {
    this.name = name;
    this.callback = callback;

  }
  async run() {
    console.log(`--- task[${this.name}]: status_start...`);
    try {
      await this.callback();
    } catch(e) {
      console.log(`--- task[${this.name}]: ...status_error`);
      console.log(e.message);
    }
    console.log(`--- task[${this.name}]: ...status_end`);
  }
}

const taskPug = new Task('pug', async () => {
  await fileOutputAsync({
    rootDir: './src/pug',
    baseDir: './src/pug/base',
    dist: _DIST,
    convertor: convertorPugAsync,
    ext: 'html',
  })
});

const taskEjs = new Task('ejs', async () => {
  await fileOutputAsync({
    rootDir: './src/ejs',
    baseDir: './src/ejs/base',
    dist: _DIST,
    convertor: convertorEjsAsync,
    ext: 'html',
  })
});

const taskScss = new Task('scss', async () => {
  await fileOutputAsync({
    rootDir: './src/scss',
    baseDir: './src/scss/base',
    dist: _DIST,
    convertor: convertorSassAsync,
    ext: 'css',
  })
});

const taskJs = new Task('js', async () => {
  await fileOutputAsync({
    rootDir: './src/js',
    baseDir: './src/js/base',
    dist: _DIST,
    convertor: convertorJsAsync,
    // ext: 'js',
  })
});

const taskImg = new Task('img', async () => {
  await Promise.all([
    fileOutputAsync({
      rootDir: './src/img',
      baseDir: './src/img/base',
      dist: _DIST,
      convertor: convertorImgAsync,
    }),
    fileOutputAsync({
      rootDir: './src/img',
      baseDir: './src/img/base',
      dist: _DIST,
      convertor: convertorImgAsync,
      modifier: '_min',
    }, {scale: 0.5}),
  ])
  await fileOutputAsync({
    rootDir: './src/ejs',
    baseDir: './src/ejs/base',
    dist: _DIST,
    convertor: convertorEjsAsync,
    ext: 'html',
  })
});

const taskPure = new Task('pure', async () => {
  await fileOutputAsync({
    rootDir: './src/pure',
    baseDir: './src/pure/base',
    dist: _DIST,
    // convertor: false,
  })
});

const taskBuild = new Task('build', async () => {
  deleteSync(_DIST, {force: false});
  await Promise.all([
    taskPure.run(),
    taskPug.run(),
    taskEjs.run(),
    taskScss.run(),
    taskJs.run(),
    taskImg.run(),
  ]);
})

const taskWatch = new Task('watch', () => {
  const bs = browserSyncInit(_SETTING, _DIST);
  class Watcher {
    constructor(target, callback) {
      watch([target, './src/.database/**/*', './src/.module/**/*'], async (done) => {
        console.log('--task[Watch]: file is changed');
        await callback();
        done();
      })
    }
  }
  new Watcher('./src/pug/**/*', async () => {
    bs.reload();
    await taskPug.run();
  });
  new Watcher('./src/ejs/**/*', async () => {
    bs.reload();
    await taskEjs.run();
  });
  new Watcher('./src/scss/**/*', async () => {
    await taskScss.run();
    bs.reload();
    // bs.stream();
  });
  new Watcher('./src/js/**/*', async () => {
    await taskJs.run();
    bs.reload();
  });
  new Watcher('./src/img/**/*', async () => {
    await taskImg.run();
    bs.reload();
  });
  new Watcher('./src/pure/**/*', async () => {
    await taskPure.run();
    bs.reload();
  });
})

// 処理本体
await taskBuild.run();
if(_COMMAND.name === 'develop') {
  await taskWatch.run();
}
