var cors = require('cors')

module.exports = function(app){
    var fileserver = require('../controllers/FileSystemController')

    //routes
    app.get('/gettestfiles', cors(), fileserver.gettestfiles);
    app.get('/createstandalone', cors(), fileserver.writestandalonefiles);
}