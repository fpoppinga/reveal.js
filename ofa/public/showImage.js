/**
 * Created by finn on 07.02.15.
 */

var ImageStream = function() {
    this.init.apply(this, arguments);
};
util.inherits(ImageStream, DebugDisplay);

ImageStream.defaultConfig = {
    title:''
};

ImageStream.expectedKeys = ['image'];

ImageStream.prototype.init = function(config){
    DebugDisplay.prototype.init.call(this, config);

    this.wrapper.classList.add('image');

    this.onUpdate = _.bind(this.onUpdate, this);

    this.canvas = document.createElement('canvas');
    this.canvas.width = 640;
    this.canvas.height = 480;
    this.wrapper.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');

    this.subscription = debugMan.subscribeImage(config.keys[0], this.onUpdate);
};

ImageStream.prototype.onUpdate = function(image){
    console.log('update image');
    var img = new Image();
    img.src = 'image/' + image + '?' + new Date().getTime();

    img.addEventListener('load', _.bind(function(){
        this.ctx.drawImage(img, 0, 0);
    }, this));
};