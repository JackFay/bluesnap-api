import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
import axios from "axios";
import http from "https";
import moment from "moment";

export default ({ config, db }) => {
	let api = Router();

	// mount the facets resource
	api.use('/facets', facets({ config, db }));

	api.post('/', (req, res) => {
		var options = {
		  "method": "POST",
		  "hostname": "sandbox.bluesnap.com",
		  "port": null,
		  "path": "/services/2/batch-transactions",
		  "headers": {
		    "content-type": "application/xml",
		    "authorization": "Basic " + req.body.api,
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
		  "hostname": "sandbox.bluesnap.com",
		  "port": null,
		  "path": "/services/2/batch-transactions/" + batchId,
		  "headers": {
		    "content-type": "application/xml",
		    "authorization": "Basic " + apiKey,
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
		    res.send(body.toString());
		  });
		});

		bsReq.end();
	});

	api.post('/postBatchMetaData', (req, res) => {
		const {batchId, csvPath, res_code, res_message, res_body} = req.body;
		const datetime = moment().format('YYYY-MM-DD HH:mm:ss');
		const insertBatchQuery = 'INSERT INTO csv_uploads VALUES (' + batchId + ', ' + datetime + ', ' + csvPath + ', ' + res_code + ', ' + res_message + ', ' + res_body + ')';

		db.query(insertBatchQuery, (err, result) => {
			if(err){
				res.send(err);
			}else{
				res.send("Successfully inserted batch meta data");
			}
		});
	})

	return api;
}
