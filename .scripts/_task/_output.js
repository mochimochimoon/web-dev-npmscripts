// package
// import fs from 'fs';
import path from 'path';
import {deleteSync} from 'del';
import watch from 'glob-watcher';
// module
import command from '../_module/_command.js';
import {convertorPugAsync, convertorEjsAsync} from '../_module/_convertor/_convertor-html-template-async.js';
import convertorSassAsync from '../_module/_convertor/_convertor-sass-async.js';
import convertorImgAsync from '../_module/_convertor/_convertor-img-async.js';
import convertorJsAsync from '../_module/_convertor/_convertor-js-async.js';
import fileOutputAsync from '../_module/_file-output-async.js';
import browserSyncInit from '../_module/_browser-sync-init.js';

// 出力設定。元ソース/出力先/コンパイラーなど
const _SETTINGS = [
  // 変換なし
  {
    name: 'raw',
    outputSettings: [
      {
        // ext: false,
        rootDir: './src/raw',
        baseDir: './src/raw/base',
        // convertor: false,
      }
    ],
  },
  {
    name: 'html',
    outputSettings: [
      {
        ext: 'html',
        rootDir: './src/ejs/',
        baseDir: './src/ejs/base/',
        convertor: convertorEjsAsync,
      },
      {
        ext: 'html',
        rootDir: './src/pug/',
        baseDir: './src/pug/base/',
        convertor: convertorPugAsync,
      },
    ],
    reload: 'before',
  },
  {
    name: 'css',
    outputSettings: [
      {
        ext: 'css',
        rootDir: './src/scss',
        baseDir: './src/scss/base',
        convertor: convertorSassAsync,
      },
    ],
    reload: 'stream',
  },
  {
    name: 'js',
    outputSettings: [
      {
        ext: 'js',
        rootDir: './src/js',
        baseDir: './src/js/base',
        convertor: convertorJsAsync,
      }
    ],
  },
  {
    name: 'img',
    outputSettings: [
      {
        // ext: false,
        rootDir: './src/img',
        baseDir: './src/img/base',
        convertor: convertorImgAsync,
      },
      {
        // ext: false,
        rootDir: './src/img',
        baseDir: './src/img/base',
        convertor: convertorImgAsync,
        modifier: '_min',
        option: {scale: 0.5},
      },
    ],
  },
];

const _COMMAND = command();

const _DIST = `_${_COMMAND.name || 'null'}`;

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
};

for (let setting of _SETTINGS) {
  setting.task = new Task(setting.taskName, async () => {
    await Promise.all(setting.outputSettings.map((item) => {
      fileOutputAsync(Object.assign({
        // rootDir: './src/raw',
        // baseDir: './src/raw/base',
        // convertor: false,
        // modifier: '_min',
        // option: {scale: 0.5},
        // ext: 'png',
        dist: _DIST,
      }, item))
    }));
  });
}

const taskBuild = new Task('build', async () => {
  deleteSync(_DIST, {force: false});
  await Promise.all(_SETTINGS.map((outputSetting) => {
    return outputSetting.task.run();
  }));
});

const taskWatch = new Task('watch', async () => {
  const htmlSettings = [].concat(..._SETTINGS.map((setting) => {
    const htmlSetting = setting.outputSettings.filter((outputSetting) => {
      return outputSetting.ext === 'html';
    });
    return htmlSetting;
  }));
  const bs = browserSyncInit(_DIST, htmlSettings);

  for(let setting of _SETTINGS) {
    const srcList = setting.outputSettings.map((outputSetting) => {
      return path.join(outputSetting.rootDir, '**/*'); 
    });

    watch(srcList.concat(['./src/.database/**/*', './src/.module/**/*']), async (done) => {
      if(setting.reload === 'before') {
        console.log('reload');
        bs.reload();
        await setting.task.run();
      } else if(setting.reload === 'stream') {
        await setting.task.run();
        console.log('stream');
        bs.stream();
      } else {
        await setting.task.run();
        console.log('reload');
        bs.reload();
      }
    });
  }
});

export {taskBuild, taskWatch};