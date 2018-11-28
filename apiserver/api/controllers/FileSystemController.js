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

exports.writestandalonefiles = function(req,res){
    let dirs = [];
    dirs[0] = "./api/testfiles/all/0rtt/";
    dirs[1] = "./api/testfiles/all/2initials/";
    dirs[2] = "./api/testfiles/all/duplipkts/";
    dirs[3] = "./api/testfiles/all/exceedmd/";
    dirs[4] = "./api/testfiles/all/multistreams/";
    dirs[5] = "./api/testfiles/all/ntwrkoff/";
    dirs[6] = "./api/testfiles/all/pktsreorder/";

    let outputdir = "./api/testfiles/standalone/";

    let outputBrowser = [];
    let filenameCache = [];

    if( fs.existsSync(outputdir) ){
        fs.renameSync(outputdir, "./api/testfiles/standaloneOLD/");
    }
    fs.mkdirSync( outputdir );

    for( let dir of dirs ){
        let files = fs.readdirSync(dir);

        for( let file of files ){
            let extension = path.extname(file);
            let filename = path.parse(file).name;
            
            let output = undefined;

            if (extension === '.json') {
                filecontent = fs.readFileSync(dir + file, 'utf-8')

                output = {
                    "filename": file,
                    "fileext": extension,
                    "filecontent": JSON.parse(filecontent)
                };
            }
            else{

                let splitext = extension.split('-')
                if (splitext.length === 2 && splitext[1] === 'log'){
                    filecontent = fs.readFileSync(dir + file, 'utf-8')
                    
                    output = {
                        "filename": file,
                        "fileext": extension,
                        "filecontent": filecontent
                    };
                }
                else
                    console.error("File has no valid extension ", file, dir);
            }

            if( filenameCache.indexOf(filename) >= 0 ){
                console.error("There was already a file with this name, cannot have duplicates! ", file, dir, filename);
                outputBrowser = { error: "There was already a file with this name, cannot have duplicates! " + filename };
                req.json(outputBrowser);
                break;
            }
            else{
                let filenameUnderscores = filename.replace(new RegExp("-", 'g'), "_"); // js varnames cannot have - in them 
                fs.writeFileSync( outputdir + file + ".js", "var " + filenameUnderscores + " = " + JSON.stringify(output) + ";" );
                outputBrowser.push( file + ".js" );

                filenameCache.push( filename );
            }
        }
    }

    res.json({ standalonefiles : outputBrowser });
}