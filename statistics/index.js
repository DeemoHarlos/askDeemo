/*General Function Declaration*/
function $(a,b){
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
	if(v)	e.setAttribute(n,v)
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
function parseUA(ua){
	var UA = {}
	UA.other = []
	UA.platform = {}
	var nua = ua

	var e = nua.split(' ')[0]
	nua = nua.slice(e.length+1)
	if (e.slice(0,7)=='Mozilla')
		UA.mozilla = e.slice(8)
	else return ua
	if(nua[0]=='('){
		e = nua.split(') ')[0]
		nua = nua.slice(e.length+2)
		UA.system = e.slice(1)
	}
	e = nua.split(' ')[0]
	nua = nua.slice(e.length+1)
	var p = e.split('/')[0]
	UA.platform.name = p
	UA.platform.ver = e.slice(p.length+1)
	if(nua[0]=='('){
		e = nua.split(') ')[0]
		nua = nua.slice(e.length+2)
		UA.platform.des = e.slice(1)
	}
	while(nua.length > 0){
		if(nua[0]=='['){
			var info = nua.slice(1)
			if(info.slice(-1)==']')info = info.slice(0,-1)
			UA.info = info
			break
		}
		e = nua.split(' ')[0]
		nua = nua.slice(e.length+1)
		switch(e.split('/')[0]){
			case 'Chrome': UA.chrome = e.slice(7);break
			case 'Safari': UA.safari = e.slice(7);break
			case 'Mobile': UA.mobile = e.slice(7) || 'true';break
			default: UA.other.push({
				name: e.split('/')[0],
				ver: e.split('/')[1]
			})
		}
	}
	var other = ''
	for(i of UA.other) other += i.name+' / '+i.version+'<br>'
	var uaa = ['<td class="moz">' + (UA.mozilla||'') + '</td>',
		'<td class="system">' + (UA.system||'') + '</td>',
		'<td class="platform">' + UA.platform.name+' / '+UA.platform.ver+'<br>('+UA.platform.des + ')</td>',
		'<td class="chrome">' + (UA.chrome||'') + '</td>',
		'<td class="safari">' + (UA.safari||'') + '</td>',
		'<td class="mobile">' + (UA.mobile||'') + '</td>',
		'<td class="other">' + UA.other.map(x=>(x.name+' / '+x.ver)).join('<br>') + '</td>',
		'<td class="info">' + (UA.info?UA.info.split(';').map(x=>(x.split('/').join(' / '))).join(';<br>'):'') + '</td>']
	return uaa;
}

var data
var label = ['uid','time','website','ip','port','userAgent','moz','system',
	'platform','chrome','safari','mobile','other','info','reqUrl']
var hidden = [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]

function toggle(i,h){
	$('.'+label[i]).forEach((e,i,a)=>{e.classList.toggle('hide')})
	if(h) $('#h-'+label[i]).classList.toggle('hide')
	if(i==5)for(var j=6;j<14;j++){
		$('.'+label[j]).forEach((e,i,a)=>{e.classList.toggle('chide')})
		if(h) $('#h-'+label[j]).classList.toggle('chide')
	}
	if(i>=6&&i<=13){
		var hiddennum = hidden[6]+hidden[7]+hidden[8]+hidden[9]+hidden[10]+hidden[11]+hidden[12]+hidden[13]
		if(hiddennum == 8){
			$('.userAgent').forEach((e,i,a)=>{e.classList.toggle('phide',true)})
			if(h) $('#h-userAgent').classList.toggle('phide',true)
		}
		else{
			$('.userAgent').forEach((e,i,a)=>{
				e.classList.toggle('phide',false)
				$g(e,'colspan',8-hiddennum)
			})
			if(h){
				var h = $('#h-userAgent')
				h.classList.toggle('phide',false)
				$g(h,'colspan',8-hiddennum)
			}
		}
	}
}

function update(){
	var req = new XMLHttpRequest()
	var server = $('#url').value
	req.open('GET',server)
	req.setRequestHeader('Content-Type','application/X-www-form-urlencoded')
	req.send()
	req.onreadystatechange = function () {
		if(req.readyState === XMLHttpRequest.DONE){
			console.log(server + ' responded with status ' + req.status)
			if(req.status>=200 && req.status<400){
				data = eval(req.response).reverse()
				$('#table .content').remove()
				$('#table>table').append($n('tbody','','content'))
				var t = $('#table .content')
				var uid = data.length
				var l = Math.log(10,uid)
				data.forEach((e,i,a)=>{
					var tr = $n('tr')
					tr.append($a($n('td',null,'uid'),(''+uid--).padStart(l,'0')))
					tr.append($a($n('td',null,'time'),parseDate(e.time)))
					tr.append($a($n('td',null,'website'),e.website))
					tr.append($a($n('td',null,'ip'),parseIp(e.ip)))
					tr.append($a($n('td',null,'port'),e.port))
					var ua = parseUA(e.userAgent)
					if(typeof(ua)== String)$a(tr,'<td class="userAgent" colspan="8">' + ua + '</td>')
					else for(i of ua) $a(tr,i)
					tr.append($a($n('td',null,'reqUrl'),e.protocol + '://' + e.reqHost + e.resource))
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