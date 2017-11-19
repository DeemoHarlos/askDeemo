const argv = require('minimist')(process.argv.slice(2))
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const log = require('./logger')
const bcrypt = require('bcrypt')
const port = argv.p || 80
const database = (argv.d || '127.0.0.1:27017')
const mykey = '$2a$10$HzFpcQmmIOd9iDiDohCuqOfIEWYFHb9BKZgZsDlovACjy7BaEdfWi'

log.printLog('info','Starting server ...')

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var questionSchema = new Schema({
	ip: {type: String},
	time: {type: Date},
	content: {type: String},
	key: {type: String},
	ans: {type: String},
	ansTime: {type: Date},
	userAgent: {type: String}
})
var Question = mongoose.model('Visitor', questionSchema)

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
	var newQuestion = new Question()
	if(!req.ip) return res.status(403).send('IP not found.')
	if(!req.body.content || !req.body.content.length) return res.status(403).send('No content.')
	newQuestion.ip = req.ip
	newQuestion.time = new Date(Date.now())
	newQuestion.content = req.body.content
	newQuestion.userAgent = req.body.userAgent || 'unknown'
	newQuestion.key = req.body.key || ''
	if(bcrypt.compareSync(req.body.key,mykey))
		return res.status(403).send('Unavailable key.')
	log.printLog('info',newQuestion)
	newQuestion.save((err, question)=>{
		if (err) {
			log.printLog('error',err)
			res.status(403).send(err)
		}
		else res.status(200).send(newQuestion);
	})
})

app.post('/ans',(req,res)=>{
	if (!req.body.key || !bcrypt.compareSync(req.body.key,mykey))
		return res.status(403).send('Forbidden.')
	var newQuestion = new Question()
	if(!req.body.id) return res.status(403).send('No question assigned.')
	if(!req.body.content || !req.body.content.length) return res.status(403).send('No content.')
	newQuestion.ans = req.body.content
	newQuestion.ansTime = new Date(Date.now())
	log.printLog('info',newQuestion)
	Question.findOneAndUpdate(req.body.id, newQuestion, function (err, question) {
		if (err) return res.status(403).send(err)
		res.json(question)
	})
})

app.get('/',(req,res)=>{
	if (bcrypt.compareSync(req.body.key,mykey)){	
		Question.find({}, function (err, question) {
			if (err) return res.status(403).send(err)
			res.status(200).json(question)
		})
	}
	else if (req.body.key){
		Question.find({key:req.body.key}, function (err, question) {
			if (err) return res.status(403).send(err)
			res.status(200).json(question)
		})
	}
	else return res.status(404).send('Not found.')
})

app.listen(port, ()=>{
	log.printLog('info','Listening on port ' + (port+'').cyan)
})
