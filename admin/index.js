/*General Function Declaration*/
function $(a){
	var e = document.querySelectorAll(a)
	if (e.length == 1) return e[0]
	else return e
}
function $n(a,id,cls){
	var e = document.createElement(a)
	if(id) e.id = id
	for(cl of Array.prototype.slice.call(arguments,2))
		e.classList.add(cl)
	return e
}
function $a(e,a){
	e.insertAdjacentHTML('beforeend',a)
	return e
}
function $g(e,n,v){
	if(v) e.setAttribute(n,v)
	else return e.getAttribute(n)
}

function clicked(e,f){
	e.addEventListener('click',f)
}
function parseDate(d){
	var date = new Date(d)
	var str = ''
	str += date.getFullYear() + '/'
	str += (''+(date.getMonth()+1)).padStart(2,'0') + '/'
	str += (''+date.getDate()).padStart(2,'0') + '<br>'
	/*var utc = -date.getTimezoneOffset()/60
	str += '(' + ((utc>0)?('+'+utc):(utc==0?'0':utc)) + ')\n'*/
	str += (''+date.getHours()).padStart(2,'0') + ':'
	str += (''+date.getMinutes()).padStart(2,'0') + ':'
	str += (''+date.getSeconds()).padStart(2,'0') + '.'
	str += (''+date.getMilliseconds()).padStart(3,'0') + ' '
	return str
}
function parseIp(ip){
	var ipv4Regex = /^(\d{1,3}\.){3,3}\d{1,3}$/
	var ipv6Regex = /^(::)?(((\d{1,3}\.){3}(\d{1,3}){1})?([0-9a-f]){0,4}:{0,2}){1,8}(::)?$/i
	var nip
	if(ip.slice(0,7)=='::ffff:')nip = ip.slice(7)
	nip = nip.split(".").map(x=>('<span>'+x+'</span>')).join(".")
	return nip
}

var data
var label = ['ip','time','key','content','answer','ansTime','userAgent','ansButton']
var hidden = [false,false,false,false,false,false,false,false]
var input = $n('textarea',null,'ansBox')
$g(input,'name','answer')
$g(input,'cols','40')
$g(input,'rows','5')
var update = $n('input',null,'updateButton')
$g(update,'type','button')
$g(update,'value','Update')


function toggle(i,h){
	$('.'+label[i]).forEach((e,i,a)=>{e.classList.toggle('hide')})
	if(h) $('#h-'+label[i]).classList.toggle('hide')
}

function updateAll(){
	var req = new XMLHttpRequest()
	var server = 'http://deemo.pw:11520/get'
	req.open('POST',server)
	req.setRequestHeader('Content-Type','application/X-www-form-urlencoded')
	req.send('key='+$('#key').value)
	req.onreadystatechange = function () {
		if(req.readyState === XMLHttpRequest.DONE){
			console.log(server + ' responded with status ' + req.status)
			if(req.status>=200 && req.status<400){
				data = eval(req.response).reverse()
				$('#table #content').remove()
				$('#table>table').append($n('tbody','content'))
				var t = $('#table #content')
				var uid = data.length
				var l = Math.log(10,uid)
				data.forEach((e,i,a)=>{
					var tr = $n('tr','id'+e._id)
					tr.append($a($n('td',null,'uid'),(''+uid--).padStart(l,'0')))
					tr.append($a($n('td',null,'ip'),parseIp(e.ip)))
					tr.append($a($n('td',null,'time'),parseDate(e.time)))
					tr.append($a($n('td',null,'key'),e.key))
					tr.append($a($n('td',null,'content'),e.content))
					
					var inputBox = input.cloneNode(true);
					inputBox.value = e.ans||''
					var newtd = $n('td',null,'answer')
					newtd.append(inputBox)
					tr.append(newtd)
					
					tr.append($a($n('td',null,'ansTime'),e.ansTime||'not answered'))
					tr.append($a($n('td',null,'userAgent'),e.userAgent))
					var updateButton = update.cloneNode(true);
					//$g(updateButton,'id',e._id)
					$g(updateButton,'onclick','updateAns(\''+ e._id +'\')')

					newtd = $n('td',null,'ansButton')
					newtd.append(updateButton)
					tr.append(newtd)
					t.append(tr)
				})
				for(i in label)if(hidden[i]) toggle(i,false)
			}
		}
	}
}

$('#check>*').forEach((e,i,a)=>{
	clicked(e,()=>{
		hidden[i] = !hidden[i]
		toggle(i,true)
		e.style.backgroundColor = hidden[i]?'transparent':'#555'
	})
})

function updateAns(id){
	var req = new XMLHttpRequest()
	var server = 'http://deemo.pw:11520/ans'
	req.open('POST',server)
	req.setRequestHeader('Content-Type','application/X-www-form-urlencoded')
	req.send('id='+id+'&content='+$('#id'+id+' .ansBox').value+'&key='+$('#key').value)
	req.onreadystatechange = function () {
		if(req.readyState === XMLHttpRequest.DONE){
			console.log(server + ' responded with status ' + req.status)
			$a($('#id'+id+' .ansButton'),'<div><span>'+req.status+'</span></div>');
			if(req.status>=200 && req.status<400){
			}
		}
	}
}