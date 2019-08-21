
var BrowserEvents = my.Class({
	
	constructor : function ( options, cbOnMessage, cbConnect ) {
		this.eventWS = null;
		this.options = options;
		this.onMessageCB = cbOnMessage;
		this.connected = false;
		this.connectCB = cbConnect;
		this.sendEvent = this.sendEventfn;
		this.onOpen    = this.onOpenfn;
		this.onMessage = this.onMessagefn;
		this.onClose   = this.onClosefn;
	},
	
	sendEventfn : function (event_name, event_data) {
		if(!this.eventWS)
			return;
		
		if (event_name === 'heartbeat' || this.isConnected())
		{
			this.eventWS.send(JSON.stringify([event_name, event_data || {}]));
		}
	},
	
	onOpenfn : function(){
		var self=this;
		self.connected = true;
		//
		// this.options.events = ['meeting','endpoint','chat','private_chat'];
		// caller should have preset the desired event types
		self.sendEvent('meeting.register', self.options);
		if(self.connectCB ){
			self.connectCB(true);
		}
	},
	
	onMessagefn : function(evt){
	  var self=this;
	  var theMsg;
	  try{
		  theMsg  = JSON.parse(evt.data);
	  }catch(e)
	  {
		  return;
	  }

	  if( theMsg[0]=="keepalive" ){
		  self.sendEvent("heartbeat");
	  } else if(self.onMessageCB){
		  self.onMessageCB(evt.data);
	  }
	  
	},
	
	
	onClosefn : function() {
	  // websocket is closed.
	  console.log("Closing web socket");
	  this.connected = false;
	  this.eventWS.onmessage = null;
	  this.eventWS.onopen = null;
	  this.eventWS = null;
	  if(this.connectCB){
		  this.connectCB(false);
	  }
	},

	connect: function() {
		var self = this;
		this.options.eventServiceUrl =
			this.options.eventServiceUrl.replace("https:","wss:");
		this.options.eventServiceUrl += "/websocket";
				
		this.eventWS = new WebSocket( this.options.eventServiceUrl );
		
		this.eventWS.onopen = 
		   ()=>{
		   		self.connected = true;
				//
				// this.options.events = ['meeting','endpoint','chat','private_chat'];
				// caller should have preset the desired event types
				self.sendEvent('meeting.register', self.options);
				if(self.connectCB ){
					self.connectCB(true);
				}
		   };
		this.eventWS.onmessage = // this.onMessage;
			  (evt)=>{
				  var theMsg;
				  try{
					  theMsg  = JSON.parse(evt.data);
				  }catch(e)
				  {
					 console.log("error parsing msg");
					 return
				  }

				  if( theMsg[0]=="keepalive" ){
					  self.sendEvent("heartbeat");
				  } else if(self.onMessageCB){
					  self.onMessageCB(evt.data);
				  }		
			  };
	  
		this.eventWS.onclose = // this.onClose;
			()=>{
				  // websocket is closed.
				  console.log("Closing web socket");
				  self.connected = false;
				  self.eventWS.onmessage = null;
				  self.eventWS.onopen = null;
				  self.eventWS = null;
				  if(self.connectCB){
					  self.connectCB(false);
				  }
			};
	},
	
	isConnected : function() {
		return this.connected;
	},
	
	close : function() {
		this.doCloseWS();
	}

});

