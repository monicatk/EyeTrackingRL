// https://developer.mozilla.org/de/docs/Web/API/MutationObserver

// Global variables in which DOM relevant information is stored
window.fixed_elements = new Set();
window.fixed_IDlist = [];				// Position |i| contains boolean information if ID |i| is currently used
window.fixed_coordinates = [[]];		// 2D list of bounding rectangle coordinates, fill with bounding rect coordinates of fixed node and its children (if position == 'relative')

window.dom_links = [];
window.dom_links_rect = [[]];

window.dom_textinputs = [];
window.dom_textinputs_rect = [[]];

window.appendedSubtreeRoots = new Set();


// TESTING CEF V8 ExecuteFunction
// window.myObject = {val: '8', called: '0', getVal: function(){ConsolePrint('Objects function called!'); return 7;} };



// Helper function for console output
function ConsolePrint(msg)
{
	window.cefQuery({ request: msg, persistent : false, onSuccess : function(response) {}, onFailure : function(error_code, error_message){} });
}

// TODO: Add as global function and also use it in DOM node work
/**
	Adjust bounding client rectangle coordinates to window, using scrolling offset and zoom factor.

	@param: DOMRect, as returned by Element.getBoundingClientRect()
	@return: Double array with length = 4, containing coordinates as follows: top, left, bottom, right
*/
function AdjustRectCoordinatesToWindow(rect)
{
	if(rect == undefined)
		ConsolePrint("WARNING: rect == undefined in AdjustRectCoordinatesToWindow!");

	var doc = document.documentElement;
	var zoomFactor = 1;
	var offsetX = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0); 
	var offsetY = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0); 

	// var docRect = document.body.getBoundingClientRect(); // not used

	if(document.body.style.zoom)
	{
		zoomFactor = document.body.style.zoom;
	}

	var output = [];
	output.push(rect.top*zoomFactor + offsetY);
	output.push(rect.left*zoomFactor + offsetX);
	output.push(rect.bottom*zoomFactor + offsetY);
	output.push(rect.right*zoomFactor + offsetX);

	return output;
}

// Only used for fixed elements
function AdjustRectToZoom(rect)
{
	var zoomFactor = 1;
	if(document.body.style.zoom)
	{
		zoomFactor = document.body.style.zoom;
	};

	var output = [];
	output.push(rect.top*zoomFactor);
	output.push(rect.left*zoomFactor);
	output.push(rect.bottom*zoomFactor);
	output.push(rect.right*zoomFactor);

	return output;
}



// Used to get coordinates as array of size 4 in RenderProcessHandler
// function GetRect(node){ return AdjustRectCoordinatesToWindow(node.getBoundingClientRect()); }


// function CompareRectData(node_list, rect_list, NotificationFunc)
// {
// 	var n = node_list.length;

// 	for(var i = 0; i < n; i++)
// 	{
// 		var new_rect = AdjustRectCoordinatesToWindow(
// 			node_list[i].getBoundingClientRect()
// 		);

// 		// Adjust coordinates to fixed screen position if needed
// 		if(node_list[i].hasAttribute('fixedID'))
// 		{
// 			SubstractScrollingOffset(new_rect);
// 		}

// 		var old_rect = rect_list[i];

// 		if(new_rect[0] != old_rect[0] || new_rect[1] != old_rect[1] || new_rect[2] != old_rect[2] || new_rect[3] != old_rect[3])
// 		{
// 			NotificationFunc(i, new_rect);
// 		}

// 	}
// }

// // being lazy
// function RectToString(rect)
// {
// 	return ''+rect[0]+';'+rect[1]+';'+rect[2]+';'+rect[3];
// }

	/* NOTES
		Encoding of request strings for DOM node operations:

		DOM#{add | rem | upd}#nodeType#nodeID{#attribute#data}#

		Definitions:
		nodeType	: int
			0 : TextInput
			1 : TextLink
		nodeID		: int
		add --> send process message to Renderer to fetch V8 data
		rem --> request removal of given node
		upd --> update data of an specific node attribute
		attribute	: int
			0	: Rect
		data	: depends on attribute
	*/

// function UpdateDOMRects()
// {
// 	ConsolePrint("OLD UpdateDOMRects() function called!");
// 	// // Compare node's current Rect with data in Rect list
// 	// CompareRectData(
// 	// 	window.dom_links, 
// 	// 	window.dom_links_rect, 
// 	// 	function Notify(i, rect) { 
// 	// 		ConsolePrint('DOM#upd#1#'+i+'#0#'+RectToString(rect)+'#');
// 	// 	} 
// 	// );

