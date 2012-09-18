var im = require('imagemagick');
im.readMetadata('image.jpg', function(err, metadata){
  if (err) throw err;
  console.log(metadata.exif);
  // console.log('Shot at '+metadata.exif.dateTimeOriginal);
})