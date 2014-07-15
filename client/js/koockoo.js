(function(){
	var self = {};
	
	window.onload = function(e){ 
		self.init();
		self.show();
	}	
	
	self.init = function() {
		self.body = document.body;
	}
	
	self.styleSpan = function() {
		self.span.style.padding="25px";
		self.span.style.color="navy";
		self.span.style.textShadow= "1px 1px 0.15em #EEE"; 
		self.span.style.lineHeight="40px"; 
		self.span.style.fontWeight="bold"; 
		self.span.style.fontSize="14px";
	}

	self.styleDiv = function() {
		self.div.style.borderRadius="5px";
		self.div.style.cursor="pointer";
		self.div.style.position= "fixed"; 
		self.div.style.width="120px"; 
		self.div.style.height="40px"; 
		self.div.style.display="block";
	}
	
	self.styleDivHover = function(hovered) {
		if (hovered) {
			self.div.style.boxShadow="5px 5px 5px #888888"; 
			self.div.style.background="linear-gradient(to top, #BAFFFA 0%, #7092EF 100%)";
			self.div.style.top="5px"; 
			self.div.style.right="15px"; 			
		} else {
			self.div.style.boxShadow="none";
			self.div.style.background="linear-gradient(to top, #BAFFFA 0%, #5D76EF 100%)";
			self.div.style.top="10px"; 
			self.div.style.right="10px"; 			
		}	
	}
	
	self.show = function() {
		// create elements
		self.div = document.createElement('div');
		self.span = document.createElement('span'); 
		self.span.innerHTML = "Live Help";
		self.div.appendChild(self.span);
		self.body.appendChild(self.div);
		
		// style elements
		self.styleSpan();
		self.styleDiv();
		self.styleDivHover(false);
		
		// bind event listeners
		self.div.onclick = self.onClick;
		self.div.onmouseover = function() {self.styleDivHover(true);};
		self.div.onmouseout = function() {self.styleDivHover(false);};
	}
	
	self.onClick = function(e) {
		console.log("clicked "+_koockoo.id);
		if (!_koockoo.chatWindow) {
			_koockoo.chatWindow = window.open("client/chat.html", "Online Chat", "height=600,width=600,titlebar=no,location=no");
		}
		_koockoo.chatWindow.focus();
	}
	
})();