// 	// CompareRectData(
// 	// 	window.dom_textinputs, 
// 	// 	window.dom_textinputs_rect, 
// 	// 	function Notify(i, rect) { 
// 	// 		ConsolePrint('DOM#upd#0#'+i+'#0#'+RectToString(rect)+'#');
// 	// 	} 
// 	// );
// }

function UpdateFixedElementRects()
{
	window.fixed_elements.forEach(
		function (node){
			var id = node.getAttribute('fixedID');

			var preUpdate = window.fixed_coordinates[id];

			window.fixed_coordinates[id] = AdjustRectToZoom(
				node.getBoundingClientRect()
			);

			UpdateSubtreesBoundingRect(node);

			// UpdateSubtreesBoundingRects only informs CEF if child nodes' Rect exists or changes
			// So, check if updates took place has to be done here
			var equal = (preUpdate.length == window.fixed_coordinates.length);
			for(var i = 0, n = preUpdate.length; i < n && equal; i++)
			{
				equal &= (preUpdate[i] == window.fixed_coordinates[i]);
			}
			
			if(!equal)
			{
				var zero = '';
				if(id < 10) zero = '0';
				// Tell CEF that fixed node was updated
				ConsolePrint('#fixElem#add#'+zero+id);	// TODO: Change String encoding, get rid of 'zero'
			}

		}
	);


}

function AddDOMTextInput(node)
{
	// DEBUG
	ConsolePrint("AddDOMTextInput should not be called anymore!");

	// // Add text input node to list of text inputs
	// window.dom_textinputs.push(node);

	// // Add text input's Rect to list
	// window.dom_textinputs_rect.push(
	// 	AdjustRectCoordinatesToWindow(
	// 		node.getBoundingClientRect()
	// 	)
	// );

	// // Add attribute in order to recognize already discovered DOM nodes later
	// node.setAttribute('nodeType', '0');
	// node.setAttribute('nodeID', (window.dom_textinputs.length-1));

	// // Inform CEF, that new text input is available
	// var node_amount = window.dom_textinputs.length - 1;
	// ConsolePrint('DOM#add#0#'+node_amount+'#');

	// DEBUG
	//ConsolePrint("END adding text input");
}

function SubstractScrollingOffset(rectData)
{
	// Translate rectData by (-scrollX, -scrollY)
	rectData[0] -= window.scrollY;
	rectData[1] -= window.scrollX;
	rectData[2] -= window.scrollY;
	rectData[3] -= window.scrollX;
	return rectData;
}

// Iterate over Set of already used fixedIDs to find the next ID not yet used and assign it to node as attribute
function AddFixedElement(node)
{
	// Determine fixed element ID
	var id;

	if(node.hasAttribute('fixedID'))
	{
		// node already in set, use existing ID
		id = node.getAttribute('fixedID');

		// Check if bounding Rect changes happened
		UpdateSubtreesBoundingRect(node);
	}
	else
	{
		// Add node to set of fixed elements, if position is fixed
		window.fixed_elements.add(node);

		// Find smallest ID not yet in use
		var found = false;
		for(var i=0, n=window.fixed_IDlist.length; i < n; i++)
		{
			if(!window.fixed_IDlist[i])
			{
				window.fixed_IDlist[i] = true;
				id = i;
				found = true;
			}
		}
		if(!found)
		{
			// Extend ID list by one entry
			window.fixed_IDlist.push(true);
			// Use new last position as ID
			id = window.fixed_IDlist.length-1;
		}

		// Create attribute in node and store ID there
		node.setAttribute('fixedID', id);

		// DEBUG
		// ConsolePrint("Adding fixed node #"+id);

		// Write node's (and its children's) bounding rectangle coordinates to List
		SaveBoundingRectCoordinates(node);
	}

	// TODO: Add attribute 'fixedID' to every child node



	var zero = '';
	if(id < 10) zero = '0';
	// Tell CEF that fixed node was added
	ConsolePrint('#fixElem#add#'+zero+id);
}


