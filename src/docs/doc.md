## hello SSE! 
### 发帖/评论说明 
1. 设置了一些全局css，如果需要可以加上相应的class 
2. 有保存草稿功能，保存之后再次进来会加载草稿并删除草稿。如果还要再保存草稿需要手动保存，加载一次之后草稿就会删掉  
3. 请不要试图跨站攻击，如果想要学习相关知识，请找正常的题目做 

### 新前端说明 
1. 右上角加号发帖，上面大标题是跳转到首页，左上角是展开导航栏  
2. 发帖页面默认不实时展示markdown渲染之后的内容。点击 看看效果 之后才展示  
3. 配置了PWA，如果是用的谷歌浏览器之类支持PWA的浏览器，可以安装到主屏幕，相当于一个app

### 一些全局css 
1. gradientUnderline 
```css
.gradientUnderline{
    background-image: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
    background-repeat: no-repeat;
    background-size: 0 2px;
    background-position: right bottom;
    transition: background-size 0.5s ease-in;
}
.gradientUnderline:hover{
    background-size: 100% 2px;
    background-position: left bottom;
}
``` 
效果:<span class="gradientUnderline">你好，世界！</span> 
使用方法: 
```html
<span class="gradientUnderline">你好，世界！</span>
```   