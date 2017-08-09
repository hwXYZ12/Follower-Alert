(() => {
	const fs = require('fs');		
	const KEYS_FILE_PATH = 'C:\\Users\\Will\\Desktop\\more stuff\\even more stuff\\keys2\\ids.json';
	const CHANNEL_NAME = "11111011101";
	const MAX_FOLLOW_CHECK = 100;
	const POLL_RATE = 4000;
	const TRANSITION_TIME = 2000;
	const ANIMATIONS_CHECK_RATE = 2000;
	const STALL_TIME = 4500;
	const FOLLOW_MESSAGE = "Welcome ";
			
	// get client id and client secret from local file	
	var cId = "";
	var cSecret = "";
	var keys = JSON.parse(fs.readFileSync(KEYS_FILE_PATH, 'utf-8'));
		
	// get keys from the file
	clientId = keys['clientId'];
	clientSecret = keys['clientSecret'];	
	let channelId = keys['channelId'];		
					
	// get a reference to the twitch api
	var twitchApi = require('twitch-api-v5');
	twitchApi.clientID = clientId;
				
	// continuously poll the Twitch API for a list of
	// the most recent 100 followers
	let recentFollowers;
	
	// follower alert sound	
	let followerSound = new Audio();
	followerSound.src = "sounds\\illuminatiSound (mp3cut.net).mp3";

	// initialize the follower list with an initial twitch api call
		
	// try to call the twitch api for the follower list
	try{
		twitchApi.channels.followers({channelID: channelId, limit: MAX_FOLLOW_CHECK}, (errors, ret) => {

			if(errors){
				console.log(errors);
			} else{

				recentFollowers = new Set();
				
				var followListLength = Object.keys(ret.follows).length;
				for(var i = 0; i < followListLength; ++i){
					recentFollowers.add(ret.follows[i].user.name);
				}	
			}
		});
	}catch(e){
		console.log("ERROR - Could not reach the Twitch server.");
	}
	
	
	// call the api every few seconds and check the new follow list
	// against the old follow list
	let newFollowerStack = [];
	function checkFollowers(){
		
		// try to call the twitch api for the follower list
		try{

			twitchApi.channels.followers({channelID: channelId, limit: MAX_FOLLOW_CHECK}, (errors, ret) => {
			
				// occasionally a strange bug will occur in which the ret object is null
				// this would normally crash the program but with this failsafe it won't
				if(errors){
					console.log(errors);
				} else{
					let newList = ret.follows;
					
					// compare the new list to the old list
					// and find any differences
					let count = 0;
					while(count < MAX_FOLLOW_CHECK){
						let newName = newList[count].user.name;
						if(recentFollowers.has(newName))
							break;
						else{					
							recentFollowers.add(newName);
							newFollowerStack.push(newName);
							++count;
						}
					}
				}

			});

		} catch(e){
			console.log("ERROR - Could not reach the Twitch server.");
		}
		
	}
			
	// pop and a single follower alert from the stack display it
	let notAnimating = true;
	function handleAnimations(){
		
		if(newFollowerStack.length && notAnimating){

			// lock animation resources
			notAnimating = false;
		
			// set the follower alert name
			let theName = newFollowerStack.pop();
			let theText = document.getElementById('followerText');
			theText.textContent = FOLLOW_MESSAGE+theName+"!";		

			// transition the follower alert into view
			let theFollowerAlert = document.getElementById('followerAlert');
			followerAlert.classList.add('isVisible');
			
			// play the current alert sound
			followerSound.setTime = 0.00;
			followerSound.play();
												
			// transition the follower alert out of view
			setTimeout(transitionAlert, TRANSITION_TIME+STALL_TIME);
			
			function transitionAlert(){
				
				// begin animation to remove the follower alert
				followerAlert.classList.remove('isVisible');
				
				// unlock animation resources										
				setTimeout(() => {notAnimating = true;}, TRANSITION_TIME);
				
			}
		
		}
		
	}

	setInterval(checkFollowers, POLL_RATE);	
	setInterval(handleAnimations, ANIMATIONS_CHECK_RATE);						
})()