var knex = require('knex')({
  client: 'mysql',
  connection: {
    host : '127.0.0.1',
    user : 'root',
    password : '279348',
    database : 'e-commerce'
  }
});
module.exports=knex