function SaveBoundingRectCoordinates(node)
{
	// DEBUG
	// ConsolePrint('Start of SaveBoundingRectCoordinates...');

	var rect = node.getBoundingClientRect();
	// Only add coordinates if width and height are greater zero
	// if(rect.width && rect.height)
	// {
	var id = node.getAttribute('fixedID');

	
	// Add empty 1D array to 2D array, if needed
	while(window.fixed_coordinates.length <= id)
	{
		window.fixed_coordinates.push([]);
	}

	// 1D array with top, left, bottom, right values of bounding rectangle
	var rect_coords = AdjustRectToZoom(
		node.getBoundingClientRect()
	);
	
	// Add rect coordinates to list of fixed coordinates at position |id|
	window.fixed_coordinates[id] = rect_coords;

	// DEBUG
	// ConsolePrint('Start of ComputeBoundingRectOfAllChilds...');

	// Compute bounding rect containing all child nodes
	var tree_rect_coords = ComputeBoundingRectOfAllChilds(node, 0, id);

	// Save tree rect, if different than fixed nodes bounding rect
	var equal = true;
	for(var i = 0; i < 4 && equal; i++)
	{
		equal &= (rect_coords[i] == tree_rect_coords[i]);
	}

	if(!equal)
	{
		window.fixed_coordinates[id] = 
			window.fixed_coordinates[id].concat(
				ComputeBoundingRect(rect_coords, tree_rect_coords)
			);
	}
	 ConsolePrint('Computed fixed#'+id+": "+window.fixed_coordinates[id]);

	 // DEBUG
	// ConsolePrint('End of SaveBoundingRectCoordinates.');
}

// Inform CEF about the current fication status of a already known node
function SetFixationStatus(node, status)
{
	var type = node.getAttribute('nodeType');
	var id = node.getAttribute('nodeID');

	if(type && id)
	{
		// DEBUG
		// ConsolePrint("Getting DOMObject...");
		
		var domObj = GetDOMObject(type, id);
		if(domObj)
		{
			domObj.setFixed(status);
		}
	}
}

// parent & child are 1D arrays of length 4
function ComputeBoundingRect(parent, child)
{
	// OLD APPROACH: Minimum Bounding Box for all children and parent
	// // if(parent.height == 0 || parent.width == 0)
	// if(parent[2]-parent[0] == 0 || parent[3]-parent[1] == 0)
	// 	return child;

	// return [Math.min(parent[0], child[0]),
	// 		Math.min(parent[1], child[1]),
	// 		Math.max(parent[2], child[2]),
	// 		Math.max(parent[3], child[3])];

	// top, left, bottom, right

	var bbs = [];
	for(var i = 0, n=child.length/4; i < n; i++)
	{
		var _child = [child[i], child[i+1], child[i+2], child[i+3]];

		// // no intersection possible
		// if(parent[3] <= _child[0] || parent[3] <= _child[1])
		// 	bbs.push(_child);

		if(_child[2] - _child[0] > 0 && _child[3] - _child[1])
			bbs.push(_child);
	}

	return bbs;
}

function ComputeBoundingRectOfAllChilds(node, depth, fixedID)
{
	// Check if node's bounding rectangle is outside of the current union of rectangles in |window.fixed_coordinates[id]|
	if(node.nodeType == 1) // 1 == ELEMENT_NODE
	{

		// Add attribute 'fixedID' in order to indicate being a child of a fixed node
		if(!node.hasAttribute('fixedID'))
		{
			node.setAttribute('fixedID', fixedID);
		}

		// Inform CEF that DOM node is child of a fixed element
		if(node.hasAttribute('nodeType'))
		{
			SetFixationStatus(node, true);
		}

		var rect = node.getBoundingClientRect();

		// Compare nodes to current bounding rectangle of all child nodes
		var rect_coords = AdjustRectToZoom(rect);

		// Traverse all child nodes
		if(node.children && node.children.length > 0)
		{
			var n = node.children.length;

			for(var i=0; i < n ; i++)
			{		
				// Compare previously computed bounding rectangle with the one computed by traversing the child node
				rect_coords = 
					ComputeBoundingRect(
						rect_coords,
						ComputeBoundingRectOfAllChilds(node.children.item(i), depth+1, fixedID)
					);
			}
		}


		return rect_coords;
	}

	// Error case
	return [-1,-1,-1,-1]; // TODO: nodeType != 1 possible? May ruin the whole computation
}

