"use strict";
let sqls={
	create:{exists:"select shopName,Logo from shops where(ShopName=? or Logo=? )",
			subSqls:{
				create:"insert into shops (ShopName,Logo) Values(?,?)"
				}
			},
			delete:"delete from table where ?",
			get:"select * from shops where type=?",
			getAll:"select * from shops",
			allTables:"show tables",
			Currency:"update shops set Currency=? where ShopName=?",
			ai:(table)=>{return "ALTER TABLE"+table+"AUTO_INCREMENT=1";}
},connect=require('mysql').createConnection({
	host:"127.0.0.1",
	user:"root",
	password:"279348",
	database:"E-Commerce"
})
let shops={
	getAll:(callback)=>{
				connect.query(sqls.getAll,(err,result)=>{
					var done=(result&&result.length>0)?true:false
					callback(done,result);
				})	
	},
	Exists:(attrs,callback)=>{
		attrs=(typeof(attrs)=='string')?attrs.split(","):attrs
			connect.query(sqls.create.exists,attrs,(err,result)=>{
				if (err) {console.log(err.message);};
				var	exists=(result.length>0&&result!=[])?true:false;
				callback(exists);
			})
	}
	,
	create:(attrs,callback)=>{
		attrs=(typeof(attrs)=='string')?attrs.split(","):attrs
			shops.Exists(attrs,(exists)=>{
				if (!exists) {
					connect.query(sqls.create.subSqls.create,attrs,(err,result)=>{
						var done=(result.affectedRows>0)?true:false
						callback(done);
					})
				}
			})
	},
	showTables:(callback)=>{
		connect.query(sqls.allTables,(err,result)=>{
			var tables=[];
			if (result.length>0) {
				for(var i of result){
					for(var j in i){
						tables.push(i[j]);
					}
				}
				callback(tables);
			};
		})
	},
	deleteShop:(attr,callback)=>{
		attrs=(typeof(attrs)=='string')?attrs.split(","):attrs
			var sql='delete from shops where  shopName=?'
				connect.query(sql,attr,(err,result)=>{
					if (result&&result.affectedRows>0) {
						callback();
					};
				})
		}
	,
	delete:(attrs,callback)=>{
		shops.isEmpty(attrs,["adms","clients"],(empty,tableName)=>{
				if (empty==true) {
							var sql=sqls.delete.replace('table',tableName)
							connect.query(sql,{shopName:attrs},(err,result)=>{
								if (err) {console.log(err.message);}
								if (result.affectedRows>0&&result) {callback()};
							})
						}	
			})
	},
	isEmpty:(attr,excludes,callback)=>{
		if (typeof(attr)=="string") {
			shops.showTables((tables)=>{
				for(var i of tables){
					for (var j of excludes){
					if (i!==j) {
							var sql="select * from tb where shopName=?"
							sql=sql.replace('tb',i)
							connect.query(sql,attr,(err,result)=>{
								if (err) {console.log(err.message);}
								var empty=(result&&result.length==0)?true:false;
								return callback(empty,i);
							})
						}
						else{break;}
					}
						
					}
				})
			}
		}
	,
	ai:(table,callback)=>{
			connect.query(sqls.ai(table),(err,result)=>{
				if (result) {
					callback(true);
				};
			})
		},
		Currency:(attrs,callback)=>{
			attrs=typeof(attrs)=='string'?attrs.split(","):attrs;
			connect.query(sqls.Currency,attrs,(err,result)=>{
				if (err) {console.log(err.message);}
				var done=(result!=[]&&result.affectedRows>0)
				callback(done);
			})
		}
}
module.exports=shops