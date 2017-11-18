const argv = require('minimist')(process.argv.slice(2))
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const log = require('./logger')
const port = argv.p || 80
const database = (argv.d || '127.0.0.1:27017')

log.printLog('info','Starting server ...')

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var visitorSchema = new Schema({
	ip: {type: String},
	port: {type: Number},
	time: {type: Date},
	protocol: {type: String},
	reqHost: {type: String},
	resource: {type: String},
	website: {type: String},
	userAgent: {type: String}
})
var Visitor = mongoose.model('Visitor', visitorSchema)

log.printLog('info','Connecting to database ...')
mongoose.connect(database, function (err, res) {
	if (err)
		log.printLog('error','Error connecting to: ' + database + '. ' + err)
	else
		log.printLog('info','Succeeded connected to: ' + database)
})

// for parsing application/json
app.use(bodyParser.json())
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
app.enable('trust proxy')

app.use((req,res,next)=>{
	log.listenResEnd(req,res)
	res.append('Access-Control-Allow-Origin','*')
	next()
})

app.post('/',(req,res)=>{
	var newVisitor = new Visitor()
	newVisitor.ip = req.ip || 'unknown'
	newVisitor.port = req.connection.remotePort || 'unknown'
	newVisitor.time = new Date(Date.now())
	newVisitor.protocol = req.protocol || 'unknown'
	newVisitor.reqHost = req.get('host') || 'unknown'
	newVisitor.resource = req.originalUrl || 'unknown'
	newVisitor.website = req.body.website || 'unknown'
	newVisitor.userAgent = req.body.userAgent || 'unknown'
	log.printLog('info',newVisitor)
	newVisitor.save((err, course)=>{
		if (err) {
			log.printLog('error',err)
			res.status(403).send(err)
		}
		else res.status(200).send(newVisitor);
	})
})

app.get('/',(req,res)=>{
	Visitor.find({}, function (err, visitor) {
		if (err) { return res.status(403).send(err) }
		res.status(200).json(visitor)
	})
})

app.listen(port, ()=>{
	log.printLog('info','Listening on port ' + (port+'').cyan)
})
