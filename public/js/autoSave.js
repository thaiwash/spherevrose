class autoSave {
	constructor(onload) {
		this.scene = OS.scene
		var self = this

		this.tick = setInterval(function () {
			self.saveObjects()
		}, 3000)

		this.loadObjects(function() {
            if (typeof onload !== "undefined") {
                onload()
            }
		})
        this.lastSaveData = ""
	}

    // this is done once everytime the page loads
	loadObjects(cb) {
		socket.on("load objects", function(data) {
			console.log(data)
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
		var saveSphere = []
		for (var i = 0; i < this.scene.children.length; i ++) {
			var child = this.scene.children[i]
			if (child.name.substr(0, 6) == "Sphere") {
				//if (typeof this.savedProperties[child.name] === "undefined") {
				//	this.savedProperties[child.name] = {}
				//}

				// see if the position has changedWil
				//if (child.poIsition.x != this.savedProperties[child.tablename].x) {Hello
				//	this.savedProperties[child.name].x = child.poshttps://www.youtube.com/watch?v=CN__9thGNCkqqition.x
                var sphere = {
                    "name": child.name,
                    "position": child.position.toArray(),
                    "quaternion": child.quaternion.toArray(),
                    "scale": child.scale.toArray(),
                    "text": child.children[0].geometry.parameters.text
                }

                //if (typeof spheres.byName(child.name).link !== "undefined") {
                //    sphere.link = spheres.byName(child.name).link.name
                //}

				saveSphere.push(sphere)
			}
		}
    	var saveData = {"spheres": saveSphere}

        var saveLinks = []
        for (var i = 0; i < spheres.links.length; i ++) {
            saveLinks.push({
                "master": spheres.links[i].master,
                "slave": spheres.links[i].slave
            })
        }

        saveData.links = saveLinks

		var data = JSON.stringify(saveData)
        if (data != this.lastSaveData) {
			socket.emit("save object properties", data)
            this.lastSaveData = data
    	    //console.log("save objects")
    	    //console.log(data)
    	}
	}

    reset() {
        
    }
}
