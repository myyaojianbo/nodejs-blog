var express = require('express');
var router = express.Router();


var mongoose = require('mongoose');
var crypto = require('crypto');
var model = require('../models/model');
var User = model.User;
var Article = model.Article;




/* GET home page. */
router.get('/', function(req, res, next) {
  var arts = '';
  if(req.session.user){
    Article.find({
      author:req.session.user.username
    },function(err,articles){
      if(err) {
        console.log('err');
        return res.redirect('/');
      }
      // console.log('arts'+arts);
      res.render('index',{
        title:'主页',
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString(),
        arts:articles
      });
    });
  }else{
    return res.redirect('/login')
  }
});
  
  	// res.render('index', 
  	// 			{ 
  	// 				title: '主页',
    //        success: req.flash('success').toString(),
    //        error: req.flash('error').toString(),
  	// 				arts:[{
  	// 					title:req.session.data.title,
  	// 					tags:req.session.data.tag,
  	// 					author:req.session.data.author,
  	// 					createTime:req.session.data.createTime,
  	// 					content:req.session.data.content
  	// 				},{
  	// 					title:'node.js入门',
  	// 					tags:'node.js',
  	// 					author:' 二两肉',
  	// 					createTime:'2016年10月27日',
  	// 					content:'Node.js是一个基于Chrome JavaScript运行时建立的平台， 用于方便地搭建响应速度快、易于扩展的网络应用。Node.js 使用事件驱动， 非阻塞I/O 模型而得以轻量和高效，非常适合在分布式设备上运行的数据密集型的实时应用。'
  	// 				},{
  	// 					title:'node.js入门',
  	// 					tags:'node.js',
  	// 					author:' 二两肉',
  	// 					createTime:'2016年10月27日',
  	// 					content:'Node.js是一个基于Chrome JavaScript运行时建立的平台， 用于方便地搭建响应速度快、易于扩展的网络应用。Node.js 使用事件驱动， 非阻塞I/O 模型而得以轻量和高效，非常适合在分布式设备上运行的数据密集型的实时应用。'
  	// 				}],
    //        user: req.session.user,
		//      	});


/* 登录 */
router.get('/login', function(req, res, next) {
  res.render('login', {title: 'login', 
    user: req.session.user,
    success:req.flash('success'),
    error:req.flash('error')
  });
});

router.post('/login', function(req, res, next) {
    //req.body 处理 post 请求
    var username = req.body.username,
    password = req.body.password;
        // console.log('user',username);
        User.find({
          username:username,
          password:password
        },function(err,newUser){
          if(err){
            console.log('err');
          }
          if(newUser !=""){
            console.log(newUser);
            console.log('登陆成功');
            req.flash('success',"登录成功！");
            req.session.user = newUser[0];
            return res.redirect('/');
          }else{
            console.log('用户名户密码错误');
            req.flash('error',"用户名户密码错误");
            return res.redirect("/login");
          }
        });
      });


/* 退出登录 */
router.get('/logout', function(req, res, next) {
  req.session.user =null;
    // res.render('logout', {title: 'logout'});
    req.flash('success',"退出成功");
    return res.redirect('/');
  });


/* 注册 */
router.get('/reg', function(req, res, next) {
  res.render('reg', {
    title: 'reg',
    success:req.flash('success').toString(),
    error:req.flash('error').toString()
      // success:req.flash('success'),
      // error:req.flash('error')
    })
});

router.post('/reg', function(req, res, next) {
    //req.body 处理 post 请求
    var username = req.body.username,
    password = req.body.password,
    passwordRepeat = req.body.passwordRepeat,
    email = req.body.email;

      // console.log('user',username);
      if(password != passwordRepeat) {
        console.log('两次输入的密码不一致！');
        req.flash('error',"两次输入内容不一致");
        return res.redirect('/reg');
      }

      User.findOne({username:username}, function(err, user) {
        if(err) {
          console.log(err);
          return res.redirect('/reg');
        }

        if(user) {
          console.log('用户名已经存在');
          req.flash('error',"用户名已存在");
          return res.redirect('/reg');
        }

        // var md5 = crypto.createHash('md5'),
        //     md5password = md5.update(password).digest('hex');

        var newUser = new User({
          username: username,
          password: password,
          email: email
        });

        newUser.save(function(err, doc) {
          if(err) {
            console.log(err);
            return res.redirect('/reg');
          }

          console.log('注册成功！');
          req.flash('success',"注册成功");

          newUser.password = null;
          delete newUser.password;
          req.session.user = newUser;
          return res.redirect('/');
        });

      });
    });


/* 发表文章 */
router.get('/post', function(req, res, next) {
  res.render('post', {
    title: 'post',
    success:req.flash('success'),
    error:req.flash('error'),
    Article:"",
    user:req.session.user});
});

router.post('/post', function(req, res, next) {
  var data = new Article({
            title: req.body.title,
            tag: req.body.tag,
             //这里的 author 元素通过 session 获得
             author: req.session.user.username,
             createTime:Date.now(),
             content: req.body.content
           });

  data.save(function(err, doc) {
    if(err) {
      console.log(err);
      return res.redirect('/post');
    }
    console.log('文章发表成功！');
    req.flash('success',"文章发表成功")
    
    return res.redirect('/');
  });

});


/* 查询*/
router.get('/search', function(req, res, next) {
  var arts = ""
  //获取输入的标题 
  var title = req.query.keyTitle;
  // console.log("123");
  console.log(title);
  Article
    .find({title:title},function(err,articles){
      if(err){
        console.log(err);
        return res.redirect('/');
      }

      res.render('search', {
        arts:articles,
        user:req.session.user
        });

    })

});


/* 编辑*/
// router.get('/edit',function(req,res,next){
//    res.render('edit', {title:"edit"});
// });

router.get('/edit/:_id', function(req, res, next) {
    Article.findOne({
      _id: req.params._id
    }, function(err, art) {
        if(err) {
            console.log(err);
            return res.redirect('/');
        }
        res.render('edit', {
            title: '编辑',
            art: art
        });
    });
});

router.post('/edit/:_id', function(req, res, next) {
  Article.update({
    _id:req.params._id
  },{
    title:req.body.title,
    tag: req.body.tag,
    content: req.body.content,
    createTime: Date.now()
  },function(err,art){
    if(err){
      console.log(err);
    }
    
    console.log('修改成功');
    return res.redirect('/');
  });
});



/* 删除*/
router.get('/remove/:_id', function(req, res, next) {
  Article.remove({
    //req.params可以处理 /:_id 形式的get或者post请求，获取请求参数
    _id:req.params._id
  },function(err){
    if(err){
      console.log(err);
    }
    console.log('删除成功');
    return res.redirect('/');
  })
});


module.exports = router;


