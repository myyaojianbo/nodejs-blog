var express = require('express');
var router = express.Router();


var mongoose = require('mongoose');
var crypto = require('crypto');
var model = require('../models/model');
var User = model.User;
var Article = model.Article;

/* GET home page. */
router.get('/', function(req, res, next) {
  	res.render('index', 
  				{ 
  					title: '主页',
  					arts:[{
  						title:'node.js入门',
  						tags:'node.js',
  						author:' 二两肉',
  						createTime:'2016年10月27日',
  						content:'Node.js是一个基于Chrome JavaScript运行时建立的平台， 用于方便地搭建响应速度快、易于扩展的网络应用。Node.js 使用事件驱动， 非阻塞I/O 模型而得以轻量和高效，非常适合在分布式设备上运行的数据密集型的实时应用。'
  					},{
  						title:'node.js入门',
  						tags:'node.js',
  						author:' 二两肉',
  						createTime:'2016年10月27日',
  						content:'Node.js是一个基于Chrome JavaScript运行时建立的平台， 用于方便地搭建响应速度快、易于扩展的网络应用。Node.js 使用事件驱动， 非阻塞I/O 模型而得以轻量和高效，非常适合在分布式设备上运行的数据密集型的实时应用。'
  					},{
  						title:'node.js入门',
  						tags:'node.js',
  						author:' 二两肉',
  						createTime:'2016年10月27日',
  						content:'Node.js是一个基于Chrome JavaScript运行时建立的平台， 用于方便地搭建响应速度快、易于扩展的网络应用。Node.js 使用事件驱动， 非阻塞I/O 模型而得以轻量和高效，非常适合在分布式设备上运行的数据密集型的实时应用。'
  					}],
            user: req.session.user

				} );
});

/* 登录 */
router.get('/login', function(req, res, next) {
    res.render('login', {title: 'login', user: req.session.user});
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
          req.session.user = newUser[0];

          return res.redirect('/');

        }else{
          console.log('用户名户密码错误');
        }
      });
});



/* 退出登录 */
router.get('/logout', function(req, res, next) {
    req.session.user =null;
    // res.render('logout', {title: 'logout'});
    return res.redirect('/')

});



/* 注册 */
router.get('/reg', function(req, res, next) {
    res.render('reg', {title: 'reg', err:''});
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
        return res.redirect('/reg');
    }

     User.findOne({username:username}, function(err, user) {
        if(err) {
            console.log(err);
            return res.redirect('/reg');
        }

         if(user) {
            console.log('用户名已经存在');
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
            newUser.password = null;
            delete newUser.password;

            req.session.user = newUser;

            return res.redirect('/');
        });

    });
});

/* 发表文章 */
router.get('/post', function(req, res, next) {
    res.render('post', {title: 'post'});
});

router.post('/post', function(req, res, next) {
  var data = new Article({
    title: req.body.title,
    //这里的 author 元素通过 session 获得
    author: req.session.user.username,
    tag: req.body.tag,
    content: req.body.content
  });

  data.save(function(err, doc) {
    if(err) {
      console.log(err);
      return res.redirect('/post');
    }
    console.log('文章发表成功！');
    return res.redirect('/');
  });
});

/* 查询*/
router.get('/search', function(req, res, next) {
    res.render('search', {title: 'search'});
});

/* 编辑*/
router.get('/edit', function(req, res, next) {
    res.render('edit', {title: 'edit'});
});

/* 删除*/
router.get('/remove', function(req, res, next) {
    res.render('remove', {title: 'remove'});
});


module.exports = router;


