var inputNodes = document.getElementsByTagName('input');
var textInput = [];
for (i = 0; i < inputNodes.length; i++)
{
    if(inputNodes[i].type == 'text' || inputNodes[i].type == 'search' || inputNodes[i].type == 'email' || inputNodes[i].type == 'password')
	{
        var rect = inputNodes[i].getBoundingClientRect();
        if(rect.width > 0 && rect.height > 0)
	    {
            if(textInput.length > 0)
	        {
                var rect2 = textInput[textInput.length-1].getBoundingClientRect();
                if(rect2.top != rect.top || rect2.bottom != rect.bottom || rect2.left != rect.left || rect2.right != rect.right)
	            {
                    textInput.push(inputNodes[i]);
			    }
            }
	        else
	        {
                    textInput.push(inputNodes[i]);
            }
	    }
	}
}
window.sizeTextInputs = textInput.length;