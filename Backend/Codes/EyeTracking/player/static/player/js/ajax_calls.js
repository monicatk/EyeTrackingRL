

// this will be called when a user trigger an event on the player. e.g. play, pause and etc
function record_player_state(videoId, state){
	
	var stateCode = 0;
	
	switch(state) {
	case "stop":
		stateCode = 3;
        break;
	case "end":
        stateCode = 2;
        break;
    case "play":
        stateCode = 1;
        break;
    case "pause":
        stateCode = 0;
        break;
    default:
        stateCode = 0;
	}
	
	$.ajax({
		url: "/player/ajax/record_state/",
		type: "GET",
		//type: "POST",
		data: {			
			'videoId': videoId,
			'state': stateCode,
			'length': Math.ceil(player.getDuration()),
			'passed': Math.ceil(player.getCurrentTime())
		},
		dataType: 'json',
		success: function (data) {
			console.log(data);
		},
		error: function(xhr){
            console.log("An error occured: " + xhr.status + " " + xhr.statusText);
        }
	});
  
}

