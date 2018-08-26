window.domLinks = [];
window.domTextInputs = [];

/* TODOs
        - Write method 'InformCEF' -- DONE
        - Delete methods with equal name in old approach
            > UpdateDOMRects()
            > ...
        - Adjust RenderProcessHandler to new approach
*/

/**
 * Constructor
 */
function DOMObject(node, nodeType)
{
    /* Attributes */
        this.node = node;
        this.nodeType = nodeType;
        this.rects = AdjustClientRects(this.node.getClientRects());
        this.visible = true;    // default value, call DOMObj.checkVisibility() after object is created!
        this.fixed = false;
        this.overflowParent = undefined;

    /* Methods */ 
        // Update member variable for Rects and return true if an update has occured 
        this.updateRects = function(){

            this.checkVisibility();

            // Get new Rect data
            var updatedRectsData = AdjustClientRects(this.node.getClientRects());

            if(this.fixed)
            {
                //  updatedRectsData = updatedRectsData.map( function(rectData){ rectData = SubstractScrollingOffset(rectData);} );
                // NOTE: Not sure if this works like intended
                updatedRectsData.map( function(rectData){ rectData = SubstractScrollingOffset(rectData);} );
            }

            // Compare new and old Rect data
            var equal = CompareClientRectsData(updatedRectsData, this.rects);

            // Rect updates occured and new Rect data is accessible
            if(!equal && updatedRectsData != undefined && updatedRectsData.length > 0)
            {
                this.rects = updatedRectsData;
                InformCEF(this, ['update', 'rects']); 
            }
            
            return !equal;
        };

        // Returns float[4] for each Rect with adjusted coordinates
        this.getRects = function(){
            // Update rects if changes occured
            // this.updateRects();

            // Return rects as list of float lists with adjusted coordinates
            return this.rects;
        };

        this.setFixed = function(fixed){
            if(this.fixed != fixed)
            {
                this.fixed = fixed;
                InformCEF(this, ['update', 'fixed']);
                this.updateRects();
            }
        };

        this.setVisibility = function(visible){
            if(this.visible != visible)
            {
                this.visible = visible;
                InformCEF(this, ['update', 'visible']);
                if(visible) this.updateRects();
            }
        };

        this.checkVisibility = function(){
            var visibility = window.getComputedStyle(this.node, null).getPropertyValue('visibility');

            // Set visibility to hidden if bounding box is of resolution is 0 in any direction
            var bb = this.node.getBoundingClientRect();
            if(bb.width == 0 || bb.height == 0) { visibility = 'hidden'; }


            // Check if any parent node has opacity near zero, if yes, child (this node) might not be visible
            var root = this.node;
            while(root !== document.documentElement && root && root !== undefined)
            {
                if(window.getComputedStyle(root, null).getPropertyValue('opacity') < 0.0001)
                {
                    visibility = 'hidden';
                    break;
                }
                root = root.parentNode;
            }

            switch(visibility)
            {
                case 'hidden': { this.setVisibility(false); return; }
                case '':
                case 'visible': { /*this.setVisibility(true);*/ break; }
                default:
                { 
                    ConsolePrint("DOMObj.checkVisibility() - visibility="+visibility+" currently handled as 'visible'.");
                    // this.setVisibility(true);
                }
            }

            if(this.overflowParent)
            {
                var overflowRect = this.overflowParent.getBoundingClientRect();
                var nodeRect = this.node.getBoundingClientRect();

                // DEBUG
                // ConsolePrint("Comparing node's bounding box with overflow parent's bounding box...");
                // ConsolePrint("overflow box: "+overflowRect.top+","+overflowRect.left+","+overflowRect.bottom+","+overflowRect.right);
                // ConsolePrint("node's   box: "+nodeRect.top+","+nodeRect.left+","+nodeRect.bottom+","+nodeRect.right);

                // Test if overflow box is more than a thin line
                if( (overflowRect.height > 0 && overflowRect.width > 0) &&
                    // Test if node's Rect lies completely inside of overflow Rect, then node is visible
                    !(overflowRect.left <= nodeRect.left && overflowRect.right >= nodeRect.right && 
                    overflowRect.top <= nodeRect.top && overflowRect.bottom >= nodeRect.bottom))
                    {
                        this.setVisibility(false);
                        // DEBUG
                        // ConsolePrint("Node's box is outside, so it's not visible!");
                        return;
                    }
                // ConsolePrint("Node's box is inside, so node is visible!");

            }
            this.setVisibility(true);

        }

        this.searchOverflows = function (){
            // NOTE: Assuming there aren't a any overflows in an overflow
            var parent = this.node.parentNode;
            while(parent != null || parent === document.documentElement)
            {
                if(parent.nodeType == 1)
                {
                    // style.overflow = {visible|hidden|scroll|auto|initial|inherit}
                    var overflowProp = window.getComputedStyle(parent, null).getPropertyValue('overflow');
                    if(overflowProp == 'hidden')
                    {
                        // Add node as overflow parent and compute own visibility with Rect of overflow parent
                        this.overflowParent = parent;
                        // DEBUG
                        // ConsolePrint("Found an overflow parent!");
                        return;
                    }
                }
                parent = parent.parentNode;
            }
        }

        this.setTextInput = function(text, submit){
            ConsolePrint("setTextInput called with text='"+text+"' and submit="+submit+ "   domObj.nodeType="+this.nodeType);

            // Only executable if DOMNode is TextInput field
            if(this.nodeType === 0)
            {
                if (this.node.tagName == 'INPUT')
                {
                    // GOOGLE FIX
                    var inputs = this.node.parentNode.getElementsByTagName("INPUT");
                    var n = inputs.length;
                    var zIndex = window.getComputedStyle(this.node, null).getPropertyValue('z-index');
                    for(var i = 0; i < n && n > 1; i++)
                    {
                        if(inputs[i] !== this.node && inputs[i].type == this.node.type)
                        {
                            if(zIndex < window.getComputedStyle(inputs[i], null).getPropertyValue('z-index'))
                            {
                                inputs[i].value = text;
                                ConsolePrint("Set text input on another input field with higher z-index");
                            }
                        }
                    }
                    
                    this.node.value = text;

                }
                else
                {
                    this.node.textContent = text;
                    ConsolePrint("Set input's value to given text");
                }
                
                
                // ConsolePrint("Input text was set!");

                if(submit)
                {
                    // NOTE: Emulate pressing Enter in input field?

                    var parent = this.node.parentNode;
                    var no_form_found = false;
                    while(parent.nodeName != 'FORM')
                    {
                        parent = parent.parentNode;
                        if(parent === document.documentElement)
                        {
                            ConsolePrint('Could not submit text input: No child of any form element.');
                            no_form_found = true;
                            break;
                        }
                    }
                    if(!no_form_found)
                    {
                        parent.submit();
                        ConsolePrint("Input text was submitted.");
                    }
                
                }

            }
        };


}