// If resetChildren=true, traverse through all child nodes and remove attribute 'fixedID'
// May not be neccessary if node (and its children) were completely removed from DOM tree
function RemoveFixedElement(node, resetChildren)
{
	// Remove node from Set of fixed elements
	window.fixed_elements.delete(node);

	if(node.hasAttribute('fixedID'))
	{
		var id = node.getAttribute('fixedID');
		// Remove fixedID from ID List
		window.fixed_IDlist[id] = false;
		// Delete bounding rectangle coordinates for this ID
		window.fixed_coordinates[id] = [];

		var zero = '';
		if(id < 10) zero = '0';

		// Tell CEF that fixed node with ID was removed
		ConsolePrint('#fixElem#rem#'+zero+id);
		// Remove 'fixedID' attribute
		node.removeAttribute('fixedID');

		if(resetChildren && node.children)
		{
			UnfixChildNodes(node.children);
		}
	}
}

function UnfixChildNodes(childNodes)
{
	for(var i = 0, n = childNodes.length; i < n; i++)
	{
		childNodes[i].removeAttribute('fixedID');
		
		SetFixationStatus(childNodes[i], false);

		if(childNodes[i].children)
		{
			UnfixChildNodes(childNodes[i].children);
		}
	}
}

// For fixed elements: Traverse subtree starting with given childNode as root
function UpdateSubtreesBoundingRect(childNode)
{

	var id = childNode.getAttribute('fixedID');

	// ConsolePrint('Checking #'+id+' for updates...');

	// Read out old rectangle coordinates
	var old_coords = window.fixed_coordinates[id];
	// Update bounding rectangles (only for subtree, starting with node where changes happend)
	var child_coords = ComputeBoundingRectOfAllChilds(childNode, 0, id);

	// ConsolePrint('child: '+child_coords);
	// ConsolePrint('old  : '+old_coords);
	var inform_about_changes = false;
	var parent_rect = old_coords.slice(0, 4);

	// Parent rect hasn't been containing all child rects
	if(old_coords.length > 4)
	{
		var old_child_rect = old_coords.slice(4);

		// Check if new child rect is contained in parent rect
		child_coords = ComputeBoundingRect(parent_rect, child_coords);

		// Inform CEF that coordinates have to be updated
		if(!CompareArrays(child_coords, parent_rect) && !CompareArrays(child_coords, old_child_rect))
		{

			// Update childrens' combined bounding rect 
			window.fixed_coordinates[id] = parent_rect.concat(child_coords);
			// alert('new: '+new_coords+'; old: '+old_coords);
			// ConsolePrint("Updated subtree's bounding rect: "+window.fixed_coordinates[id]);

			inform_about_changes = true;
		}
	}
	else // Parent rect has been containing all child rects
	{
		// Check if new child rect is contained in parent rect
		child_coords = ComputeBoundingRect(parent_rect, child_coords);

		if(!CompareArrays(parent_rect, child_coords))
		{
			window.fixed_coordinates[id] = parent_rect.concat(child_coords);

			inform_about_changes = true;
		}
		// else: Parent rect still contains updated child rect


		// TODO: Rewrite code here.. confusing af. Also, it seems to inform_about_changes, although none have taken place!
	}


	if(inform_about_changes)
	{
		var zero = '';
		if(id < 10) zero = '0';
		// Tell CEF that fixed node's coordinates were updated
		ConsolePrint('#fixElem#add#'+zero+id);

		// //DEBUG
		// ConsolePrint('Updated a fixed element');
		// for(var i = 0, n = window.fixed_coordinates.length; i < n ; i++)
		// {
		// 	var str = (i == id) ? '<---' : '';
		// 	ConsolePrint(i+': '+window.fixed_coordinates[i]+str);
		// }

		// DEBUG
		// ConsolePrint("UpdateSubtreesBoundingRect()");
	}

}

function CompareArrays(array1, array2)
{
	var n = array1.length;

	if(n != array2.length)
		return false;

	for(var i = 0; i < n; i++)
	{
		if(array1[i] != array2[i])
			return false;
	}

	return true;
}

// OLD APPROACH
function AddDOMTextLink(node)
{
	// DEBUG
	//ConsolePrint("START adding text link");

	window.dom_links.push(node);

	var rect = node.getBoundingClientRect(node);
	var coords = AdjustRectCoordinatesToWindow(rect); //[rect.top, rect.left, rect.bottom, rect.right];
	window.dom_links_rect.push(coords);


	// Add attribute in order to recognize already discovered DOM nodes later
	node.setAttribute('nodeType', '1');
	node.setAttribute('nodeID', (window.dom_links.length-1));

	// Tell CEF message router, that DOM Link was added
	ConsolePrint('DOM#add#1#'+(window.dom_links.length-1)+'#');

		// DEBUG
	//ConsolePrint("END adding text link");
}

