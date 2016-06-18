var DebugConnection = require('./DebugProtocol.js');
var ConfigConnection = require('./ConfigProtocol.js');
var AlivenessListener = require('./AlivenessProtocol.js');
var naoKontrol = require('./naoKONTROL2.js');
var _ = require('underscore');

var express = require('express');
var app = express();
var httpServer = require('http').Server(app);
var io = require('socket.io')(httpServer);
var fs = require('fs');
var path = require('path');

var sliderMap = {};
var latestConfigConnection = null;
var latestSocketConnection = null;


var httpPort = 8000;

var execDir = require.main ? path.dirname(require.main.filename) : process.cwd();
var sliderMapFileName = execDir+'/slider.json';
if ( fs.existsSync(sliderMapFileName) ) {
	var content = fs.readFileSync(sliderMapFileName, 'utf8');
	sliderMap = JSON.parse(content);
	console.log('loaded slider config from', sliderMapFileName);
}

var aliveness = new AlivenessListener();
aliveness.listen();
aliveness.on('changed', function(alive) {
	io.emit('alive', alive);
});

io.on('connection', function(socket) {
	latestSocketConnection = socket;
	socket.emit('naoKontrolAvailable', ctrl.found());
	socket.emit('alive', aliveness.getAlive());

	var debug = new DebugConnection();
	debug.on('connect', function() {
		console.log('debugConnect');
		socket.emit('debugConnect');
	});
	debug.on('error', function(err) {
		console.log('debugError', err.message);
		socket.emit('debugError', err.message);
	});
	debug.on('disconnect', function() {
		console.log('debugDisconnect');
		socket.emit('debugDisconnect');
	});
	debug.on('update', function(data) {
		socket.emit('update', data);
	});
	debug.on('list', function(list) {
		socket.emit('list', list);
	});
	debug.on('image', function(image) {
		socket.emit('image', image);
	});

	var config = latestConfigConnection = new ConfigConnection();
	config.on('connect', function() {
		console.log('configConnect');
		socket.emit('configConnect');
	});
	config.on('error', function(err) {
		console.log('configError', err.message);
		socket.emit('configError', err.message);
	});
	config.on('disconnect', function() {
		console.log('configDisconnect');
		socket.emit('configDisconnect');
		latestConfigConnection = null;
	});
	config.on('sendMounts', function(data) {
		console.log('config.sendMounts', data);
		socket.emit('config.sendMounts', data);
	});
	config.on('sendKeys', function(data) {
		console.log('config.sendKeys', data);
		socket.emit('config.sendKeys', data);
	});


	socket.on('disconnect', function() {
		console.log('disconnect');
		debug.disconnect();
		config.disconnect();
		latestConfigConnection = null;
		latestSocketConnection = null;
	});
	socket.on('disconnectNao', function() {
		console.log('disconnectNao');
		debug.disconnect();
		config.disconnect();
		latestConfigConnection = null;
		latestSocketConnection = null;
	});
	socket.on('connectNao', function(hostname) {
		console.log('connectNao', hostname);
		debug.connect(hostname);
		config.connect(hostname);
	});
	socket.on('subscribe', function(key) {
		console.log('subscribe', key);
		debug.subscribe(key);
	});
	socket.on('unsubscribe', function(key) {
		console.log('unsubscribe', key);
		debug.unsubscribe(key);
	});
	socket.on('listCommands', function() {
		console.log('listCommands');
		debug.listCommands();
	});

	socket.on('config.set', function(data) {
		console.log('config.set', data);
		config.set(data);
	});
	socket.on('config.getMounts', function() {
		console.log('config.getMount');
		config.getMounts();
	});
	socket.on('config.getKeys', function(mountpoint) {
		console.log('config.getKeys', mountpoint);
		config.getKeys(mountpoint);
	});
	socket.on('config.save', function() {
		console.log('config.save');
		config.save();
	});
	socket.on('config.map', function(cfg) {
		console.log('config.map', cfg);
		sliderMap[cfg.ch] = cfg;
		fs.writeFile(sliderMapFileName, JSON.stringify(sliderMap), { encoding:'utf8' }, function() {
			console.log('Saved slider config to', sliderMapFileName);
		});
	});
});


app.use( express.static(__dirname + '/public') );

app.get('/', function(req, res) {
	res.redirect('index.htm');
});

app.get('/image/:imageKey', function(req, res){
	res.sendFile(path.resolve('public/' + req.params.imageKey + '.jpg'));
});

httpServer.listen(httpPort, function() {
	console.log('http server listening on *:'+httpPort);
});


var ctrl = new naoKontrol();
if ( ! ctrl.found() ) {
	console.log('WARNING: naoKontrol not available');
} else {
	ctrl.openPort();
}

ctrl.on('value', function(ch, val) {
	if ( latestConfigConnection === null || ! sliderMap.hasOwnProperty(ch) ) {
		return;
	}
	var cfg = sliderMap[ch];
	var mappedVal = val / 127 * (cfg.max - cfg.min) + cfg.min;
	setConfig([{ mp:cfg.mp, key:cfg.key, value:mappedVal }]);
});
var setConfig = _.debounce(function(data) {
	latestConfigConnection.set(data);
	latestSocketConnection.emit('config.set', data);
}, 200);
ctrl.on('REC_PUSH', function() {
	if ( latestConfigConnection === null ) {
		return;
	}
	latestConfigConnection.save();
});
