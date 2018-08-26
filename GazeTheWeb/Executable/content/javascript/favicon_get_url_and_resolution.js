// alert('favIcon main script');
// Link search among an element's childNodes
function searchAllChilds(element)
{
	
	var links = element.getElementsByTagName('link');
	// alert('searchAllChilds! (#links='+links.length+')');
	var found = false;
	for (i = 0; i < links.length; i++)
	{
		// Prefer higher resolutions
		if((links[i].rel == 'apple-touch-icon' || links[i].rel == 'apple-touch-icon-precomposed') && (links[i].sizes == '120x120' || links[i].sizes == '152x152'))
		{
			window.favIconUrl = links[i].href;
			found = true;
			// alert('Found iconURL with high resolution');
			break;
		}
		if (links[i].rel == 'icon' || links[i].rel == 'shortcut icon')
	    {
	        window.favIconUrl = links[i].href;
	        found = true;
	        // alert('Found iconURL!');
	    }
	}
	return found;
}
// Breadth-first link search
function breadthFirstSearch(element, list, position)
{
	// alert('breadthFirstSearch! (pos='+position+')');

	if(searchAllChilds(element))
		return true;

	for(i=0; i < element.childNodes.length; i++)
		list.push(element.childNodes[i]);

	position += position;
	return breadthFirstSearch(list[position], list, position);

}
var list = [];
// Start breadth-first search on document
if (breadthFirstSearch(document, list, 0))
{
	favIconImg.src =  window.favIconUrl;
	// alert('Found iconURL='+window.favIconUrl);
}
else
{
	favIconImg.src = "";
	// alert('Searched for links, have not found iconURL...');
}

