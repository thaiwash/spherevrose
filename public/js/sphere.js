

//"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
// " .,()[]{};:=!?/*$#@_-+|&><\""
class Sphere {
	constructor() {
		var self = this
		this.scene = OS.scene
        this.controllerWrapper()
        this.defaultColor = 0x5555FF
		this.spheres = []
		this.links = []
		this.selected = []
		this.intersecting = [false, false]

        socket.on("load project callback", function (data) {
            self.jsonToSphere(data.saveData)
        } )

        window.addEventListener("keypress", function (evt) {
            self.add(controller.controllerSphere[0].position, evt.key)
        });

		this.sphereGeom =  new THREE.SphereGeometry( 40/1000, 32/1000, 16/1000 );

		this.blueMaterial = new THREE.MeshBasicMaterial(
            { color: this.defaultColor, transparent: true, opacity: 0.5 }
        )
    }

    controllerWrapper() {
    	var self = this
        window.addEventListener('buttonpressed', function (e) {
            if (e.detail.button == "A" && controller.buttonPressed['B']) {
                self.add(controller.controllerSphere[0].position)
            } else if (e.detail.button == "A" && self.selected.length > 0) {
                self.copySelected()
            }

            if (e.detail.button == "A") {
                var intersecting = controller.intersectingGrabbableObject(0)
                if (intersecting) {
                    headText.add("Name " + intersecting.name)
                    for (var i = 0; i < self.links.length; i ++) {
                        if ( self.links[i].slave == intersecting.name
                            || self.links[i].master == intersecting.name) {
                            headText.add(
                                "Link \nJustM:" +
                                self.links[i].master + " \nS:"
                                + self.links[i].slave
                            )
                        }
                    }
                }
            }

            if (e.detail.button == "R_JOYSTICK" && controller.grippedObject[0]) {
                controller.grippedObject[0] = self.packOrUnpack(controller.grippedObject[0])
            }

            if (e.detail.button == "B" && controller.grippedObject[0]) {
                self.removeStack(controller.grippedObject[0])
                controller.grippedObject[0] = false
            } else if (e.detail.button == "B" && self.selected.length > 0) {
                self.removeSelected()
            } else if (e.detail.button == "B") {
                var intersecting = controller.intersectingGrabbableObject(0)
                if (intersecting) {
                    if (self.hasLinks(intersecting)) {
                        self.removeLinks(intersecting)
                    } else {
                        self.scene.remove(intersecting)
                    }
                }
            }

            if (e.detail.button == "X") {
                if (controller.grippedObject[0] && controller.grippedObject[1]) {
                    self.link(
                        controller.grippedObject[0].name,
                        controller.grippedObject[1].name
                    )
                }

                if (controller.buttonPressed["Y"]) {
                    var intersecting = controller.intersectingGrabbableObject(1)
                    if (intersecting) {
                        headText.add(
                            "compiled text: " + self.getWholeText(
                                intersecting.name
                            )
                        )
                        if (controller.buttonPressed["L_TRIGGER"]) {
                            self.runProgram(intersecting.name)
                        }
                    }
                }
            }
        })

        window.addEventListener('grabstart', function (e) {
            if (typeof e.detail.object.name !== "undefined") {
                // check if name starts with sphere (otherwise you might brak fs sphere)
				if (e.detail.object.name.substr(0, 6) == "Sphere") {
					//console.log(self.getLinkedObjects(e.detail.object.name))
					self.multiAttach(
						e.detail.object,
						self.getLinkedObjects(e.detail.object.name)
					)
				}
            }
            self.updateLinks()
        })

        window.addEventListener('grabend', function (e) {
            if (typeof e.detail.object.name !== "undefined") {
				if (e.detail.object.name.substr(0, 6) == "Sphere") {
					self.detachSpheres(e.detail.object)
                    for (var i = 0; i < fs.fsSpheres.length; i ++) {
                        var fsSphere = controller.intersecting(
                            fs.fsSpheres[i],
                            e.detail.rightOrLeft
                        )
                        if (fsSphere) {
                            //console.log(fs.fsSpheres[i])
                            if (fs.fsSpheres[i].path !== "drives") {
                                socket.emit("save project", {
                                    "file": fs.fsSpheres[i].path
                                        + "/" + self.fileName(
                                        e.detail.object
                                    ) + ".bubble.json",
                                    "data": self.sphereToJson(e.detail.object)
                                })
                            }
    				    }
				    }
				}

            }
            self.updateLinks()
			// if grabend sphere intersects fs sphere save it to fs sphere dir
        })



        window.addEventListener('buttonheld', function (e) {
            if (e.detail.button == "R_TRIGGER") {
                var intersecting = controller.intersectingGrabbableObject(0)
                if (intersecting) {
                    self.select(intersecting)
                }
            }

            if (e.detail.button == "L_TRIGGER") {
                var intersecting = controller.intersectingGrabbableObject(1)
                if (intersecting) {
                    self.select(intersecting)
                }
            }
        })

        window.addEventListener('buttonreleased', function (e) {
            if (e.detail.button == "L_TRIGGER"
                || e.detail.button == "R_TRIGGER") {
                self.unselect()
            }
        })

        window.addEventListener('controllerupdate', function (e) {
		    var intersecting = controller.intersectingGrabbableObject(
                e.detail.rightOrLeft
            )
		    if (intersecting) {
                if (!self.isSphere(intersecting)) {
                    return
                }
                intersecting.material.opacity = 0.8
                if (self.intersecting[e.detail.rightOrLeft]) {
                    if (self.intersecting[e.detail.rightOrLeft].uuid
                        != intersecting.uuid
                    ) {
                        self.intersecting[
                            e.detail.rightOrLeft
                        ].material.opacity = 0.5
                    }
                }
                self.intersecting[e.detail.rightOrLeft] = intersecting
		    } else {
                if (self.intersecting[e.detail.rightOrLeft]) {
                    self.intersecting[
                        e.detail.rightOrLeft
                    ].material.opacity = 0.5
                    self.intersecting[e.detail.rightOrLeft] = false
                }
            }
        })
    }

