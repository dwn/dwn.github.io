////////////////////////////////////////////
// Dan Nielsen
////////////////////////////////////////////
if (typeof DEBUG!=='undefined' && DEBUG==1) {function debug(s){console.log(s);}} else {function debug(s){}}
////////////////////////////////////////////
//Requires jquery
$(function(){
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
});
$('document').ready(function(){
////////////////////////////////////////////
  var socket = io();
  var uniqueUsername = decodeURIComponent(getParameterByName('username'));
  if (!uniqueUsername) {
    //Okay to call this async since it cannot be used quickly
    //Ajax unique-username -> uniqueUsername
    $.ajax({type:'GET',dataType:'text',url:'/my-unique-username',
      success:function(r){uniqueUsername=r;},error:function(r){}});
  }
////////////////////////////////////////////
  $('form').submit(function(){
    const str=$('#messages-input').val();
    if (!str) return false;
    grProcess(str);
    socket.emit('chat message', uniqueUsername+':'+json['conscript-text']);
    $('#messages-input').val('');
    $('#messages-input').focus();
    return false; //Non-refreshing submit
  });
////////////////////////////////////////////
  socket.on('chat message', function(msg){
    msg = msg.split(':');
    var username = msg[0];
    msg.shift();
    msg = msg.join(':');
    const shortUsername=username.split('_')[1]; //Without uid
    if (shortUsername==='connected') {
      socket.emit('chat font', msg);
    }
    $('#messages')
    .append($("<li "+
      (shortUsername==='connected'?
        "style='font:18px Helvetica,Arial'" :
        (username? "style='font-family:"+username+"'" : '')
      ) + ">")
    .html("<div style='display:inline-block;height:70px;line-height:70px;font-family:latin;font-size:.7em'>"+
      shortUsername+"&nbsp;</div><div style='display:inline-block;position:relative;top:.6em'>"+msg+"</div>"));
    window.scrollTo(0, document.body.scrollHeight);
    // say(msg);
  });
////////////////////////////////////////////
  socket.on('chat font', function(msg){
    debug(msg);
    msg = msg.split(':');
    const username = msg[0];
    const fontBasename = msg[1];
    var url = '/bucket-url';
    if (!fontBasename.match(/\d{4}[-]\d{2}[-]\d{2}[_]\d{2}[_]\d{2}[_]\d{2}[_]\d{3}[_]/)) {
      url = '/common-lang-url';
    }
    //Ajax bucket-url/ -> bucketURL
    $.ajax({type:'GET',dataType:'text',url:url,
      success:function(bucketURL){
        setAllData(true, null, null, null, bucketURL);
        var newFont = new FontFace(username, 'url(' + bucketURL + fontBasename + '.otf)');
        newFont.load().then(function(loadedFace) {
          setTimeout(function() { //Occasionally even after the font was successfully loaded, it needs a brief moment before adding
            document.fonts.add(loadedFace);
          }, 1000);
        });
      },error:function(r){}
    }); //bucketURL
  });
});
