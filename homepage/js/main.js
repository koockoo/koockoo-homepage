(function(){
	var self = {};
	
	$(document).ready(function(){
		self.initSlogans();
		self.init();	
	});
	
	self.init = function() {
		self.showHideStyle = "more out";
		$("#showHideInstructions").on("click", self.showHideInstractions);
		$("#createButton").on("click", self.createAccount);
		$("#generateButton").on("click", self.generateSnippet);
		$( "#ul-slogans" ).find( "li" ).hover( self.hoverIn, self.hoverOut);
		self.interval = 10000;
		self.selectNextSlogan();
		self.lookupService();
	};
	
	self.initSlogans = function() {
		self.messages = new Array();
		self.messages[0] = {
				bgimage:"url('homepage/img/man-question.jpg'), linear-gradient(to right, #FFFFFF 50%, #CCF 100%)",
				text: "1 Create your account in 1 click.<br><br>2. Insert code fragment into your Webpage.<br><br>3. You are all set to chat. Just launch operator app."
			};
		self.messages[1] = {
				bgimage:"url('homepage/img/man-ok.jpg'), linear-gradient(to right, #FFFFFF 50%, #CCF 100%)",
				text: "Yes it's free!<br><br>There is no cost to you to start using our chat.<br><br>Our chat is fully hosted.<br> No downloads and installations on your site."
			};
		self.messages[2] = {
				bgimage:"url('homepage/img/man-nocare.png'), linear-gradient(to right, #FFFFFF 50%, #CCF 100%)",
				text: "No free trial axe by your neck. <br><br> Free subscription never expires.<br><br> Use it as long as you need it."
			};
		self.messages[3] = {
				bgimage:"url('homepage/img/man-operator.jpg'), linear-gradient(to right, #FFFFFF 50%, #CCF 100%)",
				text: "Add as many operators as you need to your account for free.<br><br> No per operator fee, no package deals, no promotions."
			};
	};
	
	self.showHideInstractions = function (event) {
		var el = $("#showHideInstructions");
		var cls = el.attr('class');
		el.attr('class', self.showHideStyle);
		self.showHideStyle = cls;
		if ($("#instructions").css("display") == "block") {
			$("#instructions").css("display", "none");
		} else {
			$("#instructions").css("display", "block");
		}
	};
	
	self.hoverIn = function(event) {
		self.stopNextSlogan = true;
		clearTimeout(self.timeout);
		if (self.selectedSlogan) {
			self.selectedSlogan.removeClass("selected");
		}
		self.selectedSlogan = $(event.target);
		$(self.selectedSlogan).addClass("selected");
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
		self.selectedIdx = $( "#ul-slogans li" ).index( self.selectedSlogan );
		$(self.selectedSlogan).addClass("selected");
		self.setMessage();
		self.timeout = setTimeout(self.selectNextSlogan, self.interval);
	};
	
	self.setMessage = function() {
		var msg = self.messages[self.selectedIdx];
		$("#details span").html(msg.text);
		$("#details").css("background-image",msg.bgimage);
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
		$("#snippetEmail").val($("#emailInput").val());
		$("#createStatus").html("Success");
		$("#createStatus").removeClass().addClass( "success" );		
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
		if (result.success==true) {
			$("#snippetArea").val(result.data);
		} else {
			$("#snippetArea").val("No koockoo account associated with provided email adress");
		}	
	};

	self.onGenerateSnippetFail = function(result) {
		$("#snippetArea").val("SERVICE UNAVAILABLE");
	};	
	
	/******************** account service api definiton **************************/
	var chatApi = {};
	
	// find available service
	self.lookupService = function() {
		if (location.href.indexOf("file") >-1 || location.href.indexOf("localhost")>-1) {
			chatApi.baseUrl = "http://localhost:8080/koockoo-services/";
		} else {
			$.ajax({
				url : "http://chatservicelocator.appspot.com/services/any",
				dataType : "json",
				success : function onSuccess(response) {
					chatApi.baseUrl = response.url+"/koockoo-services/";
				}
			});	
		}
	};
	
	/** express registration */
	chatApi.register = function(displayName, email, password, onSuccess, onError) {
		$.ajax({
			type: "POST",
			url : chatApi.baseUrl+"account/express",
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
			type: "GET",
			url : chatApi.baseUrl+"account/snippet/"+email,
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