    // remove object and all connected objects
    removeStack(object) {
        for ( var i = 0; i < object.children.length; i ++) {
            var sphere = object.children[i]

            this.removeLinks(sphere)
        }
        /*
        for ( var i = 0; i < object.children.length; i ++) {
            var sphere = object.children[i]

            object.remove(sphere)
        }*/
        if (controller.grippedObject[0].id == object.id) {
            controller.grippedObject[0] = false
            clearInterval(controller.grabTimer[0])
        }
        if (controller.grippedObject[1].id == object.id) {
            controller.grippedObject[1] = false
            clearInterval(controller.grabTimer[1])
            //controller.unGrip(1)
        }
        // todo, manual ungrip, otherwise clontroller bugs

        this.scene.remove(object)

    }

    packOrUnpack(object) {
        //var sphereNameArray = this.getLinkedObjects(object.name)
        //sphereNameArray.push(object.name)

        /* todo
        for ( var i = 0; i < sphereNameArray.length; i ++) {
            var sphere = this.scene.getObjectByName(
                sphereNameArray[i]
            )
            if (!controller.intersecting(sphere, 0)) {
                sphere.material.color.setHex( 0xff0000 )
                headText.add("cant pack "+ this.getText(sphere))
                return
            }
            sphere.material.color.setHex( 0x000000 )
        }*/

        if (typeof object.package !== "undefined") {
            this.jsonToSphere(object.package)
            this.scene.remove(object)
            return false
        } else  {
            var pack = this.add(
                controller.controllerSphere[0].position.toArray(),
                this.fileName(object),
                undefined,
                undefined,
                1.1
            )
            pack.package = this.sphereToJson(object)
            //console.log(pack)

            this.removeStack(object)

            //} else {
                //this.add(controller.controllerSphere[0], this.fileName(object))
                // theck that all connected are intersecting
                // add(position, text, name, quaternion, scale) {
            //Will}
            return pack
        }
    }

    getText(sphere){
        return sphere.children[0].geometry.parameters.text
    }

    isSphere(sphere) {
        if (sphere.name.substr(0, 6) == "Sphere") {
            return true
        } else {
            return false
        }
    }

    select(sphere) {
        if (!this.isSphere(sphere)) {
            return
        }
        sphere.material.color.setHex( 0xffffff )
        if (this.find(sphere.name, this.selected) == -1) {
            this.selected.push(sphere)
        }
    }

    unselect() {
        for ( var i = 0; i < this.selected.length; i ++) {
            this.selected[i].material.color.setHex( this.defaultColor )
        }
        this.selected = []
    }

    find(sphereName, spheres) {
        for ( var i = 0; i < spheres.length; i ++) {
            if (spheres[i].name == sphereName) {
                return i
            }
        }
        return -1
    }

