var http = require('http');
var DataStream = require("./DataStream")
var fs = require("fs")
var httpProxy = require('http-proxy');
var parseServers = require("./parseServers")
var servers = fs.readFileSync("./servers.file").toString().split("\n")


var serverArray = servers.map(server=>{
  return server.split(" ")[0]
})
var serversObj = parseServers(fs.readFileSync("./servers.file").toString())
var index = 0


var proxy = httpProxy.createProxyServer({});
require('http').createServer(function(req, res) {
      if(req.url == "/favicon.ico"){
        res.end()
      }else if(req.url.indexOf("/Check") == 0){
            res.end(JSON.stringify(servers))

      }else if(req.url.indexOf("/Update") != 0){
           if(req.method == "POST" ){
             if(servers.length==0) res.end("bad gateway")
             index = (index + 1) % servers.length;
             req.headers.host = serverArray[index]
              proxy.web(req, res, {target:"http://"+serverArray[index]},(err)=>{
                        res.end("err")
              });
           }else if(req.method == "GET"){
               if(servers.length==0) res.end("bad gateway")
               var serverId = req.headers.auth
               if(!serverId) res.end("no id")
               var dedicated = serversObj[serverId]
               req.headers.host = dedicated
                  console.log(serversObj,serverId ,dedicated)
               proxy.web(req, res, {target:"http://"+dedicated},(err)=>{
                      res.end("err")
               });
           }
      }else{
         var { url } = req
         var query = url.slice(url.indexOf("?")+1)
         var ser = query.split("&")
         var upd = ser.map(server=>{
           return server.split("=")[1]
         })
         var msg = upd.join("&%₹&")
               serverArray.push(upd[0])
               
               process.send(msg+"&&"+process.pid)
               servers.push(upd[0]+" "+upd[1])
               serversObj[upd[1]]=upd[0]
               var text = servers.join("\n")
               fs.writeFile("servers.file",text, (err) => { 
                  if (err) {
                     res.end("error")
                  }else { 
                     res.end(text)
                  }   
               }); 
     }
}).listen(process.env.PORT || 8080, function() {console.log('Started');});
process.on("message",msg=>{
     if(msg.split("&&")[1] != process.pid){
      var msgs = msg.split("&&")[0]
      var decoded = msgs.split("&%₹&")
      serverArray.push(decoded[0])
      serversObj[decoded[1]] = decoded[0]
      servers.push(decoded.join(" "))
     }
   })
//lets )
