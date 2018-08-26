if(document.body.style.zoom)
{
	var zoom = document.body.style.zoom;
}

for(i=0; i < fixedElements.length); i++)
{
	var rect = fixedElements[i].getBoundingClientRect();
	_fixedElements.push(rect.top*zoom);
	_fixedElements.push(rect.left*zoom);
	_fixedElements.push(rect.bottom*zoom);
	_fixedElements.push(rect.right*zoom);
}