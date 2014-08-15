/**
 * This Module is an API description for the koockoo-services.
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
		localIps: [],
		localUrl: "http://localhost:8080/koockoo-services",
		balancer: "http://chatservicelocator.appspot.com/services/any",
		baseUrl: "",
		ready: false	
	};

	koockoo.service.init = function (successCallback, failCallback) {
		self.successCallback = successCallback;
		self.failCallback = failCallback;
		self.lookupService();
	};
	
	/** Invoke external call back if any when service is ready to consume*/
	self.onServiceReady = function () {
		self.successCallback();
	};
	/** 
	 * look up available service endpoint.
	 * JS running from the file or localhost will connect to localhost only.
	 * 
	 *  When running from the website always connect to public service.
	 *  if PC and public service both are in home network this will connect to hardcoded home ip.
	 */
	self.lookupService = function() {
		if (location.href.indexOf("file") >-1 || location.href.indexOf("localhost")>-1) {
			self.baseUrl = self.localUrl;
			self.initUrls();
			self.onServiceReady();
		} else {
			var request = {
				url : self.balancer,
				method: "GET",
				dataType : "json",
				success : function onSuccess(response) {
						self.baseUrl = response.url+"/koockoo-services";
						self.initUrls();
						self.onServiceReady();
				}
			};
			
			if ($ && $.ajax) {
				$.ajax(request);
			} else if (Ext && Ext.Ajax){
			    Ext.Ajax.request(request);
			}	
		}
	};
	
	/** initialize services urls */
	self.initUrls = function() {
		var url = self.baseUrl+"/auth";
		koockoo.service.auth = {
		    ping:         {url: url+"/ping", type:'GET'},
		    signOperator: {url: url+"/signin/operator", type:'POST'},
			signGuest:    {url: url+"/signin/guest", type:'POST'},
			signout:      {url: url+"/signout", type:'POST'}
		};
		
		url = self.baseUrl+"/account";
		koockoo.service.account = {
			    ping:      {url: url+"/ping", type:'GET'},
			    express:   {url: url+"/express", type:'POST'}, 
			    snippet:   {url: url+"/snippet", type:'POST'}
		};	
	};
	
})();