var Browser = {
    isPhone: function(){
        var userAgent = navigator.userAgent.toLowerCase();
        return userAgent.indexOf('iphone') > -1 || userAgent.indexOf('android') > -1
    }
}
module.exports = Browser