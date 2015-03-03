var Unicode = exports;

Unicode.encode = function(str){
  return escape(str).replace(/%/g,"\\").toLowerCase();
}

Unicode.decode = function(str){
  return unescape(str.replace(/\\/g, "%"));
}