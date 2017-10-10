import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
import axios from "axios";

export default ({ config, db }) => {
	let api = Router();

	// mount the facets resource
	api.use('/facets', facets({ config, db }));

	api.post('/', (req, res) => {
		var http = require("https");

		var options = {
		  "method": "POST",
		  "hostname": "sandbox.bluesnap.com",
		  "port": null,
		  "path": "/services/2/batch-transactions",
		  "headers": {
		    "content-type": "application/xml",
		    "authorization": req.body.api,
		    "cache-control": "no-cache",
		    "postman-token": "d0f3b0aa-cff2-70ad-554f-11321617f822"
		  }
		};

		var bsReq = http.request(options, function (bsRes) {
		  var chunks = [];

		  bsRes.on("data", function (chunk) {
		    chunks.push(chunk);
		  });

		  bsRes.on("end", function () {
		    var body = Buffer.concat(chunks);
		    res.send({status: bsRes.statusCode, message: bsRes.statusMessage});
		  });
		});

		bsReq.write(req.body.xml);
		bsReq.end();
	});

	api.get('/test', (req, res) => {
		res.send("testing...");
	})

	return api;
}
