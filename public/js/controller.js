/*

todo: calibrate controllers

*/

class Controller {
	constructor() {
		//this.ready = false
		this.raycaster = new THREE.Raycaster()
		this.scene = OS.scene
        this.RIGHT_HAND = 0
        this.LEFT_HAND = 1
		var self = this


		// radius, segments along width, segments along height
		var sphereGeom =  new THREE.SphereGeometry(
            40/1000, 32/1000, 32/1000
        )

		// math sphere
		this.mathSphere = [
            new THREE.Sphere(new THREE.Vector3(), 40/1000),
            new THREE.Sphere(new THREE.Vector3(), 40/1000)
        ]


		// overlapping translucent red/green/blue spheres
		var greenMaterial = new THREE.MeshBasicMaterial(
            { color: 0x0000FF, transparent: true, opacity: 0.1 }
        )
        greenMaterial.depthWrite = false
		var greenMaterialGrabbing = new THREE.MeshBasicMaterial(
            { color: 0x0000FF, transparent: true, opacity: 0.2 }
        )
        greenMaterialGrabbing.depthWrite = false
		var sphere = new THREE.Mesh( sphereGeom.clone(), greenMaterial )

		this.controllerSphere = [
			new THREE.Mesh( sphereGeom.clone(), greenMaterial ),
			new THREE.Mesh( sphereGeom.clone(), greenMaterial )
		]
		this.scene.add( this.controllerSphere[0] )
		this.scene.add( this.controllerSphere[1] )

		this.controllerGrabbingSphere = [
			new THREE.Mesh( sphereGeom.clone(), greenMaterialGrabbing ),
			new THREE.Mesh( sphereGeom.clone(), greenMaterialGrabbing )
		]
		this.scene.add( this.controllerGrabbingSphere[0] )
		this.scene.add( this.controllerGrabbingSphere[1] )

		this.controllerGrabbingSphere[0].visible = false
		this.controllerGrabbingSphere[1].visible = false

/* -0.08394855260848999, -0.06598687171936035, -0.06598687171936035

*/

        this.pointingSphere = [
        	new THREE.Mesh( sphereGeom.clone(), greenMaterial ),
        	new THREE.Mesh( sphereGeom.clone(), greenMaterial )
    	]
    	this.scene.add( this.pointingSphere[0] )
        this.scene.add( this.pointingSphere[1] )

        this.pointingSphere[0].updateMatrixWorld()
        this.pointingSphere[0].position.x =
            this.pointingSphere[0].position.x - 0.08394855260848999
        this.pointingSphere[0].position.y =
            this.pointingSphere[0].position.y - 0.06598687171936035
        this.pointingSphere[0].position.z =
            this.pointingSphere[0].position.z - 0.06598687171936035

        this.pointingSphere[1].updateMatrixWorld()
        this.pointingSphere[1].position.x =
            this.pointingSphere[1].position.x - 0.08394855260848999
        this.pointingSphere[1].position.y =
            this.pointingSphere[1].position.y - 0.06598687171936035
        this.pointingSphere[1].position.z =
            this.pointingSphere[1].position.z - 0.06598687171936035

        this.pointingSphere[0].updateMatrixWorld()
        this.controllerSphere[0].updateMatrixWorld()
        THREE.SceneUtils.attach(
            this.pointingSphere[0],
            this.scene,
            this.controllerSphere[0]
        )
        this.pointingSphere[1].updateMatrixWorld()
        this.controllerSphere[1].updateMatrixWorld()
        THREE.SceneUtils.attach(
            this.pointingSphere[1],
            this.scene,
            this.controllerSphere[1]
        )


        var material = new THREE.LineBasicMaterial({
            color: 0x0000ff
        })

        var geometry = new THREE.Geometry();
        geometry.vertices.push(
            this.controllerSphere[0].position,
            this.controllerSphere[1].position
        )

        var line = new THREE.Line( geometry.clone(), material.clone() )
        this.pointingLine = [
            new THREE.Line( geometry.clone(), material.clone() ),
            new THREE.Line( geometry.clone(), material.clone() )
        ]
        this.pointingLine[0].visible = false
        this.pointingLine[1].visible = false
		this.scene.add( this.pointingLine[0] )
		this.scene.add( this.pointingLine[1] )


        this.pointingSphere[0].visible = false
        this.pointingSphere[1].visible = false

		// controller.controllerGrabbingSphere[0].intersectsSphere(controller.controllerSphere[0].intersectsSphere)

        this.buttonMap = {
			"R_JOYSTICK": [0, 0],
			"L_JOYSTICK": [1, 0],
			"R_TRIGGER": [0, 1],
			"L_TRIGGER": [1, 1],
			"R_GRIP": [0, 2],
			"L_GRIP": [1, 2],
    		"A": [0, 3],
    		"X": [1, 3],
    		"B": [0, 4],
    		"Y": [1, 4]
		}

		this.buttonPressed = {
			"A": false,
			"B": false,
			"X": false,
			"Y": false,
			"L_GRIP": false,
			"R_GRIP": false,
			"L_TRIGGER": false,
			"R_TRIGGER": false,
			"R_JOYSTICK": false,
			"L_JOYSTICK": false
		}

        this.buttonPressedEvent = {}
        this.buttonHeldEvent = {}
        this.buttonReleasedEvent = {}

		var keys = Object.keys(this.buttonPressed)
		for (var i = 0; i < keys.length; i ++) {
			var key = keys[i]
			//console.log(key)
			this.buttonPressedEvent[key] = new CustomEvent('buttonpressed', {
                detail: { button: key }
            })
			this.buttonHeldEvent[key] = new CustomEvent('buttonheld', {
                detail: { button: key }
            })
			this.buttonReleasedEvent[key] = new CustomEvent('buttonreleased', {
                detail: { button: key }
            })
		}

    	this.updateEvent = []
        this.updateEvent.push(
            new CustomEvent('controllerupdate', { detail: { rightOrLeft: 0 }})
        )
        this.updateEvent.push(
            new CustomEvent('controllerupdate', { detail: { rightOrLeft: 1 }})
        )

		this.grabTimer = []
        this.controller = []
		this.grippedObjectPosition = [new THREE.Vector3(), new THREE.Vector3()]
		this.controllerPosition = [new THREE.Vector3(), new THREE.Vector3()]
		this.controllerRotation = [new THREE.Quaternion(), new THREE.Quaternion()]
		this.newControllerPosition = [new THREE.Vector3(), new THREE.Vector3()]
		this.newControllerRotation = [new THREE.Quaternion(), new THREE.Quaternion()]
		this.grippedObject = [false, false]

        this.sphereCollider = new THREE.Sphere()
        this.boxCollider = new THREE.Box3()


        window.addEventListener('buttonpressed', function (e) {
            if (e.detail.button == "R_GRIP") {
                self.grip(0)
            }
            if (e.detail.button == "L_GRIP") {
                self.grip(1)
            }
        })
        window.addEventListener('buttonreleased', function (e) {
            if (e.detail.button == "R_GRIP") {
                self.unGrip(0)
            }
            if (e.detail.button == "L_GRIP") {
                self.unGrip(1)
            }
        })

        this.dir = [new THREE.Vector3(), new THREE.Vector3()]
        this.helperPos = [new THREE.Vector3(), new THREE.Vector3()]
	}