// TESTING PURPOSE
document.onclick = function(){
	ConsolePrint("### document.onclick() triggered! ###");
	UpdateDOMRects();
	// UpdateFixedElementRects();

		// var divs = document.getElementsByTagName('DIV');
		// for (var i = 0, n = divs.length; i < n; i++)
		// {
		// 	var role = divs[i].getAttribute('role');
		// 	ConsolePrint('role: '+role);
		// 	if(role == 'button')
		// 	{
		// 		ConsolePrint("Found DIV which behaves as Button!");
		// 		CreateDOMLink(divs[i]);
		// 	}
		// 	if(role == 'textbox')
		// 	{
		// 		ConsolePrint("Found DIV which behaves as Textbox!");
		// 		CreateDOMTextInput(divs[i]);
		// 	}
		// }
	
}

window.maxDepth = 0;
function UpdateMaxDepth(node)
{
	ConsolePrint("UpdateMaxDepth...");
	var depth = 0;
	var current = node;
	while(current != document.documentElement)
	{
		ConsolePrint("depth: "+depth);
		current = current.parentNode;
		if(current) depth++;
	}
	ConsolePrint('Result: depth='+depth);
	window.maxDepth = Math.max(window.maxDepth, depth);
}


// Trigger DOM data update on changing document loading status
document.onreadystatechange = function()
{
	// ConsolePrint("### DOCUMENT STATECHANGE! ###");

	// if(document.readyState == 'loading')
	// {
	// 	// ConsolePrint('### document.readyState == loading ###'); // Never triggered
	// }

	if(document.readyState == 'interactive')
	{
		UpdateDOMRects();

		ForEveryChild(document.documentElement, AnalyzeNode);
	}

	if(document.readyState == 'complete')
	{
		UpdateDOMRects();

		ConsolePrint('<----- Page fully loaded. -------|');

		// GMail
		ForEveryChild(document.documentElement, AnalyzeNode);
		
	}
}

// http://stackoverflow.com/questions/18323757/how-do-you-detect-that-a-script-was-loaded-and-executed-in-a-chrome-extension


window.onresize = function()
{
	//UpdateDOMRects();
	// TODO: Update fixed elements' Rects too?
	ConsolePrint("Javascript detected window resize, update of fixed element Rects.");

	// UpdateFixedElementRects(); // TODO: Already triggered by CEF's JS injection?
}


document.addEventListener('transitionend', function(event){
	// TODO: for duckduckgo's shfiting links below search field

	// ConsolePrint(event.target.textContent+" "+window.getComputedStyle(event.target, null).getPropertyValue('opacity'));

		// ForEveryChild(event.target, function(child){
		// 	var nodeType = child.getAttribute('nodeType');
		// 	if(nodeType)
		// 	{
		// 		var nodeID = child.getAttribute('nodeID');
		// 		var domObj = GetDOMObject(nodeType, nodeID);
		// 		if(domObj)
		// 		{
		// 			domObj.checkVisibility();
		// 		}
		// 	}
		// });
	
	// ConsolePrint("Transition ended: opacity="+window.getComputedStyle(node, null).getPropertyValue('opacity'));
}, false);



var docFrags = [];

