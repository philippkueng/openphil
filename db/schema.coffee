mongoose = require 'mongoose'
Schema = mongoose.Schema
ObjectId = Schema.ObjectId

ItemsSchema = new Schema(
  post_id:
    type: String
    index:
      unique: true
  title: String
  post_date: Date
  keys: [String]
  caption: String
  post_url: String
  image_url: String
  image_height: Number
  image_width: Number
  image_date: Date
  weight_date: String
  weight: Number
)

mongoose.model('Items', ItemsSchema)
module.exports['Items'] = mongoose.model('Items')
module.exports['Items'].modelName = 'Items'