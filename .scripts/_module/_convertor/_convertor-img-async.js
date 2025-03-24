import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import Jimp from 'jimp';
import imageminMozjpeg from 'imagemin-mozjpeg';

export default async (buffer, filePath, {rootDir, option}) => {
  // 画像スケール変更
  if(option.scale) {
    await Jimp.read(buffer)
      .then((img) => {
        img.scale(option.scale);
        img.getBuffer(img.getMIME(), (e, arg) => {
          buffer = arg;
        });
      });
  }

  // 圧縮
  buffer = await imagemin.buffer(buffer, [
    imageminMozjpeg({
      progressive: true,
    }),
    imageminPngquant({
      strip: true,
      quality: [.1],
      speed: 1,
    })
  ]);

  return buffer;
};
