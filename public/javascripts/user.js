let lotterySeed;
let winnerCount;
let winners = [];

$('#participate').on('click', function() {
	setMessage1();
	$.post('/createAccount', {}, function(res) {
		console.log("response", res);
		let wallet = res;
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

function setMessage1() {
	$("#transactionStatus").html(`<p id="statusMessage">In creating your account and participating in the lottery...</p>`);
}

function setMessage2(err, data) {
	if (err) {
		$("#transactionStatus").html(`<p id="statusMessage">Failed to send the transaction</p>`);
	}
	let transactionHash = data['transaction'];
	let wallet = data['wallet'];
	$("#transactionStatus").html(`
		<p id="statusMessage">Finished the transaction.<br />
		Wallet Address: ${wallet}<br />
		Transaction: ${transactionHash}</p>
	`);
}
