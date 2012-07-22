var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ObjectId = Schema.ObjectId;

var ItemsSchema = new Schema({
  post_id: {
    type: String,
    index: {
      unique: true
    }
  },
  title: String,
  post_date: Date,
  keys: [String],
  caption: String,
  post_url: String,
  image_url: String,
  image_height: Number,
  image_width: Number,
  image_date: Date,
  weight_date: Date,
  weight: Number,
  important_date: Date
});

mongoose.model('Items', ItemsSchema);

module.exports['Items'] = mongoose.model('Items');

module.exports['Items'].modelName = 'Items';
