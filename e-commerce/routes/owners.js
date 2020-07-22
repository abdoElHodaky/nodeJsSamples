"use strict";
let sqls={
	exists:"SELECT Name,Password,Email FROM adms cs WHERE (cs.Name=? or cs.Name=? or cs.Email=? )",
	create:"INSERT INTO owners(Name,Password,Email) VALUES (?,?,?)",
	delete:"Delete from owners where (Name=? OR admID=?)",
	getAll:"SELECT * FROM adms",
	updatePass:"update adms set Password = ? where Name=?",
	ai:(table)=>{return "ALTER TABLE"+table+" AUTO_INCREMENT=1";}

},connect=require('mysql').createConnection({
	host:"127.0.0.1",
	user:"root",
	password:"279348",
	database:"E-Commerce"
})
let owners={
	Exists:(attrs,callback)=>{
		var attrs=(typeof(attrs)=='string')?attrs.split(","):attrs
		var values=attrs;
		connect.query(sqls.exists,attrs,(err,result)=>{
			if (err) {console.log(err.message);};
			var exists=(result.length>0&&result!=[])?true:false
			callback(exists,result);
		})
	},
	create:(attrs,callback)=>{
		var attrs=typeof(attrs)=='string'?attrs.split(","):attrs
		connect.query(sqls.create,attrs,(err,result)=>{
			var done=(result.affectedRows>0)?true:false
			callback(done);
		})
	},
	delete:(attr,callback)=>{
		var attrs=typeof(attrs)=='string'?attrs.split(","):attrs
		connect.query(sqls.delete,attrs,(err,result)=>{
			var done=(result.affectedRows>0)?true:false
			owners.ai("owners",(done)=>{
				callback(done);
			})	
		})
	},
	ai:(table,callback)=>{
			connect.query(sqls.ai(table),(err,result)=>{
				var done=(result)?true:false
				callback(done);
			})
		},
	getAll:(callback)=>{
		connect.query(sqls.getAll,(err,result)=>{
			var done=(result&&result.length>0)?true:false
			callback(done,result);
		})
	},
	changePass:(attrs,callback)=>{
			attrs=(typeof(attrs)=='string')?attrs.split(","):attrs
			connect.query(sqls.ChangePass,attrs,(err,result)=>{
				if (err) {console.log(err.message);};
				var done=(result!=[]&&result.affectedRows>0)?true:false;
				callback(done);
			})
		}	
}
module.exports=owners