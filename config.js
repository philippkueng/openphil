module.exports = {
  aws: {
    key: process.env.AWS_KEY ? process.env.AWS_KEY : '',
    secret: process.env.AWS_SECRET ? process.env.AWS_SECRET : '',
    bucket: process.env.AWS_BUCKET ? process.env.AWS_BUCKET : 'eatingstats'
  },
  tumblr: {
    subdomain: process.env.TUMBLR_SUBDOMAIN ? process.env.TUMBLR_SUBDOMAIN : '',
    api_key: process.env.TUMBLR_API_KEY ? process.env.TUMBLR_API_KEY : ''
  },
  mongodb: process.env.MONGOLAB_URI ? process.env.MONGOLAB_URI : ''
};