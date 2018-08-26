var css = document.createElement('style');
css.type = 'text/css';
css.innerHTML = 'body::-webkit-scrollbar { width:0px !important; }';
document.getElementsByTagName('head')[0].appendChild(css);