	update() {
		this.gamepads = navigator.getGamepads()

		for (var i = 0; i < this.gamepads.length; i ++) {
			if (this.gamepads[i].id == "Oculus Touch (Right)") {
				if (this.gamepads[i].pose.position != null) {
					this.handleController(this.gamepads[i], 0)

				}
			}
			if (this.gamepads[i].id == "Oculus Touch (Left)") {
				if (this.gamepads[i].pose.position != null) {
					this.handleController(this.gamepads[i], 1)
				}
			}
		}
	}

	// check if the controller is touched or not
	isTouching(rightOrLeft = 0) {
		var touching = false
        if (typeof this.controller[rightOrLeft] !== "undefined") {
            if (typeof this.controller[rightOrLeft].buttons !== "undefined") {
        		for (var i = 0; i < this.controller[rightOrLeft].buttons.length; i ++) {
        			if (this.controller[rightOrLeft].buttons[i].touched) {
        				touching = true
        			}
        		}
            }
        }
		return touching
	}


	buttonTest(controller) {
    		for (var i = 0; i < controller.buttons.length; i ++) {
    			if (controller.buttons[i].pressed) {
    				//spheres.debug("button " + i)
    			}
    		}
	}

    intersecting(object, rightOrLeft) {
        if (!object) {
            return false
        }

        if (object.geometry.type == "Geometry") {
            this.sphereCollider.center.copy(object.position)
            if (object.geometry.boundingSphere === null) {
                //console.warn("Geometry dont seem to be a sphere")
                return false
            }
            this.sphereCollider.radius =
                (object.geometry.boundingSphere.radius * object.scale.x)
            if (this.sphereCollider.intersectsSphere(
                this.mathSphere[rightOrLeft]
            )) {
                return true
            }
        } else if (object.geometry.type == "BoxGeometry") {
            this.boxCollider.setFromObject(object)
            if (this.boxCollider.intersectsSphere(this.mathSphere[rightOrLeft])) {
                return true
            }
        }
        return false
    }

