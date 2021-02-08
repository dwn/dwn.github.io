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
  var socket = io();
  var uniqueUsername = getParameterByName('username');
  if (!uniqueUsername) {
    //Okay to call this async since it cannot be used quickly
    //Ajax unique-username -> uniqueUsername
    $.ajax({type:'GET',dataType:'text',url:'/my-unique-username',
      success:function(r){uniqueUsername=r;},error:function(r){}});
  }
////////////////////////////////////////////
  $('form').submit(function(){
    if (!$('#messages-input').val()) return false;
    socket.emit('chat message', uniqueUsername+':'+$('#messages-input').val());
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
    var uri = '/bucket-uri';
    if (!fontBasename.match(/\d{4}[-]\d{2}[-]\d{2}[_]\d{2}[_]\d{2}[_]\d{2}[_]\d{3}[_]/)) {
      uri = '/static-bucket-uri';
    }
    //Ajax bucket-uri/ -> bucketURI
    $.ajax({type:'GET',dataType:'text',url:uri,
      success:function(bucketURI){
        const addr = bucketURI + fontBasename + '.otf';
        var newFont = new FontFace(username, 'url(' + addr + ')');
        newFont.load().then(function(loadedFace) {
          setTimeout(function() { //Occasionally even after the font was successfully loaded, it needs a brief moment before adding
            document.fonts.add(loadedFace);
          }, 200);
        });
      },error:function(r){}
    }); //bucketURI
  });
});
