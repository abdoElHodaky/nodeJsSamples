"use strict";
var knex=require('../knex');
let sqls={
	exists:"SELECT Name,Password,Email FROM clients cs WHERE (cs.Name=? or cs.Name=? or cs.Email=? )",
	create:"INSERT INTO clients(Name,Password,Email) VALUES (?,?,?)",
	delete:"Delete from clients where Name=?",
	getAll:"SELECT * FROM clients",
	updatePass:"update clients set Password = ? where Name=?",
	hasCredit:"select hasCredit from clients where Name=?",
	getCredit:"select * from credits where ClientName=?",
	ai:(table)=>{return "ALTER TABLE"+table+" AUTO_INCREMENT=1";},
	PAccount:{
		create:{exists:"select * from PAccounts,credits where credits.ClientName=PAccounts.ClientName=?",
				create:"insert into PAccounts (ClientName,Balance,deposit) Values(?,?,0)"
				},
			updateDeposit:"update PAccounts set deposit=case when deposit>=Balance then ? Else 0 END where ClientName=?",
			updateBalanceD:"update PAccounts set Balance=case when deposit>=Balance then Balance+deposit ELSE deposit END where ClientName=?"
			,updateBalance:"update PAccounts set Balance=Balance-? where ClientName=?"
			,Credits:{
				get:"select * from credits where ClientName=?",
				add:"insert into credits (ClientName,FirstName,LastName,CreditNumber,CreditType,CVV,Expires) Values (?,?,?,?,?,?,?)",
				hasCredit:"UPDATE `clients` SET `hasCredit`=true where Name=?"
				,delete:"delete from credits  where ClientName=?",
				update:"update credits set FirstName=?,LastName=?,CreditNumber=?,CVV=?,Expires=? where ClientName=?"
			},
			delete:"delete from PAccounts  where ClientName=?",
			get:"select * from PAccounts,credits where (credits.ClientName=PAccounts.ClientName and PAccounts.ClientName=?)"
	}
},connect=require('mysql').createConnection({
	host:"127.0.0.1",
	user:"root",
	password:"279348",
	database:"E-Commerce"
})
let clients={
	Exists:(attrs,callback)=>{
		var attrs=(typeof(attrs)=='string')?attrs.split(","):attrs
		var values=attrs;
		connect.query(sqls.exists,attrs,(err,result)=>{
			if (err) {console.log(err.message);};
			var exists=(result.length>0&&result!=[])?true:false
			callback(exists);
		})
	},
	create:(attrs,callback)=>{
		attrs=(typeof(attrs)=='string')?attrs.split(","):attrs
				connect.query(sqls.create,attrs,(err,result)=>{
					if (err) {console.log(err.message)};
					var done=(result.affectedRows>0)?true:false
					callback(done);
				})
	},
	delete:(attr,callback)=>{
		if (typeof(attr)=='string') {
			connect.query(sqls.delete,attr,(err,result)=>{
				if (err) {console.log(err.message);};
					var done=(result!=[]&&result.length>0)?true:false
					clients.drop(attr,(done)=>{
						clients.ai('clients',(done)=>{
							callback(done)
						})
					})
			})
		}
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
	hasCredit:(attr,callback)=>{
		if (typeof(attr)=='string') {
			connect.query(sqls.hasCredit,attr,(err,result)=>{
				if (err) {console.log(err.message);};
				var done=(result&&result.length>0)?true:false
				callback(done,result[0]);
			})
		}
	},
	getCredit:(attrs,callback)=>{
		if (typeof(attrs)=='string') {
				connect.query(sqls.getCredit,attrs,(err,result)=>{
					if (err) {console.log(err.message);};
					var done=(result&&result.length>0)?true:false
					callback(done,result[0]);
				});
			}
		},
		changePass:(attrs,callback)=>{
			attrs=(typeof(attrs)=='string')?attrs.split(","):attrs
			connect.query(sqls.ChangePass,attrs,(err,result)=>{
				if (err) {console.log(err.message);};
				var done=(result!=[]&&result.affectedRows>0)?true:false;
				callback(done);
			})
		},
	PAccount:{
					Exists:(attrs,callback)=>{
					attrs=typeof(attrs)=='string'?attrs.split(","):attrs
					connect.query(sqls.PAccount.create.exists,attrs,(err,result)=>{
						if (err) {console.log(err.messgae);};
						var exists=(result!=[]&&result.length>0)?true:false;
						callback(exists);
					})
				},
				add:(attrs,callback)=>{
					attrs=typeof(attrs)=='string'?attrs.split(","):attrs
					connect.query(sqls.PAccount.create.create,attrs,(err,result)=>{
						if (err) {console.log(err.messgae);};
						var done=(result!=[]&&result.affectedRows>0)?true:false;
						callback(done);
					})
				},
				delete:(attr,callback)=>{
					if (typeof(attr)=="string") 
					{
						connect.query(sqls.PAccount.delete,attr,(err,result)=>{
							if (err) {console.log(err.message);}
							var done=(result!=[]&&result.affectedRows>0)?true:false;
								clients.ai("PAccounts",(done)=>{
									callback(done);
								})
						})
					}
				},
				updateDeposit:(attrs,callback)=>{
					attrs=typeof(attrs)=="string"?attrs.split(","):attrs
						connect.query(sqls.PAccount.updateDeposit,attrs,(err,result)=>{
							if (err) {console.log(err.messgae);};
							var done=(result!=[]&&result.affectedRows>0)?true:false;
							callback(done);
						})
					
				},
				updateBalance:(attrs,callback)=>{
					attrs=typeof(attrs)=="string"?attrs.split(","):attrs
						connect.query(sqls.PAccount.updateBalance,attrs,(err,result)=>{
							if (err) {console.log(err.message);};
							var done=(result!=[]&&result.affectedRows>0)?true:false;
							callback(done);
						})
				},
				updateBalanceD:(attrs,callback)=>{
					attrs=typeof(attrs)=="string"?attrs.split(","):attrs
						connect.query(sqls.PAccount.updateBalanceD,attrs,(err,result)=>{
							if (err) {console.log(err.message);};
							var done=(result!=[]&&result.affectedRows>0)?true:false;
							callback(done);
						})
				},
		getCredit:(attr,callback)=>{
			if (typeof(attr)=="string") 
			{
				connect.query(sqls.PAccount.Credits.get,attr,(err,result)=>{
					if (err) {console.log(err.message);}
					var done=(result!=[]&&result.length>0)
					callback(done,result);
				})
			}
		},
		CreateCredit:(attrs,callback)=>{
			attrs=typeof(attrs)=='string'?attrs.split(","):attrs
			connect.query(sqls.PAccount.Credits.add,attrs,(err,result)=>{
				if (err) {console.log(err.messgae);};
				var done=(result!=[]&&result.affectedRows>0)?true:false;
				clients.PAccount.add([attrs[0],500],(done)=>{
					clients.PAccount.hasCredit(attrs[0],(done)=>{
						callback(done)
					})
				})
			})
		},
		hasCredit:(attr,callback)=>{
			if (typeof(attr)=="string") 
			{
				connect.query(sqls.PAccount.Credits.hasCredit,attr,(err,result)=>{
					if (err) {console.log(err.messgae);};
					var done=(result!=[]&&result.affectedRows>0)?true:false;
					callback(done,result[0]);
				})
			}
		},
		deleteCredit:(attrs,callback)=>{
				attrs=typeof(attrs)=='string'?attrs.split(","):attrs
					connect.query(sqls.PAccount.Credits.delete,attrs,(err,result)=>{
					if (err) {console.log(err.messgae);};
					var done=(result!=[]&&result.affectedRows>0)?true:false;
						clients.ai("credits",(done)=>{
						callback(done);
					})
				})
		},
		get:(attr,callback)=>{
		if (typeof(attr)=="string") 
			{
				connect.query(sqls.PAccount.get,attr,(err,result)=>{
					if (err) {console.log(err.message);}
					var done=(result!=[]&&result.length>0)
					callback(done,result[0]);
				})
			}
		},
		updateCredit:(attrs,callback)=>{
			if (typeof(attrs)=='object') {
				clients.PAccount.updateDeposit(attrs.creditBalance,(done)=>{
					if (done) {
						clients.PAccount.updateBalanceD((done)=>{
							connect.query(sqls.PAccount.Credits.update,attrs.creditFName,(err,result)=>{
								if (err) {console.log(err.message);};
								done=(result!=[]&&result.affectedRows>0)?true:false;
								callback(done);
							})
						})
					}
				})
			}
		}
	},
	drop:(attr,callback)=>{
		if (typeof(attr)=='string') {
			clients.PAccount.deleteCredit(attr,(done)=>{
				clients.PAccount.delete(attr,(done)=>{
					callback(done)
				})
			})
		}
	},
	Trans:{
		create:(attrs,socket)=>{
			knex('transaction').insert(req.body).then((r)=>{
					socket.emit("transaction_success",r,(data)=>{
						console.log(data);
					})
				}).catch((error)=>{
					socket.emit('transaction_failed',error,(data)=>{
						console.log(data);
					})
				})
		},
		delete:(attrs,socket)=>{
			knex('transaction').delete(attrs).then((r)=>{
					socket.emit("transaction_deleted",r,(data)=>{
						console.log(data);
					})
				}).catch((error)=>{
					socket.emit('transaction_failed',error,(data)=>{
						console.log(data);
					})
				})

		},
		update:(attrs,socket)=>{
			knex('transaction').update(attrs[0]).where(attrs[1]).then((r)=>{
					socket.emit("transaction_modified",r,(data)=>{
						console.log(data);
					})
				}).catch((error)=>{
					socket.emit('transaction_failed',error,(data)=>{
						console.log(data);
					})
				})
		},
		getAll:(attr,socket)=>{
			knex('transaction').select().where(attr).then((r)=>{
					socket.emit("transaction_get",r,(data)=>{
						console.log(data);
					})
				}).catch((error)=>{
					socket.emit('transaction_failed',error,(data)=>{
						console.log(data);
					})
				})
		}

	}
}
module.exports=clients