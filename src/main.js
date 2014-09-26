$(function(){

	var pipStartTime = 9;
	var pipDuration = 240; // like Vine, but better ;)
	var volumeAdjust = .5;

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
	})
	.fail(function(err) {
		console.error("fanups JSON error:", err);
	})
	.always(function() {
		playerMain.play();
	});

	var startPip = _.once(function() {
		console.log("startPip");
		$(playerPip).fadeIn("slow");
		playerPip.play();
		playerMain.volume = .5;
		return null;
	});

	var killPip = function(fade){
		playerMain.volume = 1;
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

	var outsideOfPip = function(mainTime) {
		return ((mainTime < pipStartTime) || (mainTime > pipStartTime + pipDuration));
	}

	var isPipped = function () {
		var pipOnPage = ($(playerPip).length > 0) && $(playerPip).filter(":visible");
		return pipOnPage && !outsideOfPip(playerMain.currentTime);
	}

	var syncPip = function (mainTime) {
		// beforePip or afterPip - reset pip, fade out pip
		if (outsideOfPip(mainTime)) {
			killPip();
		}
		// earlierPip or laterPip - seek pip
		else {
			$(playerPip).show();
			var seekTime = mainTime - pipStartTime;
			playerMain.volume = .5;
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
		console.log("playerMain.currentTime", playerMain.currentTime); // DEBUG
		var currentTime = parseInt(playerMain.currentTime, 10);
		if (currentTime === pipStartTime) {
			startPip();
		}

		var minutes = Math.floor(currentTime / 60), 
			seconds = currentTime % 60, 
			currentMoment = moment({minutes: minutes, seconds: seconds});
		$("#newPipStartTime").val(currentMoment.format("mm:ss"));
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