    // check if were intersecting any grabbable objects, if we are, return that object
    intersectingGrabbableObject(rightOrLeft) {
		var nearestGrabbable = false

        // get nearest grabbable
        for (var i = 0; i < this.scene.children.length; i ++) {
            if (typeof this.scene.children[i].grabbable !== "undefined") {
                if (this.scene.children[i].grabbable) {
                    this.mathSphere[rightOrLeft].distanceToPoint(
                        this.scene.children[i].position
                    )

                    if (nearestGrabbable) {
    					if (this.mathSphere[rightOrLeft].distanceToPoint(
                            nearestGrabbable.position) >
                            this.mathSphere[rightOrLeft].distanceToPoint(
                                this.scene.children[i].position)
                            ) {
    						nearestGrabbable = this.scene.children[i]
    					}
    				} else {
    					nearestGrabbable = this.scene.children[i]
    				}
                }
            }
        }


        if (!this.intersecting(nearestGrabbable, rightOrLeft)) {
            return false
        } else {
            return nearestGrabbable
        }
        /* moved to intersecting
        if (!nearestGrabbable) {
            return false
        }

        // Assume sphere
        if (nearestGrabbable.geometry.type == "Geometry") {
            this.sphereCollider.center.copy(nearestGrabbable.position)
            if (nearestGrabbable.geometry.boundingSphere === null) {
                //console.warn("Geometry dont seem to be a sphere")
                return false
            }
            this.sphereCollider.radius =
                nearestGrabbable.geometry.boundingSphere.radius
            if (this.sphereCollider.intersectsSphere(
                this.mathSphere[rightOrLeft]
            )) {
                return nearestGrabbable
            }
        } else if (nearestGrabbable.geometry.type == "BoxGeometry") {
            this.boxCollider.setFromObject(nearestGrabbable)
            if (this.boxCollider.intersectsSphere(this.mathSphere[rightOrLeft])) {
                return nearestGrabbable
            }
        }

        return false*/
    }

    grabObject(object, rightOrLeft) {
        var self = this
        object.scalable = false

        this.controllerPosition[rightOrLeft].copy(
            this.controllerSphere[rightOrLeft].position
        )
        this.controllerRotation[rightOrLeft].copy(
            this.controllerSphere[rightOrLeft].quaternion
        )

        this.grippedObject[rightOrLeft] = object
        this.grippedObjectPosition[rightOrLeft].copy(object.position)

        // ongoing grip, until ungripped
        this.grabTimer[rightOrLeft] = setInterval(function() {
            self.newControllerPosition[rightOrLeft].copy(
                self.controllerSphere[rightOrLeft].position
            )
            self.newControllerRotation[rightOrLeft].copy(
                self.controllerSphere[rightOrLeft].quaternion
            )

            // move grabbed object
            var xyz = ["x", "y", "z"]
            for (var i = 0; i < xyz.length; i++) {
                object.position[xyz[i]] =
                self.grippedObjectPosition[rightOrLeft][xyz[i]] +
                ( self.newControllerPosition[rightOrLeft][xyz[i]] -
                    self.controllerPosition[rightOrLeft][xyz[i]] )
            }

            // rotate grabbed object
            self.newControllerRotation[rightOrLeft].multiplyQuaternions(
                self.newControllerRotation[rightOrLeft],
                self.controllerRotation[rightOrLeft].inverse())
            object.quaternion.multiplyQuaternions(
                controller.newControllerRotation[rightOrLeft],
                object.quaternion
            )
            self.controllerRotation[rightOrLeft].copy(
                self.controllerSphere[rightOrLeft].quaternion)
        },50)
    }

	grip(rightOrLeft) {
		this.controllerGrabbingSphere[rightOrLeft].visible = true
		this.controllerSphere[rightOrLeft].visible = false
        var grabbable = this.intersectingGrabbableObject(rightOrLeft)

        if (grabbable) {
            var event = new CustomEvent('grabstart', {
                detail: {
                    "rightOrLeft": rightOrLeft,
                    "object": grabbable
                }
            })
            window.dispatchEvent(event)
            this.grabObject(grabbable, rightOrLeft)
	    }
	}

	unGrip(rightOrLeft) {
    	this.controllerGrabbingSphere[rightOrLeft].visible = false
    	this.controllerSphere[rightOrLeft].visible = true
        if (!this.grippedObject[rightOrLeft]) {
            return
        }
        this.grippedObject[rightOrLeft].scalable = true
        var event = new CustomEvent('grabend', {
            detail: {
                "rightOrLeft": rightOrLeft,
                "object": this.grippedObject[rightOrLeft]
            }
        })
        window.dispatchEvent(event)


        this.grippedObject[rightOrLeft] = false
		clearInterval(this.grabTimer[rightOrLeft])
	}

