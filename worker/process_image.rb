require 'rubygems'
require 'exifr'
require 'mongo'
require 'RMagick'

# 13065530490

post_id = ARGV[0]
file_name = "../images/#{post_id}.jpg"

#
# Extract EXIF information and write into the database
#

exif = EXIFR::JPEG.new(file_name).exif

db = Mongo::Connection.new("localhost", 27017).db("eatingstats")
coll = db.collection('items')

post_entry = coll.find_one("post_id" => post_id)

if exif.pixel_x_dimension
  post_entry['image_width'] = exif.pixel_x_dimension
end

if exif.pixel_y_dimension
  post_entry['image_height'] = exif.pixel_y_dimension
end

if exif.date_time_original
  post_entry['image_date'] = exif.date_time_original
end

# puts post_entry.keys
# puts post_entry.keys.include?('weight')

if post_entry.keys.include?('weight') == false
  post_entry['important_date'] = post_entry["image_date"]
end

# if post_entry['keys'] == 'weight'
#   puts 'Date item found...'
# end

coll.update({"_id" => post_entry["_id"]}, post_entry)

#
# Create thumbnails from original image and save them to disk
#

original_image = Magick::Image.read(file_name).first

[20, 100].each do |size|
  original_image.resize_to_fill!(size,size).write("../images/thumbnails/#{size}_#{post_id}.jpg")
end

puts post_id