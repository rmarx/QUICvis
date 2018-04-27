var express = require('express')
    app = express(),
    port = process.env.PORT || 8040;

var routes = require('./api/routes/FileSystemRoutes')
routes(app)
    
app.listen(port)

console.log('File API server started on: ' + port)