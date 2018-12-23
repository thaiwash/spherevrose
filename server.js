const express = require('express')
const app = express()
const fs = require('fs')
const drivelist = require('drivelist');
const robot = require("robotjs");

const touch = filename => fs.closeSync(fs.openSync(filename, 'w'));

touch('saved_object_data.json');


app.use(express.static('public'))
app.get('/', function(req, res) {
	res.set('Content-Type', 'text/html')
	res.end(fs.readFileSync("public/Translucence.html").toString("utf8"))
})


var http = require('http').Server(app);
var io = require('socket.io')(http);

var screenSize = robot.getScreenSize();
var height = screenSize.height
var width = screenSize.width

io.on('connection', function(socket){
	console.log('a user connected');


	socket.on('screen mouse event', function(data) {
		data.y = Math.abs(data.y - 1)
		data.x = data.x * width
		data.y = data.y * height

		if (data.y > -1) {
			robot.moveMouse(data.x, data.y)
		}
	})

	socket.on('left mouse down', function() {
		robot.mouseToggle("down", "left")
	})

	socket.on('left mouse up', function() {
		robot.mouseToggle("up", "left")
	})

	socket.on('right mouse down', function() {
		robot.mouseToggle("down", "right")
	})

	socket.on('right mouse up', function() {
		robot.mouseToggle("up", "right")
	})
	socket.on('mouse scroll', function(data) {
		robot.scrollMouse(data.horizontal, data.vertical)
	})


	socket.on('keyboard event', function(data) {
		/*if (data.key == "Ä") {
			runAutoitScript("Send(\""+data.key+"\")")
			return;
		}
		if (data.key == "Ö") {
			runAutoitScript("Send(\""+data.key+"\")")
			return;
		}
		if (data.key == "Å") {
			runAutoitScript("Send(\""+data.key+"\")")
			return;
		}*/
		console.log(data.key)
		robot.keyTap(data.key)
	})

	socket.on('keyboard hold', function(data) {
		if (data.key == "Ä") {
			return;
		}
		if (data.key == "Ö") {
			return;
		}
		if (data.key == "Å") {
			return;
		}

		console.log("key hold "+data.key)
		robot.keyToggle(data.key, "down")
	})

	socket.on('keyboard release', function(data) {
		if (data.key == "Ä") {
			return;
		}
		if (data.key == "Ö") {
			return;
		}
		if (data.key == "Å") {
			return;
		}

		console.log("key release "+data.key)
		robot.keyToggle(data.key, "up")
	})

	socket.on('save object properties', function(data) {
		var str = data
        if (str.length == 0) {
		    console.log("I'm not writing an empty string!")
            return
        }
		fs.writeFileSync("saved_object_data.json", str)
	})

	socket.on('load object properties', function() {
        var str = fs.readFileSync("saved_object_data.json").toString()
        if (str.length == 0) {
		    console.log("Savedata scrambled, resetting world")
            str = '{"spheres": [], "links": []}'
        }
		socket.emit('load objects', str)
	})

    socket.on('save project', function(data) {
        console.log("writing file " + data.file + " with " + data.data)
        fs.writeFileSync(data.file, data.data)
    })

    socket.on('load project', function(data) {
        console.log("loading file " + data.file)
        socket.emit("load project callback", {
            "saveData": fs.readFileSync(data.file).toString()
        })
    })

	socket.on('get fs data', function(data) {
        var fsData = {}
        if (data.root == "drives") {
            drivelist.list((error, drives) => {
                if (error) {
                  throw error;
                }
                var nodes = {"path": data.root}
                nodes.children = []
                for (var i = 0; i < drives.length; i++) {
                    for (var i2 = 0; i2 < drives[i].mountpoints.length; i2 ++) {
                        var path = drives[i].mountpoints[i2].path.replace("\\", "")
                        console.log(path)
                        nodes.children.push({
                            "name": path,
                            "path": path,
                            "type": "dir"
                        })
                    }
                }
                console.log(nodes)
        	    socket.emit('fs data', {"root": nodes})
            });
        } else {
            console.log("readdir "+data.root+"/")
            if (!fs.statSync(data.root).isDirectory()) {
                console.log("not a dir")
                return
            }
            fs.readdir(data.root+"/", function(err, items) {
                console.log(items);
                var nodes = {"path": data.root}
                nodes.children = []


                for (var i = 0; i < items.length; i++) {
                    try {
                        var type = fs.statSync(
                            data.root+ "/"+ items[i]
                        ).isDirectory() ? "dir" : "file"
                    }
                    catch(error) {
                      console.error(error);
                      if (error) {
                          var type = "error"
                      }
                    }


                    nodes.children.push({
                        "name": items[i],
                        "path": data.root + "/" + items[i],
                        "type": type
                    })
                }
                console.log(nodes)
        	    socket.emit('fs data', {"root": nodes})
            });
        }
	})
});
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});
http.listen(3000, function(){
  console.log('listening on *:3000');
});
