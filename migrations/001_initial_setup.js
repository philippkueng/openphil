var initial_setup = new Migration({
  up: function(){
    this.create_table("posts", function(t){
      t.integer("id", {auto_increment: true});
      t.string("caption");
      t.string("tumblr_original_url");
      t.integer("post_id");
      t.string("post_url");
      t.string("post_datetime");
      t.string("tags");
      t.string("exif_datetime");
      t.string("gps_latitude_ref");
      t.string("gps_latitude");
      t.string("gps_longitude_ref");
      t.string("gps_longitude");
      t.string("gps_altitude");
      t.string("gps_timestamp");
      t.string("weight");
      t.string("weight_datetime");
      t.primary_key("id");
    });

  },
  down: function(){
    this.drop_table("posts");
  }
});