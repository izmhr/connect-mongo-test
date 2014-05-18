// (1) データベースとの接続
// (2) スキーマの作成
// (3) モデルの登録 & 利用開始

var mongoose = require('mongoose');
var url = 'mongodb://localhost/user'; // database
var db  = mongoose.createConnection(url, function(err, res){
  if(err){
    console.log('Error connected: ' + url + ' - ' + err);
  }else{
    console.log('Success connected: ' + url);
  }
});

// schema = Modelの定義 Modelは構造を意味する
// schemaのunique指定 http://mongoosejs.com/docs/api.html#schematype_SchemaType-unique
var UserSchema = new mongoose.Schema({
  email    : {type:String, unique: true},
  password  : String
},{collection: 'info'});  // collection名を指定する

// UserSchemaの定義をコンパイルして、model = ドキュメントのコンストラクタを生成する
exports.User = db.model('User', UserSchema);