"use strict";
let helpers={
		sqls:{
		Products:{
			getByCat:"select * from products where (Cat=? and shopName=?)",	
			getAll:"SELECT * FROM products where shopName=?",
			getById:"SELECT * FROM products where (shopName=? and ProductId=?)"
			,addProduct:{existed:"select products.ProductName,specification.SpecName,specification.SpecValue from products inner join specification on specification.ProductName=products.ProductName  where products.ProductName=?",
			subSqls:{
				addProduct:"insert into products (ProductName,ShopName,Price,Quantity,ProductThumbnail,ProductDesc,Cat) Values (?,?,?,?,?,?,?)",
				addSpecs:"insert into specification(SpecName,SpecValue,ShopName,ProductName)values(?,?,?,?)"
			}},
			editProduct:"update products set ProductName=?, Price=? ,ProductThumbnail=? , ProductDesc=? , Quantity=?  where ProductId=?",
			deleteProduct:{
				subSqls:{
					deleteSpecs:"delete from specification where ProductName=(select ProductName from products where ProductId=?)"
					,deleteProduct:"DELETE FROM products WHERE (ProductId=? and shopName=?)"
				}
				
			},
			View:"SELECT ps.ProductId,ps.ProductName,ps.Price,ps.ProductThumbnail,ps.ProductDesc,ps.Cat,spec.SpecName,spec.SpecValue  FROM products ps INNER JOIN specification spec ON spec.ProductName=ps.ProductName WHERE ps.ProductName=?"
			,Collect:{
				//updateProduct:"update products  set  BillModel=? , OQuantity= case  WHEN Quantity>OQuantity THEN ? ELSE 1  END , Quantity= case  WHEN Quantity-OQuantity<=0 THEN 1 ELSE Quantity-OQuantity END Where(ProductId=? and shopName=?)"
				updateBill:"update bill set empty=false where (empty=true and BillModel=?)",
				updateClient:"update clients set BillModel=? where Name=?",
				addProduct:"insert into bill_products(ProductName,OQuantity,ClientName,BillModel,Price)Values(?,?,?,?,?)",
				deleteProduct:"Delete from bill_products where (ClienName=? and BillModel=?)"
			}
		},
		Bill:{
			add:"insert into bill(BillModel,ShopName,ClientName,empty) values (?,?,?,true)"
			//,get:"select ps.* ,cs.Name from products ps inner join clients cs on cs.BillModel=ps.BillModel where (cs.Name=? and cs.BillModel=? )"
			,pay:"update bill set isPaid=true where BillModel=? ",
			getP:"select * from products where ProductName=(select ProductName FROM bill_products WHERE(BillModel=? and ClientName=?))"
			,updateProduct:"UPDATE products,bill_products set products.Quantity=products.Quantity-bill_products.OQuantity WHERE products.ProductName=bill_products.ProductName"
		},
		Cats:{
			getAll:"SELECT * FROM cats where shopName=?",
			add:
			{exists:"select Cat,CatDesc from cats where (Cat=? and shopName=? )",
			add:"INSERT INTO cats(Cat,CatDesc,shopName)Values(?,?,?)"}
			,deleteCat:"delete from cats where (Cat=? and shopName=?)",
			deleteProduct:"delete from products where Cat=?"
		},
		Shops:{
			exists:"select shopName,Logo from shops where(ShopName=? or Logo=?)",subSqls:{
				add:"insert into shops (ShopName,Logo) Values(?,?)"
			},
			deleteShops:{
				delte:"delete from shops where ShopName=?",
				subSqls:{
					deleteProduct:"delete from products where ShopName=?",
					deleteCat:"delete from cats where ShopName=?"

				}
			}
		},
		Specs:{
			add:{
				exists:"select SpecName,SpecValue from `specification` where (ProductName=? and SpecName=?)",
				subSqls:{
					add:"insert into specification (ProductName,SpecName,SpecValue,shopName) values(?,?,?,?)"
				}
			},
			delete:"delete from specification where ProductName=(select ProductName from products where ProductId=?)"
			,deleteByName:"delete from specification where(SpecName=? and ProductName=?)"
			,getAll:"select SpecName,SpecValue from `specification` where ProductName=?"
		},
		Credits:{
			getByClientName:"select * from credits where ClientName=?"
		}

		},
		ai:(table)=>{return "ALTER TABLE"+table+" AUTO_INCREMENT=1";}
	},connect=require('mysql').createConnection({
	host:"127.0.0.1",
	user:"root",
	password:"279348",
	database:"E-Commerce"
}),knex=require('../knex'),sqls=helpers.sqls,products={
	cps:
	{},
		Products:{
			getAll:(attrs,callback)=>{
				if (typeof(attrs)=="string") 
					{
						connect.query(sqls.Products.getAll,attrs,(err,result)=>{
							if (err) {console.log(err.message)}
							var done=(result&&result.length>0)?true:false;
							callback(done,result);
						})
					}
				},
			getByCat:(attrs,callback)=>{
				var attrs=(typeof(attrs)=="string")?attrs.split(','):attrs;
				var	values=attrs;
					connect.query(sqls.Products.getByCat,values,(err,result)=>{
							if (err) {console.log(err.message)}
							var done=(result&&result.length>0)?true:false;
							callback(done,result);
						})
				
				
			},
			getById:(attrs,callback)=>{
				attrs=typeof(attrs)=='string'?attrs.split(","):attrs;
				connect.query(sqls.Products.getById,attrs,(err,result)=>{
					if (err) {console.log(err.message);}
					var done=(result&&result.length>0)?true:false;
					callback(done,result[0]);
				})
			},
			delete:(attrs,callback)=>{
				attrs=typeof(attrs)=='string'?attrs.split(","):attrs;
				connect.query(sqls.Products.subSqls.deleteProduct,attrs[0],(err,result)=>{
					if (err) {console.log(err.message);}
					products.Specs.delete(attrs[1],(done)=>{
						if (done==true) {
							products.ai('specification',(done)=>{
								if (done) {
									products.ai('products',(done)=>{
										if (done)
										{
											callback(done)
										}
									})
								}
							})
						}
					})
				})
			},
			deleteByCat:(attr,callback)=>{
				connect.query(sqls.Cats.deleteProduct,attr,(err,result)=>{
					if (err) {console.log(err.message);}
					var done=(result!=[]&&result.affectedRows>0)?true:false;
					callback(done);
				})
			},
			Exists:(attr,callback)=>{
				if (typeof(attr)=='string') {
					connect.query(sqls.Products.addProduct.existed,attr,(err,result)=>{
						if (err) {console.log(err.message);};
						var exists=(result.length>0&&result!=[])?true:false;
						callback(exists,result);
					})
				}
			},
			add:(attrs,callback)=>{
				var attrs=(typeof(attrs)=="string")?attrs.split(','):attrs;
				var	values=attrs;
					connect.query(sqls.Products.addProduct.subSqls.addProduct,values,(err,result)=>{
						if (err) {console.log(err.message);};
						var done=(result&&result.affectedRows>0)?true:false;
						callback(done);
					})
			},
			Product:(attrs,callback)=>{
				var attrs=(typeof(attrs)=="string")?attrs.split(','):attrs;
				var values=attrs;
					connect.query(sqls.Products.Collect.addProduct,values,(err,result)=>{
						var done=(result&&result.affectedRows>0)?true:false;
						connect.query(sqls.Bill.updateProduct).on('result',(rows)=>{
							callback(done);
						}).on('error',(err)=>console.log(err.message));
					})
				
			},
			Bill:(attrs,callback)=>{
				var attrs=(typeof(attrs)=="string")?attrs.split(','):attrs;
				var	values=attrs;
					connect.query(sqls.Products.Collect.updateBill,values,(err,result)=>{
						var done=(result&&result.affectedRows>0)?true:false;
						callback(done);
					})
				
			},
			Client:(attrs,callback)=>{
				var attrs=(typeof(attrs)=="string")?attrs.split(','):attrs;
				var	values=attrs;
					connect.query(sqls.Products.Collect.updateClient,values,(err,result)=>{
						var done=(result&&result.affectedRows>0)?true:false;
						callback(done);
					})
				
			},
			View:(attr,callback)=>{
				if (typeof(attr)=="string") {
					connect.query(sqls.Products.View,attr,(err,result)=>{
							var done=(result&&result.length>0)?true:false;
							callback(done,result);
						})
				}
			},
			edit:(attrs,callback)=>{
				var attrs=(typeof(attrs)=="string")?attrs.split(','):attrs;
				var values=attrs;
					connect.query(sqls.Products.editProduct,values,(err,result)=>{
						var done=(result&&result.affectedRows>0)?true:false;
						callback(done);
					})
			},
			Compare:(attrs,callback)=>{
				attrs=(typeof(attrs)=="string")?attrs.split(','):attrs;
				var done=false,ComparedProducts={};
				products.Specs.Equality(attrs,(eq)=>{
					if (eq==true) {
						attrs.forEach((a)=>{
							var cps=ComparedProducts[a]=new Array()
							products.Products.View(a,(done,product)=>{
								product.forEach((p)=>{
									done=eq;
									cps.push(p)
								})
								products.cps=ComparedProducts;
									if (done==true) {
									callback(done,a,products.cps)
								}
							})
						})
					}
				})	
			}
		},Specs:{
			Exists:(attrs,callback)=>{
						attrs=(typeof(attrs)=="string")?attrs.split(','):attrs;
						connect.query(sqls.Specs.add.exists,attrs,(err,result)=>{
						if (err) {console.log(err.message);};
						var	exists=(result.length>0&&result!=[])?true:false;
							callback(exists,result[0]);
						})
				},
				add:(attrs,callback)=>{
					var attrs=(typeof(attrs)=="string")?attrs.split(','):attrs;
					var values=attrs;
						connect.query(sqls.Specs.add.subSqls.add,attrs,(err,result)=>{
							var done=(result&&result.affectedRows>0)?true:false;
							callback(done);
						})
					
				},
				delete:(attrs,callback)=>{
					var attrs=(typeof(attrs)=="string")?attrs.split(','):attrs;
					var values=attrs;
						connect.query(sqls.Specs.delete,attrs,(err,result)=>{
							var done=(result&&result.affectedRows>0)?true:false;
							callback(done);
						})
				},
				deleteByName:(attrs,callback)=>{
					var attrs=(typeof(attrs)=="string")?attrs.split(','):attrs;
					var values=attrs;
						connect.query(sqls.Specs.deleteByName,attrs,(err,result)=>{
							var done=(result&&result.affectedRows>0)?true:false;
							callback(done);
						})
				}
				,
				getAll:(attrs,callback)=>{
						attrs=(typeof(attrs)=="string")?attrs.split(','):attrs;
						connect.query(sqls.Specs.getAll,attrs,(err,result)=>{
						if (err) {console.log(err.message);};
						var	exists=(result.length>0&&result!=[])?true:false;
							callback(exists,result);
						})
				},
				count:(attrs,callback)=>{
					if (typeof(attrs)=="string") 
					{	
						products.Specs.getAll(attrs,(done,specs)=>{
							callback(done,specs.length)
						})
					}
				},
				Equality:(attrs,callback)=>{
					attrs=(typeof(attrs)=="string")?attrs.split(','):attrs;
					var eq=false;
					for(var i in attrs){
						for(var j in attrs){
							if (j!==i&&i!==j) {
								products.Specs.count(attrs[j],(done,count)=>{
									products.Specs.count(attrs[i],(done,count2)=>{
										eq=(count==count2)
										callback(eq)

									})
								})
							}
							else{break;}
						}
					}
				}
		},Cats:{
			Exists:(attrs,callback)=>{
				var attrs=(typeof(attrs)=="string")?attrs.split(','):attrs;
				connect.query(sqls.Cats.add.exists,attrs,(err,result)=>{
					if (err) {console.log(err.message)};
					var exists=(result.length>0&&result!=[])?true:false;
					callback(exists,result);
				})
			},
			add:(attrs,callback)=>{
				var attrs=(typeof(attrs)=="string")?attrs.split(','):attrs;
					var values=attrs;
					connect.query(sqls.Cats.add.add,values,(err,result)=>{
						if (err) {console.log(err.message);};
						var done=(result&&result.affectedRows>0)?true:false;
						callback(done);
					})
				
			},
			getAll:(attrs,callback)=>{
				if (typeof(attrs)=="string") 
					{
						connect.query(sqls.Cats.getAll,attrs,(err,result)=>{
							if (err) {console.log(err.message)}
								var done=(result&&result.length>0)?true:false;
								callback(done,result);
						})
					}
				},
			delete:(attrs,callback)=>{
					var attrs=(typeof(attrs)=="string")?attrs.split(','):attrs;
					var	values=attrs;
					products.Products.deleteByCat(attrs[0],(done)=>{
						if (done==true) {
								connect.query(sqls.Cats.deleteCat,values,(err,result)=>{
									if (err) {console.log(err.message);}
									var done=(result!=[]&&result.affectedRows>0)
									products.ai('cats',(done)=>{
											products.ai('products',(done)=>{
												callback(done);
											})
									})
								})
							}
						})
				}
		},
	Bill:{
			add:(attrs,callback)=>{
			var attrs=(typeof(attrs)=="string")?attrs.split(','):attrs;
				var	values=attrs;
				connect.query(sqls.Bill.add,values,(err,result)=>{
					var done=(result&&result.affectedRows>0)?true:false;
					callback(done);
				})
			
		},
		get:(attrs,callback)=>{
			knex('bill_products').select("ProductName","OQuantity").where(attrs).then((data)=>{
				data.forEach((d)=>{
						knex('products').select().where({ProductName:d.ProductName}).then((data)=>{
						callback(data[0],d.OQuantity);
					})	
				})
			})
		},
		pay:(attrs,callback)=>{
			var attrs=(typeof(attrs)=="string")?attrs.split(','):attrs;
			var values=attrs;
				connect.query(sqls.Bill.pay,attrs,(err,result)=>{
					var done=(result&&result.affectedRows>0)?true:false;
					callback(done);
					
				})
			
		}
		
	},
		ai:(table,callback)=>{
			connect.query(helpers.ai(table),(err,result)=>{
				if (result) {
					callback(true);
				};
			})
		},
		getCreditByClientName:(attrs,callback)=>{
			var attrs=(typeof(attrs)=="string")?attrs.split(','):attrs;
			var values=attrs;
			connect.query(sqls.Credits.getByClientName,user,(err,result)=>{
				if (result.length>0) {
					callback(result);
				}
				else{
					callback();
				}
			});
		}
}
module.exports=products;