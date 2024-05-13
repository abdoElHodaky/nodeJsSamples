function maxProfit(price){
  
   let maxcost=0
   let min=price[0]
    for (let i = 0; i < price.length; i++) { 
  
        min=Math.min(price[i],min)
        cost = price[i] - min
		maxcost = Math.max(maxcost, cost)
            
    } 
    return maxcost; 
} 

let price = [44, 30, 24, 32, 35, 30, 40, 38,
15]
    let n = price.length; 
  
    console.log(maxProfit(price)); 