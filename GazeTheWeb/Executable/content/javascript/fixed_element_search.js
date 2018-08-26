function searchArray(nodeList, fixedList)
{
	var node_count = nodeList.length;

	for(i=0; i < node_count; i++)
	{
		var node= nodeList[i];

		if(node.style && node.style.position && node.style.position=='fixed')
		{

			fixedList.push(node);
		}
	}
}

var fixedElements = [];
var divList = document.getElementsByTagName('div');
var headerList = document.getElementsByTagName('header');

searchArray(divList);
searchArray(headerList);

// alert('Found '+fixedElements.length+' fixed elements');