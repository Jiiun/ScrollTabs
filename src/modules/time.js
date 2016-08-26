
var Time = (function(){

  var Date = window.Date;
  
  function getTime(){
      return (Date.now || new Date().getTime)();
  }

  return {
    getTime: getTime
  }
})();

module.exports = Time;