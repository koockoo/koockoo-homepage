(function(){
	var self = {};
	
	$(document).ready(function(){
		self.initServices();
		self.initSlogans();
		self.initContent();
		self.initMenu();
	});
	
	/** initialize service endpoints */
	self.initServices = function () {
		$('.register :input').attr('disabled', true);
		$('.generate :input').attr('disabled', true);
		koockoo.service.init(self.onServiceInitialized);
	};
	
	self.onServiceInitialized = function() {
		$('.register :input').removeAttr('disabled');
		$('.generate :input').removeAttr('disabled');
		console.log("service enpoints are initialized");
	};
	
	self.onServiceInitializedFail = function() {
		console.log("service enpoints fail to initialize");
		$("#createStatus").html("Service Unavailable");
		$("#createStatus").removeClass().addClass( "invalid" );		
	};
	
	self.initContent = function() {
		$("#createButton").on("click", self.createAccount);
		$("#generateButton").on("click", self.generateSnippet);
		$( "#ul-slogans" ).find( "li" ).hover( self.hoverIn, self.hoverOut);
		self.interval = 10000;
		self.prevIdx = 0; 
		self.selectedIdx = 0;
		self.selectNextSlogan();
	};

	self.initMenu = function() {
		self.selctedPage = '#mainPage';
		$("#features").on("click", self.goFeatures);
		$("#docs").on("click", self.goDocs);
		$("#about").on("click", self.goAbout);
		$("#contact").on("click", self.goContact);
	};

	self.initSlogans = function() {
		self.messages = new Array();
		self.messages[0] = {id:"#detail1"};
		self.messages[1] = {id:"#detail2"};
		self.messages[2] = {id:"#detail3"};
		self.messages[3] = {id:"#detail4"};
	};


	self.goDocs = function() {
		self.showPage('#docPage');
	};

	self.goAbout = function() {
		self.showPage('#aboutPage');
	};

	self.goContact = function() {
		self.showPage('#contactPage');
	};

	self.goFeatures = function() {
		self.showPage('#featurePage');
	};

	/** show selected page and hide previous one*/
	self.showPage = function(pageId) {
		// same page - do nothing
		if (self.selctedPage == pageId) return;

		// show and hide
		$('html').css('background','white');
		$('html').css('background-color','white');
		$(self.selctedPage).css('display', 'none');
		$(pageId).css('display', 'block');
		self.selctedPage = pageId;

	}

	self.hoverIn = function(event) {
		self.stopNextSlogan = true;
		clearTimeout(self.timeout);
		if (self.selectedSlogan) {
			self.selectedSlogan.removeClass("selected");
		}
		self.selectedSlogan = $(event.target);
		$(self.selectedSlogan).addClass("selected");
		self.prevIdx = self.selectedIdx; 
		self.selectedIdx = $( "#ul-slogans li" ).index( self.selectedSlogan );
		self.setMessage();
	};
	
	self.hoverOut = function(event) {
		self.stopNextSlogan = false;
		self.selectedSlogan = $(event.target);
		self.timeout = setTimeout(self.selectNextSlogan, self.interval);
	};	
	
	self.selectNextSlogan = function() {
		if (self.stopNextSlogan == true) {
			return false;
		}
		if (self.selectedSlogan) {
			self.selectedSlogan.removeClass("selected");
			self.selectedSlogan = $( self.selectedSlogan ).next("li");
			if (!self.selectedSlogan.length) {
				self.selectedSlogan = $( "#ul-slogans" ).find( "li" ).first();
			}
		} else {
			self.selectedSlogan = $( "#ul-slogans" ).find( "li" ).first();
		}
		self.prevIdx = self.selectedIdx; 
		self.selectedIdx = $( "#ul-slogans li" ).index( self.selectedSlogan );
		$(self.selectedSlogan).addClass("selected");
		self.setMessage();
		self.timeout = setTimeout(self.selectNextSlogan, self.interval);
	};
	
	self.setMessage = function() {
		var prev = self.messages[self.prevIdx];
		var next = self.messages[self.selectedIdx];
		$(prev.id).css("display","none");
		$(next.id).css("display","block");
	};
	
	self.createAccount = function() {
		if ($("#emailInput")[0].validity.valid == true && 
			$("#nameInput")[0].validity.valid == true &&
			$("#passwordInput")[0].validity.valid == true) {
			var name = $("#nameInput").val();
			var email = $("#emailInput").val();
			var pwd = $("#passwordInput").val();
			if (name && email && pwd) {
				chatApi.register(name, email, pwd, self.onCreateAccountSuccess, self.onCreateAccountFail);
			}
		} else {
			$("#createStatus").html("Invalid Input");
			$("#createStatus").removeClass().addClass( "invalid" );
		}
	};
	
	self.onCreateAccountSuccess = function (result) {
		if (result.success) {
			$("#snippetEmail").val($("#emailInput").val());
			$("#createStatus").html("Success");
			$("#createStatus").removeClass().addClass( "success" );
		} else {
			$("#createStatus").html(result.message);
			$("#createStatus").removeClass().addClass( "invalid" );
		}
	};
	
	self.onCreateAccountFail= function (result) {
		$("#createStatus").html("Service Unavailable");
		$("#createStatus").removeClass().addClass( "invalid" );
	};
	
	self.generateSnippet = function() {
		var email = $("#snippetEmail").val();
		if (email) {
			chatApi.generate(email, self.onGenerateSnippetSuccess, self.onGenerateSnippetFail);
		}
	};
	
	self.onGenerateSnippetSuccess = function(result) {
		if (result.data) {
			$("#snippetArea").val(result.data);
		} else {
			$("#snippetArea").val(result.message);
		}	
	};

	self.onGenerateSnippetFail = function(result) {
		$("#snippetArea").val("SERVICE UNAVAILABLE");
	};	
	
	/******************** account service api definiton **************************/
	var chatApi = {};
	
	/** express registration */
	chatApi.register = function(displayName, email, password, onSuccess, onError) {
		$.ajax({
			type: koockoo.service.account.express.type,
			url : koockoo.service.account.express.url,
			data : {displayName:displayName, email:email, password:password}
		})		
		.done(onSuccess)
	    .fail(onError);
	};

	/**
	 * get code snippet
	 */
	chatApi.generate = function(email, onSuccess, onError) {
		$.ajax({
			type: koockoo.service.account.snippet.type,
			url : koockoo.service.account.snippet.url,
			data : {email:email},
			dataType : "json"
		})
		.done(onSuccess)
	    .fail(onError);
	};
	
	/*******************************************************************
	 * utils
	 * ******************************************************************/
	var utils = {};
	
	utils.animateResize = function(panel, newLeft, newTop, newWidth, newHeight, time, callback) {
		  if(panel == null)
		    return;
		 
		  var cLeft = panel.position().left;
		  var cTop = panel.position().top;
		  var cWidth = panel.width();
		  var cHeight = panel.height();
		 
		  var totalFrames = 1;
		  if(time> 0)
		    totalFrames = time/40;

		  var fLeft = newLeft - cLeft;
		  if(fLeft != 0)
		    fLeft /= totalFrames;
		 
		  var fTop = newTop - cTop;
		  if(fTop != 0)
		    fTop /= totalFrames;
		 
		  var fWidth = newWidth - cWidth;
		  if(fWidth != 0)
		    fWidth /= totalFrames;
		 
		  var fHeight = newHeight - cHeight;
		  if(fHeight != 0)
		    fHeight /= totalFrames;
		   
		  utils.doFrame(panel, cLeft, newLeft, fLeft, cTop, newTop, fTop, cWidth, newWidth, fWidth, cHeight, newHeight, fHeight, callback);
		};

		utils.doFrame = function(panel, cLeft, nLeft, fLeft,
			cTop, nTop, fTop, cWidth, nWidth, fWidth,
			cHeight, nHeight, fHeight, callback) {
			if(panel == null) {
				return;
			}	

			cLeft = utils.moveSingleVal(cLeft, nLeft, fLeft);
			cTop = utils.moveSingleVal(cTop, nTop, fTop);
			cWidth = utils.moveSingleVal(cWidth, nWidth, fWidth);
			cHeight = utils.moveSingleVal(cHeight, nHeight, fHeight);

			panel.css('left', Math.round(cLeft));
			panel.css('top', Math.round(cTop));
			panel.css('width', Math.round(cWidth));
			panel.css('height', Math.round(cHeight));
				 
			if(cLeft == nLeft && cTop == nTop && cHeight == nHeight && cWidth == nWidth) {
				if(callback != null) {
				    callback();
				}    
				return;
			}
				   
			setTimeout( function(){utils.doFrame(panel, cLeft, nLeft, fLeft, cTop, nTop, fTop, cWidth, nWidth, fWidth,
				    cHeight,nHeight,fHeight,callback);}, 40);
		};

		utils.moveSingleVal = function(currentVal, finalVal, frameAmt) {
			if(frameAmt == 0 || currentVal == finalVal)
				return finalVal;
				 
			currentVal += frameAmt;
			if((frameAmt> 0 && currentVal>= finalVal) || (frameAmt <0 && currentVal <= finalVal)) {
				return finalVal;
			}
			return currentVal;
		};
})();