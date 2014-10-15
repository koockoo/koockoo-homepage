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
		localTry: 0,
		localIps: ["http://192.168.1.148:8080", "http://192.168.1.71:8080"],
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
		if (self.successCallback) {
			self.successCallback();
		}
	};
	
	self.onServiceFail = function () {
		if (self.failCallback) {
			self.failCallback();
		}
	};
	/** 
	 * look up available service endpoint.
	 * JS running from the file or localhost will connect to localhost only.
	 * 
	 *  When running from the website always connect to public service.
	 *  if PC and returned public service are in home network this will connect to hardcoded local ip.
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
				success : self.onGetBaseUrlSuccess,
				failure: self.onGetBaseUrlFail,
				error: self.onGetBaseUrlFail
			};
			self.ajax(request);
		}
	};
	
	/** base url retrieved. now let's ping the service for availability */
	self.onGetBaseUrlSuccess = function(response) {
        if (self.isExt()) {
            response = Ext.decode(response.responseText);
        }
		self.baseUrl = response.url+"/koockoo-services";
		self.pingBaseUrl();
	};

	/** base url retrieved. now let's ping the service for availability */
	self.onPingBaseUrlSuccess = function(response) {
		self.initUrls();
		self.onServiceReady();
	};

    /** base url retrieved. now let's ping the service for availability */
    self.onPingBaseUrlSuccess = function(response) {
        self.initUrls();
        self.onServiceReady();
    };

	/** base url is not retrieved. fail */
	self.onGetBaseUrlFail = function(response) {
		self.onServiceFail();
	};

	/** ping the service for availability */
	self.pingBaseUrl = function(url) {
		var request = {
				url : self.baseUrl+"/ping",
				method: "GET",
				dataType : "json",
				timeout: 5000,
				success : self.onPingBaseUrlSuccess,
				failure: self.retryLocalUrl,
				error: self.retryLocalUrl
			};
		
		self.ajax(request);
	};
	
	self.retryLocalUrl = function() {
		if (self.localTry < self.localIps.length) {
			self.baseUrl = self.localIps[self.localTry]+"/koockoo-services";
			self.localTry++;
			self.pingBaseUrl();
		} else {
			self.onGetBaseUrlFail();
		}
	};
	
	self.ajax = function(request){
        if (self.isExt()) {
            Ext.Ajax.request(request);
        } else {
			$.ajax(request);
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

        url = self.baseUrl+"/chatroom";
        koockoo.service.chatroom = {
            ping:       {url: url+"/ping", type:'GET'},
            pending:    {url: url+"/pending", type:'GET'},
            open:    {url: url+"/open", type:'GET'},
            close:    {url: url+"/close", type:'GET'},
            accept:    {url: url+"/accept", type:'GET'}
        };
	};

    self.isExt = function() {
        return typeof Ext !== 'undefined'
    };
	
})();