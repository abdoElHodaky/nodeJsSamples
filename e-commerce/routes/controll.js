module.exports = (io)=>{
var app = require('express');
var router = app.Router();
var crypto=require("crypto"),knex=require('../knex');
var credit=require('credit-card'),connect=require('mysql').createConnection({
	host:"127.0.0.1",
	user:"root",
	password:"279348",
	database:"E-Commerce"
}),extend=require('xtend');
var products=require('../routes/products'),
clients=require("../routes/clients"),
owners=require("../routes/owners"),
shops=require('../routes/shops');
var checksession=(req,res,resolve,reject)=>{
	req.session.url=req.url;
	req.session.logout=false;
	if ((req.session)&&((req.session.uniqueID) && (req.session.type=="owner"||req.session.type=="client"))) {
		return resolve();
	}
	else{
		reject();
		req.session.destroy();
	}
}

var assertCallback=(condition,resolve,reject)=>{
	if (condition && condition!=null) {
		resolve();
	}
	else{reject();}
}
var checkType=(type,resolve,reject)=>{
	if (type == 'owner'||type=='admin') {
		return resolve();
	}
	else{return reject();}
}
var checkEquality=(arr1,arr2,resolve,reject)=>{
	eq=false;
	whicheq=[];
	for(i in arr1){
		for(j in arr2){
			if (typeof(arr1[i])=='object') {
				for(k in arr1[i]){
					if (arr1[i][k]==arr2[j]) {
						eq=true
						whicheq[j]=[k,j]
					}
				}
			}
			else{
					if (arr1[i]==arr2[j]) {
					eq=true
					whicheq.push([i,j])
					}
			}
		}
	}
	if(eq==true){
		return resolve(eq,whicheq);
	}
	else{return reject()}
}
function shuffle (array) {
  var i = 0
    , j = 0
    , temp = null

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1))
    temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}
