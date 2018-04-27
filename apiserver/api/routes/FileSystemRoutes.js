module.exports = function(app){
    var fileserver = require('../controllers/FileSystemController')

    //routes
    app.route('/gettestfiles')
        .get(fileserver.gettestfiles);
}