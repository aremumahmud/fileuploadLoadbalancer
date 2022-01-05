function parseServers (list){
  var lists = list.split("\n")
  var res = {}
  for(var i=0 ;i<lists.length;i++ ){
    var sep = lists[i].split(" ")
    res[sep[1]] = sep[0]
    
  } 
  return res
}

module.exports = parseServers

