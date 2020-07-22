"use strict";
let sqls={
	create:{exists:"select * from accounts,credits where credits.ClientName=accounts.ClientName",
			subSqls:{
				create:"insert into accounts (ClientName,Balance,deposit) Values(?,?,0)"
				}
			},
			updateDeposit:"update deposit=case when deposit>=Balance then ? Else 0 END",
			updateBalance:"update Balance=case when deposit>=Balance then Balance+deposit ELSE deposit END"
			,Credits:{
				get:"select * from credits where ClientName=?",
				add:"insert into credits (ClientName,FirstName,LastName,CreditNumber,CreditType,CVV,Expires) Values (?,?,?,?,?,?,?)"
				hasCredit:"UPDATE `clients` SET `hasCredit`=true where Name=?"
			}
	},connect=require('mysql').createConnection({
	host:"127.0.0.1",
	user:"root",
	password:"279348",
	database:"E-Commerce"
}),accounts={
	Exists:(attrs,callback)=>{
		attrs=typeof(attrs)=='string'?attrs.split(","):attrs
		connect.query(sqls.create.exists,attrs,(err,result)=>{
			if (err) {console.log(err.messgae);};
			var exists=(result!=[]&&result.length>0)?true:false;
			callback(exists);
		})
	},
	add:(attrs,callback)=>{
		attrs=typeof(attrs)=='string'?attrs.split(","):attrs
		connect.query(sqls.create.subSqls.create,attrs,(err,result)=>{
			if (err) {console.log(err.messgae);};
			var done=(result!=[]&&result.affectedRows>0)?true:false;
			callback(done);
		})
	},
	Deposit:(attr,callback)=>{
		attr=typeof(attr)=="Number"?attr:Number(attr)
			connect.query(sqls.updateDeposit,attrs,(err,result)=>{
				if (err) {console.log(err.messgae);};
				var done=(result!=[]&&result.affectedRows>0)?true:false;
				callback(done);
			})
		
	},
	Balance:(attr,callback)=>{
		attr=typeof(attr)=="Number"?attr:Number(attr)
			connect.query(sqls.updateBalance,attrs,(err,result)=>{
				if (err) {console.log(err.messgae);};
				var done=(result!=[]&&result.affectedRows>0)?true:false;
				callback(done);
			})
	},
	getCreditCard:(attr,callback)=>{
		if (typeof(attr)="string") 
		{
			connect.query(sqls.Credits.get,attr,(err,result)=>{
				if (err) {console.log(err.message);}
				var done=(result!=[]&&result.length>0)
				callback(done,result);
			})
		}
	},
	CreateCreditCard:(attrs,callback)=>{
		attrs=typeof(attrs)=='string'?attrs.split(","):attrs
		connect.query(sqls.Credits.add,attrs,(err,result)=>{
			if (err) {console.log(err.messgae);};
			var done=(result!=[]&&result.affectedRows>0)?true:false;
			callback(done);
		})
	},
	hasCredit:(attr,callback)=>{
		if (typeof(attr)="string") 
		{
			connect.query(sqls.Credits.hasCredit,attr,(err,result)=>{
				if (err) {console.log(err.messgae);};
				var done=(result!=[]&&result.affectedRows>0)?true:false;
				callback(done,result[0]);
			})
		}
	}
}
module.exports=accounts