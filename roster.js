var Roster = my.Class({
/*
	var options ={
		numeric_id: "",
		access_token: "",
		user : {
			full_name: "",
			is_leader: true
		},
		leader_id : 0,
		protocol  : '2',
		endpointType : 'commandCenter',
		eventServiceUrl : ""
	};
*/

/*
		this.options.events = ['meeting','endpoint','chat','private_chat'];

*/
	
    constructor : function(options, cbRoster,cbChat,cbPrivateChat){
		this.roster = [];
		this.options = options;
		this.rosterCB = cbRoster;
		this.chatCB   = cbChat;
		this.privateChatCB = cbPrivateChat;
		this.isObject  = this.isObjectfn;
		this.mergeDeep = this.mergeDeepfn;
		this.sendMessage = this.sendMessagefn;
		this.rosterMessage = this.rosterMessagefn;
	},
	
    onMessage : function ( msg )
    {
		var self = this;
		var mobj = "";
		var evtJson = "";
		
		try{
			mobj = JSON.parse(msg);
		}catch(e) 
		{
			console.error("Cannot parse event message: " + msg);
			return;
		}

		var mt = mobj[0];
		var data = mobj[1];
		
		if( mt == "meeting.notification.msg" ) {
			try {
				evtJson = JSON.parse(data.body);
			} catch(e)
			{
				console.error("Cannot parse event body: " + data.body);
				return;
			}
			
			var evtType = evtJson.event;
			if( evtType.startsWith("statechange.livemeeting") ){
				var mtgState = evtJson.props.meetingState;
				if(mtgState == "MeetingFinished")
				{
					/*
					// Handle close of meeting
					//
					showMsg("Meeting finished, closing chat");
					theChat.close();
					*/
				}
			} else if (evtType.startsWith('statechange.endpoints')) {
				self.rosterMessage(evtJson);
			}
			if(null != self.rosterCB){
				self.rosterCB();
			}

		} else if(mt == "meeting.chat.msg") {
			// handle chat
			if(null != self.chatCB) {
				console.log("chatCB");
				self.chatCB(data.body);
			}
		} else if( mt == "private.chat.msg") {
			// handle private chat
			if(null != self.privateChatCB) {
				self.privateChatCB(data.body);
			}
		}
	}, // onmessage

	rosterMessagefn : function(eventJson){
		console.log("rosterMSgfn");
		var self=this;
		
		// Current state
		// Each Event message will have a property field "props"
		// that field is an object with 1 or more action properties: "f","a","m","d"
		// 		Each Action Property is an array of affected participants props: { f:[...], a:[...] } etc
		//
		var ops = Object.keys(eventJson.props);
		
		ops.forEach( (op,i)=>{
			// Extract out the property field
			switch(op) {
				case "f" : // full update of roster
					console.log(op + ": " + eventJson.props[op]);
					eventJson.props[op].forEach(function (item,n)
					{
						self.roster.push(item);
					});
					break;
				
				case "a": // add parties
					console.log(op + ": " + eventJson.props[op]);
					eventJson.props[op].forEach(function (item)
					{
						self.roster.push(item);
					});
					break;
				
				case "d": // delete parties
					console.log(op + ": " + eventJson.props[op]);
					eventJson.props[op].forEach(function (item)
					{
						var d = -1;
						for(var i=0; (d<0) && (i<self.roster.length); i++){
							if( self.roster[i].E1 == item.E1 ){
								d=i;
							}
						}
						if(d>=0){
							self.roster.splice(d);
						}
					});
					break;
				
				case "m": // modify parties
					console.log(op + ": " + eventJson.props[op]);
					eventJson.props[op].forEach(function (item)
					{
						// perform deep merge of incoming data to modify existing party
						var d = -1;
						for(var i=0; (d<0) && (i<self.roster.length); i++){
							if( self.roster[i].E1 == item.E1 ){
								d=i;
							}
						}
						if(d>=0){
							self.mergeDeep( self.roster[d], item );
						}
					});
					break;
			} // switch
		}); // forEach JSON prop
	}, // if statechange.endpoints
	
	
	/**
	 * Simple object check.
	 * @param item
	 * @returns {boolean}
	 */
	isObjectfn : function(item) {
	  return (item && typeof item === 'object' && !Array.isArray(item));
	},


	/**
	 * Deep merge two objects.
	 * @param target
	 * @param ...sources
	 */
	mergeDeepfn : function(target, ...sources) {
	  var self = this;
	  if (!sources.length) return target;
	  const source = sources.shift();

	  if (self.isObject(target) && self.isObject(source)) {
		for (const key in source) {
		  if (self.isObject(source[key])) {
			if (!target[key]) Object.assign(target, { [key]: {} });
			self.mergeDeep(target[key], source[key]);
		  } else {
			Object.assign(target, { [key]: source[key] });
		  }
		}
	  }

	  return self.mergeDeep(target, ...sources);
	},
	
	sendMessagefn : function (message){
		this.evtService.sendEvent("meeting.chat.msg", {
			msg: JSON.stringify(message)
			});
	},
	
});

