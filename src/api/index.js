import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
import axios from "axios";
import http from "https";
import moment from "moment";
import config from '../config';
const hostname = config.hostname;

export default ({ config, db }) => {
	let api = Router();

	// mount the facets resource
	api.use('/facets', facets({ config, db }));

	api.post('/', (req, res) => {
		var options = {
		  "method": "POST",
		  "hostname": hostname,
		  "port": null,
		  "path": "/services/2/batch-transactions",
		  "headers": {
		    "content-type": "application/xml",
		    "authorization": "Basic " + config.apiKey,
		    "cache-control": "no-cache",
		    "postman-token": "2847266b-dca6-9920-6942-0b43934b1306"
		  }
		};

		var bsReq = http.request(options, function (bsRes) {
		  var chunks = [];

		  bsRes.on("data", function (chunk) {
		    chunks.push(chunk);
		  });

		  bsRes.on("end", function () {
		    var body = Buffer.concat(chunks);
		    res.send({status: bsRes.statusCode, message: bsRes.statusMessage, body: body.toString()});
		  });
		});

		bsReq.write(req.body.xml);
		bsReq.end();
	});

	api.post('/findBatch', (req, res) => {
		const batchId = req.body.batchId;
		const apiKey = req.body.apiKey;
		var options = {
		  "method": "GET",
		  "hostname": hostname,
		  "port": null,
		  "path": "/services/2/batch-transactions/" + batchId,
		  "headers": {
		    "content-type": "application/xml",
		    "authorization": "Basic " + config.apiKey,
		    "cache-control": "no-cache",
		    "postman-token": "d4b52c61-bc50-c8cc-0d02-ded9de999104"
		  }
		};

		var bsReq = http.request(options, function (bsRes) {
		  var chunks = [];

		  bsRes.on("data", function (chunk) {
		    chunks.push(chunk);
		  });

		  bsRes.on("end", function () {
		    var body = Buffer.concat(chunks);
		    res.send({status: bsRes.statusCode, message: bsRes.statusMessage, body: body.toString()});
		  });
		});

		bsReq.end();
	});

	api.post('/postBatchMetaData', (req, res) => {
		const {batchId, csvPath, res_code, res_message, res_body} = req.body;
		const datetime = moment().format('YYYY-MM-DD HH:mm:ss');
		const insertBatchQuery = 'INSERT INTO csv_uploads (batch_id, date_time, csv_path,\
			 response_code, response_message, response_body)\
			 VALUES (\'' + batchId + '\', \'' + datetime + '\', \'' + csvPath + '\', \'' + res_code + '\', \'' + res_message + '\', \'' + res_body + '\')';

		db.query(insertBatchQuery, (err, result) => {
			if(err){
				res.send(err);
			}else{
				res.send("Successfully inserted batch meta data");
			}
		});
	});

	api.post('/batchTransactionCallback', (req, res) => {
		var xml = req.body['batch-transaction'];
		console.log(xml);
		var transactions = [];
		var batchId = xml['batch-id'][0];
		var batch_processing_status = xml['processing-info'][0]['processing-status'][0];
		for(var i=0; i < xml['transaction-count']; i++){
			var card_transaction_type = xml['card-transaction'][i]['card-transaction-type'][0];
			var merchant_txn_id = xml['card-transaction'][i]['merchant-transaction-id'][0];
			var transaction_id = "N/A";
			var recurring_txn = xml['card-transaction'][i]['recurring-transaction'][0];
			var amount = xml['card-transaction'][i]['amount'][0];
			var currency = xml['card-transaction'][i]['currency'][0];
			var card_holder_first_name = "N/A";
			var card_holder_last_name = "N/A";
			var card_last_four_digits = 0;
			var card_expiration_month = 0;
			var card_expiration_year = 0;
			var card_type = "N/A";
			if(xml['card-transaction'][i]['card-holder-info'] !== undefined){
				card_holder_first_name = xml['card-transaction'][i]['card-holder-info'][0]['first-name'][0];
				card_holder_last_name = xml['card-transaction'][i]['card-holder-info'][0]['last-name'][0];
			}
			if(xml['card-transaction'][i]['credit-card'] !== undefined){
				var cardXml = xml['card-transaction'][i]['credit-card'][0];
				card_last_four_digits = cardXml['card-last-four-digits'] === undefined ? 0 : cardXml['card-last-four-digits'][0];
				card_expiration_month = cardXml['expiration-month'] === undefined ? 0 : cardXml['expiration-month'][0];
				card_expiration_year = cardXml['expiration-year'] === undefined ? 0 : cardXml['expiration-year'][0];
				card_type = cardXml['card-type'] === undefined ? "N/A" : cardXml['card-type'][0];
			}
			var processing_status = xml['card-transaction'][i]['processing-info'][0]['processing-status'][0];
			var processing_error_code = "N/A";
			var processing_error_desc = "N/A";
			if(processing_status !== "SUCCESS"){
				processing_error_desc = xml['card-transaction'][i]['processing-info'][0]['processing-errors'][0]['processing-error'][0]['processing-error-description'][0];
				processing_error_code = xml['card-transaction'][i]['processing-info'][0]['processing-errors'][0]['processing-error'][0]['processing-error-code'][0];
			}else{
				transaction_id = xml['card-transaction'][i]['transaction-id'][0];
			}
			transactions.push([batchId, card_transaction_type, merchant_txn_id, transaction_id,
				recurring_txn, amount, currency, card_holder_first_name, card_holder_last_name,
				card_last_four_digits, card_expiration_month, card_expiration_year, card_type, processing_status,
				processing_error_code, processing_error_desc, batch_processing_status
			]);
		}

		var sql = "INSERT INTO processed_transactions (batch_id, card_transaction_type, merchant_transaction_id, \
								transaction_id, recurring_transaction, amount, currency, card_holder_first_name, \
							  card_holder_last_name, card_last_four_digits, card_expiration_month, card_expiration_year, card_type, \
							  processing_status, processing_error_code, processing_error_description, batch_processing_status)\
								VALUES ?";
		db.query(sql, [transactions], (err, result) => {
				if(err){
					res.send(err);
				}else{
					res.send("success");
				}
		})

		console.log(transactions);

	});

	return api;
}
