var Date = window.Date;

var DateTime = {
  getTime: function(){
      return (Date.now || new Date().getTime)();
  },
  now: function() {
	return +( new Date() );
  }
};

module.exports = DateTime;