    handleButtons(controller, rightOrLeft) {
        for (var i = 0; i < Object.keys(this.buttonMap).length; i ++) {
            var label = Object.keys(this.buttonMap)[i]
            var hand = this.buttonMap[label][0]
            if (hand != rightOrLeft) {
                continue
            }

            var button = this.buttonMap[label][1]

        	if (controller.buttons[button].pressed) {
                window.dispatchEvent(this.buttonHeldEvent[label]);
                if (!this.buttonPressed[label]) {
        		    this.buttonPressed[label] = true
        			window.dispatchEvent(this.buttonPressedEvent[label]);
                }
        	} else {
        		if (this.buttonPressed[label]) {
                    this.buttonPressed[label] = false
        			window.dispatchEvent(this.buttonReleasedEvent[label]);
        		}
        	}
	    }

        // joystick
        if (controller.axes[0] || controller.axes[1]) {
            var event = new CustomEvent('joystickevent', {
                detail: {
                    "rightOrLeft": rightOrLeft,
                    "verticalAxe": controller.axes[0],
                    "horizontalAxe": controller.axes[1]
                }
            })
            window.dispatchEvent(event)
        }
	}

    // todo: determine active side
	point(objects, rightOrLeft) {
		for ( var i = 0; i < objects.length; i++ ) {
			if (typeof objects[i].uv !== "undefined") {
    			if (typeof objects[i].object.point === "function") {
                    objects[i].object.point(objects[i].uv, rightOrLeft)
                    //console.log(objects[i].point)
                    this.pointingLine[rightOrLeft].geometry.vertices[0].copy(
                        this.controllerSphere[rightOrLeft].position
                    )
                    this.pointingLine[rightOrLeft].geometry.vertices[1].copy(
                        objects[i].point
                    )
                    this.pointingLine[rightOrLeft].geometry.verticesNeedUpdate = true
                    this.pointingLine[rightOrLeft].visible = true

                    //socket.emit("screen mouse event", objects[i].uv)
                }
            }
        }
    }

	handleController(controller, rightOrLeft) {
        this.controller[rightOrLeft] = controller
        //todo: optimize
		var position = [
			controller.pose.position[0],
			controller.pose.position[1]+1.65,
			controller.pose.position[2]
		]

		var orientation = [
			controller.pose.orientation[0],
			controller.pose.orientation[1],
			controller.pose.orientation[2],
			controller.pose.orientation[3]
		]
		/*
		var orientation = new THREE.Vector4(
			controller.pose.orientation[0] + this.rotationFix[rightOrLeft].x,
			controller.pose.orientation[1] + this.rotationFix[rightOrLeft].y,
			controller.pose.orientation[2] + this.rotationFix[rightOrLeft].z,
			controller.pose.orientation[3] + this.rotationFix[rightOrLeft].w
		)*/


		//this.controllerObject[rightOrLeft].quaternion.x += this.rotationFix[rightOrLeft].x
		//this.controllerObject[rightOrLeft].quaternion.y += this.rotationFix[rightOrLeft].y
		//this.controllerObject[rightOrLeft].quaternion.z += this.rotationFix[rightOrLeft].z
		//this.controllerObject[rightOrLeft].quaternion.w += this.rotationFix[rightOrLeft].w

		this.controllerSphere[rightOrLeft].position.fromArray(position)
		this.controllerSphere[rightOrLeft].quaternion.fromArray(orientation)
		this.controllerGrabbingSphere[rightOrLeft].position.fromArray(position)
		this.controllerGrabbingSphere[rightOrLeft].quaternion.fromArray(orientation)
		this.mathSphere[rightOrLeft].center.fromArray(position)

		this.scene.updateMatrixWorld()

		this.handleButtons(controller, rightOrLeft)

        // todo: optimize
        this.helperPos[rightOrLeft].setFromMatrixPosition(
            this.pointingSphere[rightOrLeft].matrixWorld
        )

        this.dir[rightOrLeft].subVectors(
            this.helperPos[rightOrLeft],
            this.controllerSphere[rightOrLeft].position
        ).normalize()

		this.raycaster.set(
            this.controllerSphere[rightOrLeft].position,
            this.dir[rightOrLeft]
        )
		// calculate objects intersecting the picking ray
		var intersects = this.raycaster.intersectObjects( this.scene.children )
        // console.log(intersects)
        this.pointingLine[rightOrLeft].visible = false
        if (intersects.length > 0) {
            this.point(intersects, rightOrLeft)
        }


        window.dispatchEvent(this.updateEvent[rightOrLeft])
	}

}
