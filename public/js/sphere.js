

//"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
// " .,()[]{};:=!?/*$#@_-+|&><\""
class Sphere {
	constructor() {
		var self = this
		this.scene = OS.scene
        this.controllerWrapper()
        this.defaultColor = 0xe6f9ff
		this.spheres = []
		this.links = []
		this.selected = []
		this.intersecting = [false, false]


        window.addEventListener("keypress", function (evt) {
            //self.add(controller.sphere[0].position, evt.key)
        });

		this.sphereGeom =  new THREE.SphereGeometry( 40/1000, 32/1000, 16/1000 );

		this.blueMaterial = new THREE.MeshBasicMaterial(
            { color: this.defaultColor, transparent: true, opacity: 0.5 }
        )
		this.allChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,()[]{};:=!?/*$#@_-+|&><\""
		
    }
	
	getSceneObject(object) {
		while(object.parent.type != "Scene") {
			if (spheres.isSphere(object.parent)) {
				object = object.parent
			} else {
				return object
			}
		}
		return object
	}
	
	
	
    controllerWrapper() {
    	var self = this
        window.addEventListener('buttonpressed', function (e) {
            if (e.detail.button == "A" && controller.buttonPressed['B']) {
               var sphere = self.add(controller.sphere[0].position)
				headText.add("Sphere added "+sphere.name)
            } else if (e.detail.button == "A" && self.selected.length > 0) {
                self.copySelected()
            }

            if (e.detail.button == "A") {
                if (controller.intersectingFromArray(RIGHT, spheres.spheres)) {
					compiler.compile(spheres.getGroup(controller.intersectingFromArray(RIGHT, spheres.spheres)))
                }
            }


            if (e.detail.button == "B" && controller.isGrabbing(RIGHT)) {
                //elf.removeStack(controller.getGrabbedObject(RIGHT))
            } else if (e.detail.button == "B" && self.selected.length > 0) {
                self.removeSelected()
            } else if (e.detail.button == "B") {
				var intersecting = controller.intersectingFromArray(RIGHT, spheres.spheres)
                if (intersecting) {
					//console.log("asd")
					//console.log(self.hasLinks(intersecting))
                    if (self.hasLinks(intersecting)) {
						headText.add("Links removed from "+intersecting.name)
                        self.removeLinks(intersecting)
                    } else {
                        self.removeSphere(intersecting)
                    }
                }
            }

            if (e.detail.button == "X") {
					console.log(controller.isGrabbing(RIGHT))
					console.log(controller.isGrabbing(LEFT))
                if (controller.isGrabbing(RIGHT) && controller.isGrabbing(LEFT)) {
					console.log(controller.getGrabbedObject(LEFT))
					console.log(controller.getGrabbedObject(RIGHT))
					headText.add(
						"linked: " + controller.getGrabbedObject(LEFT).name + " and " + controller.getGrabbedObject(RIGHT).name
					)
					
					// detach from controller	
		
					var sphere2 = controller.getGrabbedObject(LEFT);
					var sphere1 = controller.getGrabbedObject(RIGHT);
					//var sphere1 = THREE.SceneUtils.detach(controller.getGrabbedObject(LEFT), controller.sphere[1], OS.scene)
					
					controller.unGrab(LEFT)
					controller.unGrab(RIGHT)
					
					self.intelLink(
                        sphere1,
                        sphere2
                    )
					
					/*
                    self.link(
                        sphere1,
                        sphere2
                    )*/
					
					controller.grab(LEFT)
					//THREE.SceneUtils.attach(sphere1, OS.scene, controller.sphere[1])
                }

