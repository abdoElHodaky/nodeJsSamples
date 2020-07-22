module.exports=()=>{
	checkType:(type,resolve,reject)=>{
		if (type=="owner") {
			resolve();
		}
		else{
			reject();
		}
	}
}