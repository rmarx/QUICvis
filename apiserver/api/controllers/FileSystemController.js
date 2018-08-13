const fs = require('fs')
const filefolder = './api/testfiles/'
const path = require('path')

exports.gettestfiles = function(req, res){
    var filescontainer = [];
    var dirlist = fs.readdirSync(filefolder)
    var filecontent;
    dirlist.forEach(function(filename) {
        var ext = path.extname(filename)
        if (ext === '.json') {
            filecontent = fs.readFileSync(filefolder + filename, 'utf-8')
            filescontainer.push({
                "filename": filename,
                "fileext": ext,
                "filecontent": JSON.parse(filecontent)
            })
        }
        let splitext = ext.split('-')
        if (splitext.length === 2 && splitext[1] === 'log'){
            filecontent = fs.readFileSync(filefolder + filename, 'utf-8')
            filescontainer.push({
                "filename": filename,
                "fileext": ext,
                "filecontent": filecontent
            })
        }
    })
    res.json({filescontainer})
}