
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

// MongoDBを利用したconnect上でのセッション管理
var MongoStore = require('connect-mongo')(express);

var app = express();

// all environments
app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middlewares
// ウェブサーバとアプリケーションの間に入って、リクエストやレスポンスを「加工」するプログラムのこと
// (by node.js本 p188)
app.use(express.favicon());
app.use(express.logger('dev'));
// bodyParserは 3.4.4 以降使わなくなって、代わりに express.jsonとexpress.urlencodedを用いる
// http://blog.bouzuya.net/2013/11/18/express-middleware-bodyparser/
// httpリクエストボディ中のjsonをパースし、req.body に追記される
app.use(express.json());
// httpリクエストボディのうちformから送信されるデータをパースする
app.use(express.urlencoded());
// <input type="hidden" name="_method" value="put"> などのカスタムリクエストメソッドを定義できる
// 今回は未出。
app.use(express.methodOverride());

// for session
// MongoDB session storeについて
// http://christina04.blog.fc2.com/blog-entry-268.html
// 署名付きcookieと署名無し
// http://hitsujiwool.tumblr.com/post/24238326975/connect-2-0
app.use(express.cookieParser());  // 先にcookieをパースしておく
app.use(express.session({         // cookieに書き込むsessionの仕様を定める
  secret: 'secret',               // 符号化。改ざんを防ぐ
  store: new MongoStore({
    db: 'session',
    host: 'localhost',
    clear_interval: 60 * 60     // mongodbに登録されたsession一覧を見て、expireしている物を消す、ということをする周期
  }),
  cookie: { //cookieのデフォルト内容
    httpOnly: false,
    maxAge: new Date(Date.now() + 60 * 60 * 1000)  //1 hour. ここを指定しないと、ブラウザデフォルト(ブラウザを終了したらクッキーが消滅する)になる
  } 
}));
// (おそらく)req中のcookiesのconnect-sidをチェックし、
// データベースを検索し、同じsidを持つセッションデータをreqに追加している。

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  // NODE_ENVによる NODE_ENV=production node app で起動するとproductionになる
  console.log("env == development");
}

// ログインチェック用のルーティング関数
// chromeでのcookieの確認の仕方
// http://www.crystal-creation.com/web-app/tech/browser/functions/cookie/
var loginCheck = function(req, res, next){
  console.log("loginCheck");
  console.log("####req.session####");
  console.log(req.session);   // sessionミドルウェアを通してパースしたsessionオブジェクトを確認する
  console.log("####req.cookies####");
  console.log(req.cookies);   // 送られてきたcookieの実体を確認する
  if (req.session.user) {
    next();
  } else {
    console.log("loginCheck fault redirect to '/login'");
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
  // app.get('port'); setできる項目については、getもできる。
});
