
// manualize
class autoSave {
	constructor(onload) {
		var self = this;
		this.scene = setInterval(function() {
			self.saveObjects();
console.log("saving");
			//OS.socket.emit("save project", { file: "./public/scene_savefile.json", data: JSON.stringify(OS.scene.toJSON()).toString() } )
		}, 3000)
console.log("loading");
		this.loadObjects(
			/*OS.socket.on("load project callback", function(data) {
				data.saveData
			})
			OS.socket.emit("load project", {file: "./public/scene_savefile.json"})
			*/function() {}
		)
        this.lastSaveData = ""
		
	}
	
	init() {
		socket.emit('load project', {"file": "public/modules/qmaze/jsvr.json"})
        socket.on("load project callback", function (data) {
            spheres.jsonToSphere(data.saveData)
        } )
	}

    // this is done once everytime the page loads
	loadObjects(cb) {
		socket.on("load objects", function(data) {
			//console.log(data)
            data = JSON.parse(data)
            if (typeof data.spheres !== "undefined") {
                //console.log(data.spheres.length)
    			for (var i = 0; i < data.spheres.length; i ++) {
                    // add(position, text, name, quaternion, scale)
            		//console.log(data.spheres[i])
    				spheres.add(
                        data.spheres[i].position,
                        data.spheres[i].text,
                        data.spheres[i].name,
                        data.spheres[i].quaternion,
                        data.spheres[i].scale
                    )
    			}
            }
            if (typeof data.links !== "undefined") {
    			for (var i = 0; i < data.links.length; i ++) {
                    spheres.link(
                        data.links[i].master,
                        data.links[i].slave
                    )
                }
            }
			cb()
		})
		socket.emit("load object properties")
	}
    // thiThis is as one is called every 3 seconds
	saveObjects() {
		var saveSpheres = []
		for (var i = 0; i < spheres.spheres.length; i ++) {
			var sphere = {
				"name": spheres.spheres[i].name,
				"position": spheres.spheres[i].position.toArray(),
				"quaternion": spheres.spheres[i].quaternion.toArray(),
				"scale": spheres.spheres[i].scale.toArray(),
				"text": spheres.getText(spheres.spheres[i])
			}
			//console.log("saving "+spheres.spheres[i].name)
			saveSpheres.push(sphere);
		}
    	var saveData = {"spheres": saveSpheres}

        var saveLinks = []
        for (var i = 0; i < spheres.links.length; i ++) {
            saveLinks.push({
                "master": spheres.links[i].master,
                "slave": spheres.links[i].slave
            })
        }

        saveData.links = saveLinks

		var data = JSON.stringify(saveData)
    	//console.log(data)
        if (data != this.lastSaveData) {
			socket.emit("save project", {"file": "public/modules/qmaze/jsvr.json", "data":data})
            this.lastSaveData = data
    	    console.log("save objects")
    	}
	}
	
    reset() {
        
    }
}
