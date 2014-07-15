(function(){
	var self = {};
	var chatApi = {};
	
	window.onload = function(e){ 
		self.showView("loginwindow");
		self.init();
		self.lookupService();
	};	
	
	self.showView = function(id) {
		$("#chatwindow").hide();
		$("#waitwindow").hide();
		$("#loginwindow").hide();
		$("#"+id).show();
	};
	
	/** init chat window*/
	self.init = function() {
		$("#startButton").on("click", self.startChat);
		
		// Disable caching of AJAX responses
		$.ajaxSetup({
			cache : false 	
		});
		
		// Init underscore templates to use ${} for params
		_.templateSettings = {interpolate : /\$\{(.+?)\}/g};
		
		// prepare template for chat messages
		self.messageTemplate = _.template( $("#message_template").html());
		
		$(window).on("unload", function() {
			window.opener._koockoo.chatWindow=null;
		});
		
		self.accountId = window.opener._koockoo.id;
	};
	
	// find available service
	self.lookupService = function() {
		if (location.href.indexOf("file") >-1 || location.href.indexOf("localhost")>-1) {
			chatApi.baseUrl = "http://localhost:8080/koockoo-services/";
		} else {
			$.ajax({
				url : "http://chatservicelocator.appspot.com/services/any",
				dataType : "json",
				success : function onSuccess(response) {
					chatApi.baseUrl = response.url+"/koockoo-services";
				}
			});	
		}
	};
	
	// guest starts chat
	self.startChat = function (e) {
		var displayName = $("#displayName")[0].value;
		self.displayName = displayName;
		self.showView("waitwindow");
		chatApi.start(displayName, self.accountId, self.startSuccess, self.connectionError);
	};	
	
	// chat started
	self.startSuccess = function(data) {
		self.contact = {id: data.initiatorId, displayName: self.displayName};
		self.session = {id: data.id};
		self.timer = setInterval(self.checkIfSessionAccepted, 10000);
	};	

	self.checkIfSessionAccepted = function() {
		chatApi.isAccepted(self.session.id, self.sessionAcceptedSuccess, self.connectionError);
	};
	
	// chat started
	self.sessionAcceptedSuccess = function(data) {
		if (data.success == true) {
			clearInterval(self.timer);
			self.showView("chatwindow");
			$("#sendButton").on("click", self.sendMessage);
			$("#usermsg").on("keypress", self.messageTextPressed);
			$("#exitButton").on("click", self.exit);
			self.timer = setInterval(self.pollMessages, 10000);
		}
	};
	
	self.exit = function() {
		clearInterval(self.timer);
		chatApi.exit(self.contact.id);
		window.close();
	};
	
	self.messageTextPressed = function(event) {
		if (event.keyCode == 13) {
			self.sendMessage(event);
		}
	};
	
	self.sendMessage = function(event) {
		var textel = $('#usermsg')[0];
		var msg = textel.value;
		textel.value = "";
		if (msg == "" || msg==undefined) {
			return;
		}
		var message = new Message();
		message.message = msg;
		self.renderMessage(message);
		self.submitMessage(message);
	};

	self.submitMessage = function(message) {
		var onSuccess = function(data) {
			self.sendMessageSuccess(data, message);
		};
		var onError = function(data) {
			self.sendMessageError(data, message);
		};
		chatApi.send(self.session.id, message.toJson(), onSuccess, onError);
	};

	self.sendMessageSuccess = function(data, message) {
		var oldid = message.id; // find by oldid and mark delivered
		message.id = data.id;
	};

	self.sendMessageError = function(data, message) {
		// TODO: resend or exit ?
		console.log('sendMessageError: '+data);
	};
	

	// read messages from server
	self.pollMessages = function() {
		if (self.contact == undefined || self.contact.id == "") {
			return;
		}
		chatApi.read(self.contact.id, self.pollSuccess, self.connectionError);
	};
	
	// successfully retrieved messages from server
	self.pollSuccess = function(data) {
		var messages = data[self.session.id];
		if (messages) {
			for ( var i = 0; i < messages.length; i++) {
				var obj = messages[i];
				var msg = Message.fromJson(obj);
				self.renderMessage(msg);
			}
		}	
	};
	
	self.renderMessage = function (message) {
		var html = self.messageTemplate(message.toUI());
		$('#chatmessages').append(html);
		if (message.author == self.contact) {
			$("#"+message.id).addClass("dark-shady");
		} else {
			$("#"+message.id).addClass("light-shady");
		}	
	};
	
	
	self.connectionError = function (data) {
		console.log(" Can't connect to chat");
	};
	
	
	/******************** chat service api definiton **************************/
	
	/** guest will be disconnected and chat session closed */
	chatApi.exit = function(contactId, onSuccess, onError) {
		$.ajax({
			url : chatApi.baseUrl+"/guest/exit/"+contactId,
			dataType : "json"
		})		
		.done(onSuccess)
	    .fail(onError);
	};

	/**
	 * new chat session will be created for the guest
	 */
	chatApi.start = function(name, accountId, onSuccess, onError) {
		$.ajax({
			url : chatApi.baseUrl+"/guest/start/"+accountId,
			data : {name:name},
			dataType : "json"
		})
		.done(onSuccess)
	    .fail(onError);
	};

	/**
	 * return chat session if accepted or nothing
	 */
	chatApi.isAccepted = function(sessionId, onSuccess, onError) {
		$.ajax({
			url : chatApi.baseUrl+"/guest/isaccepted/"+sessionId,
			dataType : "json"
		})
		.done(onSuccess)
	    .fail(onError);
	};
	
	/**
	 * post a message as json 
	 */
	chatApi.send = function(sessionId, data, onSuccess, onError) {
		$.ajax({
			url : chatApi.baseUrl+"/message/"+sessionId,
			type: "POST",
			data : data,
			dataType :"application/json; charset=UTF-8",
			contentType: "application/json; charset=UTF-8"
		})		
		.done(onSuccess)
	    .fail(onError);
	};

	/**
	 * get chat messages as json {session: [messages]}
	 */
	chatApi.read = function(contactId, onSuccess, onError) {
		$.ajax({
			url : chatApi.baseUrl+"message/"+contactId,
			type: "GET",
			dataType : "json"
		})      
		.done(onSuccess)
	    .fail(onError);
	};	
	
	/************************ Define Message Object ****************************/ 
	function Message() {
		var ts = moment.utc();
		this.id = ts.unix();
		this.timestamp = ts;
		this.message = "";
		this.author = self.contact;
	}
		
	/**
	 * kinda static function to instantiate new message from json obj
	 * usage: var message = Message.fronJson(json)
	 */
	Message.fromJson = function(jsonObj) {
		var msg = new Message();
		msg.id = jsonObj.id;
		msg.author = {id:jsonObj.author.id, displayName: jsonObj.author.displayName};
		msg.message = jsonObj.message;
		msg.timestamp = moment.utc(jsonObj.timestamp);
		return msg;
	};
	
	/** returns JSON string to send on server */
	Message.prototype.toJson = function () {
			var jsonObj = {};
			jsonObj.author = this.author;
			jsonObj.message = this.message;
			return JSON.stringify(jsonObj);
	};
	
	/**	return formatted obj for ui */
	Message.prototype.toUI = function() {
			var msg = {};
			msg.id = this.id
			msg.author = this.author.displayName;
			msg.message = this.message;
			msg.timestamp = this.timestamp.format('HH:mm');
			return msg;			
	};	
	
})();