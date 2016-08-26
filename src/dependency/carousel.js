var DOM = require('../modules/dom');
var TransformStyle = require('../modules/transformStyle');
var Transition = require('../modules/transition');
var Time = require('../modules/time');

var Carousel = (function($){

  var transformStyle = TransformStyle;
  var transitionEnd = Transition.end;
  var getTime = Time.getTime;
 
  function _transitionTime (obj, time) {
    time = time || 0;

    obj.style[transformStyle.transitionDuration] = time + 'ms';
  }


  function Carousel(config){

    this.scroller = typeof config.id == 'string' ? document.querySelector('#'+config.id) : config.id;
    this.position = 0;
    this.callback = config.callback;
    this.timeout = 300;
    this.index = 0;

    //一屏多张幻灯片
    this.alignCenter = config.alignCenter;

    this.tranisitionDuration = config.duration || 400;

    this.vDirection = config.dire;
    this.up = config.vertical;
    this.tab = config.tab;



    // this.minHeight = this.scroller.parentNode.offsetHeight;
    this.minHeight = this.scroller.parentNode.clientHeight;//这里不能用offsetHeight，当容器包含padding时会计算进来，这样会出现首次进入时不能滚动
    if(navigator.userAgent.toLowerCase().indexOf('android') == -1){
      //iphone临时解决方案，容器高度高出5像素，初次渲染后能滚动
      // this.scroller.clientWidth;
      //在android上这段代码，会引起有些浏览器不能滑动
      this.minHeight += 1;
    }
    else{
      this.scroller.parentNode.classList.add('stick');
    }
    $(this.scroller).find('.container').css('min-height', this.minHeight + 'px');

    this.meta = {};


    if(config.indicators){
      this.indicators = document.querySelector('#'+config.indicators).children;
    }


    var self = this;

    this.init(function(){
      self.active(config.current || 0);
    });
    
    if(!this.tab){
      //幻灯片，不是tab
      this.bindEvents();

    }
    

    $(this.scroller).delegate('.scroll', 'tap', function(){
      
      var index = $(this).index();

      if(index != self.index){
        self.active(index);
      }
    });

    this.scroller.addEventListener(transitionEnd, function(){

      //由于current样式有时候会配合动画，所以在滑动动画结束后执行
      DOM.addClassOnly(self.scroller.children, 'current', self.index);
      
      //如果html一开始display:none，则不会执行该动画
      // if(!self.touchTime || !self.stay && self.right()){
      if(!self.touchTime || !self.stay){
        //touchTime为0时，说明Carousel被其他控件触发引起动画
        //跳到上／下一页执行

        self.resetHeight();
        
        self.scrollTop();
        
        config.end && config.end(self.index);

        self.stay = true;

      }

      if(self.scroller.parentNode.classList.contains('carousel'))
        self.scroller.parentNode.classList.remove('carousel');

      self.touchTime = 0;

    });

    // this.scroller.classList.add('fixBug');
    // this.scroller.classList.remove('fixBug');
  }

  Carousel.prototype = {
    'init': function(fn){

      this.scroller.style[transformStyle.transitionTimingFunction] = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      this.transitionTime();

      var self = this;
      this.lastPosition = 0;


      var viewport = this.scroller.parentNode.offsetWidth;
      var kid = this.scroller.children[0];
      var width = self.width = +kid.offsetWidth;
      var height = self.height = kid.offsetHeight;
      var unit = this.up ? height : width;

      this.width = width;
      this.viewport = viewport;

      var timeout = 0;

      if(this.alignCenter){
        //幻灯片不占满屏幕
        var scroller = this.scroller;
        scroller.style.marginLeft = (viewport - width) / 2 + 'px';
        timeout = 300;
      }

      setTimeout(function(){
        //异步执行active，避免多个动画同时执行
        fn && fn()
      }, timeout);

      this.pages = $.map(this.scroller.children, function(item, index){

        var start = -index * unit;
        var end = start - unit;
        var cx = (start + end) / 2;

        self.lastPosition += unit;

        return {
          'start': start,
          'end': end,
          'cx': cx//中间线,过线跳至下一页
        }
      });
      self.lastPosition -= unit;


    },
    bindEvents: function(){

      if(this.binding){
        //已绑定
        return;
      }

      this.binding = 1;
      var self = this;

      this.startEvent = function(){
        // event.preventDefault();
        //在move的情况下绑定事件后，start事件不执行
        self.start(event);

      };

      this.moveEvent = function(){

        // event.preventDefault();

        self.move(event);
      }

      this.endEvent = function(){
        // event.preventDefault();
        self.end(event);
      }
    
      this.scroller.addEventListener('touchstart', this.startEvent, false);

      this.scroller.addEventListener('touchmove', this.moveEvent, false);

      this.scroller.addEventListener('touchend', this.endEvent, false);
    },
    unbindEvents: function(){

      if(!this.binding){
        //未绑定
        return;
      }
      this.scroller.removeEventListener('touchstart', this.startEvent);

      this.scroller.removeEventListener('touchmove', this.moveEvent);

      this.scroller.removeEventListener('touchend', this.endEvent);
      this.binding = 0;
    },
    isBinding: function(){
      return this.binding;
    },
    'start': function(ev){
      // ev.preventDefault();

      var touch = ev.changedTouches[0];
      
      // console.log('start-carousel-' + touch.target.innerText.replace(/\n/mg,''));

      //this.touchTime也用于判断是滑动跳转还是点击页签跳转
      //纵向滑动时再点击页签，this.touchTime有值导致transitionend不执行，所以这里只能重置touchTime，不能初始化
      this.touchTime = 0;
      this.startTime = getTime();

      this.x = this.startX = this.pageX = touch.pageX;
      this.y = this.startY = this.pageY = touch.pageY;


      //this.x 手指的位置
      //this.startX 用于判断手指是否快速滑动
      //this.pageX 手指开始触摸的位置
      //this.position = 0;
      //this.noTransition();
    },
    'move': function(ev){


      var touch = ev.changedTouches[0];

      // console.log('move-carousel-' + touch.target.innerText.replace(/\n/mg,''));



      ev.preventDefault();

      this.touchTime = getTime();

      //这个放在RefreshTabs
      //确保纵向滚动时切换页签，减少斜向切换
      this.scroller.parentNode.classList.add('carousel');

      var distance = this.up ? touch.pageY - this.y : touch.pageX - this.x;
      if(this.edge()){

        distance = distance / 3;
      }

      this.position += distance;
      
      this.x = touch.pageX;
      this.y = touch.pageY;
      this.dire = this.up ? touch.pageY - this.pageY : touch.pageX - this.pageX;
      this.noTransition();
      this.translate();

      if(getTime() - this.startTime > 300){
        this.startTime = getTime();
        this.startX = touch.pageX;
        this.startY = touch.pageY;
      }
      

    },
    'end': function(ev){

      // if(!this.right()){
      //  this.touchTime = 0;
      //  return;
      // }
      var self = this;

      //标志是否翻页
      //默认应该为true，因为当前页滚动时不能进入transition.end
      this.stay = true;
      this.transitionTime();

      var distance = self.up ? Math.abs(self.y - self.startY) : Math.abs(self.x - self.startX);
      var period = getTime() - self.startTime;
      //快速滑动
      var fast = !self.edge() && distance > 10 && period < 200;
      if(fast && self.alignCenter){
        //只在一屏多账幻灯片时才执行加速
        var speed = distance / period;
        speed = (speed * speed) / (2 * 0.0006);
        if(self.dire > 0){
          self.position += speed;
        }
        else{
          self.position -= speed;
        }
        
      }

      self.constrain();

      $.each(this.pages, function(index, item){

         if(self.position > item.end){


          if(fast){
            //快速滑动


            if(self.dire > 0){
              //手指往右
              self.goto(item.start, index);

              self.stay = false;
            }
            else if(self.dire < 0){
              //手指往左
              self.goto(item.end, index + 1);

              self.stay = false;
            }


            return false;
          }
          // console.log('posotion:'+self.position+',half:'+item.cx);
          if(self.position > item.cx){
            //两个负数比较大小时，绝对值越大值越小
            //上一张

            if(self.dire > 0 && !self.edge()){
              //手指往左

              self.stay = false;
            }

            self.goto(item.start, index);
            
          }
          else{
            //下一张
            var i = self.dire ? (index + 1) : (index - 1);

            if(self.dire < 0 && !self.edge()){
              //手指往右
              self.stay = false;
            }

            self.goto(item.end, i);
          }

          
          return false;
         }
      });

    },
    'edge': function(){

      return this.position >= 0 || this.position <= -this.lastPosition;
    },
    'constrain': function(){
      if(this.position < -this.lastPosition){
        this.position = -this.lastPosition;
      }
      else if(this.position > 0){
        this.position = 0;
      }
    },
    'goto': function(dest, index){
      if(index < 0){
        index = 0;
        this.position = 0;
      }
      else if(index >= this.pages.length){
        index = this.pages.length - 1;
        this.position = dest + this.width;
      }
      else{
        this.position = dest;
      }

      this.current(index);
      // this.transitionTime();

      this.translate();
      this.activeIndicator(index);

      var callback = this.callback;
      callback && callback(index);

      // this.setHeight(index);
    },
    'active': function(index){

      this.current(index);
      // this.stay = false;
      this.position = this.pages[index].start;
      // event.preventDefault();
      this.translate();
    },
    'translate':function(){

      if(this.up){

        this.scroller.style[transformStyle.transform] = 'translate3d(0,'+ this.position +'px, 0)';
        // this.scroller.style.top = this.position +'px';

      }
      else{

        this.scroller.style[transformStyle.transform] = 'translate3d('+ this.position +'px, 0, 0)';
        // this.scroller.style.left = this.position +'px';


      }

    },
    'transitionTime': function(time){
      time = time == undefined ? this.tranisitionDuration : time;

      this.scroller.style[transformStyle.transitionDuration] = time + 'ms';
    },
    'noTransition': function(){
      this.transitionTime(0);
    },
    'activeIndicator':function(index){
      if(this.indicators){
        $(this.indicators[index]).addClass('selected').siblings().removeClass('selected');
      }
    },
    'resetHeight': function(){
      
      if(!this.tab){
        //来自页签的才需要执行，幻灯片动画结束也会执行该方法，应该return不接着执行
        return;
      }
      var container = this.scroller.children[this.index].children[0];
      
      // console.log(container.offsetHeight);
      // var fontSize = document.defaultView.getComputedStyle(document.querySelector('html'), '').fontSize;
      // fontSize = +(fontSize.slice(0, fontSize.length - 2));

      var height = (container.offsetHeight > this.minHeight ? container.offsetHeight : this.minHeight);
      // var height = container.offsetHeight - fontSize * 1.52;

      // document.querySelector('#scroller').style.height = height + 'px';
      
      $(this.scroller).children().css('height', height + 'px');

    },
    'scrollTop': function(){
      var node = this.scroller.parentNode;
      // console.log(node.scrollTop);
      // if(node.scrollTop != 0){
        node.scrollTop = 0
      // };
      // this.scroller.scrollTop = 0;
    },
    'scrollLeft': function(){
      var node = this.scroller.parentNode;

      if(node.scrollLeft){

        node.scrollLeft = 0;

      }

    },
    'getX': function(){
      return this.position;
    },
    'vertical': function(){
      return this.vDirection && this.vDirection()
    },
    'right': function(){

      var vertical = this.vertical();
      if(vertical == undefined){
        //这里必须返回true，因为幻灯片本身不依赖tab
        return true;
      }
      return this.up && vertical || !this.up && !vertical;
    },
    'current': function(index){
      
      if(this.index == index){
        // 因为激活的与之前一致，动画不执行，所以要在此处设置current，如果触发了transitionEnd会导致事件之行两次
        DOM.addClassOnly(this.scroller.children, 'current', this.index);
        // $(this.scroller).trigger(transitionEnd);
        
        return;
      }
      this.index = index;
      
      
    },
    'prev': function(){
      //是通过其他点击动作引起动画，touchTime设为0才会执行end方法
      this.touchTime = 0;
      this.active(this.index - 1);
    },
    'next': function(){
      this.touchTime = 0;
      this.active(this.index + 1);
    }
  }
  return Carousel;
  
})($);

module.exports = Carousel;