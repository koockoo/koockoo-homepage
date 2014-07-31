/**
 * This Module is a proxy APi for the koockoo-services.
 * Module initializes global var koockoo-services.
 * Supported services
 * auth
 * account
 * message
 */
var koockoo = koockoo || {};
(function(){
	koockoo.service = {};
	
	var self = {
		localUrl: "http://localhost:8080/koockoo-services",
		balancer: "http://chatservicelocator.appspot.com/services/any",
		baseUrl: ""
	};
	
	window.onload = function(e) { 
		self.lookupService();
	};
	
	/** 
	 * look up available service endpoint.
	 * JS running from the file or localhost will try to connect local service.
	 * if no local available then attempt to connect to real public one.
	 * 
	 *  When runing from the website always connect to public service.
	 *  if public service is home service this will connect to hardcoded home service.
	 * 
	 * */
	self.lookupService = function() {
		if (location.href.indexOf("file") >-1 || location.href.indexOf("localhost")>-1) {
			self.baseUrl = self.localUrl;
			self.initUrls();
		} else {
			$.ajax({
				url : self.balancer,
				dataType : "json",
				success : function onSuccess(response) {
					self.baseUrl = response.url+"/koockoo-services";
					self.initUrls();
				}
			});	
		}
	};
	
	/**
	 * initialize services urls
	 * */
	self.initUrls = function() {
		var url = self.baseUrl+"/auth";
		koockoo.service.auth = {
		    ping:         url+"/ping",
		    signOperator: url+"/signin/operator",
			signGuest:    url+"/signin/guest",
			signout:      url+"/signout"
		};
		
		url = self.baseUrl+"/account";
		koockoo.service.account = {
			    ping:       url+"/ping",
			    express:    url+"/express",
			    snippet:    url+"/snippet"
		};	
	};
	
})();