## 安装依赖
```sh
npm install
```

### 开发环境
```sh
npm run dev
```

### 生产环境
```sh
npm run build
```

### 正文  
配置了jsx，用于封装一些组件      
试着用了pinia来管理用户信息和帖子，但是感觉性能太差了，使用pinia前lighthouse性能评分85，用了后37，于是舍弃了。      

#### 未完成的功能 
1. 忘记密码（后端）
2. 课程专区的课件资料    

#### 不太重要但是最好早点做的事情    
- HomeView.vue,PostDetailView.vue,代码太长了，其中很多可以考虑做成组件。      
对于PostDetailView.vue,可以将文章和评论做成一个组件，文章只比评论多一个浏览量。      
对于HomeView.vue,可以考虑将Header,NavBar做成两个组件。    

### 文件夹概要 
#### `api`文件夹
放了各种跟后端连接的东西，所有的都在里面。 
***
#### `assets`文件夹
存放css文件。
1. `global.css`是便于用户使用某些特效的
2. `hl.css`是代码高亮css，不知道为什么我无法正常导入，所以放到这里从这导入了 
3. `jsxComponents.css`是jsx组件的样式 
4. `main.css`是全局样式   
5. `mode.css`存放黑暗模式和明亮模式的颜色
***
#### components文件夹 
存放各种组件。 
1. `imageShower.jsx`用于放大图片。导出函数`showImg(img:string)`, `img`为图片地址
2. `MarkdownEditor.vue` markdown编辑器。需要传入一个响应式变量和一个发送函数。  
3. `NewEditor.vue` 第三方库，如果这个更好的话就用这个吧。需要传入一个响应式变量和一个发送函数
4. `MessageBox.jsx` 展示一个6s的弹窗，导出函数`showMsg(msg:string)`,msg是要展示的信息 
5. `MarkdownContainer.vue` 用于将md转为html。   
6. `HeatList.vue`热榜     
7. `NewEditor.vue`md编辑器的planB，如果`MarkdownEditor.vue`反响不好可考虑换成这个第三方的编辑器。      
8. `PostList.vue`帖子列表      
9. `card`文件夹，里面有封装好的卡片，`BasicCard.vue`是基础卡片，相当于父类，其他的都是子类。`CommentCard.vue`未完成      
***
#### docs文件夹 
可有可无，相当于一个公告吧。 
***
#### utils文件夹 
`expHandler.js`根据分数分配等级 
`strHandler.js`处理时间、图片链接
