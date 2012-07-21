module.exports = {
  mysql: {
    user: process.env.MYSQL_USER ? process.env.MYSQL_USER : 'root',
    password: process.env.MYSQL_PASSWORD ? process.env.MYSQL_PASSWORD : '',
    database: process.env.MYSQL_DATABASE ? process.env.MYSQL_DATABASE : 'eatingstats',
    port: process.env.MYSQL_PORT ? process.env.MYSQL_PORT : 3306,
    host: process.env.MYSQL_HOST ? process.env.MYSQL_HOST : 'localhost'
  },
  aws: {
    key: process.env.AWS_KEY ? process.env.AWS_KEY : '',
    secret: process.env.AWS_SECRET ? process.env.AWS_SECRET : '',
    bucket: process.env.AWS_BUCKET ? process.env.AWS_BUCKET : 'eatingstats'
  }
};