const express = require('express');
const router = express.Router();
const request = require('request');

const apiRoot = "https://eth.accel-baas.io/";
const serverRoot = "http://localhost:3000/";

let adminWallet = {The first wallet address of your project};

let auth = {API key of your project};
let contractId = {The ID of your lottery contract};

// For user
router.get('/user', function(req, res, next) {
  res.render('user', {title: 'Lottery for user'});
});

router.post('/setting', function(req, res) {
    adminWallet = req.body.admin_wallet;
    auth = req.body.auth;
    contractId = req.body.contract_id;
    return res.send();
});

router.post('/createAccount', function(req, res) {
	execMethod("createAccount", "createWallet", [], null, false, function(error, body) {
		if (error) {
			return res.send("Failed to create account.");
		}
		let walletAddress = body['data']['address'];
		console.log(2);
		request.post({url: serverRoot + 'participate', headers: {"Content-type": "application/json"}, json: {"wallet": walletAddress}}, function(err, response, body) {
			console.log(3);
			if (error) {
				body['status'] = 'error';
				body['message'] = error;
				return res.send(body);
			}
            console.log("body", body);
			body['data'] = {'wallet': walletAddress, 'transaction': body['data']};
			return res.send(body);
		});
	});
});

router.post('/participate', function(req, res) {
	console.log("req.body2", req.body);
	// Delegate transaction (give gas to end user)
	execMethod("participate", "transaction", [], req.body.wallet, true, function(error, body) {
		return res.send(body);
	});
});

// For Admin
router.get('/admin', function(req, res, next) {
  res.render('admin', {title: 'Lottery for admin'});
});

router.post('/startLottery', function(req, res) {
	execMethod("startLottery", "transaction", [], adminWallet, false, function(error, body) {
		res.send(body);
	});
});

router.get('/checkVote', function(req, res) {
	execMethod("vote_num", "call", [req.query.address], null, false, function(error, body) {
		res.send(body);
	});
});

router.post('/closeLottery', function(req, res) {
	execMethod("close", "transaction", [], adminWallet, false, function(error, body) {
		res.send(body);
	});
});

router.post('/startSelection', function(req, res) {
	execMethod("startSelection", "transaction", [], adminWallet, false, function(error, body) {
		res.send(body);
	});
});

router.get('/selectWinners', function(req, res) {
	execMethod("selectWinners", "call", [req.query.seed], null, false, function(error, body) {
		res.send(body);
	});
});

router.get('/getLotterySeed', function(req, res) {
	execMethod("win_seed", "call", [], null, false, function(error, body) {
		res.send(body);
	});
});

router.get('/getWinnerCount', function(req, res) {
	execMethod("winner_count", "call", [], null, false, function(error, body) {
		res.send(body);
	});
});

function execMethod(method, endpoint = "call", args = [], wallet = null, delegate = false, cb) {
	let requestData = {};
	if (endpoint == "call" || endpoint == "transaction"){
		requestData = {
			'id': contractId,
			'method': method,
			'args': JSON.stringify(args),
			'wallet': wallet,
			'fee': 'high',
			'delegate': delegate
		};
	} else if (endpoint != "createWallet") {
		return cb("Invalid API call", null);
	}

	let url = `${apiRoot}${endpoint}?auth=${auth}`;

	let requestHeaders = {
	  'Content-Type':'application/json'
	}
	let options = {
	  url: url,
	  method: 'POST',
	  headers: requestHeaders,
	  json: true,
	  form: requestData
	}

	request(options, function (error, response, body) {
		cb(error, body);
	});
}

module.exports = router;
