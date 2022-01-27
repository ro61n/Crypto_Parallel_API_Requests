# Parallel API Requests

Last Updated: 27-01-2022

This is a basic Node.js application that demonstrates Parallel API requests.

The first function retrieves all cryptocurrency pairs available on Binance.
 
These pairs are then all pushed into an array. Each element in this array will become an API call to binance to retrieve the candlestick data of every pair.

The parallel requests are then made through another function. This function handles 10 parallel requests at a time. As soon as one promise is returned it is replaced by another request from the array until all elements (pairs) in the array have been requested.

The program also makes use of Abort Controllers to reject a request if it takes longer than 20 seconds.

The parallel/concurrent request function was derived from the methods used in the following blog post: https://itnext.io/node-js-handling-asynchronous-operations-in-parallel-69679dfae3fc

Robin Titus is the maintainer and contributor of this project.

In order to run this application, download the repository; move to the local directory in command prompt and type 'node index.js'.