/**
 * Create a DOMObject of given type for node and add it to the global list
 * Also, automatically inform CEF about added node and in case of Rect updates
 * 
 * args:    node : DOMNode, nodeType : int
 * returns: void
 */
function CreateDOMObject(node, nodeType)
{
    // Only add DOMObject for node if there doesn't exist one yet
    if(!node.hasAttribute('nodeID'))
    {
        // Create DOMObject, which encapsulates the given DOM node
        var domObj = new DOMObject(node, nodeType);

        // Push to list and determined by DOMObjects position in type specific list
        var domObjList = GetDOMObjectList(nodeType);



        if(domObjList != undefined)
        {
            domObjList.push(domObj);
            var nodeID = domObjList.length - 1;

            // Add attributes to given DOM node
            node.setAttribute('nodeID', nodeID);
            node.setAttribute('nodeType', nodeType);

            // Setup of attributes
            domObj.checkVisibility();
            domObj.searchOverflows();
 


            InformCEF(domObj, ['added']);
        }
        else
        {
            ConsolePrint("ERROR: No DOMObjectList found for adding node with type="+nodeType+"!");
        }

    }
    else
    {
        // ConsolePrint("Useless call of CreateDOMObject");
    }
}

function CreateDOMTextInput(node) { CreateDOMObject(node, 0); }
function CreateDOMLink(node) { CreateDOMObject(node, 1); }


/**
 * Adjusts given DOMRects to window properties in order to get screen coordinates
 * 
 * args:    rects : [DOMRect]
 * return:  [[float]] - top, left, bottom, right coordinates of each DOMRect in rects
 */
function AdjustClientRects(rects)
{
	function RectToFloatList(rect){ return [rect.top, rect.left, rect.bottom, rect.right]; };

    var adjRects = [];
    for(var i = 0, n = rects.length; i < n; i++)
    {
        adjRects.push(
            AdjustRectCoordinatesToWindow(rects[i])
        );
    }

    return adjRects;
}

/**
 * Compares two lists of DOMRect objects and returns true if all values are equal
 * 
 * args:    rects1, rects2 : [DOMRect]
 * returns: bool
 */
function CompareClientRects(rects1, rects2)
{
	var n = rects1.length;

	if(n != rects2.length)
		return false;

	// Check if width and height of each Rect are identical
	for(var i = 0; i < n; i++)
	{
		if(rects1[i].width != rects2[i].width || rects1[i].height != rects2[i].height)
			return false;
	}

	// Check if Rect coordinates are identical
	for(var i = 0; i < n; i++)
	{
		// Note: It's enough to check x & y if width & height are identical
		if(rects1[i].x != rects2[i].x || rects1[i].y != rects2[i].y)		
			return false;
	}

	return true;
}

