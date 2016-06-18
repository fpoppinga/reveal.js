Node.prototype.addText = function(text) {
	this.appendChild(document.createTextNode(text));
	return this;
};

var ui = {
	body: document.getElementsByTagName('body')[0],
	createButton: function(container, caption, handler, context) {
		var button = document.createElement('button');
		button.appendChild(document.createTextNode(caption));
		button.addEventListener('click', _.bind(handler, context || this), false);
		container.appendChild(button);
		return button;
	},

    createWrapper: function(className) {
        var wrapper = document.createElement('div');
        wrapper.className = className;
        ui.body.appendChild(wrapper);
        return wrapper;
    }
};

var util = {
	inherits: function(ctor, superCtor) {
		ctor.super_ = superCtor;
		ctor.prototype = Object.create(superCtor.prototype, {
			constructor: {
				value: ctor,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
	}
};

var navigation = {};
navigation.init = function() {
	this.wrapper = document.createElement('nav');
	this.viewList = document.createElement('ul');
	this.wrapper.appendChild(this.viewList);

	var item = document.createElement('li');
	item.appendChild(document.createTextNode('Disconnect'));
	item.addEventListener('click', _.bind(connectionManager.disconnect, connectionManager));
	this.viewList.appendChild(item);

	for(var name in views){
		var item = document.createElement('li');
		item.appendChild(document.createTextNode(name));
		item.addEventListener('click', _.bind(configModal.show, configModal, views[name], null));
		this.viewList.appendChild(item);
	}

	item = document.createElement('li');
	item.appendChild(document.createTextNode('Config Editor'));
	item.addEventListener('click', _.bind(ConfigEditor.show, ConfigEditor));
	this.viewList.appendChild(item);

	item = document.createElement('li');
	item.appendChild(document.createTextNode('Map Slider'));
	item.addEventListener('click', _.bind(sliderMapper.show, sliderMapper));
	this.viewList.appendChild(item);

	ui.body.appendChild(this.wrapper);
}

ui.ModalOverlay = (function() {
	var elem = document.createElement('div');
	elem.className = 'modalOverlay';
	ui.body.appendChild(elem);

	var Overlay = {};
	Overlay.hide = function() {
		elem.style.display = 'none';
	};
	Overlay.show = function() {
		elem.style.display = '';
	};
	Overlay.hide();
	return Overlay;
}());
ui.Modal = function Modal(caption) {
	this.container = document.createElement('div');
	this.container.className = 'modal';
	this.hide();
	this.head = document.createElement('section');
	this.head.className = 'head';
	this.head.textContent = caption;
	this.body = document.createElement('section');
	this.body.className = 'body';

	this.container.appendChild(this.head);
	this.container.appendChild(this.body);
	ui.body.appendChild(this.container);
};
ui.Modal.prototype.hide = function() {
	ui.ModalOverlay.hide();
	this.container.style.display = 'none';
};
ui.Modal.prototype.show = function() {
	ui.ModalOverlay.show();
	this.container.style.display = '';
};
