function ConfigEditor() {
	this.init.apply(this, arguments);
}

ConfigEditor.show = function() {
	return new ConfigEditor();
};

ConfigEditor.prototype.init = function() {
	this.panel = document.createElement('div');
	this.panel.className = 'panel configEditor';

	this.head = document.createElement('section');
	this.head.className = 'head';
	this.panel.appendChild(this.head);

	var closeBtn = this._closeBtn = document.createElement('div');
	closeBtn.className = 'close btn';
	closeBtn.addEventListener('click', _.bind(this.onClose, this), false);
	this.head.appendChild(closeBtn);

	var title = this._titleSpan = document.createElement('span');
	title.textContent = 'Config Editor';
	this.head.appendChild(title);

	this.wrapper = document.createElement('div');
	this.wrapper.className = 'body';
	this.panel.appendChild(this.wrapper);

	this.mountList = document.createElement('ul');
	this.mountList.className = 'listbox';
	this.wrapper.appendChild(this.mountList);

	this.mountDiplay = document.createElement('div');
	this.mountDiplay.className = 'mountDiplay';
	this.wrapper.appendChild(this.mountDiplay);

	var __self = this;
	configMan.getMounts(function(mountPoints) {
		__self.mountPoints = mountPoints;
		_.chain(mountPoints)
			.sortBy('key')
			.each(function(item) {
				var li = item.li = document.createElement('li');
				li.textContent = item.key;
				li.title = item.filename;
				li.addEventListener('click', _.bind(__self.onMountClick, __self, item), false);
				__self.mountList.appendChild(li);
			});
	});
	this.activeMountPoint = null;

	ui.body.appendChild(this.panel);
}

ConfigEditor.prototype.onMountClick = function(item) {
	if ( item == this.activeMountPoint ) return;

	if ( this.activeMountPoint ) {
		this.activeMountPoint.li.className = '';
	}
	this.activeMountPoint = item;
	item.li.className = 'active';

	this.mountDiplay.innerHTML = '';

	var heading = document.createElement('h2');
	heading.textContent = item.filename;
	this.mountDiplay.appendChild(heading);

	configMan.getKeys(item.key, _.bind(this.onMountLoad, this, item), false);
};

ConfigEditor.prototype.onMountLoad = function(mp, keys) {
	if ( mp !== this.activeMountPoint ) return;

	var __self = this;
	_.each(keys, function(item) {
		item.type = typeof item.value;
		var div = document.createElement('div');

		var label = document.createElement('label');
		label.textContent = item.key + ' [' + item.type + ']';
		div.appendChild(label);

		var input = item.input = document.createElement('input');
		if ( item.type == 'boolean' ) {
			input.type = 'checkbox';
			input.checked = item.value;
		} else {
			input.value = item.value;
		}
		div.appendChild(input);

		if ( item.type !== 'object' ) {
			input.addEventListener('keyup', _.bind(__self.onInputKeyUp, __self, input));

			var setBtn = document.createElement('button');
			setBtn.textContent = 'Set';
			setBtn.addEventListener('click', _.bind(__self.onSetClick, __self, mp, item));
			div.appendChild(setBtn);
		}

		if ( item.type == 'number') {
			var mapBtn = document.createElement('button');
			mapBtn.textContent = 'Slider';
			mapBtn.addEventListener('click', _.bind(__self.onMapClick, __self, mp, item));
			div.appendChild(mapBtn);
		}

		__self.mountDiplay.appendChild(div);
	});
};

ConfigEditor.prototype.onSetClick = function(mp, key) {
	var val = key.input.value;
	if ( key.type == 'number' ) {
		val = parseFloat(val);
	}
	if ( key.type == 'boolean' ) {
		val = key.input.checked;
	}
	if ( key.type == 'object' ) {
		throw new Error('cannot set object key');
	}
	configMan.set(mp.key, key.key, val);
};

ConfigEditor.prototype.onMapClick = function(mp, key) {
	sliderMapper.show({
		mp: mp.key,
		key: key.key
	});
};

ConfigEditor.prototype.onInputKeyUp = function(input, e) {
	// respond only to UP (38) and down (40) keys
	if ( e.keyCode != 38 && e.keyCode != 40 ) return;

	var val = parseFloat(input.value);
	if ( isNaN(val) ) return;

	step = (e.keyCode == 38 ? 1 : -1) * 0.1 * (e.altKey ? 0.1 : 1) * (e.ctrlKey ? 0.1 : 1) * (e.shiftKey ? 0.1 : 1);
	input.value = (Math.round((val + step)*10000)/10000).toString();
};

ConfigEditor.prototype.onClose = function() {
	this.panel.parentNode.removeChild(this.panel);
}
