// Import modules
const fetch = require('node-fetch');
const AbortController = require("abort-controller");

// Function that gets all coins and pushes them into an array
// It then calls the makeParallelRequests function which performs parallel API calls
async function getAllCoins() {
	
	//Set conditions for abort controller
	const controllerA = new AbortController();
	setTimeout(() => controllerA.abort(), 20000); // Fetch request will only wait 20 seconds before aborting
	//controllerA.abort(); // For testing - immediate abort...
	
	// One Fetch request - get all coin data.
	let response = await fetch('https://api.binance.com/api/v3/ticker/24hr', {signal: controllerA.signal,} ).catch((error)=>console.log(error));
	
	// Declare json array to filter coins later (i.e. only USDT or BNB base)
	let responsePrices = []
	
	//Continue if response is received and convert text to json format
	if (response){
		responsePrices = await response.json();
	}
	
	// Continue if response JSON length is > 0
	if (responsePrices.length >0){
		
		// Declare array to push all coins into
		const listOfArguments = [];
		var chartAnalysis = '30m'; // - Only 30m interval - variable relevant in other program
		
		// Loop through prices json to filter only USDT base pairs to the listOfArguments array.
		for (let i = 0; i < responsePrices.length; i++) {
			if (responsePrices[i].symbol.substr(-4) == 'USDT'){
				listOfArguments.push([responsePrices[i].symbol, chartAnalysis, responsePrices[i].lastPrice, responsePrices[i].volume, responsePrices[i].quoteVolume]); 
			}
		}
		
		// Print confirmation
		console.log('=============================================================');
		console.log('Analysis: # of requests:'+listOfArguments.length);
		console.log('=============================================================');
		
		// Call parallel request function and pass listOfArguments
		makeParallelRequests(listOfArguments);
		
		
	}
	
}

var promList = [];

let counter = 0;
let interval;


// This is the function that is called concurrently 10 times.
// This function returns a value to the makeParallelRequests function below
const makeApiCall = index => {
  counter++;
  return new Promise((resolve, reject) => {
  
		// Set abort controller to reject API call if it takes longer than 20 seconds
		const controller = new AbortController();
		setTimeout(() => controller.abort(), 20000);
		//controller.abort(); // -- for testing purposes
		
		// Fetch candlestick data from Binance
		fetch('https://api.binance.com/api/v3/klines?symbol='+index[0]+'&interval='+index[1]+'&limit=210', { signal: controller.signal })
			.then((response)=> {
				return response.json();
			})
			.then(function (data) {
				//console.log('----------------------');
				//console.log('result. below. ...')
				//console.log(data);
				
				console.log('Operation performed:', index[0]);
				      
				// In the other program, I did not want to use these pairs, so I filtered them out...
				if ( (index[0].includes("VEN") == false ) && (index[0].includes("BEAR") == false ) && (index[0].includes("BULL") == false ) && (index[0].includes("BCHABC") == false )       && (index[0].includes("BCHSV") == false ) 
					&& (index[0].includes("AUD") == false ) && (index[0].includes("USDS") == false ) && (index[0].includes("TUSD") == false ) && (index[0].includes("PAX") == false )  && (index[0].includes("EUR") == false )   && (index[0].includes("BUSD") == false )  &&  (index[0].includes("USDC") == false )  &&  (index[0].includes("GBP") == false ) &&  (index[0].includes("DAI") == false )
				){
					promList.push([{symbol: index[0], price: index[2], vol:index[3], vol_BTC:index[4]}, data]);
				}
				
					
				counter--;
				resolve();
				
				//console.log('=====================')
			})
			.catch(function (err) {
				
				console.log('X X X X X X X X X X X X X X X X X X X X');
				console.log('Operation REJECTED below:', index[0]);
				console.log("Something went wrong!", err);
				
				console.log('X X X X X X X X X X X X X X X X X X X X')
				
				resolve();
				
			});
	});
};


// Not sure if this is relevant. Was in my previous code - stops concurrent calls if no more values in listOfArguments array left.
if (counter==0){	
	clearInterval(interval);
}


// Function logs returned data to console
function printReturnedData() {
	console.log("Returned Data");
	console.log(promList);
}


// Function makes parallel requests... // Copied from a blog. Source: https://itnext.io/node-js-handling-asynchronous-operations-in-parallel-69679dfae3fc
async function makeParallelRequests(listOfArguments) {
  const concurrencyLimit = 10; // 10 parallel requests at a time
  const argsCopy = listOfArguments.slice();
  const promises = new Array(concurrencyLimit).fill(Promise.resolve());
  // Recursively chain the next Promise to the currently executed Promise
  function chainNext(p) {
    if (argsCopy.length) {
      const arg = argsCopy.shift();
      return p.then(() => {
        const operationPromise = makeApiCall(arg); // --> see makeAPICall() function above
		// 10 makeApiCall functions run concurrently
        return chainNext(operationPromise);
      })
    }
    return p;
  }

  await Promise.all(promises.map(chainNext));
  
  // For code simplicity - function called that logs returned data to console
  // See printReturnedData function above
  printReturnedData();
  
}

//Start program
getAllCoins();

