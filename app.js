
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

//
var MongoStore = require('connect-mongo')(express);

var app = express();

// all environments
app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

// for session
app.use(express.cookieParser());
app.use(express.session({
  secret: 'secret',
  store: new MongoStore({
    db: 'session',
    host: 'localhost',
    clear_interval: 60 * 60
  }),
  cookie: {
    httpOnly: false,
    maxAge: new Date(Date.now() + 60 * 60 * 1000)  //60 hours?
  } 
}));

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// ログインチェック用のルーティング関数
var loginCheck = function(req, res, next){
  console.log("loginCheck");
  console.log(req.session);
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login'); // sessionがなかったらloginにリダイレクト
  }
}

// Routing
app.get('/', loginCheck, routes.index); //loginCheckをしたのち、indexを見る
app.get('/login', routes.login);        //loginフォームを表示
app.post('/add', routes.add);           // 新しいアカウントの作成 これはlogin.ejsの中で呼ばれる
app.get('/logout', routes.logout);      //ログアウトのリクエスト

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
