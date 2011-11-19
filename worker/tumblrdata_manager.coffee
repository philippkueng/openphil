fs = require('fs')
sys = require('sys')
config = require('../config')

# ---
# MONGODB
# ---

mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/eatingstats')
Schema = mongoose.Schema
ObjectId = mongoose.ObjectId

ItemsSchema = new Schema(
  (post_id: (type: String, index: (unique: true)))
  (title: String)
  (date: Date)
  (keys: [String])
  (post_url: String)
  (image_url: String)
)

Items = mongoose.model('Items', ItemsSchema)

# ---
# TUMBLR
# ---

Tumblr = require('tumblr').Tumblr

blog = new Tumblr "#{config.tumblr.subdomain}.tumblr.com", config.tumblr.api_key

blog.photo limit: 20, (error, response) ->
    throw new Error error if error
    
    for post in response.posts
      do (post) ->
        console.log post
        
        postdate = new Date()
        postdate.setTime(post.timestamp * 1000)
        
        item = new Items(
          post_id: post.id.toString()
          title: post.title
          date: postdate
          keys: post.tags
          post_url: post.post_url
          image_url: post.photos[0].original_size.url
        )
        
        item.save((err) ->
          if err then throw err
          console.log("saved item with id: #{post.id}")
        )
   


 

# does the entry already exist?
# add a new entry
# replace old with new file