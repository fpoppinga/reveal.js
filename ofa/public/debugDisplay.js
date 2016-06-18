function DebugDisplay() {
	this.init.apply(this, arguments);
}

DebugDisplay.prototype.init = function(config) {
	this._lastInitConfig = config;
	if ( ! this.panel ) {
		this.panel = document.createElement('div');
		this.panel.className = 'panel';

		this.head = document.createElement('section');
		this.head.className = 'head';
		this.panel.appendChild(this.head);

		var closeBtn = this._closeBtn = document.createElement('div');
		closeBtn.className = 'close btn';
		closeBtn.addEventListener('click', _.bind(this.onClose, this), false);
		this.head.appendChild(closeBtn);

		var editBtn = this._editBtn = document.createElement('div');
		editBtn.className = 'btn';
		editBtn.textContent = 'Edit';
		editBtn.addEventListener('click', _.bind(this.onEdit, this), false);
		this.head.appendChild(editBtn);

		var title = this._titleSpan = document.createElement('span');
		title.textContent = config.title + '\u00A0';
		this.head.appendChild(title);

		this.wrapper = document.createElement('div');
		this.wrapper.className = 'body';
		this.panel.appendChild(this.wrapper);
	}
	else {
		this._titleSpan.textContent = config.title + '\u00A0';
		this.wrapper.innerHTML = '';
	}

	if ( ! this.panel.parentNode ) {
		ui.body.appendChild(this.panel);
	}
}

DebugDisplay.prototype.onEdit = function() {
	configModal.show(this.constructor, this);
};

DebugDisplay.prototype.reInit = function(config) {
	if ( this.subscription ) {
		debugMan.unsubscribe(this.subscription);
		this.subscription = null;
	}
	this.init(config);
};

DebugDisplay.prototype.subscribe = function(keys, mappingFct) {
	this.subscription = debugMan.subscribe(keys, mappingFct, this.onUpdate);
}

DebugDisplay.prototype.onUpdate = function() {};

DebugDisplay.prototype.onClose = function() {
	if ( this.subscription ) {
		debugMan.unsubscribe(this.subscription);
		this.subscription = null;
	}
	this.panel.parentNode.removeChild(this.panel);
}