    // make ison of sphere and all linked spheres snd their links
	sphereToJson(sphere) {
        var sphereNameArray = this.getLinkedObjects(sphere.name)
        sphereNameArray.push(sphere.name)
        var links = this.getRelevantLinks(sphereNameArray)
        var spheres = []

        for ( var i = 0; i < sphereNameArray.length; i ++) {
            var sphere = this.scene.getObjectByName(
                sphereNameArray[i]
            )
            var worldPosition = new THREE.Vector3()
            sphere.getWorldPosition(worldPosition)
            var worldScale = new THREE.Vector3()
            sphere.getWorldScale(worldScale)
            spheres.push({
                "position": worldPosition.toArray(),
                "text": sphere.children[0].geometry.parameters.text,
                "name": sphere.name,
                "quaternion": sphere.quaternion.toArray(),
                "scale": worldScale.toArray()
            })
        }
        return JSON.stringify([spheres, links])
    }

    jsonToSphere(json) {
        //console.log(json)

        // todo: align to controller right
        var saveData = JSON.parse(json)

        var relativePosition = [
            controller.controllerSphere[0].position.x
                - saveData[0][0].position[0],
            controller.controllerSphere[0].position.y
                - saveData[0][0].position[1],
            controller.controllerSphere[0].position.z
                - saveData[0][0].position[2]
        ]


        for ( var i = 0; i < saveData[0].length; i ++) {

            var position = [
                saveData[0][i].position[0] + relativePosition[0],
                saveData[0][i].position[1] + relativePosition[1],
                saveData[0][i].position[2] + relativePosition[2]
            ]

            this.add(
                position,
                saveData[0][i].text,
                saveData[0][i].name,
                saveData[0][i].quaternion,
                saveData[0][i].scale
            )
        }

        for ( var i = 0; i < saveData[1].length; i ++) {
            this.link(
                saveData[1][i].master,
                saveData[1][i].slave
            )
        }
    }

    removeLinks(sphere) {
        for (var i = 0; i < this.links.length; i ++) {
            if ( this.links[i].slave == sphere.name
                || this.links[i].master == sphere.name) {
                this.scene.remove(this.links[i].line)
                this.links.splice(i, 1)
                this.removeLinks(sphere)
            }
        }
    }

    hasLinks(sphere) {
        for (var i = 0; i < this.links.length; i ++) {
            if ( this.links[i].slave == sphere.name
                || this.links[i].master == sphere.name) {
                return true
            }
        }
        return false
    }

    getRelevantLinks(sphereNameArray) {
        var arrayOfRelevantLinks = []
        for ( var i = 0; i < sphereNameArray.length; i ++) {
            for (var i2 = 0; i2 < this.links.length; i2 ++) {
                // links maybe double included, is that gonna be a problem?
                // nope, unless you want to optimize save file size and syntax
                if ( this.links[i2].slave == sphereNameArray[i]
                    || this.links[i2].master == sphereNameArray[i]) {
                    arrayOfRelevantLinks.push({
                        "master": this.links[i2].master,
                        "slave": this.links[i2].slave
                    })
                }
            }
        }
        return arrayOfRelevantLinks
    }


    removeSelected() {
        for ( var i = 0; i < this.selected.length; i ++) {
            this.removeLinks(this.selected[i])
            this.scene.remove(this.selected[i])
        }
    }

    runProgram(sphereName) {
        try {
            headText.add(eval(this.getWholeText(sphereName)))
        } catch (e) {
            headText.add(e.message)
        }
    }

    copySelected() {
        // todo, copy scale
        var newSpheres = []
        var relativePosition = [
            controller.controllerSphere[0].position.x
                - this.selected[0].position.x,
            controller.controllerSphere[0].position.y
                - this.selected[0].position.y,
            controller.controllerSphere[0].position.z
                - this.selected[0].position.z
        ]


        for ( var i = 0; i < this.selected.length; i ++) {
            var position = [
                this.selected[i].position.x + relativePosition[0],
                this.selected[i].position.y + relativePosition[1],
                this.selected[i].position.z + relativePosition[2]
            ]
            newSpheres.push(
                this.add(
                    position,
                    this.selected[i].children[0].geometry.parameters.text,
                    undefined,
                    this.selected[i].quaternion.toArray(),
                    this.selected[i].scale.toArray()
                )
            )
        }


        for ( var i = 0; i < this.selected.length; i ++) {
            for ( var i2 = 0; i2 < this.links.length; i2 ++) {
                if ( this.links[i2].slave == this.selected[i].name
                    || this.links[i2].master == this.selected[i].name ) {
                    if (this.find(this.links[i2].slave, this.selected) > -1
                        && this.find(this.links[i2].master, this.selected) > -1
                    ) {
                        this.link(
                            newSpheres[
                                this.find(this.links[i2].master, this.selected)
                            ].name,
                            newSpheres[
                                this.find(this.links[i2].slave, this.selected)
                            ].name
                        )
                    }
                }
            }
        }

    }

