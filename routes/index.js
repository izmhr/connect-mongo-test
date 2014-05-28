
/*
 * GET home page.
 */

 // model.js 参照
 // model.js をrequireした時点で、db作成などは行われる
var model = require('../model.js'),
  User = model.User;

// ログイン後ページ
exports.index = function(req, res) {
  res.render('index', { user: req.session.user});
  console.log("correctly loggined");
}

// ユーザー登録機能
exports.add = function(req, res) {  // add は postで行われる。
  var newUser = new User(req.body); // postの内容{email: "fuga@fuga", password: "fugafuga"}を利用して、新しいドキュメントを作成
  newUser.save(function(err){       // 追加する
    if(err){
      console.log(err);
      // model.jsの方で email に対し unique option をつけたので、同じemailを指定するとエラー11000が返ってくる
      if( err.code === 11000 ) console.log("the email is already used");
      res.redirect('back');
    } else {
      console.log("add success and redirect to '/'");
      req.session.user = req.body.email;  // ここでsessionに記録して、ログインする
      res.redirect('/');  // 新しいアカウントが作られたので、次のloginCheckは成功する
    }
  });
};

// ログイン機能
exports.login = function(req, res) {  // login は postで行われる
  var email = req.query.email;
  var password = req.query.password;
  var query = { "email": email, "password": password};
  User.find(query, function(err, data){ //データベースの機能！！ querying!!!
    if(err) {
      console.log(err);
    }
    if(data == "") {
      console.log("no data");
      res.render('login');
    } else {
      req.session.user = email; // 実際はここでもっと固有のデータをいっぱい引っ張り出して使うなどする
      // redirectの場合、リクエスト内容(ここでは特にcookieのこと)は引き継がれる
      console.log("user found!! user found!!");
      res.redirect('/');
    }
  });
};

exports.logout = function(req, res){
  req.session.destroy();      // sessionが消えたreqが、次のindexのgetに引き継がれるので、そちらではログインが出来ない
  console.log('deleted session id');
  console.log(req.session);
  res.redirect('/');
};