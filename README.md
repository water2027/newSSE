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

#### 未完成的功能 
1. 忘记密码（后端）
2. 课程专区的课件资料 

### 概要 
#### `api`文件夹
放了各种跟后端连接的东西，所有的都在里面。 
***
#### `assets`文件夹
存放css文件。
1. `global.css`是便于用户使用某些特效的
2. `hl.css`是代码高亮css，不知道为什么我无法正常导入，所以放到这里从这导入了 
3. `jsxComponents.css`是jsx组件的样式 
4. `main.css`是全局样式 
***
#### components文件夹 
存放可能会大量复用的组件。 
1. `imageShower.jsx`用于放大图片。导出函数`showImg(img:string)`, `img`为图片地址
2. `MarkdownEditor.vue` markdown编辑器。需要传入一个响应式变量和一个发送函数。  
3. `NewEditor.vue` 第三方库，如果这个更好的话就用这个吧。需要传入一个响应式变量和一个发送函数
4. `MessageBox.jsx` 最开始没有启用eslint，命名不规范。展示一个6s的弹窗，导出函数`showMsg(msg:string)`,msg是要展示的信息 
5. `MarkdownContainer` 用于将md转为html。 
***
#### docs文件夹 
可有可无，相当于一个公告吧。 
***
#### utils文件夹 
`expHandler.js`根据分数分配等级 
`strHandler.js`处理时间、图片链接
