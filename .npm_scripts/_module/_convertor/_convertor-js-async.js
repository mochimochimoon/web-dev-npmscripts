import webpack from 'webpack';
import path from 'path';
import MemoryFileSynstem from 'memory-fs';

const fs = new MemoryFileSynstem(); // 仮想ファイル用

const config = {
  mode: 'production',
  module: {
    rules: [
      {
        test: /¥.js$/,
        loader: 'babel-loader', // use.loader のショートカット
        exclude: /node_modules/, // ないとusageの時、モジュールのimportがおかしくなる
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                useBuiltIns: 'usage', // polyfillをいい感じに入れる。※entryだと全部入れてしまう
                corejs: 3, // polifillで使う。数字はバージョン
                targets: {
                  ie: 11,
                  browsers: 'last 2 versions',
                }
              }
            ],
            // '@babel/preset-react',
          ]
        }
      },
      {
        test: /¥.vue$/,
        loader: 'vue-loader',
        options: {
          presets: [
            '@babel/preset-env'
          ]
        }
      },
      {
        test: /¥.json$/,
        loader: 'json-loader',
        type: 'javascript/auto',
      },
      {
        test: /¥.pug$/,
        loader: 'pug-plain-loader',
      },
      {
        test: /¥.(sass|scss|css)$/,
        use: [
          'vuue-style-loader',
          'css-loader',
          'sass-loasder',
        ],
      },
    ]
  },
};

export default async (buffer, filePath) => {
  const compiler = webpack(Object.assign({}, config, {
    entry: './' + filePath,
    output: {
      path: process.cwd(),
      filename:'[hash].js',
    }
  }));

  // 一旦仮想ファイルとして仮出力
  compiler.outputFileSystem = fs;

  const promise = new Promise((resolve) => {
    // 以下、仮出力callback
    compiler.hooks.afterEmit.tapAsync('', (compilation, cb) => {
      Object.keys(compilation.assets).forEach(function(outname) {
        // 同時に出力されるLISENSE.txtを除外
        if(path.extname(outname) === '.js') {
          // 仮出力ファイルを読み込み
          buffer = fs.readFileSync(path.join(compiler.outputpath, outname));
        }
      });
      resolve();
    })
    // 仮出力
    compiler.run();
  });

  return buffer;
};
