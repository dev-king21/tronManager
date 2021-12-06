var express =require('express');
var generateAccount = require('./lib/account').generateAccount;
var cors =require('cors');
var TronWeb = require('tronweb')

// const mainOptions = {
//   fullNode: "https://testhttpapi.tronex.io",
//   solidityNode: "https://testhttpapi.tronex.io",
//   eventServer: "https://testapi.tronex.io"
// }

const mainOptions = {
  fullNode: "https://api.shasta.trongrid.io",
  solidityNode: "https://api.shasta.trongrid.io",
  eventServer: "https://api.shasta.trongrid.io"
}

// const mainOptions = {
//   fullNode: 'https://api.nileex.io',
//   solidityNode: 'https://api.nileex.io',
//   eventServer: 'https://api.nileex.io'
//   // fullNode: "http://47.252.3.238:8090",
//   // solidityNode: "http://47.252.3.238:8090",
//   // eventServer: "http://47.252.3.238:8090"
// };
const privateKey = 'ad52475d77319fddbf10d111632d46ead4593b89dfbdf9493d3f41fd0a1b6525';



const app = express(),
      port = 3050;



app.use(cors())
app.use(express.json());

app.post('/trxapi/createWallet', (req, res) => {
    console.log("post /api/createWallet");
    let response = generateAccount();
    console.log(response)
    res.json(response);
});

app.post('/trxapi/getTrxBalance', async function(req, res) {
    try{
        const tronWeb = new TronWeb(mainOptions.fullNode, mainOptions.solidityNode, mainOptions.eventServer, privateKey);
        console.log("post /api/getTrxBalance");
        const address = req.body.address;  
        //Get account information，Query the trx balance by the balance in the return value.
        let response = await tronWeb.trx.getAccount(
            address
        );

    console.log(response)
    res.json({balance : response.balance/Math.pow(10,6)});

    }catch(e){
        console.log(e);
    }
    
});
app.post('/trxapi/getTokenBalance', async function(req, res) {
    try{
        const tronWeb = new TronWeb(mainOptions.fullNode, mainOptions.solidityNode, mainOptions.eventServer, privateKey);
        console.log("post /api/getTokenBalance");
        const address = req.body.address;  
        const tokenAddress = req.body.tokenAddress;  

        let contract = await tronWeb.contract().at(tokenAddress);
        //Use call to execute a pure or view smart contract method.
        // These methods do not modify the blockchain, do not cost anything to execute and are also not broadcasted to the network.
        let balance_hex = await contract.balanceOf(address).call();
        let decimals = await contract.decimals().call();
        //Get account information，Query the trx balance by the balance in the return value.
        // console.log(balance_hex)
        response = balance_hex / Math.pow(10,decimals);

        // console.log(decimals)
        res.json({balance : response});

    }catch(e){
        console.log(e);
    }
    
});

app.post('/trxapi/sendToken', async function(req, res) {
    try{
        
        console.log("post /api/sendToken");
        const toAddress = req.body.toAddress;  
        const privateKey = req.body.privateKey;  
        const tokenAddress = req.body.tokenAddress;  
        const amount = req.body.amount
        const tronWeb = new TronWeb(mainOptions.fullNode, mainOptions.solidityNode, mainOptions.eventServer, privateKey);

        let contract = await tronWeb.contract().at(tokenAddress);
        
        let decimals = await contract.decimals().call();
        let response = await contract.transfer(
            toAddress, //address _to
            (amount * Math.pow(10,decimals)).toString()   //amount
        ).send({
            // feeLimit: 1000000
        }).then(output => {res.json({hash : output});});
        // console.log('result: ', result);

        // console.log(decimals)
        

    }catch(e){
        console.log(e);
    }
    
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});
  