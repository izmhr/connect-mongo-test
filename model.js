var mongoose = require('mongoose');
var url = 'mongodb://localhost/user'; // database
var db  = mongoose.createConnection(url, function(err, res){
  if(err){
    console.log('Error connected: ' + url + ' - ' + err);
  }else{
    console.log('Success connected: ' + url);
  }
});

// Modelの定義 Modelは構造を意味する
var UserSchema = new mongoose.Schema({
  email    : String,
  password  : String
},{collection: 'info'});  // collection名を指定する

// UserSchemaの定義をコンパイルして、(ドキュメントの)コンストラクタを生成する
// ドキュメントは、modelのインスタンス、と言える。
exports.User = db.model('User', UserSchema);