io.on('connection',(socket)=>{
	
})
/*router.route("/").get(function(req, res, next) {
	checksession(req,res,()=>{
		user=req.session.user
		checkType(req.session.type,()=>{
			shops.getAll((done,shops)=>{
				res.render('index',
					{	Shops:shops,created:true,
						title:req.session.type,
						type:req.session.type,
						user:user,
						name:req.session.name
					})
				res.end();
			})
		},()=>{
			clients.hasCredit(user,(done,client)=>{
				if(client.hasCredit==true||client.hasCredit==1){
					req.session.CreatedC=true;
					clients.getCredit(user,(credit)=>{
						req.session.orguser["Credit"]=client;
					})
					shops.getAll((done,shops)=>{
						res.render('index',
							{	Shops:shops,created:true,
								title:req.session.type,
								type:req.session.type,
								user:user,
								name:req.session.name
							})
							res.end();
					})
				}
				else
				{
							
						res.render('index',
							{	Shops:[],created:false,
								title:req.session.type,
								type:req.session.type,
								user:user,
								name:req.session.name
							})
							res.end();
				}
			})
			
		})
	},()=>{
		res.redirect("/products");
	})
}).post((req,res)=>{
			checksession(req,res,()=>{
				body=req.body;
				values=[];
				credits={};
				user=req.session.user;
				for(i in body){
					req.checkBody(i.toString(),i.toString().match("[^Credit].+")+" required").notEmpty();
					if (i.toString().startsWith("Credit")) {
						credits[i.toString()]=req.body[i.toString()];
					}
					values[0]=user;
					if (i.toString()!="UserName") {
						values.push(req.body[i.toString()]);
					}
				}
				errors=req.validationErrors();
				assertCallback(errors,()=>{
					res.render("index",{type:req.session.type,flash:{type:"CreditAdded",messages:errors},created:false,title:"error",Shops:[]});
				},()=>{
						console.log(values);
						var card={
							cardType:credits["CreditType"],
							number:credits["CreditNumber"],
							expiryMonth:credits.CreditExpireDate.split("/")[0],
							expiryYear:credits.CreditExpireDate.split("/")[1],
							cvv:credits["CreditCVV"]
						}
						card=credit.validate(card);
						if(card.isExpired==false && card.validCardNumber==true && card.validExpiryMonth && card.validExpiryYear)
							{
								clients.PAccount.Exists(user,(exists)=>{
									if (exists==true) {
										res.render("index",{type:req.session.type,flash:{type:"CreditAdded",messages:"This Client Credit Exists"},created:false,title:"error",Shops:[]});
										res.end();
									}
									else{
										clients.PAccount.CreateCredit(values,(done)=>{
												res.redirect("back");
												res.end();
										})
									}
								})
							}
						else
							{
								res.render("index",{type:req.session.type,flash:{type:"CreditAdded",messages:{msg:"Your CreditCard Expired"}},created:false,title:"error",Shops:[]});
							}

						})
			},()=>{
				res.redirect("/login");
			})
});*/
router.route("/").get((req,res)=>{
	var client=req.session.client,name=req.session.name
	var render={notifications:false,Client:client,Name:name,type:'visitor'}
	if (req.session.LoggedIn==true) 
	{
		sql=knex('products').select(["products.ProductId",'products.Price','Products.Quantity',"products.ProductDesc","products.ProductName","products.ProductThumbnail",'cats.Cat','cats.ShopName','cats.CatDesc']).crossJoin('cats','cats.Cat',"=","products.Cat");
		if (!req.query.cat) {
		sql.then((products)=>{
				knex('cats').select().then((cats)=>{
					
					res.render('ps',extend({Products:products,Cats:cats},render));	
					res.end();
				})
		});}
		else{
			sql.where({'products.Cat':req.query.cat}).then((products)=>{
				knex('cats').select().then((cats)=>{
					res.render('ps',extend({Products:products,Cats:cats},render));
					res.end();
				})
			});
		}
	}
	else{
			
			sql=knex('products').select(["products.ProductId",'products.Price','Products.Quantity',"products.ProductDesc","products.ProductName","products.ProductThumbnail",'cats.Cat','cats.ShopName','cats.CatDesc']).crossJoin('cats','cats.Cat',"=","products.Cat");
				if (!req.query.cat) {
				sql.then((products)=>{
						knex('cats').select().then((cats)=>{
							res.render('ps',extend({Products:products,Cats:cats},render));
							res.end();
						})
				});
				}else{
					sql.where({'products.Cat':req.query.cat}).then((products)=>{
						knex('cats').select().then((cats)=>{
							res.render('ps',extend({Products:products,Cats:cats},render));
							res.end();
						})
					});
				}	
		}
});
router.route('/login').get((req,res)=>{
	res.render("lr");
	res.end();
}).post((req,res)=>{
	var r=false;
	req.check(
		{  "userName":{
				matches:{
					options:['/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/',"i"],
					options:["[a-zA-Z0-9]","i"],
					errorMessage: 'Email|UserName not matched'
				}
			},"password":{
				matches:{
					options:["[a-zA-Z0-9]","i"],
					errorMessage: 'Password not matched'
				},
				isLength:{
					options:[{min:3,max:20}],
					errorMessage: 'Must be between 3 and 20 chars long'
				}
			},
			"email":{
				errorMessage:"Your Email dosen't matches"
			} 	
		});
	var errors=req.validationErrors();
	if (errors) {
		res.render('lr',{flash:{type:"danger",messages:errors}})
	};
	if (!errors) {
		if (req.body.action=='login') {
				user=req.body.userName;
				password=req.body.password;
				knex('clients').select().then((clients)=>{
					for(var i in clients){
						r=(hashVerify('sha1',user,user,clients[i].Name)||hashVerify('sha1',user,user,clients[i].Email))
						&&(hashVerify('sha1',password,password,clients[i].Password))	
						if (r) {
							req.session.client=clients[i].Name;
							break;
						};
					}
					if (r) {
						req.session.name=user;
						req.session.LoggedIn=true;
						res.redirect("/");
					}
					else{
						res.render('lr',{flash:{type:"danger",messages:[{msg:"Not Found"}]}})
						res.end();
					}
					
				}).catch((err)=>console.log(err));
		}else if(req.body.action=='register'){
				user=req.body.userName;
				password=req.body.password;
				email=req.body.email
				knex('clients').select().then((clients)=>{
					for(var i in clients){
						r=(hashVerify('sha1',user,user,clients[i].Name)||hashVerify('sha1',email,email,clients[i].Email))
						&&(hashVerify('sha1',password,password,clients[i].Password))	
						if (r) {
							break;
						}
					}
					if (r==true) {
						req.flash("warning","Exists");
						res.redirect('back');
					}
					else{
						knex('clients').insert({
							ClientName:crypto.Hmac('sha1',user).update(user).digest('hex'),
							Password:crypto.Hmac('sha1',password).update(password).digest('hex'),
							Email:crypto.Hmac('sha1',email).update(email).digest('hex')
						}).then((d)=>{
							knex('paccounts').insert({
								ClientName:crypto.Hmac('sha1',user).update(user).digest('hex'),
								Balance:500,
						}).then((d)=>{
								res.redirect("back");
							}).catch((err)=>console.log(err));
							
						}).catch((err)=>console.log(err));
					}
				}).catch((err)=>console.log(err));
		}
	}
})
router.route("/logout").get((req,res)=>{
	if (req.session.LoggedIn&&req.query.log) {	
		if (req.session.admin) {
			res.redirect('/admin');
		}
		if(req.session.client){
			res.redirect('/');
		}
		req.session.clear();
	}
})
var hashVerify=(algo,key,word,hash)=>{
	return (crypto.Hmac(algo,key).update(word).digest("hex")==hash)
}
var locals;
router.route('/:shopName/products').get((req,res,next)=>{
	checksession(req,res,()=>{
		var shopName=req.params.shopName
		products.Products.getAll(shopName,(done,product)=>{
			products.Cats.getAll(shopName,(done,cats)=>{
				res.render('products',{"title":"Products","shopName":shopName,Cats:cats,products:product,type:req.session.type,user:req.session.user})
				res.end();
			})
		})
	},()=>{
		res.render("users",{title:"Login"});
	})
});
router.route('/:shopName/products/add').post((req,res)=>{
	checksession(req,res,()=>{
		req.checkBody({
			"ProductName":{
				notEmpty: true,
				matches:{
					options:["([a-zA-Z].){1,}","i"],
					errorMessage:"Please Check Product's Name has invalid charaters"
				},
				errorMessage:"Please Check Product's Name"
			},
			"Price":{
				matches:{options:["([0-9]+)","i"],errorMessage:"Product's Price must be a number"}
			},
			"ProductThumbnail":{
				notEmpty: true,
				matches:{
						options:["([data:]+)","i"],
						errorMessage:"Please Check Product's Logo"
					},
				errorMessage:"Please Check Product's Logo"
			},
			"Cat":{
				notEmpty: true,
				matches:{
					options:["([a-zA-Z].){1,}","i"],
					errorMessage:"Please Check Product's Cat has invalid charaters"
				},
				isLength:{options:{min:3,max:50},
				errorMessage:"Length must be between 3 and 50"}
			},
			"ProductDesc":{
				optional:true,notEmpty:true,
				errorMessage:"Please check your New Product's Description"
			},
			"SpecName":{
				notEmpty:true,
				errorMessage:"Please check your New Product's Spec"
			},
			"SpecValue":{
				notEmpty:true,
				errorMessage:"Please check your New Product's Spec's Value"
			}
		})
			shopName=req.params.shopName;
			var errors=req.validationErrors();
			assertCallback(errors,()=>{
				res.render('products',{flash:{type:"addP",class:"alert-danger",messages:errors},"title":"Products","shopName":shopName,Cats:req.app.cats,products:req.app.products,type:req.session.type,user:req.session.user});
				res.end();
			},()=>{
				var values=[req.body.ProductName,shopName,parseInt(req.body.Price),parseInt(req.body.Quantity),req.body.ProductThumbnail,req.body.ProductDesc,req.body.Cat];
				var specs=[req.body.SpecName,req.body.SpecValue,shopName,req.body.ProductName];
				products.Products.Exists(values[0],(exists,product)=>{
					
						checkEquality(product,[req.body.ProductName,
							shopName,
							parseInt(req.body.Price),
							parseInt(req.body.Quantity),
							req.body.ProductThumbnail,
							req.body.ProductDesc,req.body.Cat,
							req.body.SpecName,req.body.SpecValue],(eq,Aeq)=>{
								if (eq) {
									AExists=[]
										for(i in Aeq){
											AExists.push({msg:Aeq[i][0].toString()+" entered  Exists"})
										}
										products.Cats.getAll(shopName,(done,cats)=>{
											products.Products.getAll(shopName,(done,products)=>{
												res.render('products',{title:"error",flash:{action:"addP",class:"alert-warning",messages:AExists},"title":"Products","shopName":shopName,Cats:cats,products:products,type:req.session.type,user:req.session.user})
												res.end();
											})
										})
										
									}
							},()=>{
								products.Products.add(values,(done)=>{
									products.Specs.add(specs,(done)=>{
										res.redirect("back");
									})
								})
							})
					
				})
			})
	},()=>{
		res.render("users",{title:"Login"});
	})
});
router.route('/:shopName/products/edit').post((req,res)=>{ 
	checksession(req,res,()=>{
		req.checkBody({
			"ProductName":{
				
				matches:{
						options:["([a-zA-Z].){1,}","i"],
						errorMessage:"Please Check Product's Name has invalid charaters"
					},
					errorMessage:""
				},
				"Logo":{
					
					matches:{
						options:["([data:]+)","i"],
						errorMessage:"Please Check Product's Logo"
					},
					errorMessage:""
				},
				"Quantity":{
					
					matches:{options:["([0-9]+)","i"],errorMessage:"Quantity must be a number"}
				},
				"ProductDesc":{
					optional:true,
					
					errorMessage:"Please write something for Product"
				}
		})
		var errors=req.validationErrors();
		assertCallback(errors,()=>{
			res.render("products",{flash:{type:"editProduct",messages:errors},type:req.session.type,user:req.session.user,products:req.app.products,Cats:req.app.cats,shopName:req.params.shopName})
		},()=>{
			var id=parseInt(req.query.id);
			var Img=req.body.Logo;
			var id=req.query.id;
			var values=[
			req.body.ProductName,
			parseInt(req.body.Price),
			Img,
			req.body.ProductDesc,
			parseInt(req.body.Quantity),
			parseInt(id)
			]
			products.Products.edit(values,()=>{
				res.redirect("back");
				res.end();
			})
		})
	},()=>{
		res.render("users",{title:"Login"});
	})
}).get((req,res)=>{
	checksession(req,res,()=>{
		products.Products.getById([req.params.shopName,parseInt(req.query.id)],(done,product)=>{
			res.render('edit',{Product:product});
			res.end();
		})
	},()=>{
		res.render("users",{title:"Login"});
	})
});
router.route('/:shopName/products/delete').get((req,res)=>{
	checksession(req,res,()=>{
		var id=parseInt(req.query.id);
				products.Products.getById(id,(done,product)=>{
					products.Products.delete([id,product.ProductName],(done)=>{
						res.redirect("back");
					})
					res.end();
				})
	},()=>{
		res.render("users",{title:"Login"})
	})
});
var buys=[]
var i=0;
router.route("/:shopName/products/:BillModel/collect").get((req,res)=>{
	checksession(req,res,()=>{
		BillModel=req.params.BillModel;
		shopName=req.params.shopName;
		var client=req.session.user;
		req.session.orguser["Bill"]=BillModel;	
		var id=parseInt(req.query.id),total=0;
		var quantity=parseInt(req.query.q);
		products.Products.getById([shopName,id],(done,product)=>{
			products.Products.Product([product.ProductName,quantity,client,BillModel,product.Price],(done)=>{
				products.Products.Bill(BillModel,(done)=>{
					res.end();
				})
			})
		})
			
	},()=>{
		res.render("users",{title:"Login"});res.end();
	})
});
router.route('/cats/add').post((req,res)=>{
	checksession(req,res,()=>{
		shopName=req.query.shopName;
		req.checkBody({
			"Cat":{
				optional:true,notEmpty:true,
				matches:{
					options:["([a-zA-Z]*){1,}",'i'],
					errorMessage:"Please CateName has Invalid characters"
				},
				isLength:{
					options:{min:3,max:15},
					errorMessage:"Length must be between 3 and 15 chars"
				},
				errorMessage:"Please Check Cat's Name"
			},
			"CatDesc":{
				optional:true,notEmpty:true,
				errorMessage:"Please write something about this Cate"
			}
		})
		errors=req.validationErrors();
		assertCallback(errors,()=>{
			return res.render("products",{flash:{type:"CatAdded",messages:errors,class:"alert-danger"},Cats:req.app.cats,products:req.app.products,type:req.session.type,shopName:shopName,user:req.session.user})
		},()=>{
			Name=req.body.Cat
			Desc=req.body.CatDesc
			values=[Name,Desc,shopName]
				products.Cats.Exists([Name,shopName],(exists,cat)=>{
					checkEquality(cat,values,(eq,Aeq)=>{
						if (eq) {
									AExists=[]
										for(i in Aeq){
											AExists.push({msg:Aeq[i][0].toString()+" entered  Exists"})
										}
										products.Cats.getAll(shopName,(cats)=>{
											products.Products.getAll(shopName,(products)=>{
												res.render('products',{title:"error",flash:{action:"CatAdded",class:"alert-warning",messages:AExists},"title":"Products","shopName":shopName,Cats:cats,products:products,type:req.session.type,user:req.session.user})
												res.end();
											})
										})
										
									}

					},()=>{
						products.Cats.add(values,(done)=>{
							res.redirect("back");
						})
					})
				})
		})
	},()=>{
		res.render("users",{title:"Login"})
	})
})
router.route('/:shopName/products/:cat').get((req,res)=>{
	checksession(req,res,()=>{
		cat=req.params.cat,shopName=req.params.shopName
		products.Products.getByCat([cat,shopName],(done,product)=>{
			products.Cats.getAll(shopName,(done,cats)=>{
				res.render("products",{products:product,Cats:cats,shopName:shopName,type:req.session.type,user:req.session.user})
			})
		})
	},()=>{
		res.render("users",{title:"Login"})
	})
})
router.route('/:shopName/cats/delete').get((req,res)=>{
	checksession(req,res,()=>{
		var name=req.query.name,shopName=req.params.shopName;
			products.Cats.delete([name,shopName],(done)=>{
				res.redirect("back");
				res.end();
			})
	},()=>{
		res.render("users",{title:"Login"});
	})
});
router.route("/products/bill").post((req,res)=>{
	checksession(req,res,()=>{
			BillModel=req.body.BillModel;
			user=req.session.user;
			req.checkBody("BillModel","BillName is Required").notEmpty();
			errors=req.validationErrors();
			assertCallback(errors,()=>{
				res.render('users',{title:"error",flash:{action:"Bill",type:"alert-danger",messages: errors}})
			},()=>{
					
			})
			
	},()=>{
		res.render("users",{title:"Login"});;res.end();
	})
});
io.on('connection',(socket)=>{
	ps=[];quan=[];Scart={};
	visitors=[];
	socket.on('getbps',(data)=>{
		products.Bill.get(data,(billP,q)=>{
			ps.push(billP)
			quan.push(q);
			socket.emit('bps',ps,quan);
		})
	});
	socket.on('cart-changed',(Scart)=>{
		socket.emit('cart-init',Scart);
	});
	socket.on('bill-create',(billd)=>{
		knex('bill').insert(billd).then((d)=>{
			socket.emit('bill-created');
		}).catch(err=>console.log(err));
	})
	socket.on('collect',(ps)=>{
		var r=false;
		knex('bill_products').select().then((data)=>{
			data.forEach((d)=>{
				for(var i in d){
					if(ps[i]==d[i]){
						r=true
						break;
					}
					else{break;}
				}
			})
		}).catch(err=>console.log(err));
		if (r==true) {
			knex('bill_products').delete().where({ProductName:ps.ProductName,BillModel:ps.BillModel
			}).then((d)=>{
				console.log(d);
			}).catch(err=>console.log(err));
		}
		if (r==false) {
			knex('bill_products').insert(ps).update(ps).where({ProductName:ps.ProductName,BillModel:ps.BillModel}).then((d)=>{
				knex('bill').update({empty:false}).where({BillModel:ps.BillModel}).then((d)=>{
					socket.emit('order-collected',true);
				}).catch(err=>console.log(err));
			}).catch(err=>console.log(err));
		}
	});
	socket.on('bills',(cn,bm)=>{
		knex('bills').select(['bill.BillModel','bill_products.ProductName','bill_products.OQuantity','bill_products.ShopName','bill_products.Price']).crossJoin('bill_products').on('bill_products.BillModel',"=","bill.BillModel").where({ClientName:cn}).then((data)=>{
			socket.emit('getbill',data.filter(d=>d.BillModel==bm));
		})
	})
	socket.on('b2b',(opts)=>{
		owner=opts.owner
		owner2=opts.owner2
		ps=opts.ps
		var r=false;
		knex('shops').select().then((data)=>{
			shops=data.filter(d=>d.owner==owner2);
			if (opts.sOnly==false) {
				if (Array.isArray(ps)) {
					data=ps
				for(var ps of data){
					if (ps.OQuantity<=10) {
							knex('B_products').insert({ProductName:ps.Name,OQuantity:ps.OQuantity,ShopName:shops[0].ShopName,Price:ps.price}).update({OQuantity:ps.OQuantity,ShopName:shops[0].ShopName,Price:ps.price}).where({ProductName:ps.Name}).then((d)=>{
								knex('products').update({OQuantity:'products.OQuantity'- ps.OQuantity}).where({ProductName:ps.Name}).then((d)=>{
									socket.emit('b2b',true);
								}).catch(err=>console.log(err))
							}).catch(err=>console.log(err))
						}		
					}
				}else{
					if (ps.OQuantity<=10) {
							knex('B_products').insert({ProductName:ps.Name,OQuantity:ps.OQuantity,ShopName:shops[0].ShopName,Price:ps.price}).update({OQuantity:ps.OQuantity,ShopName:shops[0].ShopName,Price:ps.price}).where({ProductName:ps.Name}).then((d)=>{
								knex('products').update({OQuantity:'products.OQuantity'- ps.OQuantity}).where({ProductName:ps.Name}).then((d)=>{
									socket.emit('b2b',true);
								}).catch(err=>console.log(err))
							}).catch(err=>console.log(err))
						}
				}
			}else{
				//if(r==false){
					knex('B_products').insert({ProductName:ps.Name,OQuantity:ps.OQuantity,ShopName:opts.ShopName,Price:ps.price}).update({OQuantity:ps.OQuantity,ShopName:opts.ShopName,Price:ps.price}).where({ProductName:ps.Name}).then((d)=>{
						knex('products').update({OQuantity:'products.OQuantity'- ps.OQuantity}).where({ProductName:ps.Name}).then((d)=>{
							socket.emit('b2b',true);
						}).catch(err=>console.log(err))
					}).catch(err=>console.log(err))
				//}
			}
		}).catch(err=>console.log(err))
	})
	socket.on('sps',(s)=>{
		knex('products').select().then((data)=>{
			socket.emit('sps',data.filter(d=>d.ShopName==s));
		}).catch(err=>console.log(err));
	})
})
router.get('/cart',(req,res)=>{
	res.render('cart',{notifications:false,Client:req.session.client,Name:req.session.name});
	res.end();
});
router.get("/:shopName/bill/",(req,res)=>{
	res.render('bill',{BillName:req.session.orguser.name,shopName:req.params.shopName,BillModel:BillModel});
	res.end();
});
router.route("/order").get((req,res)=>{
	res.render('order',{Client:req.session.client,Name:req.session.name});
	res.end();
}).post((req,res)=>{
		var render={Client:req.session.client,Name:req.session.name}
		req.checkBody({
			'phone':{
				matches:{
					options:['^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$','im'],
					errorMessage:"Your Phone not matches"
				}
			},
			'first': {  
		    isLength: {
		      options: [{ min: 3, max: 20 }],
		      errorMessage: 'Must be between 2 and 20 chars long'
		    }
		  },
			'last': {  
		    isLength: {
		      options: [{ min: 3, max: 20 }],
		      errorMessage: 'Must be between 3 and 20 chars long' 
		    }
		  },
		  'email':{
		  	 isEmail: {
			      errorMessage: 'Invalid Email'
			    }
			}
			/*'address':{
				matches:{
					options:["^\d{1,6}\040([A-Z]{1}[a-z]{1,}\040[A-Z]{1}[a-z]{1,})$|^\d{1,6}\040([A-Z]{1}[a-z]{1,}\040[A-Z]{1}[a-z]{1,}\040[A-Z]{1}[a-z]{1,})$|^\d{1,6}\040([A-Z]{1}[a-z]{1,}\040[A-Z]{1}[a-z]{1,}\040[A-Z]{1}[a-z]{1,}\040[A-Z]{1}[a-z]{1,})$",'i'],
					errorMessage:"your Address not matches",
					//options:["/^\d+\w*\s*(?:(?:[\-\/]?\s*)?\d*(?:\s*\d+\/\s*)?\d+)?\s+/","i"]
				}
			}*/
		})
		var errors=req.validationErrors();
		if (errors) {
			res.render('order',extend(render,{flash:{messages:errors}}));
		}
		if (!errors) {
			BillModel=req.body.Bill;
			user=req.session.client;
			var opts=typeof(req.body.opts)=='string'?req.body.opts.split("."):req.body.opts;
			console.log(opts);
			var validation=credit.validate({
				cardType:req.body.CT,
				number:req.body.CN.replace("+",''),
				cvv:req.body.CVV,
				ExpiryMonth:req.body.Expires.split("/")[0],
				ExpiryYear:req.body.Expires.split("/")[1]})
			console.log(validation);
			if (validation.isExpired==false) {
				knex('credits').select().where('ClientName',req.session.client).then((d)=>{
					if (d.length>0) {
							knex('credits').insert(
							{
								FirstName:req.body.first,
								LastName:req.body.last,
								CreditNumber:req.body.CN,
								CVV:req.body.CVV,
								Expires:req.body.Expires,
								ClientName:req.session.client,
								CreditType:req.body.CT
							}
						).then((d)=>{
							knex('paccounts').select('Balance').where({ClientName:req.session.client}).then((paccount)=>{
								knex('paccounts').update('Balance',parseInt(d.Balance)-parseInt(opts[1])).then((d)=>{
									if (d.affectedRows>1) {
										knex('bill').update({isPaid:true}).where({BillModel:opts[0]}).then((d)=>{
											console.log(d);
										}).catch((err)=>{console.log(err)})
									}
								}).catch((err)=>{console.log(err)})
							}).catch((err)=>{console.log(err)})
						}).catch((err)=>{console.log(err)})
					}
					else{
						knex('paccounts').select('Balance').where({'ClientName':req.session.client}).then((paccount)=>{
								knex('paccounts').update('Balance',parseInt(d.Balance)-parseInt(total)).then((d)=>{
									if (d.affectedRows>1) {
										knex('bill').update({isPaid:true}).then((d)=>{
											console.log(d);
										}).catch(err=>console.log(err))
									}
								}).catch((err)=>{console.log(err)})
							}).catch((err)=>{console.log(err)})
					}	
				}).catch((err)=>{console.log(err)})
			}
			else{
				res.render('order',extend(render,{flash:{messages:[{msg:"CreditCard is Expired"}]}}));
				res.end();
			}
		}
});
router.post("admin/shops",(req,res)=>{
	if(req.session.LoggedIn==true&&req.session.admin){
		for(i of req.body){
			if (i!="SName"||i!="Logo"||i!="CatN") {
					req.checkBody({
					i:{
						notEmpty:true,
						matches:{
							options:['[0-9A-Za-z]'.'i'],
							errorMessage:"Your entire not matches"
						}
					}
				})
			}
				req.checkBody({
				"SName":{
					notEmpty:true,
					errorMessage:"Please Ckeck shop's Name"
				},
				"Logo":{
					matches:{
						options:["([data:]+)","i"],
						errorMessage:"Please Check Product's Logo"
						},
					errorMessage:""
					}
				})
		}
		var errors=req.validationErrors();
		if (errors) {
			res.render('admin/shops',{admin:req.session.admin,flash:{messages:errors}});
		}else{
			knex('shops').insert({ShopName:req.body.SName,Logo:req.body.Logo}).then((d)=>{
				r=false
				for(var i=0;i<parseInt(req.body.CatN);i++){
					knex('cats').insert({Cat:req.body['CatN'+String(i)],CatDesc:req.body['CatD'+String(i)],shopName:req.body.SName}).then((d)=>{
						r=true
					}).catch(err=>console.log(err))
				}
			}).catch(err=>console.log(err))
			if (r) {
				req.flash('success','Shop added Successfully');
				res.redirect("back");
			}
		}
	}
	else{
		res.render("admin/login");
		res.end();
	}
});
router.get("admin/shops/del",(req,res)=>{
	knex('shops').delete().where({ShopName:req.query.SN}).then((d)=>{
		req.flash('success','Shop deleted Successfully');
		res.redirect("back");
	}).catch(err=>console.log(err))
})
router.route('/:ProductName/Specs/add').post((req,res)=>{
		req.checkBody({
			"SpecName":{
				matches:{
					options:["([a-zA-Z].){1,}","i"],
					errorMessage:"Please check SpecName has Invalid characters"
				}
			},
			"SpecValue":{
				matches:{
					options:["([a-zA-Z0-9]+)","i"],
					errorMessage:"Please check SpecValue has Invalid characters"
				}
			}
		})
		r=false;
		knex('specification').select().where({ProductName:req.query.ProductName}).then((data)=>{
			for(var d of data){
				if (d.SpecName==req.body.SpecName&&d.SpecValue==req.body.SpecValue) {
					r=true
					break;
				}
			}
		}).catch(err=>console.log(err))
		if (r==false) {
			knex('specification').insert({ProductName:req.query.ProductName,SpecName:req.body.SpecName,SpecValue:req.body.SpecValue}).then((d)=>{
				req.flash('success','Spec added Successfully');
				res.redirect("back");
			}).catch(err=>console.log(err))
		};

})
router.route('/:product/Specs/delete').get((req,res)=>{
	knex('specification').delete().where({SpecName:req.query.SName}).then((d)=>{
		req.flash('success','Spec deleted Successfully');
		res.redirect("back");
	}).catch(err=>console.log(err))
})
router.get("/:shopName/:product/view",(req,res)=>{
	checksession(req,res,()=>{
		products.Products.View(req.params.product,(done,product)=>{
			res.render("View",{Product:product,shopName:req.params.shopName,type:req.session.type});
			})
	},()=>{
		res.render("users",{title:"Login"})
	})
})
var ComparedProducts={};
router.get("/compare/:ComparedProducts",(req,res)=>{
	var render={Client:req.session.client,Name:req.session.name}
	Products=req.params.ComparedProducts;
	Products=Products.split(',');
			products.Products.Compare(Products,(done,p,cps)=>{
				ComparedProducts[p]=cps[p]
			})
			do{
				setTimeout(()=>{
					res.render("compare",extend(render,{ComparedProducts:ComparedProducts}));
				},1000)
				setTimeout(()=>{
					ComparedProducts={}
				},1000);
			}while(Object.keys(ComparedProducts).length==Products.length);
});
router.route("/:user/settings").get((req,res)=>{
	checksession(req,res,()=>{
		checkType(req.session.type,()=>{
			shops.getAll((done,shops)=>{
				res.render('settings',{title:"Settings",type:req.session.type,PA:{},Shops:shops});
				res.end()
			})
		},()=>{
					clients.PAccount.get(req.params.user,(done,paccount)=>{
						res.render('settings',{title:"Settings",type:req.session.type,PA:paccount,Shops:[]});
						res.end()
					})
		})
		
	},()=>{
		res.render("users",{title:"Login"})
	})
}).post((req,res)=>{
	checksession(req,res,()=>{
		credit={};
		action=req.query.action
		for(i in req.body){
			if (i.startsWith("credit")) {
				credit[i.toString()]=req.body[i.toString()];
			}
			req.checkBody({
				i:{
					notEmpty:true,optional:true,
					matches:{
						options:["([a-zA-Z0-9]+)","i"]
					},
					errorMessage:"Please Check "+i+"Field"
				}
			})
		}
		assertCallback(req.validationErrors(),()=>{

		},()=>{
			checkType(req.session.type,()=>{
				if (action=="Pass") {
					values=[req.body.OldPass,req.body.NewPass,req.body.CNewPass]
					if (values[2]===values[1]) {
						owners.changePass(values,(done)=>{
							req.session.destroy();
							res.redirect("/");
							res.end();
						})
					}
				}
				if (action=="shop") {
					shops.Currency([req.body.Currency,req.body.shopName],(done)=>{
						res.end();
					})
				}
			},()=>{
				if (action=="Pass") {
					values=[req.body.OldPass,req.body.NewPass,req.body.CNewPass]
					if (values[2]===values[1]) {
						clients.changePass(values,(done)=>{
							req.session.destroy();
							res.redirect("/");
							res.end();
						})
					}
				}
				else if(action=="Credit"){
					clients.PAccount.updateCredit(credit,(done)=>{
						res.redirect("/");
						res.end();
					})
				}
				else if (action=="user"){
					values=[]
					for(i in req.body){
						if (req.body[i]!="" ||req.body[i]!=null) {
							values.push(req.body[i])
						}
					}
					checkType(req.body.Type,()=>{
						owners.Exists(crypto.Hmac('SHA1',req.body.UserName).update(req.body.UserName).digest('hex'),(exists)=>{
								if (exists==false) {
										owners.create(values,(done)=>{
										res.redirect("/");
										res.end();
									})
								}
							})
					},()=>{
							clients.Exists(crypto.Hmac('SHA1',req.body.UserName).update(req.body.UserName).digest('hex'),(exists)=>{
								if (exists==false) {
									clients.create(values,(done)=>{
										res.redirect("/");
									res.end();
									})
								}
							})
						

						
					})
				}

			})
		})
	},()=>{
		res.render("users",{title:"Login"})
	})
});
router.route("/trans/:from/:to/:action").post((req,res)=>{
	checksession(req,res,()=>{
		clients.Trans.create({seller:req.params.from,buyer:req.params.to,type:req.params.action},socket);

	},()=>{
		res.render("users",{title:"Login"})
	})
})
router.route("/admin").get((req,res)=>{
	var admin=req.session.admin,name=req.session.name;
		if (req.session.LoggedIn==true&&admin){
		req.flash('success',"Login Successfully");
		res.render('admin/index',{admin:admin,name:name});
		res.end();
		}
		else{
			res.render("admin/login");
			res.end();
		}	
}).post((req,res)=>{
	var r=false;
	req.check(
		{  "userName":{
				matches:{
					options:['/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/',"i"],
					options:["[a-zA-Z0-9]","i"],
					errorMessage: 'Email|UserName not matches'
				}
			},"password":{
				matches:{
					options:["[a-zA-Z0-9]","i"],
					errorMessage: 'Password not matched'
				},
				isLength:{
					options:[{min:3,max:20}],
					errorMessage: 'Must be between 3 and 20 chars long'
				}
			} 	
		});
	var errors=req.validationErrors();
	if (errors) {
		res.render('admin/login',{flash:{type:"error",messages:errors}})
	};
	if (!errors) {
		user=req.body.userName;
		password=req.body.password;
		knex('adms').select().then((adms)=>{
			for(var i in adms){
				r=(hashVerify('sha1',user,user,adms[i].Name)||hashVerify('sha1',user,user,adms[i].Email))
				&&(hashVerify('sha1',password,password,adms[i].Password))	
				if (r) {
					req.session.admin=adms[i].Name;
					break;
				};
			}
			if (r) {
				req.session.name=user;
				req.session.LoggedIn=true;
				res.redirect("back");
			}
			else{
				res.render('admin/login',{flash:{type:"error",messages:[{msg:"Not Found"}]}})
			}
			res.end();
		}).catch((err)=>console.log(err));
	}
});
router.route("/admin/Shops").get((req,res)=>{
	var render={name:req.session.name,admin:req.session.admin}
	if (req.session.admin) {
	var count=0;
	var Shops=[];
		knex('shops').select().then((shops)=>{
			res.render("admin/shops",extend({shops:shops},render));
		}).catch((err)=>console.log(err));
	}else{
		res.render("admin/login");
	}
})
router.route("/Shops/:ShopName/:action").get((req,res)=>{
	if (req.session.admin) {
		if (req.params.action=='delete') {
			shops.showTables((tables)=>{
				for(var i in tables){
					knex(tables[i]).delete().where("ShopName","=",req.params.ShopName).then((r)=>{
						req.flash('success',"Deleted Successfully");
						res.redirect("/admin/Shops");
					}).catch((err)=>console.log(err));
				}
			})
		}
	}
	else{
		res.render('admin/login');
	}
})
return router
}