const fs = require('fs')
const filefolder = './api/testfiles/'

exports.gettestfiles = function(req, res){
    var filescontainer = [];
    var dirlist = fs.readdirSync(filefolder)
    var filecontent;
    dirlist.forEach(function(filename) {
        filecontent = fs.readFileSync(filefolder + filename, 'utf-8')
        filescontainer.push({
            "filename": filename,
            "filecontent": JSON.parse(filecontent)
        })
    })
    res.json({filescontainer})
}