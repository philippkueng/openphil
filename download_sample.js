var request = require('superagent'),
    fs = require('fs');

// request
//   .get('http://google.com/')
//   .end(function(res){
//     fs.writeFileSync('response.txt', res.text, 'utf8');
//     console.log('response saved.');
//     // console.log(res.text);
//   });

  // request
  // .get('http://25.media.tumblr.com/tumblr_m749plIgYn1r6f6iuo1_1280.jpg')
  // .end(function(res){
  //   fs.writeFileSync('image.jpg', res.text, 'binary');
  //   console.log(res);
  //   // console.log('response saved.');
  // });


// var stream = fs.createWriteStream('image.jpg');
// var req = request.get('http://25.media.tumblr.com/tumblr_m749plIgYn1r6f6iuo1_1280.jpg');
// req.pipe(stream);
// console.log('written to disk');

request.get('http://25.media.tumblr.com/tumblr_m749plIgYn1r6f6iuo1_1280.jpg').pipe(fs.createWriteStream('image.jpg'))
console.log('written to disk');