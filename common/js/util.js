////////////////////////////////////////////
// Dan Nielsen
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
function nthIndex(str, pat, k, n) {
  var L=str.length, i=k-1;
  while(n-- && ++i<L){
    i=str.indexOf(pat,i);
    if (i<0) break;
  }
  return i;
}
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
