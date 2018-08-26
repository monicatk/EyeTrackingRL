// topleft x, y, width, height of image
var imageData = ctx.getImageData(0, 0, window.favIconWidth, window.favIconHeight);
// if(window.favIconHeight < 0 || window.favIconWidth < 0) alert('Favicon height or width less than 0!');
var times = 4*window.favIconHeight*window.favIconWidth;
if(imageData.data.length != times) alert('imageData less than given resolution!');
for (i=0; i < times ; i+=4)
{
	window.favIconData[i/4] = ((imageData.data[i] << 8*3) | (imageData.data[i+1] << 8*2) | (imageData.data[i+2] << 8) | imageData.data[i+3]);
}
