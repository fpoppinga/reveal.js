var Graph = function() {
	this.init.apply(this, arguments);
};
util.inherits(Graph, DebugDisplay);

Graph.defaultConfig = {
	title:'',
	width:500,
	height:101,
	lineColor: 'white',
	bufferSize: 100,
	minValue: -2,
	maxValue: 2
};
Graph.expectedKeys = ['float'];

Graph.prototype.init = function(config) {
	DebugDisplay.prototype.init.call(this, config);

	console.log('graph init', JSON.stringify(config));
	this.onUpdate = _.bind(this.onUpdate, this);

	this.config = _.defaults(config||{}, Graph.defaultConfig);
	this.config.bufferSize = parseInt(this.config.bufferSize);
	this.config.minValue = parseFloat(this.config.minValue);
	this.config.maxValue = parseFloat(this.config.maxValue);

	this.wrapper.classList.add('graph');

	this.canvas = document.createElement('canvas');
	this.canvas.width = this.config.width;
	this.canvas.height = this.config.height;
	this.wrapper.appendChild(this.canvas);

	this.ctx = this.canvas.getContext('2d');
	this.ctx.strokeStyle = this.config.lineColor;

	this.buf = new Array(this.config.bufferSize);

	this.subscribe(config.keys, config.mappingFct);
	requestAnimationFrame(_.bind(this.paint, this));
};

Graph.prototype.onUpdate = function(val) {
	this.buf.shift();
	this.buf.push(val);
};

Graph.prototype.paint = function() {
	this.ctx.fillRect(0,0,this.config.width, this.config.height);
	this.ctx.beginPath();
	this.ctx.moveTo(0, this.normalize(this.buf[0]));
	for ( var x = 1; x < this.config.bufferSize; x++ ) {
		this.ctx.lineTo(x*5, this.normalize(this.buf[x]));
	}
	this.ctx.stroke();
	this.ctx.strokeText(this.buf[this.buf.length-1], 450, 10);
	requestAnimationFrame(_.bind(this.paint, this));
};

Graph.prototype.normalize = function(val) {
	return (1 - (val - this.config.minValue) / (this.config.maxValue - this.config.minValue))*this.config.height;
};
