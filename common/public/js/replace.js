////////////////////////////////////////////
// Dan Nielsen
////////////////////////////////////////////
if (typeof DEBUG!=='undefined' && DEBUG==1) {function debug(s){console.log(s);}} else {function debug(s){}}
////////////////////////////////////////////
meSpeak.loadConfig('common/json/mespeak_config.json');
meSpeak.loadVoice('common/json/en.json');
////////////////////////////////////////////
var tmpTxt;
var arrTxt;
var txt = '';
var phoneme;
var phonemeEsc;
var grapheme;
var graphemeEsc;
var json = {};
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
     { 'src': /B\//g, 'dest': 'blblb' }, //Exact sound not available
     { 'src': /f\//g, 'dest': 'fh' }, //Exact sound not available
     { 'src': /B\//g, 'dest': 'vhU' }, //Exact sound not available
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
function grProcess() {
  tmpTxt = txt;
  if (json['view'] === 'view single page' && getSelectedText() === '') {
    var userTextEl = document.getElementById('user-text');
    if (userTextEl) {
      var k = userTextEl.selectionEnd;
      var lineIndex = txt.substring(0,k).split(/\r?\n/g).length;
      var begin = txt.lastIndexOf('\n',k-1);
      begin = begin<0? 0 : begin;
      var end = nthIndex(txt,'\n',k,16); //16th txt.indexOf('\n',k);
      end = end<0? txt.length : end;
      txt = txt.substring(begin,end);
    }
  }
  debug('ORTHOGRAPHY');
  graphemeEsc = escapeArray(grapheme);
  json['user-text'] = txt;
  txt = txt.replace(/\n/g,'_⚠_'); //Weird newline character hopefully no one else will use
  txt = txt.replace(/ /g,'_');
  for(var j in graphemeEsc) {
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