/* Modify appendChild in order to get notifications when this function is called */
var originalAppendChild = Element.prototype.appendChild;
Element.prototype.appendChild = function(child){

	// appendChild extension: Check if root is already part of DOM tree
    if(this.nodeType == 1 || this.nodeType > 8)
    {
		var subtreeRoot = this;

		// Stop going up the tree when parentNode is documentElement or doesn't exist (null or undefined)
		while(subtreeRoot !== document.documentElement && subtreeRoot.parentNode && subtreeRoot.parentNode !== undefined)
		{
			subtreeRoot = subtreeRoot.parentNode;
		}


		// Register subtree roots, whose children have to be checked outside of MutationObserver
        if(subtreeRoot !== document.documentElement) 
		{

			// When DocumentFragments get appended to DOM, they "lose" all their children and only their children are added to DOM
			if(subtreeRoot.nodeType == 11) // 11 == DocumentFragment
			{
				// Mark all 1st generation child nodes of DocumentFragments as subtree roots
				for(var i = 0, n = subtreeRoot.childNodes.length; i < n; i++)
				{
					window.appendedSubtreeRoots.add(subtreeRoot.childNodes[i]);

					ForEveryChild(subtreeRoot.childNodes[i], function(childNode){
						// if(childNode.style) childNode.style.backgroundColor = '#0000ff';
					});
					
				}
			}
			else 
			{	
				// if(subtreeRoot.style)
				// 	subtreeRoot.style.backgroundColor = "#ff0000";

				// Add subtree root to Set of subtree roots
				window.appendedSubtreeRoots.add(subtreeRoot);	

				// Remove children of this subtree root from subtree root set --> prevent double-checking of branches
				ForEveryChild(subtreeRoot, function(childNode){
						// if(childNode.nodeType == 1 && childNode.style) childNode.style.backgroundColor = '#ffff00';
						window.appendedSubtreeRoots.delete(childNode);
					}
				);


			}
		
		}

    }  

	// DocumentFragment as parent: children disappear when fragment is appended to DOM tree
	if(child.nodeType === 11)
	{
		// ConsolePrint("DocumentFragment as child (appendChild)");
		for(var i = 0, n = child.childNodes.length; i < n; i++)
		{

			// COLORING
			// if(child.childNodes[i].style) child.childNodes[i].style.backgroundColor = "#ff0000";
			ForEveryChild(child.childNodes[i], function(childNode){
					// if(childNode.nodeType == 1 && childNode.style) childNode.style.backgroundColor = '#ff00ff';
					window.appendedSubtreeRoots.delete(childNode);
				}
			);

			window.appendedSubtreeRoots.add(child.childNodes[i]);
		}
	}

	// Finally: Execute appendChild
    return originalAppendChild.apply(this, arguments); // Doesn't work with child, why?? Where does arguments come from?
};

document.createDocumentFragment = function() {
	var fragment = new DocumentFragment();

	var config = { attributes: true, childList: true, characterData: true, subtree: true, characterDataOldValue: false, attributeOldValue: true};
	window.observer.observe(fragment, config);

	return fragment;
};

// argument |applyFunction| has to take a node as only parameter
function ForEveryChild(parentNode, applyFunction)
{
	var depth = '-';
	ForEveryChild(parentNode, applyFunction, depth);
}

function ForEveryChild(parentNode, applyFunction, depth)
{
	var childs = parentNode.childNodes;
	if(childs && applyFunction)
	{
		// ConsolePrint(depth+"Executing ForEveryChild...");

		var n = childs.length;
		for(var i = 0; i < n; i++)
		{
			// ConsolePrint(depth+""+(i+1)+". child...");
			applyFunction(childs[i]);
			ForEveryChild(childs[i], applyFunction, (depth+'---'));
			
		
			// ConsolePrint(depth+""+(i+1)+". ... finished");
		}

		// ConsolePrint(depth+"... finished ForEveryChild");
	}
	// else
		// ConsolePrint(depth+" No children / no function");
}

