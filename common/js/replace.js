////////////////////////////////////////////
// Dan Nielsen
////////////////////////////////////////////
if (typeof DEBUG!=='undefined' && DEBUG==1) {function debug(s){console.log(s);}} else {function debug(s){}}
////////////////////////////////////////////
meSpeak.loadConfig('https://dwn.github.io/common/json/mespeak_config.json');
meSpeak.loadVoice('https://dwn.github.io/common/json/en.json');
////////////////////////////////////////////
var tmpTxt;
var arrTxt;
var txt = '';
var phoneme;
var phonemeEsc;
var grapheme;
var graphemeEsc;
var json = {};
var alreadyPlaying=false;
var conscriptTextReady=false;
////////////////////////////////////////////
function loadFileURL(fileURL) {
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open('GET', fileURL, false);
  xmlhttp.send();
  if (xmlhttp.status==200) {
    result = xmlhttp.responseText;
  }
  return result;
}
////////////////////////////////////////////
function getSelectedText() {
  var userSelection='', ta;
  if (window.getSelection && document.activeElement) {
    if (document.activeElement.nodeName == 'TEXTAREA' ||
        (document.activeElement.nodeName == 'INPUT' &&
        document.activeElement.getAttribute('type').toLowerCase() == 'text')) {
      ta = document.activeElement;
      userSelection = ta.value.substring(ta.selectionStart, ta.selectionEnd);
    } else {
      userSelection = window.getSelection();
    }
  } else {
    userSelection = document.getSelection();
  }
  return userSelection.toString();
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
function setAllData(on, titleEl, title = null, dat = null) {
  if (on) {
    if (!dat) { //Only called when font selected from title screen
      openedChat=false;
      fontSelectedFromTitleScreen=true;
      setVisibility('select-selected',false);
      setVisibility('conscript-loading',true);
      dat = loadFileURL('https://dwn.github.io/common/lang/'+titleEl.innerHTML+'.svg');
      setVisibility('conscript-loading',false);
      setVisibility('select-selected',true);
      const nameInInputBox = document.querySelector('.username-element').value;
      //Okay to call this async since it cannot be used quickly
      //Ajax unique-username -> myUsername
      $.ajax({type:'GET',dataType:'text',url:'/unique-username?name='+(nameInInputBox? nameInInputBox : ''),
        success:function(r){myUsername=r;},error:function(r){}});
    }
    dat = dat.split('<desc>');
    dat = dat[1].split('</desc>')[0];
    json = JSON.parse(dat);
    document.getElementById('phoneme-map').value = json['phoneme-map'].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
    document.getElementById('grapheme-map').value = json['grapheme-map'].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
    document.getElementById('kerning-map').value = json['kerning-map'].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
    document.getElementById('user-text').value = json['user-text'].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
    //document.getElementById('conscript-text').innerText = json['conscript-text'].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
    document.getElementById('font-code').value = json['font-code'].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
    document.getElementById('direction').value = json['direction'];
    document.getElementById('pen').value = json['pen'];
    document.getElementById('weight').value = json['weight'];
    document.getElementById('size').value = json['size'];
    document.getElementById('style').value = json['style'];
    document.getElementById('space').value = json['space'];
    document.getElementById('note').value = json['note'];
    document.getElementById('view').value = json['view'];
    document.getElementById('font-name').value = json['name'].replace(/\d{4}[-]\d{2}[-]\d{2}[_]\d{2}[_]\d{2}[_]\d{2}[_]\d{3}[_]/g, '');
    setAdjustSetting();
    //Clear canvas
    var canvas = document.getElementById('font-canvas'),
    ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //Load mappings
    loadKerningMap();
    loadPhonemeMap();
    loadGraphemeMap();
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = '#680068';
    fullTxt = document.getElementById('user-text').value;
    hideAll();
    document.getElementById('page-container').style.backgroundColor = '#680068';
    setVisibility('help',false);
    setVisibility('username',false);
    setVisibility('donate',false);
    setVisibility('menu',true);
    setVisibility('script',true);
  } else {
    document.body.style.backgroundImage = 'url(img/continua.svg)';
    document.getElementById('page-container').style.backgroundColor = 'transparent';
    hideAll();
    setVisibility('menu',false);
    setVisibility('donate',true);
    setVisibility('username',true);
    setVisibility('help',true);
  }
  if (titleEl !== null && title !== null) {
    titleEl.innerHTML = title;
  }
}
////////////////////////////////////////////
function loadPhonemeMap() {
  phoneme = loadMap('phoneme-map',document.getElementById('phoneme-map').value);
  if (!phoneme) {
    phoneme = json['phoneme'];
  }
  var last = phoneme.length-1;
  if (last<0) { last=0; phoneme.push([]); }
  phoneme[last] = phoneme[last].concat([[' ','\'']]);
}
////////////////////////////////////////////
function loadGraphemeMap() {
  grapheme = loadMap('grapheme-map',document.getElementById('grapheme-map').value);
  if (!grapheme) {
    grapheme = json['grapheme'];
  }
}
////////////////////////////////////////////
function addEscaping(s) {
  var r = '';
  for(var i=0; i<s.length; i++) {
    r = r.concat('\\',s[i]);
  }
  return r;
}
////////////////////////////////////////////
function removeEscaping(s) {
  return s.replace(/\\/g,'');
}
////////////////////////////////////////////
function escapeArray(arr) {
  var arrEsc = [];
  for(var j in arr) {
    arrEsc.push([]);
    for(var i in arr[j]) {
      const esc = addEscaping(arr[j][i][0]);
      arrEsc[j].push([esc,arr[j][i][1]]);
    }
  }
  return arrEsc;
}
////////////////////////////////////////////
function phProcessHelper() {
  do {
    if (arrTxt===null || !arrTxt.length) {
      const playEl = document.getElementsByClassName('play-element')[0];
      if (playEl) playEl.src = 'img/play.png';
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
    speakId = meSpeak.speak('[['+uipa+']]', { 'rawdata': 'mime' });
    if (speakId == null) alert('An error occurred - speaking failed');
    meSpeak.play(speakId, 1, phProcessHelper);
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
  if (playEl) playEl.src = 'img/stop.png';
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
  var repeating=false;
  var sectionBegin=[0];
  var currLine=0;
  var stopLine=graphemeEsc.length;
  for(var j=0; j<graphemeEsc.length; j++) {
    if (j>=stopLine && repeating) {
      j = currLine;
      repeating = false;
      continue;
    }
    else if (graphemeEsc[j][0][0].substr(0,23)==='\\=\\=\\=\\=\\R\\E\\P\\E\\A\\T\\-\\'&&!repeating) {
      var s = graphemeEsc[j][0][0].substr(23);
      var n = parseInt(s,10);
      currLine = j;
      j = sectionBegin[n];
      if (n+1<sectionBegin.length) stopLine = sectionBegin[n+1];
      else stopLine = graphemeEsc.length;
      repeating = true;
      continue;
    }
    else if (graphemeEsc[j][0][0]==='\\=\\=\\=\\=\\S\\E\\C\\T\\I\\O\\N') {
      sectionBegin.push(j);
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
  if (conscriptTextReady) {
    const conscriptTextEl = document.getElementById('conscript-text');
    if (conscriptTextEl) conscriptTextEl.innerHTML = txt.replace(/⟨/g,"<span style='font-family:arial;font-size:.5em'>").replace(/⟩/g,'</span>');
  }
  json['conscript-text'] = txt;
  json['user-text']=json['user-text'].replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  json['conscript-text']=json['conscript-text'].replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