    fileName(sphere) {
        var text = this.getWholeText(sphere.name)
        if (text.substr(0, 2) == "/*") {
            return text.substr(2, text.indexOf("*/")-2)
        }
        return sphere.name
    }

    getWholeText(sphereName) {
        var self = this

        // get first
        for ( var i = 0; i < this.links.length; i ++) {
            if ( this.links[i].master == sphereName ) {
                sphereName = this.links[i].slave
                i = -1
            }
        }
        //headText.add(sphereName)
        if (typeof this.scene.getObjectByName(
            sphereName
        ) === "undefined") {
            console.warn("unhandeled error, no sphere with name " + sphereName)
            return
        }
        var chars = this.scene.getObjectByName(
            sphereName
        ).children[0].geometry.parameters.text

        // loop to last
        for ( var i = 0; i < this.links.length; i ++) {
            if ( this.links[i].slave == sphereName ) {
                sphereName = this.links[i].master
                chars += this.scene.getObjectByName(
                    sphereName
                ).children[0].geometry.parameters.text
                i = -1
            }
        }
        //headText.add(sphereName)
        return chars
    }

    detachSpheres(object) {
        var loop = true
        while (loop) {
            loop = false
            for (var i = 0; i < object.children.length; i ++) {
                if (object.children[i].geometry.type != "TextGeometry") {
                    THREE.SceneUtils.detach(object.children[i], object, this.scene)
                    object.updateMatrixWorld()
                    loop = true
                }
            }
        }
    }

    // master object, objects array of object names
    multiAttach(master, objects) {
        // updateMatrixWorld?
        master.updateMatrixWorld()
        for (var i = 0; i < objects.length; i ++) {
            THREE.SceneUtils.attach(
                this.scene.getObjectByName(objects[i]), OS.scene, master
            )
        }
    }

    // get all objects linked with a certain object, and the whole link chain
    getLinkedObjects(name) {
        var linked = [name]
        var populating = true
        while (populating) {
            populating = false
            for (var i = 0; i < this.links.length; i ++) {
                for (var i2 = 0; i2 < linked.length; i2 ++) {
                    if (this.links[i].master == linked[i2]) {
                        if (!linked.includes(this.links[i].slave)) {
                            populating = true
                            linked.push(this.links[i].slave)
                        }
                    } else if (this.links[i].slave == linked[i2]) {
                        if (!linked.includes(this.links[i].master)) {
                            populating = true
                            linked.push(this.links[i].master)
                        }
                    }
                }
            }
        }
        linked.shift()
        return linked
    }

    add(position, text, name, quaternion, scale) {
        /* if (this.spheres.length >= this.MAX_SPHERES) {
            console.log("Rendering limit exeeded")
            return false
		} */
		if (typeof text === "undefined") {
			text = " "
		}

        var cnt = Math.random()

        // todo: deal with id dublication bug, with uuids and object type
		if (typeof name === "undefined" || name == "generate") {
			name = "Sphere No. " + cnt
		}

        // deal with dublicate names automatically
        while (typeof this.scene.getObjectByName( name )  !== "undefined") {
            name = "Sphere No. " + cnt
            //cnt += 1
            cnt += Math.random()
        }


		// radius, segments along width, segments along height
		var sphere = new THREE.Mesh( this.sphereGeom.clone(), this.blueMaterial.clone() )


        sphere.material.side = THREE.DoubleSide

		sphere.name = name
		if (typeof position !== "undefined") {
		    if (typeof position[0] !== "undefined") {
                sphere.position.fromArray(position)
			} else {
                sphere.position.fromArray([position.x, position.y, position.z])
            }
		}
		if (typeof quaternion !== "undefined") {
            if (typeof quaternion[0] !== "undefined") {
                sphere.quaternion.fromArray(quaternion)
 			} else {
                sphere.quaternion.copy(quaternion)
            }
        }
		if (typeof scale !== "undefined") {
            if (typeof scale[0] !== "undefined") {
                sphere.scale.fromArray([scale[0], scale[0], scale[0]])
     		} else {
                sphere.scale.fromArray([scale, scale, scale])
            }
        }
        sphere.grabbable = true
        sphere.scalable = true
        sphere.controlled = true
		this.scene.add( sphere );

        // optimize with sphere.material.opacity

		var textGeometry = this.spawnText(text, sphere.position)

        THREE.SceneUtils.attach(textGeometry, OS.scene, sphere)

		this.spheres.push(sphere)

        return sphere
	}

