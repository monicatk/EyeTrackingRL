var doc = document.documentElement;
var zoomFactor = 1;
var offsetX = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0); 
var offsetY = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0); 


function writeToArray()
{
for(i = 0; i < textInput.length; i++)
	{
		// TODO: Nested DOM nodes should get their parent's information as well
	    var rect = textInput[i].getBoundingClientRect();
	    window.TextInputs[i].coordinates = [rect.top*zoomFactor + offsetY, rect.left*zoomFactor + offsetX, rect.bottom*zoomFactor + offsetY, rect.right*zoomFactor + offsetX];
	    window.TextInputs[i].value = textInput[i].value;
	}
}

function updateOffsets()
{
	// Update scrolling offset and zoom factor for 
	offsetX = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0); 
	offsetY = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0); 
	// NOTE: Never used the following variables? Seem to be offsetX and offsetY
	// scrollOffsetX = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0); 
	// scrollOffsetY = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0); 

	var docRect = document.body.getBoundingClientRect();

	if(document.body.style.zoom)
	{
		zoomFactor = document.body.style.zoom;
	}
}

updateOffsets();
// Save computed offsets in case they change while writing to array
// var used_offsetX = offsetX;
// var used_offsetY = offsetY;

// Write node data to array
writeToArray();

// Check if node data changed while writing to array, if yes, repeat writing
// updateOffsets(offsetX, offsetY);
// if(used_offsetX != offsetX || used_offsetY != offsetY)
// {
// 	writeToArray(offsetX, offsetY);
// }