function AnalyzeNode(node)
{
	// ConsolePrint("AnalyzeNode called");



	if((node.nodeType == 1 && !node.hasAttribute("nodeType"))|| node.nodeType > 8) // 1 == ELEMENT_NODE
	{
		// EXPERIMENTAL
		// if(node.tagName == 'SCRIPT')
		// {
			// Detect when external scripts start and end execution
		// 	node.textContent = "ConsolePrint('# Script START #); var f = function(){ "+node.textContent+"}; f(); ConsolePrint('# Script END #');";
		// }


		if(window.appendedSubtreeRoots.delete(node))
		{
			// ConsolePrint("My children have to be checked separatedly! "+node.tagName+ " class: "+node.getAttribute('class'));
			// node.style.backgroundColor = "#00ff00";

			// COLOR LEGEND
			// roots, not found by observer:	red
			// roots, found by observer:		green
			// children, not found by observer:	magenta
			// children, found by observer:		blue-green

			// ForEveryChild(node, function(child){ 
				// if(child.nodeType == 1 && 'style' in child) // child.style 
			// 		child.style.backgroundColor = '#00ffff'; 
			// });


			ForEveryChild(node, AnalyzeNode);
			// DEBUG
			// ForEveryChild(node.parentNode.parentNode.parentNode, AnalyzeNode);
			

		

			window.appendedSubtreeRoots.delete(node);
		}


		// Identify fixed elements on appending them to DOM tree
		if(window.getComputedStyle(node, null).getPropertyValue('position') == 'fixed') 
		{
			// ConsolePrint('position: '+node.style.position);
			if(!window.fixed_elements.has(node)) // TODO: set.add(node) instead of has sufficient?
			{
				//DEBUG
				// ConsolePrint("New fixed node added to DOM tree");

				AddFixedElement(node);

				UpdateDOMRects();
			}
		}



		// Find text links
		if(node.tagName == 'A' )
		{
			CreateDOMLink(node);
		}

		if(node.tagName == 'INPUT')
		{
			// Identify text input fields
			if(node.type == 'text' || node.type == 'search' || node.type == 'email' || node.type == 'password')
			{
				CreateDOMTextInput(node);
			}

			// TODO: Handle other kinds of <input> elements
			if(node.type == 'button' || node.type == 'submit' || node.type == 'reset' || !node.hasAttribute('type'))
			{
				// TODO: CreateDOMButton!
				CreateDOMLink(node);
			}
		}
		// textareas or DIVs, whole are treated as text fields
		if(node.tagName == 'TEXTAREA' || (node.tagName == 'DIV' && node.getAttribute('role') == 'textbox'))
		{
			CreateDOMTextInput(node);
		}

		// NEW: Buttons
		if(node.tagName == 'DIV' && node.getAttribute('role') == 'button')
		{
			CreateDOMLink(node);
		}

		// GMail
		if(node.tagName == 'DIV' && (node.getAttribute('role') == 'link' || node.getAttribute('role') == 'tab') )
		{
			CreateDOMLink(node);
		}
		if(node.tagName == "SPAN" && node.hasAttribute('email'))
		{
			CreateDOMLink(node);
		}



		if(node.tagName == 'FORM')
		{
			// Update whole <form> if transition happens in form's subtree
			// (For shifting elements in form (e.g. Google Login) )
			node.addEventListener('webkitTransitionEnd', function(event){
				// ConsolePrint("FORM transition event detected"); //DEBUG
				ForEveryChild(node, function(child){
					if(child.nodeType == 1)
					{
						var nodeType = child.getAttribute('nodeType');
						if(nodeType)
						{
							var nodeID = child.getAttribute('nodeID');
							var domObj = GetDOMObject(nodeType, nodeID);
							if(domObj)
							{
								domObj.updateRects();
							}
						}
					}
					
				});
			}, false);
		}


	}
}


