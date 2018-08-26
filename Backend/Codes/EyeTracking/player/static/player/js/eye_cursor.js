$( document ).ready(function() {
	// used to simulate click function on parent element
	var timer = '';
	//$('.hoverClickable').on('mouseover', function(){
	$( document ).on( 'mouseover', '.hoverClickable', function(e){	
		var hoveredElement = $(this).parent().attr('id');
			timer =  setTimeout(function() {
			   // trigger the click after 1.5 seconds
				console.log(hoveredElement);
				$("#" + hoveredElement)[0].click();
				//$("#" + hoveredElement).trigger( "click" );
	}, 1500);
	});
		//$('.hoverClickable').on('mouseout', function() {
		$( document ).on( 'mouseout', '.hoverClickable', function(e){
			clearInterval(timer);
	});
	
	// used to simulate click function on the element
	var timer2 = '';
	//$('.hoverClickableSelf').on('mouseover', function(){
	$( document ).on( 'mouseover', '.hoverClickableSelf', function(e){	
		var hoveredElement = $(this).attr('id');
			timer2 =  setTimeout(function() {
			   // trigger the click after 1.5 seconds
				console.log(hoveredElement);
				$("#" + hoveredElement)[0].click();
				//$("#" + hoveredElement).trigger( "click" );
	}, 1500);
	});
		//$('.hoverClickableSelf').on('mouseout', function() {
		$( document ).on( 'mouseout', '.hoverClickableSelf', function(e){
			clearInterval(timer2);
	});
	
	
});





