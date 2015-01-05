var koockoo = koockoo || {};
(function(){
    koockoo.userLocale = localStorage ? (localStorage.getItem('user-locale') || 'us') : 'us';
    console.log("detected user locale:"+koockoo.userLocale);
})();