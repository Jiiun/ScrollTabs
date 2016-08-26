# ScrollTabs
类似天猫宝贝详情页的滚动页签，即支持横向滑动切换页签，也支持纵向滚动页签页

### 需要这么多div吗？
![html结构图](https://raw.githubusercontent.com/Jiiun/ScrollTabs/99f0619b186f4a8d23c0afeeb28d4d86db16d164/docs/html.png)  
wrapper 整个页签容器，包含tabs和panels  
content panels的viewport，当前可视化窗口  
scroller panels容器，也是负责滑动的区域  
tab 对应每一个panel  
container 为了获取每一个panel的高度  