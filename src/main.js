$(function(){

	var pipStartTime = 9;
	var pipDuration = 20; // like Vine, but better ;)

	var playerMain = $('#playerMain')[0];
	var playerPip = $('#playerPip')[0];

	$.getJSON("/fanups")
	.success(function (data) {
		console.log("fanups JSON:", data.fanups); // DEBUG
		// TODO handle multiple pips
		pip = data.fanups[0]; // DEBUG
		pipStartTime = parseInt(pip.startTime, 10);
		$(playerPip).attr("src", pip.path);
		if (pipStartTime === 0) { startPip(); }
		playerMain.play();
	})
	.fail(function(err) {
		console.error("fanups JSON error:", err);
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