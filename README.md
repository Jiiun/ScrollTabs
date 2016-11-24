# ScrollTabs
类似天猫宝贝详情页的滚动页签，即支持横向滑动切换页签，也支持纵向滚动页签页

点击查看[DEMO](https://jiiun.github.io/ScrollTabs/demo.html)

# 用法
##js代码
```js
new ScrollTabs({
    'container': 'wrapper',                 //页签容器ID
    'panel': 'scroller',                    //页签panel容器ID
    'current': 0,                           //激活页签index
    'data': [{                              //页签tabs数据源
        'name': '第一章',
    },{
        'name': '第二章',
    },{
        'name': '第三章',
    },{
        'name': '第四章',
    },{
        'name': '第五章',
    }],
    'change': function(index) {             //切换tabs后的回调函数，参数是当前激活的index
    }
});
##html代码
```html
<div id="wrapper" class="wrapper">
    <div id="content" class="content">
        <div id="scroller" class="scroller">
            <div class="tab current">
                <div class="container">
                    <img src="http://ww4.sinaimg.cn/bmiddle/6f0e6a6ajw1f7iybshzz0j209i7ps4l4.jpg"/>
                </div>
            </div>
            <div class="tab" >
                <div class="container">
                    <img src="http://ww2.sinaimg.cn/bmiddle/6f0e6a6ajw1f7iybwia63j20cj7ps1kx.jpg"/>
                </div>
            </div>
            <div class="tab" >
                <div class="container">
                    <img src="http://ww3.sinaimg.cn/bmiddle/6f0e6a6ajw1f7iyc3rvyhj20gj7ps4qp.jpg"/>
                </div>
            </div>
            <div class="tab" >
                <div class="container">
                    <img src="http://ww4.sinaimg.cn/bmiddle/6f0e6a6ajw1f7iyc67w0hj20817pswys.jpg"/>
                </div>
            </div>
            <div class="tab" >
                <div class="container">
                    <img src="http://ww2.sinaimg.cn/bmiddle/6f0e6a6ajw1f7iybt8f5bj20b40m8mzr.jpg"/>
                </div>
            </div>
        </div>
    </div>
</div>
```

### 需要这么多div吗？
![html结构图](https://raw.githubusercontent.com/Jiiun/ScrollTabs/99f0619b186f4a8d23c0afeeb28d4d86db16d164/docs/html.png)  
wrapper 整个页签容器，包含tabs和panels  
content panels的viewport，当前可视化窗口  
scroller panels容器，也是负责滑动的区域  
tab 对应每一个panel  
container 为了获取每一个panel的高度  