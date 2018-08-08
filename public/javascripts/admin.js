let lotterySeed;
let winnerCount;
let winners = [];
let winNums = [];

$('#setting').on('click', function() {
	setMessage1();
	let adminWallet = $('#adminWallet').val();
	let auth = $('#auth').val();
	let contractId = $('#contractId').val();
	$.post('/setting', {admin_wallet: adminWallet, auth: auth, contract_id: contractId}, function(res) {
		getLotterySeed();
		setMessage2(null, "");
	});
});

$('#startLottery').on('click', function() {
	setMessage1();
	$.post('/startLottery', {}, function(res) {
		setMessage2(res['message'], res['data']);
	});
});

$('#checkVote').on('click', function() {
	let voteAddress = $('#voteAddress').val();
	$.get('/checkVote', {address: voteAddress}, function(res) {
		console.log(res);
		$('#givenNumber').text(`The given number for this address: ${res['data']}`);
	});
});

$('#closeLottery').on('click', function() {
	setMessage1();
	$.post('/closeLottery', {}, function(res) {
		console.log(res);
		setMessage2(res['message'], res['data']);
	});
});

$('#startSelection').on('click', function() {
	setMessage1();
	$.post('/startSelection', {}, function(res) {
		getLotterySeed();
		setMessage2(res['message'], res['data']);
	});
});

$('#selectWinners').on('click', function() {
	repeatSelection();
});

// 事前に設定された当選者数（winnerCount）に達するまで抽選を繰り返す
function repeatSelection() {
	$.get('/selectWinners', {seed: lotterySeed}, function(res) {
		console.log(res);
		if (res['status'] == 'success') {
			console.log("win number", res['data'][0]);
			console.log("winner", res['data'][1]);
			lotterySeed = res['data'][0];
			winNums.push(lotterySeed);
			winners = winners.concat(res['data'][1]);
			if (winners.length < winnerCount) {
				repeatSelection();
			} else {
				console.log("Selection finished");
				console.log(winners);
				for (let winner of winners) {
					$('#winners').append(winner + "<br />");
				}
				for (let winNum of winNums) {
					$('#winNums').append(winNum + "<br />");
				}
			}
		}
	});
}

function getLotterySeed() {
	getWinnerCount();
	$.get('/getLotterySeed', {}, function(res) {
		if (res['status'] == 'error') {
			// エラーがあれば1秒後に再度リクエスト
			setTimeout(getLotterySeed(), 1000);
		} else {
			lotterySeed = res['data'];
			console.log("set lottery seed", lotterySeed);
		}
	});
}

function getWinnerCount() {
	$.get('/getWinnerCount', {}, function(res) {
		if (res['status'] == 'error') {
			// エラーがあれば1秒後に再度リクエスト
			setTimeout(getWinnerCount(), 1000);
		} else {
			winnerCount = res['data'];
			console.log("set winner count", winnerCount);
		}
	});
}

function setMessage1() {
	$("#transactionStatus").html(`<p id="statusMessage">In transacting...</p>`);
}

function setMessage2(err, data) {
	if (err) {
		$("#transactionStatus").html(`<p id="statusMessage">Failed to send the transaction</p>`);
	}
	let transactionHash = data;
	$("#transactionStatus").html(`<p id="statusMessage">Finished the transaction.<br />${transactionHash}</p>`);
}
