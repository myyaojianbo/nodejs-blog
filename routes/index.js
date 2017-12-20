var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var crypto = require('crypto');
var model = require('../models/model');
var User = model.User;
var Article = model.Article;


/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.user){
    Article.find({
      author:req.session.user.username
    },function(err,articles){
      if(err) {
        console.log('err');
        return res.redirect('/');
      }else{
        // console.log('arts2222',articles);
        res.render('index',{
          title:'主页',
          user:req.session.user,
          success:req.flash('success').toString(),
          error:req.flash('error').toString(),
          arts:articles
        });
      }
    });
  }else{
    return res.redirect('/login')
  }
});


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
          // console.log('err');
          req.flash("error",error);
        }else{
          if(newUser !=""){
            // console.log(newUser);
            // console.log('登陆成功');
            req.flash('success',"登录成功！");
            req.session.user = newUser[0];
            return res.redirect('/');
          }else{
            console.log('用户名户密码错误');
            req.flash('error',"用户名户密码错误");
            return res.redirect("/login");
          }
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
      // console.log('两次输入的密码不一致！');
      req.flash('error',"两次输入内容不一致");
      return res.redirect('/reg');
    }

    User.findOne({username:username}, function(err, user) {
      if(err) {
        console.log(err);
        return res.redirect('/reg');
      }else{
        if(user) {
          console.log('用户名已经存在');
          req.flash('error',"用户名已存在");
          return res.redirect('/reg'); 
        }else{
          var newUser = new User({
              username: username,
              password: password,
              email: email
          });

          newUser.save(function(err, doc) {
            if(err) {
              console.log(err);
              return res.redirect('/reg');
            }else{
              console.log('注册成功！');
              req.flash('success',"注册成功");

              newUser.password = null;
              delete newUser.password;
              req.session.user = newUser;
              return res.redirect('/');
            }
          });
        }
      }
  });
});


/* 发表文章 */
router.get('/post', function(req, res, next) {
  res.render('post', {
    title: 'post',
    success:req.flash('success'),
    error:req.flash('error'),
    Article:"",
    user:req.session.user
  });
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
    }else{
      // console.log('文章发表成功！');
      req.flash('success',"文章发表成功");
      return res.redirect('/');
    } 
  });
});


/* 查询*/
router.get('/search', function(req, res, next) {
  // console.log('123333');
  var arts = ""
  //获取输入的标题 
  var seartitle = req.query.ggtitle;
  // console.log("123");
  // console.log(seartitle);
  Article.find({
    title:seartitle
    },function(err,articles){
      if(err){
        console.log(err);
        return res.redirect('/');
      }else{
        res.render('index', {
          arts:articles,
          user:req.session.user
        });
      }
    })
});


/* 编辑*/
router.get('/edit/:_id', function(req, res, next) {
    Article.findOne({
      _id: req.params._id
    }, function(err, art) {
        if(err) {
          console.log(err);
          return res.redirect('/');
        }else{
          res.render('edit', {
            title: '编辑',
            art: art
          });
        }
    });
});

router.post('/edit/:_id', function(req, res, next) {
  // console.log('id', req.params._id)
  // console.log(req.body)
  Article.update({
    _id:req.params._id
  },{
    title:req.body.title,
    tag: req.body.tag,
    content: req.body.content,
    createTime: Date.now()
  },function(err,art){
    if(err){
      console.log('123');
      console.log('err',err);
    }else{
      console.log('修改成功');
      return res.redirect('/');
    }
  });
});

/* 删除*/
router.get('/remove', function(req, res, next) {
  Article.remove({
    _id:req.query.id
  },function(err,art){
    if(err){
      console.log('error',err);
    }else{
      // console.log('成功了');
      res.json({"rmit":1});
    }
  })
})

/* 点赞*/
router.get('/dianzan',function(req,res,next){
 Article.update({
    _id:req.query.id
  },{
    dz:1
  },function(err,art){  
    if(err){
      console.log('error',err);
    }else{
      // console.log('art111111',art);
      res.json({'sd':1});
    }
    
  });
});

//收藏文章
router.get('/collect',function(req,res,next){
  var arts = ""
  var _id = req.query._id;
  console.log('id',_id);
  Article.update({
      _id:_id
    },{
      clt:1
    },function(err,articles){
      if(err){
        console.log(err);
        return res.redirect('/');
      }else{
        res.json({"cllt":1});
      }
    })
})

//我的收藏
router.get('/mycollected',function(req,res,next){
  var arts = "";
  console.log('aaa',req.query.clt);
  Article.find({
    clt:1,
    author:req.session.user.username
    },function(err,articles){
      if(err){
        console.log("err",err);
        return res.redirect('/');
      }else{
        res.render('index', {
          arts:articles,
          user:req.session.user
        });
      }
    })
})
module.exports = router;


