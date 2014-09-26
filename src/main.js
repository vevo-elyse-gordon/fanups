$(function(){

	var pipStartTime = 9;
	var pipDuration = 20; // like Vine, but better ;)

	var playerMain = $('#playerMain')[0];
	var playerPip = $('#playerPip')[0];

	$.get("/fanups", function(data){
		pipStartTime = data[0].startTime;
		$(playerPip).attr("src", data[0].path);
		playerPip.load();
		playerMain.play();
	});

	var startPip = _.once(function() {
		console.log("startPip");
		$(playerPip).fadeIn("slow");
		playerPip.play();
		return null;
	});

	var killPip = function(fade){
		console.log("killPip");
		playerPip.pause();
		playerPip.currentTime = 0;
		if(fade) {
			$(playerPip).fadeOut("slow");
		}
		else {
			$(playerPip).hide();
		}
	}

	var isPipped = function () {
		// TODO make sure the main video is at the pip range 
		// TODO bonus points - that they are in sync
		return ($(playerPip).length > 0) && $(playerPip).filter(":visible");
	}

	var syncPip = function (mainTime) {
		// beforePip - reset pip, fade out pip
		if (mainTime < pipStartTime) {
			killPip();
		}
		// afterPip - fade out pip
		else if (mainTime > pipStartTime + pipDuration) {
			killPip();
		}
		// earlierPip - seek pip
		// laterPip - seek pip
		else {
			$(playerPip).show();
			var seekTime = mainTime - pipStartTime;
			playerPip.currentTime = seekTime;
		}
	}

	/*
	MAIN PLAYER EVENTS
	*/
	// DEBUG
	// $(playerMain).on("loadeddata", function(evt){
	// 	console.log(evt);
	// 	playerMain.currentTime = pipStartTime - 2;
	// });

	$(playerMain).on("timeupdate", function(evt){
		var currentTime = playerMain.currentTime;
		console.log("player currentTime", currentTime);
		if (parseInt(currentTime, 10) === pipStartTime) {
			startPip();
		}
	});

	$(playerMain).on("seeked", function() {
		syncPip(playerMain.currentTime);
	});

	$(playerMain).on("pause", function(evt) {
		if (isPipped()) {
			playerPip.pause();
		}
	});

	$(playerMain).on("play", function(evt) {
		if (isPipped()) {
			playerPip.play();
		}
	});

	$(playerMain).on("ended", function(){killPip(true)});

	/*
	PIP PLAYER EVENTS
	*/

	$(playerPip).on("timeupdate", function(evt){
		var currentTime = playerPip.currentTime;
		console.log("pip currentTime", currentTime);
		if (parseInt(currentTime, 10) >= pipDuration) {
			killPip(true);
		}
	});

	$(playerPip).on("ended", function(){killPip(true)});
});