var favIconImg = new Image();
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
favIconImg.onload = function(){
	// alert('img.onload '+favIconImg.src);
	// alert('favIconImg.onload(), width:'+favIconImg.width);
	// canvas.width = favIconImg.width;
	// canvas.height = favIconImg.height+1;	// see experimental above
	ctx.drawImage(favIconImg, 0, 0);

	//alert('Setting V8 favicon res to ('+favIconImg.height+','+favIconImg.width+')');
	window.favIconHeight = favIconImg.height;
	window.favIconWidth = favIconImg.width;
	// alert(window.favIconHeight);

	// experimental: draw 1 row in RGBA to force encoding, don't read this line afterwards
	// ctx.fillStyle = 'rgba(255, 0, 0, 255)';
	// ctx.fillRect(0, favIconImg.height, favIconImg.width, favIconImg.height+1);
	//alert('DEBUG: Drew 1px line on canvas bottom');
	//alert('Updated favIconImg!');


	// Extract image format in search of 'ico'
	var url_length = favIconImg.src.length;
	var format = (favIconImg.src).slice(url_length-3, url_length);
	
	var channel = 4;
	if(format == 'ico') 
	{
		channel = 3;
		// alert('channel = 3');
	}

	// topleft x, y, width, height of image
	window.favIconData = [];

	var imageData = ctx.getImageData(0, 0, window.favIconWidth, window.favIconHeight);
	// alert('getImageData worked!');

	var bytes = channel*window.favIconHeight*window.favIconWidth;

	if(channel == 4)
	{
		for (i=0; i < bytes ; i+=4)
		{
			window.favIconData.push( ( (imageData.data[i] << 8*3) | (imageData.data[i+1] << 8*2) | (imageData.data[i+2] << 8) | (imageData.data[i+3])) );
		}
	}
	else // .ico image has only 3 color channels, fill alpha channel with 255 (not transparent)
	{
		for (i=0; i < bytes ; i+=3)
		{
			window.favIconData.push( ( (imageData.data[i] << 8*3) | (imageData.data[i+1] << 8*2) | (imageData.data[i+2] << 8) | (0xFF) ) );
		}
	}

	// Tell BrowserMsgRouter, that favicon bytes are ready
	window.cefQuery({ request: 'faviconBytesReady', persistent : false, onSuccess : function(response) {}, onFailure : function(error_code, error_message){} });
};