// Instantiate and initialize the MutationObserver
function MutationObserverInit()
{ 
	ConsolePrint('Initializing Mutation Observer ... ');

	window.observer = new MutationObserver(
		function(mutations) {
		  	mutations.forEach(
		  		function(mutation)
		  		{
					// DEBUG
					// ConsolePrint("Mutation occured..."+mutation.type);

			  		var node;
					
		  			if(mutation.type == 'attributes')
		  			{
		  				node = mutation.target;

			  			var attr; // attribute name of attribute which has changed


		  				if(node.nodeType == 1) // 1 == ELEMENT_NODE
		  				{
		  					attr = mutation.attributeName;

		  					if(attr == 'style' ||  (document.readyState != 'loading' && attr == 'class') )
		  					{
								if(window.getComputedStyle(node, null).getPropertyValue('position') == 'fixed')
								{
									if(!window.fixed_elements.has(node))
									{
										//DEBUG
										// ConsolePrint("Attribut "+attr+" changed, calling AddFixedElement");

										AddFixedElement(node);
										
										UpdateDOMRects();
									}
						
								}
								else // case: style.position not fixed
								{
									// If contained, remove node from set of fixed elements
									if(window.fixed_elements.has(node))
									{
										RemoveFixedElement(node, true);

										UpdateDOMRects();
									}
								}


								// Visibility a): style.visibility of given node (and its children)
								// Check visibility of all children, only top most node called because of changes in node.style?

							
								// ForEveryChild(node, function(child){
								// 	if(child.nodeType == 1)
								// 	{	
								// 		var nodeType = child.getAttribute('nodeType');
								// 		if(nodeType)
								// 		{
								// 			var nodeID = child.getAttribute('nodeID');
								// 			var domObj = GetDOMObject(nodeType, nodeID);
								// 			if(domObj)
								// 			{
								// 				domObj.checkVisibility();
								// 			}
								// 		}
								// 	}
								// });
							
								


		  					} // END attr == 'style'

							// Changes in attribute 'class' may indicate that bounding rect update is needed, if node is child node of a fixed element
							if(attr == 'class')
							{
								if(node.hasAttribute('fixedID'))
								{
									//DEBUG
									// ConsolePrint("class changed, updating subtree");
									UpdateDOMRects();

									UpdateSubtreesBoundingRect(node);

									


									// TODO: Triggered quite often... (while scrolling)
								}

								// Testing: GMail, username entered, pw field appears, Rects not in place...
								UpdateDOMRects(); // TODO: With every class changes? Sounds wayyyy too much

								ForEveryChild(node, function(child){
									if(child.nodeType == 1)
									{	
										var nodeType = child.getAttribute('nodeType');
										if(nodeType)
										{
											var nodeID = child.getAttribute('nodeID');
											var domObj = GetDOMObject(nodeType, nodeID);
											if(domObj)
											{
												domObj.checkVisibility();
											}
										}
									}
								});
							}

		  				} // END node.nodeType == 1
						
					

		  			} // END mutation.type == 'attributes'





		  			if(mutation.type == 'childList') // TODO: Called upon each appending of a child node??
		  			{
		  				// Check if fixed nodes have been added as child nodes
			  			var nodes = mutation.addedNodes; // concat(mutation.target.childNodes);
						
			  			for(var i=0, n=nodes.length; i < n; i++)
			  			{
			  				node = nodes[i]; // TODO: lots of data copying here??

							// if(node.nodeType == 1 && node.getAttribute('class') == 'tag-home__wrapper')//'tag-home  tag-home--slide  no-js__hide  js-tag-home')
							// {
							// 	ConsolePrint("Observer found shifting root DIV on its appending to DOM");
							// 	ConsolePrint("Observer: node has "+node.childNodes.length+" already");
							// }
						
							// Mark child nodes of DocumentFragment, in order to analyze their subtrees
							if(mutation.target.nodeType == 11)
							{
								window.appendedSubtreeRoots.add(node);
								ForEveryChild(node, function(child){ window.appendedSubtreeRoots.delete(child); });
							}
							
			  				AnalyzeNode(node);

	
					
			  			}





			  			// Check if fixed nodes have been removed as child nodes and if yes, delete them from list of fixed elements
			  			var removed_nodes = mutation.removedNodes;
			  			for(var i=0, n=removed_nodes.length; i < n; i++)
			  			{
			  				node = removed_nodes[i];

			  				if(node.nodeType == 1)
			  				{
								if(window.fixed_elements.has(node))
								{
									RemoveFixedElement(node, false);

									UpdateDOMRects();
								}

								// TODO: Removal of relevant DOM node types??
			  				}
			  			}

		  			} // END mutation.type == 'childList'


		  		} // END forEach mutation


		 	);    
		}
	);



	// TODO:

	// characterData vs. attributes - one of those not neccessary?

	// attributeFilter -
	// Mit dieser Eigenschaft kann ein Array mit lokalen Attributnamen angegeben werden (ohne Namespace), wenn nicht alle Attribute beobachtet werden sollen.
	// --> nur relevante Attribute beobachten!

	ConsolePrint('MutationObserver successfully created! Telling him what to observe... ');
	ConsolePrint('Trying to start observing... ');
		
	// Konfiguration des Observers: alles melden - Änderungen an Daten, Kindelementen und Attributen
	var config = { attributes: true, childList: true, characterData: true, subtree: true, characterDataOldValue: false, attributeOldValue: true};
	
	// eigentliche Observierung starten und Zielnode und Konfiguration übergeben
	window.observer.observe(document, config);

	ConsolePrint('MutationObserver was told what to observe.');

	// TODO: Tweak MutationObserver by defining a more specific configuration



	
} // END OF MutationObserverInit()

function MutationObserverShutdown()
{
	window.observer.disconnect(); 

	delete window.observer;

	ConsolePrint('Disconnected and deleted MutationObserver! ');
}

		  				// https://developer.mozilla.org/de/docs/Web/API/Node
		  				// https://developer.mozilla.org/de/docs/Web/API/Element
		  				// http://stackoverflow.com/questions/9979172/difference-between-node-object-and-element-object
		  				// read also: http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/

		  												// offtopic: check if attributes exist
								// if(nodes[i].hasOwnProperty('style'))

			  					// http://ryanmorr.com/understanding-scope-and-context-in-javascript/