    spawnText(text, position, textSize = 1) {

		var geometry = new THREE.TextGeometry( text, {
			font: OS.font,
			size: (80/5000) * textSize,
            height: (20/5000) * textSize,
			curveSegments: 2
		});


		var materials = [
			new THREE.MeshBasicMaterial( {
                color: 0x000000, overdraw: 0.5
            } )
		];

		var textGeometry = new THREE.Mesh( geometry, materials );

		textGeometry.position.copy(position)
		textGeometry.lookAt( OS.camera.position );

		OS.scene.add( textGeometry )

		return textGeometry
	}

    link(sphere1, sphere2) {
        if (typeof sphere1 === "undefined") {
            console.warn("sphere1 is undefined")
            return false
        }
        if (typeof sphere2 === "undefined") {
            console.warn("sphere2 is undefined")
            return false
        }

        var material = new THREE.LineBasicMaterial({
            color: 0x00ff00
        });

        var geometry = new THREE.Geometry();
        geometry.vertices.push(
            this.scene.getObjectByName(sphere1).position,
            this.scene.getObjectByName(sphere2).position
        );

        // check agaist double linking
        for (var i = 0; i < this.links.length; i ++) {
            if (this.links[i].master == sphere1) {
                if (this.links[i].slave == sphere2) {
                    return false
                }
            }

            if (this.links[i].master == sphere2) {
                if (this.links[i].slave == sphere1) {
                    return false
                }
            }
        }

        var line = new THREE.Line( geometry, material )
        this.scene.add( line )
        //line.controlled = true
        this.links.push({
            "master": sphere1,
            "slave": sphere2,
            "line": line,
            "linked": true,
            "merged": true
        })
        return true
    }

    updateWorldMatrices(object) {
        var parent = object;
        while (parent.parent != null) {
            parent.updateMatrixWorld();
            parent = parent.parent;
        }
    }

    updateLinks() {
    	for (var i = 0; i < this.links.length; i ++) {
            // todo: if this.links[i].line.visible,
            // in case of performance optimization, dont do recursive search
			if (typeof this.links[i].master === "undefined") {
			     console.warn(this.links[i])
     			 console.warn("invalid link")
			}
            this.links[i].line.visible = true
            var master = this.scene.getObjectByName(this.links[i].master, true)
            if (master.parent.type != "Scene") {
                // Failure to get object's child's child object's scene position
                /*this.updateWorldMatrices(master)
                var position = new THREE.Vector3()
                position.setFromMatrixPosition(master.matrixWorld)
                this.links[i].line.geometry.vertices[0].copy(
                    position
                )*/
                //this.links[i].line.geometry.vertices[0].copy(
                //    master.parent.matrixWorld.getPosition()
                //)
                this.links[i].line.visible = false
            } else {
                this.links[i].line.geometry.vertices[0].copy(
                    master.position
                )
            }

            var slave = this.scene.getObjectByName(this.links[i].slave, true)
            if (slave.parent.type != "Scene") {
                /*this.updateWorldMatrices(slave)
                var position = new THREE.Vector3()
                position.setFromMatrixPosition(slave.matrixWorld)
                this.links[i].line.geometry.vertices[1].copy(
                    position
                )*/
                //this.links[i].line.visible = false
                //this.links[i].line.geometry.vertices[1].copy(
                //    slave.parent.matrixWorld.getPosition()
                //)
                this.links[i].line.visible = false
            } else {
                this.links[i].line.geometry.vertices[1].copy(
                    slave.position
                )
            }

            if (!master.visible && !slave.visible) {
                this.links[i].line.visible = false
            }
            this.links[i].line.geometry.verticesNeedUpdate = true
        }
    }

    update() {
        // performance, update links only if moved
        //this.updateLinks()
    }
}