/**
 * Compares two lists of type [[float]] and returns true if all values are equal
 * 
 * args:    rects1, rects2 : [[float]]
 * returns: bool
 */
function CompareClientRectsData(rects1, rects2)
{
    if(rects2 == undefined)
        return false;

    var n = rects1.length;

	if(n != rects2.length)
		return false;

	// Check if width and height of each Rect are identical
	for(var i = 0; i < n; i++)
	{
		for(var j = 0; j < 4; j++)
        {
            if(rects1[i][j] != rects2[i][j])
             return false;
        }
	}

	return true;
}

/**
 * Triggers update of DOMRects of each DOMObject by using DOMObjects updateRects() method
 * 
 * args:    -/-
 * returns: void
 */
function UpdateDOMRects()
{
    // DEBUG
    // ConsolePrint("UpdateDOMRects() called");

    // Trigger update of Rects for every domObject
    window.domTextInputs.forEach(
        function (domObj) { domObj.updateRects(); }
    );
    window.domLinks.forEach(
        function (domObj) { domObj.updateRects(); }
    );

    // ConsolePrint("Also, update fixed element Rects");
    UpdateFixedElementRects();

    // ConsolePrint("And visibility!");
    // Trigger update of Rects for every domObject
    window.domTextInputs.forEach(
        function (domObj) { domObj.searchOverflows(); domObj.checkVisibility(); }
    );
    window.domLinks.forEach(
        function (domObj) { domObj.searchOverflows(); domObj.checkVisibility(); }
    );
}

/**
 * Transform natural language to encoded command to send to CEF
 * 
 * args:    domObj : DOMObject, operation : [string]
 * returns: void
 */
function InformCEF(domObj, operation)
{
    var id = domObj.node.getAttribute('nodeID');
    var type = domObj.nodeType;

    if(id != undefined && type != undefined)
    {
        // Encoding uses only first 3 chars of natural language operation
        var op = operation[0].substring(0,3);

        var encodedCommand = 'DOM#'+op+'#'+type+'#'+id+'#';

        if(op == 'upd')
        {
            if(operation[1] == 'rects')
            {
                var rectsData = domObj.getRects();
                // Encode changes in 'rect' as attribute '0'
                encodedCommand += '0#';
                // Encode list of floats to strings, each value separated by ';'
                for(var i = 0, n = rectsData.length; i < n; i++)
                {
                    for(var j = 0; j < 4; j++)
                    {
                        encodedCommand += (rectsData[i][j]+';');
                    }
                }
                // Add '#' at the end to mark ending of encoded command
                encodedCommand = encodedCommand.substr(0,encodedCommand.length-1)+'#';
            }

            if(operation[1] == 'fixed')
            {
                // If fixed attribute doesn't exist, node is not fixed
                var status = (domObj.node.getAttribute('fixedID') != undefined) ? 1 : 0;
                // Encode changes in 'fixed' as attribute '1'
                encodedCommand += ('1#'+status+'#');

            }

            if(operation[1] == 'visible')
            {
                var status = (domObj.visible) ? 1 : 0;
                
                encodedCommand += ('2#'+status+'#');
                // ConsolePrint("encodedCommand: "+encodedCommand);
            }
        }



        // Send encoded command to CEF
        ConsolePrint(encodedCommand);
    }
    else
    {
        ConsolePrint("ERROR: No DOMObject given to perform informing of CEF!");
    }
}

/**
 * Get global list of DOMObjects for specific node 
 * 
 * args:    nodeType : int
 * returns: [DOMObject]
 */
function GetDOMObjectList(nodeType)
{

    switch(nodeType)
    {
        case 0:
        case '0': { return window.domTextInputs; };
        case 1:
        case '1': { return window.domLinks; };
        // NOTE: Add more cases if new nodeTypes are added
        default:
        {
            ConsolePrint('ERROR: No DOMObjectList for nodeType='+nodeType+' exists!');
            return undefined;
        }
    }
}


/**
 * Get DOMObject by using node's type and ID
 * 
 * args:    nodeType, nodeID : int
 * returns: DOMObject
 */
function GetDOMObject(nodeType, nodeID)
{
    var targetList = GetDOMObjectList(nodeType);

    // Catch error case
    if(nodeID >= targetList.length || targetList == undefined)
    {
        ConsolePrint('ERROR: Node with id='+nodeID+' does not exist for type='+nodeType+'!');
        return undefined;
    }

    return targetList[nodeID];
}

// ATTENTION: V8 doesn't seem to work with polymorphism of functions!

// /**
//  * Get corresponding DOMObject to a given node, if it doesn't exist 'undefined' is returned
//  * 
//  * args:    node : DOMNode
//  * return:  DOMObject
//  */
// function GetDOMObject(node)
// {
//     var id = node.getAttribute('nodeID');
//     var type = node.getAttribute('nodeType');

//     if(!id || !type)
//         return undefined;

//     return GetDOMObject(type, id);
// }