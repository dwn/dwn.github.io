////////////////////////////////////////////
// Dan Nielsen
////////////////////////////////////////////
if (typeof DEBUG!=='undefined' && DEBUG==1) {function debug(s){console.log(s);}} else {function debug(s){}}
////////////////////////////////////////////
var fullTxt = '';
var tmpTxt;
var arrTxt;
var txt = '';
var phoneme;
var phonemeEsc;
var grapheme;
var graphemeEsc;
var json = {};
var jsonAfter = {};
var alreadyPlaying=false;
var conlangTextReady=false;
////////////////////////////////////////////
$(document).ready(function() {
  // $(window).bind('keydown', function(event) {
  //   debug('hotkey in iframe')
  //   event.preventDefault();
  //   if (event.ctrlKey || event.metaKey)
  //     parent.$(parent.document).dispatchEvent(new KeyboardEvent('keydown', { key: 's',code: 'KeyS',ctrlKey: true}));
  // });
  $('#message-input').bind('keyup click focus paste', function() {
    if (!fullTxt) debug('message-input: fullTxt empty');
    var k = this.selectionEnd;
    var str = this.value;
    var begin = str.lastIndexOf(' ',k-1);
    begin = (begin<0? 0 : begin);
    var end = str.indexOf(' ',k);
    end = (end<0? str.length : end);
    str = str.substring(begin,end).trim();
    if (str.length>2) {
      k=0;
      var searchEl = document.getElementById('search-result');
      if (searchEl) searchEl.innerText='';
      while((k=fullTxt.indexOf(str,k))>=0) {
        begin = fullTxt.lastIndexOf('\n',k);
        begin = (begin<0? 0 : begin);
        end = fullTxt.indexOf('\n',k);
        end = (end<0? fullTxt.length : end);
        var res = fullTxt.substring(begin,end).trim();
        if (res===res.toUpperCase()) { //If all uppercase, include preceding line as well
          begin = fullTxt.lastIndexOf('\n',begin-1);
          begin = (begin<0? 0 : begin);
        }
        else if (res===res.toLowerCase()) { //If all lowercase, include succeeding line as well
          end = fullTxt.indexOf('\n',end+1);
          end = (end<0? fullTxt.length : end);
        }
        res = fullTxt.substring(begin,end).trim();
        document.getElementById('search-result').innerText+=res+'\n';
        k++;
      }
      const chatEl = document.querySelector('#chat');
      if (chatEl) chatEl.scrollTo(0,chatEl.scrollHeight);
    }
  });
});
////////////////////////////////////////////
function nastyHack(key) { //Dollar sign followed by tick would crash the program otherwise
  const s = json[key];
  if (s.includes('$`') || s.includes('$\\`')) {
    alert('NOT SAVED! PLEASE CHANGE: dollar sign cannot be followed by tick ($`)');
    return true;
  }
  return false;
}
function invalidCharacterCombo() {
  return nastyHack('font-code') || nastyHack('kerning-map') || nastyHack('phoneme-map') || nastyHack('grapheme-map') || nastyHack('user-text') || nastyHack('conlang-text');
}
////////////////////////////////////////////
function loadMap(title,mappingText) {
  var r = mappingText;
  json[title] = r.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  if (invalidCharacterCombo()) return;
  r = r.split(/\r?\n/g);
  for(var j in r) r[j] = r[j].trim();
  r = r.filter(function(el) { return el!=''; });
  for(var j in r) {
    r[j] = r[j].split(/\s+/g);
    for(var i in r[j]) {
      r[j][i] = r[j][i].split(',');
    }
  }
  return r;
}
////////////////////////////////////////////
function loadKerningMap() {
  var kernSet;
  if (typeof setVisibility === "function") {
    kernSet = document.getElementById('kerning-map').value;
  } else {
    kernSet = jsonAfter['kerning-map'];
  }
  json['kerning-map'] = kernSet.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  if (invalidCharacterCombo()) return;
  kernSet = kernSet.split(' ');
  kerning = { };
  for(var i=0;i<kernSet.length;i++) {
    var numShiftLeft = (kernSet[i].split('<').length - 1) - (kernSet[i].split('>').length - 1);
    var dat = kernSet[i].split(/[<>]/).filter(function(el) {return el.length != 0});
    if (dat.length<2) continue;
    lhs0 = dat[0].split('-')[0];
    rhs0 = dat[0].split('-')[1];
    lhs1 = dat[1].split('-')[0];
    rhs1 = dat[1].split('-')[1];
    kerning[i] = { 'lhs0':lhs0, 'rhs0':rhs0, 'lhs1':lhs1, 'rhs1':rhs1, 'numShiftLeft':numShiftLeft };
  }
}
////////////////////////////////////////////
function loadPhonemeMap() {
  var phonemeSet;
  if (typeof setVisibility === "function") {
    phonemeSet = document.getElementById('phoneme-map').value;
  } else {
    phonemeSet = jsonAfter['phoneme-map'];
  }
  phoneme = loadMap('phoneme-map',phonemeSet);
  if (!phoneme) {
    phoneme = json['phoneme'];
  }
  var last = phoneme.length-1;
  if (last<0) { last=0; phoneme.push([]); }
  phoneme[last] = phoneme[last].concat([[' ','\'']]);
}
////////////////////////////////////////////
function loadGraphemeMap() {
  var graphemeSet;
  if (typeof setVisibility === "function") {
    graphemeSet = document.getElementById('grapheme-map').value;
  } else {
    graphemeSet = jsonAfter['grapheme-map'];
  }
  grapheme = loadMap('grapheme-map',graphemeSet);
  if (!grapheme) {
    grapheme = json['grapheme'];
  }
}
////////////////////////////////////////////
function setAllData(on, titleEl = null, title = null, dat = null) { //(Title to assign, if not null)
  var el;
  if (on) {
    if (!dat) { //Only called when font selected from title screen or when user on chat page
      //Get lang file URL
      let langFileURL; $.ajax({async:false,type:'GET',dataType:'text',url:`/lang-file-url/${titleEl? titleEl.innerHTML : fontBasename}.svg`,success:function(r){langFileURL=r;},error:function(r){}});
      debug('setAllData~langFileURL: '+langFileURL);
      dat = loadFileURL(langFileURL);
      debug(`setAllData~myUser.username: ${myUser.username}`);
      if (typeof setVisibility === "function") {
        setVisibility('conlang-loading',false);
        setVisibility('select-selected',true);
      }
    }
    if (!dat) { debug('Failed to get font at '+fileURL); return; }
    dat = dat.split('<desc>');
    dat = dat[1].split('</desc>')[0];
    json = JSON.parse(dat); if (json['conscript-text']) { json['conlang-text']=json['conscript-text']; delete json['conscript-text']; } //Legacy fix: formerly called conscript-text
    jsonAfter['phoneme-map'] = json['phoneme-map'].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
    jsonAfter['grapheme-map'] = json['grapheme-map'].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
    jsonAfter['kerning-map'] = json['kerning-map'].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
    jsonAfter['user-text'] = json['user-text'].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
    // jsonAfter['conlang-text'] = json['conlang-text'].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
    jsonAfter['font-code'] = json['font-code'].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
    jsonAfter['direction'] = json['direction'];
    jsonAfter['pen'] = json['pen'];
    jsonAfter['weight'] = json['weight'];
    jsonAfter['size'] = json['size'];
    jsonAfter['style'] = json['style'];
    jsonAfter['space'] = json['space'];
    jsonAfter['note'] = json['note'];
    jsonAfter['view'] = json['view'];
    jsonAfter['name'] = json['name'].replace(/\d{4}[-]\d{2}[-]\d{2}[_]\d{2}[_]\d{2}[_]\d{2}[_]\d{3}[_]/g, '');
    if (typeof setVisibility === "function") {
      document.getElementById('phoneme-map').value = jsonAfter['phoneme-map'];
      document.getElementById('grapheme-map').value = jsonAfter['grapheme-map'];
      document.getElementById('kerning-map').value = jsonAfter['kerning-map'];
      document.getElementById('user-text').value = jsonAfter['user-text'];
      document.getElementById('conlang-text').value = jsonAfter['conlang-text'];
      document.getElementById('font-code').value = jsonAfter['font-code'];
      document.getElementById('direction').value = jsonAfter['direction'];
      document.getElementById('pen').value = jsonAfter['pen'];
      document.getElementById('weight').value = jsonAfter['weight'];
      document.getElementById('size').value = jsonAfter['size'];
      document.getElementById('style').value = jsonAfter['style'];
      document.getElementById('space').value = jsonAfter['space'];
      document.getElementById('note').value = jsonAfter['note'];
      document.getElementById('view').value = jsonAfter['view'];
      document.getElementById('font-name').value = jsonAfter['name'];
    }
    if (typeof setVisibility === "function") {
      setAdjustSetting();
      //Clear canvas
      el = document.getElementById('font-canvas');
      if (el) {
        var ctx = el.getContext('2d');
        ctx.beginPath();
        ctx.clearRect(0, 0, el.width, el.height);
      }
    }
    //Load mappings
    loadKerningMap();
    loadPhonemeMap();
    loadGraphemeMap();
    fullTxt = jsonAfter['user-text'];
    if (!fullTxt) debug('setAllData: fullTxt failed to load');
    if (typeof setVisibility === "function") {
      document.body.style.backgroundImage = 'none';
      document.body.style.backgroundColor = '#680068';
      hideAll();
      document.getElementById('page-container').style.backgroundColor = '#680068';
      setVisibility('username',false);
      setVisibility('menu',true);
      setVisibility('notebook',true);
    }
  } else {
    if (typeof setVisibility === "function") {
      document.body.style.backgroundImage = 'url(img/continua/continua-bird.jpg)';
      document.getElementById('page-container').style.backgroundColor = 'transparent';
      hideAll();
      setVisibility('menu',false);
      setVisibility('username',true);
    }
  }
  if (titleEl && title) {
    titleEl.innerHTML = title;
  }
}
////////////////////////////////////////////
function phProcessInit() {
  if (typeof meSpeak === "undefined") {
    setTimeout(phProcessInit, 200);
  } else {
    if (!meSpeak.isVoiceLoaded()) {
      meSpeak.loadVoice('en/en');
      debug('Loading speech module');
    }
  }
}
////////////////////////////////////////////
function phProcessHelper() {
  do {
    if (arrTxt===null || !arrTxt.length) {
      const playEl = document.querySelector('.play-element');
      if (playEl) playEl.src = 'img/icon/play.png';
      alreadyPlaying=false;
      return;
    }
    txt=arrTxt.shift();
    if (txt===null) return;
    txt=txt.trim();
  } while(txt==='');
  try {
    var uipa = '_' + txt + '_'; //Underscores allow replacement at beginning and end of word
    for(var j in phonemeEsc) {
      uipa = addEscaping(uipa);
      for(var i in phonemeEsc[j]) {
        uipa = uipa.split(phonemeEsc[j][i][0]).join(phonemeEsc[j][i][1]);
      }
      uipa = removeEscaping(uipa);
    }
    consoleEl = document.getElementById('console');
    if (consoleEl) {
      consoleEl.value += uipa + '\n';
      consoleEl.scrollTop = consoleEl.scrollHeight;
    }
    var mappings = [
     { 'src': /[0|!=]\//g, 'dest': 'qk' }, //Click - Exact sound not available
     { 'src': /[0|!=]\/`/g, 'dest': 'qk' }, //Click - Exact sound not available
     { 'src': /r\/`/g, 'dest': 'r' }, //Exact sound not available
     { 'src': /k`/g, 'dest': 'k' }, //Exact sound not available
     { 'src': /g`/g, 'dest': 'g' }, //Exact sound not available
     { 'src': /n`/g, 'dest': 'N' }, //Exact sound not available
     { 'src': /s`/g, 'dest': 'Sx' }, //Exact sound not available
     { 'src': /z`/g, 'dest': 'Zx' }, //Exact sound not available
     { 'src': /l`/g, 'dest': 'l' }, //Exact sound not available
     { 'src': /u\//g, 'dest': 'U' }, //Exact sound not available
     { 'src': /I\//g, 'dest': 'I' }, //Exact sound not available
     { 'src': /U\//g, 'dest': 'U' }, //Exact sound not available
     { 'src': /@\//g, 'dest': 'I' }, //Exact sound not available
     { 'src': /3\//g, 'dest': '@' }, //Exact sound not available
     { 'src': /&\//g, 'dest': '@' }, //Exact sound not available
     { 'src': /J\//g, 'dest': 'gj' }, //Exact sound not available
     { 'src': /G\//g, 'dest': 'qg' }, //Exact sound not available
     { 'src': />\//g, 'dest': 'p' }, //Exact sound not available
     { 'src': /B\//g, 'dest': 'blb' }, //Exact sound not available
     { 'src': /f\//g, 'dest': 'fh' }, //Exact sound not available
     { 'src': /p\//g, 'dest': 'hv' }, //Exact sound not available
     { 'src': /j\//g, 'dest': 'j' }, //Exact sound not available
     { 'src': /X\//g, 'dest': 'hX' }, //Exact sound not available
     { 'src': /\?\//g, 'dest': 'hvw' }, //Exact sound not available
     { 'src': /H\//g, 'dest': 'XX' }, //Exact sound not available
     { 'src': /\<\//g, 'dest': 'Xhh' }, //Exact sound not available
     { 'src': /h\//g, 'dest': 'hh' }, //Exact sound not available
     { 'src': /K\//g, 'dest': 'zhl' }, //Exact sound not available
     { 'src': /r\//g, 'dest': 'ѨѨѨѨѨ' }, //Placeholder for r
     { 'src': /M\//g, 'dest': 'hr' }, //Exact sound not available
     { 'src': /L\//g, 'dest': 'l' }, //Exact sound not available
     { 'src': /\&/g, 'dest': 'Ea' }, //Exact sound not available
     { 'src': /y/g, 'dest': 'UI' }, //Exact sound not available
     { 'src': /1/g, 'dest': 'I' }, //Exact sound not available
     { 'src': /M/g, 'dest': 'U' }, //Exact sound not available
     { 'src': /Y/g, 'dest': 'U' }, //Exact sound not available
     { 'src': /2/g, 'dest': 'U' }, //Exact sound not available
     { 'src': /8/g, 'dest': 'U' }, //Exact sound not available
     { 'src': /7/g, 'dest': 'U' }, //Exact sound not available
     { 'src': /9/g, 'dest': 'oE' }, //Exact sound not available
     { 'src': /O/g, 'dest': 'ao' }, //Exact sound not available
     { 'src': /6/g, 'dest': 'ah' }, //Exact sound not available
     { 'src': /A/g, 'dest': 'ah' }, //Exact sound not available
     { 'src': /Q/g, 'dest': 'ao' }, //Exact sound not available
     { 'src': /F/g, 'dest': 'm' }, //Exact sound not available
     { 'src': /c/g, 'dest': 'kj' }, //Exact sound not available
     { 'src': /\?/g, 'dest': '\'' },
     { 'src': /J/g, 'dest': 'nj' },
     { 'src': /r/g, 'dest': 'rlr' }, //Exact sound not available
     { 'src': /R/g, 'dest': 'Xrlr' }, //Exact sound not available
     { 'src': /4/g, 'dest': 'R' }, //Exact sound not available
     { 'src': /C/g, 'dest': 'Sx' }, //Exact sound not available
     { 'src': /G/g, 'dest': 'xR' }, //Exact sound not available
     { 'src': /R/g, 'dest': 'XR' }, //Exact sound not available
     { 'src': /K/g, 'dest': 'Sl' }, //Exact sound not available
     { 'src': /P/g, 'dest': 'v' }, //Exact sound not available
     { 'src': /L/g, 'dest': 'j' }, //Exact sound not available
     { 'src': /ѨѨѨѨѨ/g, 'dest': '@r' }, //Evaluting r
     { 'src': /@@/g, 'dest': '@' }, //Fixing any doubled schwas
     { 'src': /,/g, 'dest': '____' }, //Pause on comma
    ];
    for (var i = 0; i < mappings.length; i++) {
      uipa = uipa.replace(mappings[i].src, mappings[i].dest);
    }
    debug(uipa);
    speakId = meSpeak.speak(uipa,null,phProcessHelper);
  }
  catch(err) {
    alert('An error occurred - speaking failed');
  }
}
////////////////////////////////////////////
function phProcess() {
  if (alreadyPlaying) return;
  alreadyPlaying=true;
  const playEl = document.getElementsByClassName('play-element')[0];
  if (playEl) playEl.src = 'img/icon/stop.png';
  debug('PHONOLOGY');
  phonemeEsc = escapeArray(phoneme);
  arrTxt = txt.split('{br}')[0].split(/\r?\n/g); //Text {br} stops speech
  phProcessHelper();
}
////////////////////////////////////////////
function grProcess(txtIn='') {
  tmpTxt = txt;
  if (txtIn) {
    txt=txtIn;
  } else {
    if (json['view'] === 'view single page' && getSelectedText() === '') {
      var userTextEl = document.getElementById('user-text');
      if (userTextEl) {
        var k = userTextEl.selectionEnd;
        var lineIndex = txt.substring(0,k).split(/\r?\n/g).length;
        var begin = txt.lastIndexOf('\n',k-1);
        begin = begin<0? 0 : begin;
        var end = nthIndex(txt,'\n',k,22); //22nd txt.indexOf('\n',k);
        end = end<0? txt.length : end;
        txt = txt.substring(begin,end);
      }
    }
  }
  debug('ORTHOGRAPHY');
  graphemeEsc = escapeArray(grapheme);
  json['user-text'] = txt;
  txt = txt.replace(/\n/g,'_⚠_'); //Weird newline character hopefully no one else will use
  txt = txt.replace(/ /g,'_');
  if (txt[0]!=='_') txt='_'+txt;
  if (txt[txt.length-1]!=='_') txt=txt+'_';
  var runningSection=0;
  var skipping=false;
  var sectionBegin={};
  var currLine=0;
  var stopLine=graphemeEsc.length;
  var currSectionBegin=0;
  for(var j=0; j<graphemeEsc.length; j++) {
    if (graphemeEsc[j][0][0]==='\\=\\=\\=\\=\\S\\E\\C\\T\\I\\O\\N') {
      if (runningSection) {
        runningSection--;
        if (runningSection) {
          j = currSectionBegin;
        } else {
          j = currLine;
        }
        continue;
      }
      var sectionTitle = graphemeEsc[j][0][1];
      sectionBegin[sectionTitle] = j;
      if (sectionTitle === 'MAIN') skipping = false;
      else skipping = true;
      continue;
    }
    if (skipping) continue;
    var strRun=graphemeEsc[j][0][0].split('\\-');
    if (strRun[0]==='\\=\\=\\=\\=\\R\\U\\N'&&!runningSection) {
      if (strRun[1]===undefined||strRun[1]==='') { //Element [1] contains number of times to run
        runningSection = 1;
      } else {
        strRun[1]=strRun[1].replace(/\\/g,'');
        runningSection = parseInt(strRun[1]);
      }
      currLine = j;
      currSectionBegin = sectionBegin[graphemeEsc[j][0][1]];
      j = currSectionBegin;
      continue;
    }
    txt = addEscaping(txt);
    for(var i in graphemeEsc[j]) {
      if (graphemeEsc[j][i][0]==='') continue;
      txt = txt.split(graphemeEsc[j][i][0]).join(graphemeEsc[j][i][1]);
    }
    txt = removeEscaping(txt);
  }
  txt = txt.replace(/_⚠_/g,'\n');
  txt = txt.replace(/_/g,' ');
  debug(txt);
  if (conlangTextReady) {
    const conlangTextEl = document.getElementById('conlang-text');
    if (conlangTextEl) conlangTextEl.innerHTML = txt.replace(/⟨/g,"<span style='font-family:arial;font-size:1rem'>").replace(/⟩/g,'</span>');
  }
  json['conlang-text'] = txt;
  json['user-text']=json['user-text'].replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  json['conlang-text']=json['conlang-text'].replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
////////////////////////////////////////////
phProcessInit();
////////////////////////////////////////////
// CHAT
////////////////////////////////////////////
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  var results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
////////////////////////////////////////////
function langList() {
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open('GET', 'https://dwn.github.io/common/lang/list', false);
  xmlhttp.send();
  if (xmlhttp.status===200) {
    result = xmlhttp.responseText;
  }
  return result;
}
var arrLang=langList().split('\n');
arrLang = arrLang.filter(function (el) { return el !== null && el !== ''; }); //Remove empty entries
////////////////////////////////////////////
var socket = io();
////////////////////////////////////////////
$('form').submit(function(){
  var str=$('#message-input').val();
  if (!str) return false;
  str+='\n';
  grProcess(str);
  socket.emit('chat message', `${myUser.longId:json['conlang-text']}`;
  $('#message-input').val('');
  $('#message-input').focus();
  return false; //Non-refreshing submit
});
////////////////////////////////////////////
socket.on('chat message', function(msg){
  debug('chat message point A');
  msg = msg.split(':');
  let username = msg[0];
  msg.shift();
  msg = msg.join(':');
  const shortUsername=username.split('_').pop(); //Without uid
  debug('chat message point B');
  if (shortUsername==='connected') {
    socket.emit('chat font', msg);
  }
  debug('chat message point C');
  $('#messages')
  .append($("<li style='font-family:" +
    (shortUsername==='connected'? ';font-size:1rem' : (shortUsername? shortUsername : '')) +
    ';text-orientation:upright;writing-mode:' +
    (json['direction']==='down-right'? 'vertical-lr' :
    json['direction']==='down-left'? 'vertical-rl' : 'horizontal-tb') +
    "'>").html("<div class='chat-username'>"+shortUsername+"&nbsp;</div><div>"+msg+"</div>"));
  const chatEl = document.querySelector('#chat');
  if (chatEl) chatEl.scrollTo(0,chatEl.scrollHeight);
  // say(msg);
});
////////////////////////////////////////////
socket.on('chat font', function(msg){
  debug(msg);
  msg = msg.split(':');
  const username = msg[0];
  const langFileBasename = msg[1];
  
  let langFileURL; $.ajax({async:false,type:'GET',dataType:'text',url:`/lang-file-url/${langFileBasename}`,success:function(r){langFileURL=r;},error:function(r){}});

  debug('setAllData 0');
  setAllData(true, null, null, null);
  debug(`Loading font from ${langFileURL}.otf`)
  var newFont = new FontFace(myUser.longId, `url(${langFileURL}.otf)`);
  newFont.load().then(function(loadedFace) {
    setTimeout(function() { //Occasionally even after the font was successfully loaded, it needs a brief moment before adding
      document.fonts.add(loadedFace);
    }, 1000);
  });
});
