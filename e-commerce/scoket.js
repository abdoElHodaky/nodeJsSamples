module.exports=(app)=>{
var server = require('http').createServer(app);
//KIV -> io is set as a global variable
io = require('socket.io')(server);
}