                if (controller.buttonPressed["Y"]) {
                    var intersecting = controller.intersectingGrabbableObject(1)
                    if (intersecting) {
                        headText.add(
                            "compiled text: " + self.getGroupText(
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
            /*if (typeof e.detail.object.name !== "undefined") {
                // check if name starts with sphere (otherwise you might brak fs sphere)
				if (e.detail.object.name.substr(0, 6) == "Sphere") {
					//console.log(self.getLinkedObjects(e.detail.object.name))
					self.multiAttach(
						e.detail.object,
						self.getLinkedObjects(e.detail.object.name)
					)
				}
            }*/
            //self.updateLinks()
			//console.log("grabstart "+controller.isGrabbing(RIGHT)+" "+controller.isGrabbing(LEFT));
			/*if (controller.isGrabbing(RIGHT) && controller.isGrabbing(LEFT)) {
				
				//onsole.log("grabstart "+controller.isGrabbing(RIGHT)+" "+controller.isGrabbing(LEFT));
				self.removeLinks(e.detail.object)
				headText.add("Snap connection "+e.detail.object.name);
			}*/
        })

        window.addEventListener('grabend', function (e) {
			/*
			if (typeof fs !== "undefined"){
					
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
			}*/
            //self.attachLine(e.detail.object)
			// if grabend sphere intersects fs sphere save it to fs sphere dir
        })

		window.addEventListener('joystickevent', function (e) {
			if (e.detail.rightOrLeft == LEFT) {
				//self.scaleWorld(e.detail.horizontalAxe)
                if (controller.isGrabbing(RIGHT)) {
                    self.charSelect(e.detail.verticalAxe, controller.getGrabbedObject(RIGHT))
                }
			}
		})

        window.addEventListener('buttonheld', function (e) {
			/* DEPRICATED 
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
            } */
        })

        window.addEventListener('buttonreleased', function (e) {
            if (e.detail.button == "L_TRIGGER"
                || e.detail.button == "R_TRIGGER") {
                self.unselect()
            }
        })

        window.addEventListener('controllerupdate', function (e) {
		    var intersectingNow = controller.intersectingFromArray(
                e.detail.rightOrLeft,
				self.spheres
            )
		    if (intersectingNow) {
				intersectingNow.material.opacity = 0.8
				
				// selecting
				//console.log("inters")
				if(controller.buttonPressed["L_TRIGGER"] && e.detail.rightOrLeft == LEFT || controller.buttonPressed["R_TRIGGER"] && e.detail.rightOrLeft == RIGHT) {
					//console.log("inters2")
					self.select(intersectingNow)
				}
						
				// started intersecting another
                if (self.intersecting[e.detail.rightOrLeft]) {
                    if (self.intersecting[e.detail.rightOrLeft].uuid
                        != intersectingNow.uuid
                    ) {
                        self.intersecting[
                            e.detail.rightOrLeft
                        ].material.opacity = 0.5
                    }
                }
                self.intersecting[e.detail.rightOrLeft] = intersectingNow
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
	
	intelLink(sphere1, sphere2) {
		if (!spheres.isSphere(sphere1)) {
			return null
		}
		if (!spheres.isSphere(sphere2)) {
			return null
		}
		if (sphere1.id == this.getFirst(sphere1) && sphere2.id == this.getLast(sphere2)) {
			this.link(sphere1, sphere2)
		}
		if (sphere2.id == this.getFirst(sphere2) && sphere1.id == this.getLast(sphere1)) {
			this.link(sphere2, sphere1)
		}
		this.link(this.getLast(sphere1), this.getFirst(sphere2))
	}
	
	
	charForward(sphere) {
		console.log("Forwards")
		//console.log(sphere)
		var newChar;
		for ( var i = 0; i < this.allChars.length; i ++) {
			//console.log("'" + this.allChars.charAt(i) + "' == '" + this.getTextByName(sphere) + "'")
			//console.log((this.allChars.charAt(i) == this.getTextByName(sphere)))
			if ( this.allChars.charAt(i) == this.getText(sphere) ) {
				if (i < this.allChars.length-1) {
					newChar = this.allChars.charAt(i + 1)
					this.setText(sphere, newChar)
					return;
				} else {
				}
			}
		}

	}

	charBackward(sphere) {
		console.log("Backwards")
		for ( var i = 0; i < this.allChars.length; i ++) {
			if ( this.allChars.charAt(i) == this.getText(sphere) ) {
				if (i > 0) {
					this.setText(sphere, this.allChars.charAt(i - 1))
				}
			}
		}
	}
	
    charSelect(axe, sphere) {
		var self = this

		if (this.hasLinks(sphere)) {
			return;
		}

		if (!this.breaks) {
			console.log(axe)
			if (axe > 0) {
				this.charForward(sphere)
			} else {
				this.charBackward(sphere)
			}
			this.breaks = true
			setTimeout(function () {
				self.breaks = false
			}, 500 * (1 - Math.abs(axe)) )
		}
    }

    removeGroup(group) {
		console.log(group)
        for ( var i = 0; i < group.length; i ++) {
            var sphere = group[i]

			for ( var i2 = 0; i2 < spheres.spheres.length; i2 ++) {
				if (sphere.id == spheres.spheres[i2].id) {
					spheres.spheres.shift(i2)
					i2 = 0
				}
			}
			for ( var i2 = 0; i2 < spheres.links.length; i2 ++) {
				if (sphere.name == spheres.master) {
					spheres.links.shift(i2)
					i2 = 0
				}
			}
			this.removeLinks(sphere)
			this.scene.remove(sphere)
			controller.sphere[0].remove(sphere)
        }


    }

	unpack(object) {
		console.log(object)
		if (typeof object.serialized.length < 0) {
			return
		}
		this.jsonToSphere(object.serialized)
        controller.sphere[0].remove(object)
	}
	
	pack(object) {
		if (!spheres.hasLinks(object)) {
			return
		}
		var pack = this.add(
			controller.sphere[0].position.toArray(),
			this.getGroupText(this.getGroup(object)),
			undefined,
			undefined,
			1.1
		)
		pack.serialized = this.sphereToJson(object)
		//console.log(object.serialized)
        this.removeGroup(this.getGroup(object))
	}
	

    getText(object){
		if (typeof object === "undefined") {
			console.warn("getting text in drunken ways")
		}
		if (object != null) {
			for (var i = 0; i < object.children.length; i ++) {
				if (typeof object.children[i].geometry == "undefined") {
					continue
				}
				if (object.children[i].geometry.type == "TextGeometry") {
					return object.children[i].geometry.parameters.text
				}
			}
		}
        return ""
    }

    isSphere(sphere) {
		if (typeof(sphere) === "undefined") {
			return false
		}
		
        if (sphere.name.substr(0, 6) == "Sphere") {
            return true
        } else {
            return false
        }
    }
	
	removeText(object) {
		for (var i = 0; i < object.children.length; i ++) {
			if (typeof object.children[i].geometry == "undefined") {
				continue
			}
			if (object.children[i].geometry.type == "TextGeometry") {
				var id = object.children[i].id
				THREE.SceneUtils.detach(
					object.children[i],
					object,
					OS.scene
				)
				OS.scene.remove(OS.scene.getObjectById( id, true ));
			}
		}
	}

	setText(sphere, _text) {
		this.removeText(sphere);
		//OS.scene.updateMatrixWorld()
		
		//var textGeometry = this.spawnText(_text, sphere.position)
		var textGeometry = this.spawnText(_text, getMatrixPosition(sphere), sphere.quaternion)
		OS.scene.updateMatrixWorld()
        THREE.SceneUtils.attach(textGeometry, OS.scene, sphere)
		//var newSphere = this.add(sphere.position, _text, sphere.name, sphere.quaternion, sphere.scale.x);
		headText.add("setting char to "+_text);
		//if (controller.getGrabbedObject(RIGHT).name == sphere.name) {
		//	controller.grabObject(newSphere, RIGHT);
		//}
	}
	
	
    select(sphere) {
        if (!this.isSphere(sphere)) {
            return
        }
        sphere.material.color.setHex( 0xffff77 )
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
	/*sphereToJson2(sphere) {
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
    }*/

    // make json of sphere and all linked spheres snd their links
	sphereToJson(sphere) {
        var sphereGroup = this.getGroup(sphere)
		console.assert(sphere == null, sphere)
		
		var spheresOut = []
        for ( var i = 0; i < sphereGroup.length; i ++) {
			OS.scene.updateMatrixWorld();
            var worldPosition = new THREE.Vector3()
            sphereGroup[i].getWorldPosition(worldPosition)
            var worldScale = new THREE.Vector3()
            sphereGroup[i].getWorldScale(worldScale)
			var worldQuaternion = new THREE.Quaternion()
			sphereGroup[i].getWorldQuaternion(worldQuaternion);
            spheresOut.push({
                "position": worldPosition.toArray(),
                "text": this.getText(sphereGroup[i]),
                "name": sphereGroup[i].name,
                "quaternion": worldQuaternion.toArray(),
                "scale": worldScale.toArray(),
                "serialized": sphereGroup[i].serialized
            })
        }
		var links = []
        for ( var i = 0; i < sphereGroup.length; i ++) {
		}
        return JSON.stringify({"spheres": spheresOut, "links": this.getRelevantLinks(sphereGroup)}, 0, 4)
    }

    jsonToSphere2(json) {
        //console.log(json)

        // todo: align to controller right
        var saveData = JSON.parse(json)

        var relativePosition = [
            controller.sphere[0].position.x
                - saveData[0][0].position[0],
            controller.sphere[0].position.y
                - saveData[0][0].position[1],
            controller.sphere[0].position.z
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
	
    jsonToSphere(json) {
		if (json.length < 1) {
			return;
		}
        console.log(json)

        // todo: align to controller right
        var saveData = JSON.parse(json)
        console.log(saveData)

		if (saveData.spheres.length == 0) {
			return null
		}

		// coordinate it to the left hand
        var relativePosition = [
            controller.sphere[LEFT].position.x
                - saveData.spheres[0].position[0],
            controller.sphere[LEFT].position.y
                - saveData.spheres[0].position[1],
            controller.sphere[LEFT].position.z
                - saveData.spheres[0].position[2]
        ]


        for ( var i = 0; i < saveData.spheres.length; i ++) {
            if (OS.scene.getObjectByName(saveData.spheres[i].name) != null) {
				console.info("cannot double load a project")
				return "cannot double load a project";
			}
		}

        for ( var i = 0; i < saveData.spheres.length; i ++) {


            var position = [
                saveData.spheres[i].position[0] + relativePosition[0],
                saveData.spheres[i].position[1] + relativePosition[1],
                saveData.spheres[i].position[2] + relativePosition[2]
            ]

            this.add(
                position,
                saveData.spheres[i].text,
                saveData.spheres[i].name,
                saveData.spheres[i].quaternion,
                saveData.spheres[i].scale,
                saveData.spheres[i].serialized
            )
        }

		OS.scene.updateMatrixWorld()

		setTimeout(function() {
        for ( var i = 0; i < saveData.links.length; i ++) {
            spheres.link(
                saveData.links[i].master,
                saveData.links[i].slave
            )
			console.log("link "+i)
        }}, 500);
    }

    removeLinks(sphere) {
		//console.log("Links removed from "+sphere.name)
        for (var i = 0; i < this.links.length; i ++) {
            if ( this.links[i].slave == sphere.name
                || this.links[i].master == sphere.name) {
					
				//console.log(OS)
				//console.log(typeof OS.scene.getObjectById)
				//console.log(this.links[i].arrow)
				// just hide it?
                OS.scene.getObjectById(this.links[i].arrow.id).visible = false
				
				
				
				// detach spheres
				if (this.links[i].master == sphere.name) {
					OS.scene.updateMatrixWorld()
					THREE.SceneUtils.detach(OS.scene.getObjectByName(this.links[i].slave), sphere, OS.scene)
					//sphere.position.copy(positionSave);
				}
				if (this.links[i].slave == sphere.name) {
					var positionSave = getMatrixPosition(sphere)
					var scaleSave = new THREE.Vector3()
					OS.scene.updateMatrixWorld()
					sphere.getWorldScale(scaleSave)
					THREE.SceneUtils.detach(OS.scene.getObjectByName(this.links[i].slave), sphere, OS.scene)
					sphere.position.copy(positionSave);
					sphere.scale.copy(scaleSave);
				}
				//sphere.parent = OS.scene
                this.links.splice(i, 1)
                //sthis.removeLinks(sphere)s
            }
        }
    }
	
	removeSphere(sphere) {
		this.spheres = this.spheres.filter(function(value, index, arr){
			return value.id != sphere.id
		})
		
		controller.grabbableObjects = controller.grabbableObjects.filter(function(value, index, arr){
			return value.id != sphere.id
		})
		
		sphere.parent.remove(sphere)
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

    getRelevantLinks(sphereGroup) {
        var arrayOfRelevantLinks = []
        for ( var i = 0; i < sphereGroup.length; i ++) {
            for (var i2 = 0; i2 < this.links.length; i2 ++) {
                // links maybe double included, is that gonna be a problem?
                // nope, unless you want to optimize save file size and syntax
                if (this.links[i2].master == sphereGroup[i].name) {
                    arrayOfRelevantLinks.push({
                        "master": this.links[i2].master,
                        "slave": this.links[i2].slave
                    })
                }
            }
        }
        return arrayOfRelevantLinks
    }
	/*
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
    }*/


    removeSelected() {
        for ( var i = 0; i < this.selected.length; i ++) {
            this.removeLinks(this.selected[i])
            this.removeSphere(this.selected[i])
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
		headText.add("Copying "+ this.selected.length)
		
        var newSpheres = []
		OS.scene
		var controllerPos = getMatrixPosition(controller.sphere[0])
		var firstSelectedPos = getMatrixPosition(this.selected[0])
		
        var relativePosition = [
            controllerPos.x
                - firstSelectedPos.x,
            controllerPos.y
                - firstSelectedPos.y,
            controllerPos.z
                - firstSelectedPos.z
        ]
		/*
        var relativePosition = [
            controller.sphere[0].position.x
                - this.selected[0].position.x,
            controller.sphere[0].position.y
                - this.selected[0].position.y,
            controller.sphere[0].position.z
                - this.selected[0].position.z
        ]*/


        for ( var i = 0; i < this.selected.length; i ++) {
			var selectedPos = getMatrixPosition(this.selected[i])
            var position = [
                selectedPos.x + relativePosition[0],
                selectedPos.y + relativePosition[1],
                selectedPos.z + relativePosition[2]
            ]
            newSpheres.push(
                this.add(
                    position,
                    this.getText(this.selected[i]),
                    undefined,
                    this.selected[i].quaternion.toArray(),
                    this.selected[i].scale.toArray()
                )
            )
        }

        for ( var i = 0; i < this.selected.length; i ++) {
            for ( var i2 = 0; i2 < this.links.length; i2 ++) {
                if (this.links[i2].master == this.selected[i].name ) {
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

	getFirst(sphere) {
		if (sphere == undefined) {
			return null
		}
        for ( var i = 0; i < this.links.length; i ++) {
            if ( this.links[i].slave == sphere.name ) {
                sphere = OS.scene.getObjectByName(this.links[i].master, true)
				i = -1
				if (sphere == undefined) {
					console.warn("Broken link at "+this.links[i].master)
					return null
				}
            }
        }
		return sphere
	}
	
	loopToLast(sphere, callOnEach) {
	}
	
	getLast(sphere) {
		if (sphere == null) {
			return null
		}
		
        for ( var i = 0; i < this.links.length; i ++) {
            if ( this.links[i].master == sphere.name ) {
                sphere = OS.scene.getObjectByName(this.links[i].slave, true)
				if (sphere == null) {
					console.warn("Broken link at "+sphere.name)
				}
                i = -1
            }
        }
		return sphere
	}
	
    getGroup(sphere) {
		var spheresArray = []
		
		var sphere = this.getFirst(sphere);
		spheresArray.push(sphere)
        for ( var i = 0; i < this.links.length; i ++) {
			if (sphere == null) {
				return null
			}
			
            if ( this.links[i].master == sphere.name ) {
                sphere = OS.scene.getObjectByName(this.links[i].slave, true)
				if (sphere == null) {
					console.warn("Broken link at "+sphere.name)
				} else {
					spheresArray.push(sphere)
				}
                i = -1
            }
        }
		//console.log("here")
		//console.log(spheresArray)
		return spheresArray;
	}

    getGroupText(sphere) {
		if (typeof spheres.children === "undefined") {
			sphere = sphere[0]
		}
		//console.log(sphere)
		//console.log("GT")
        var self = this
		
        if (typeof sphere === "string") {
			sphere = OS.scene.getObjectByName(sphere, true)
		}
		
		var sphere = this.getFirst(sphere)
		//console.log(sphere)
		var chars = this.getText(sphere);
		
        for ( var i = 0; i < this.links.length; i ++) {
			if (sphere == null) {
				return null
			}
            if ( this.links[i].master == sphere.name ) {
                sphere = OS.scene.getObjectByName(this.links[i].slave, true)
				if (sphere == null) {
					console.warn("Broken link at "+sphere.name)
				}
				chars = this.getText(sphere) + chars
                i = -1
            }
        }
	
		
		/*
		while (sphere.children.length) {
			ret += spheres.getText(sphere)
			var id = sphere.uuid
			for (var i = 0; i < sphere.children; i ++) {
				if (spheres.isSphere(sphere.children[i])) {
					sphere = sphere.children[i];
				}
			}
			if (id == sphere.uuid) {
				break;
			}
		}*/
		//chars = chars.split("").reverse().join("")
		return chars;
	}
    getWholeText(sphere) {
        var self = this

        if (typeof sphere === "string") {
			sphere = OS.scene.getObjectByName(sphere, true)
		}
        // get first
        for ( var i = 0; i < this.links.length; i ++) {
            if ( this.links[i].master == sphere.name ) {
                sphere.name = this.links[i].slave
                i = -1
            }
        }
        //headText.add(sphereName)
        if (typeof this.scene.getObjectByName(
            sphere.name
        ) === "undefined") {
            console.warn("unhandeled error, no sphere with name " + spherev)
            return
        }
        var chars = this.getText(sphere)

        // loop to last
        for ( var i = 0; i < this.links.length; i ++) {
            if ( this.links[i].slave == sphere.name ) {
                sphere = OS.scene.getObjectByName(this.links[i].master, true)
				if (sphere == null) {
					console.warn("Broken link at "+sphere.name)
				}
                chars += this.getText(sphere)
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
				if (typeof object.children[i].geometry === "undefined") {
					continue;
				}
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
        // updateMatrixWorld
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

    add(position, text, name, quaternion, scale, serialized) {
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

		if (typeof this.scene.getObjectByName( name )  !== "undefined") {
			//OS.scene.remove(this.scene.getObjectByName( name ))
			this.removeSphere(this.scene.getObjectByName( name ))
		}
/*
        // deal with dublicate names automatically
        while (typeof this.scene.getObjectByName( name )  !== "undefined") {
            name = "Sphere No. " + cnt
            //cnt += 1
            cnt += Math.random()
        }
		
*/

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
		if (typeof serialized !== "undefined") {
			sphere.serialized = ""
		} else {
			sphere.serialized = serialized
		}
		controller.grabbableObjects.push(sphere);
        sphere.scalable = true
        sphere.controlled = true
		sphere.serialized = ""
		this.scene.add( sphere );

        // optimize with sphere.material.opacity
		OS.scene.updateMatrixWorld()

		var textGeometry = this.spawnText(text, sphere.position)
		OS.scene.updateMatrixWorld()
		textGeometry.lookAt(OS.camera.position)
        THREE.SceneUtils.attach(textGeometry, OS.scene, sphere)
		//OS.scene.updateMatrixWorld()
        //THREE.SceneUtils.attach(textGeometry, sphere, OS.scene)

		//
		this.spheres.push(sphere)

		// 	this.resetTextPosition(sphere)
        return sphere
	}
	
	resetTextPosition(sphere) {
		// spheres.resetTextPosition(var sphere = spheres.spheres[0])
		/* THREE.SceneUtils.detach(spheres.spheres[0].children[0], spheres.spheres[0], OS.scene)
		OS.scene.updateMatrixWorld()
		OS.scene.updateMatrixWorld()
        THREE.SceneUtils.detach(sphere.textGeometry, OS.scene, sphere)
		OS.scene.updateMatrixWorld()
		sphere.textGeometry.geometry.lookAt(OS.camera.position)
        THREE.SceneUtils.attach(sphere.textGeometry, sphere, OS.scene)
		OS.scene.updateMatrixWorld()
		OS.scene.updateMatrixWorld()
		THREE.SceneUtils.detach(sphere.textGeometry, sphere, OS.scene)
		OS.scene.updateMatrixWorld()
		sphere.children[0].lookAt(OS.camera.position)*/
		
	}
	
	linkGroup(group) {
		for (var i = 0; i < group.length; i ++) {
			if (typeof group[i+1] === "undefined") {
				continue;
			}
			this.link(group[i], group[i+1])
		}
	}

    spawnText(text, position, quaterion, textSize = 1) {
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

		if (typeof quaterion === "undefined") {
			//OS.scene.updateMatrixWorld()
		} else {
			textGeometry.quaternion.copy(quaterion)
		}
		
		
		
		
		//console.assert(typeof quaternion !== "undefined")
		// <3
		//
		
		textGeometry.position.copy(position)
		//textGeometry.quaternion.copy(quaterion)
		//textGeometry.rotation.copy(rotation)
		//textGeometry.lookAt( OS.camera.position );

		OS.scene.add( textGeometry )

		return textGeometry
	}

	link(sphere1, sphere2) {
		var name1;
		var name2;
        if (typeof sphere1 === "undefined") {
            console.warn("sphere1 is undefined")
            return false
        }
        if (typeof sphere2 === "undefined") {
            console.warn("sphere2 is undefined")
            return false
        }
        if (typeof sphere1 === "string") {
			name1 = sphere1;
			sphere1 = OS.scene.getObjectByName(sphere1, true)
		}
        if (typeof sphere2 === "string") {
			name2 = sphere2;
			sphere2 = OS.scene.getObjectByName(sphere2, true)
		}
        if (sphere1 == null) {
            console.warn("broken link "+ name1)
            return false
		}
        if (sphere2 == null) {
            console.warn("broken link "+ name2)
            return false
		}
        if (!spheres.isSphere(sphere1)) {
            console.warn("not a sphere "+ sphere1.name)
            return false
		}
        if (!spheres.isSphere(sphere2)) {
            console.warn("not a sphere "+ sphere2.name)
            return false
		}
		//sphere1 = getSceneParent(sphere1);
		//sphere2 = getSceneParent(sphere2);
		
		OS.scene.updateMatrixWorld();
		var pos1 = new THREE.Vector3();
		pos1.setFromMatrixPosition( sphere1.matrixWorld );
		
		var pos2 = new THREE.Vector3();
		pos2.setFromMatrixPosition( sphere2.matrixWorld );
		
				
		var dir = new THREE.Vector3().subVectors(pos1, pos2);

		dir.normalize();

		var origin = pos2
		var length = pos1.distanceTo(pos2)
		var hex = 0x00ff00;

		var arrow = new THREE.ArrowHelper( dir, origin, length, hex );
		//arrow.visible = false
		OS.scene.add( arrow );

        // check agaist double linking
        for (var i = 0; i < this.links.length; i ++) {
            if (this.links[i].master == sphere1.name) {
                if (this.links[i].slave == sphere2.name) {
					console.warn("double link master")
                    return false
                }
            }

            if (this.links[i].master == sphere2.name) {
                if (this.links[i].slave == sphere1.name) {
					console.warn("double link slave")
                    return false
                }
            }
        }
		
		
			//textGeometry.lookAt( OS.camera.position );
			// git clone https://thaiwash@bitbucket.org/thaiwash/avrose.git
		OS.scene.updateMatrixWorld();
		
		THREE.SceneUtils.attach(arrow, OS.scene, sphere1)
		THREE.SceneUtils.attach(sphere2, OS.scene, sphere1)

        //THREE.SceneUtils.attach(line, OS.scene, this.scene.getObjectByName(sphere1))
        //line.controlled = true
        this.links.push({
            "master": sphere1.name,
            "slave": sphere2.name,
            "arrow": arrow,
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
}
