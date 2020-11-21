/*

todo: calibrate controllers


THREEx.Util = {
	getSceneParent: function() (object) {
		while(object.parent.type != "Scene") {
			object = object.parent;
		}
		return object
	}
}

OS.socket.emit("write file", {data: JSON.stringify(OS.scene.toJSON()).toString();
*/
var THREEx = {};
const RIGHT = 0;
const LEFT = 1;



class Controller {
	constructor() {
		//this.ready = false
		this.raycaster = new THREE.Raycaster()
		this.scene = OS.scene
        this.RIGHT_HAND = 0
        this.LEFT_HAND = 1
		var self = this
		this.nearestObject = [false, false]
		this.grabbableObjects = [];

		// radius, segments along width, segments along height
		var sphereGeom =  new THREE.SphereGeometry(
            40/1000, 32/1000, 32/1000
        )

		this.multiMathSphere = new THREE.Sphere(new THREE.Vector3(), 40/1000);


		// overlapping translucent red/green/blue spheres
		var greenMaterial = new THREE.MeshBasicMaterial(
            { color: 0x00FF00, transparent: true, opacity: 0.5 }
        )
        greenMaterial.depthWrite = false

		this.sphere = [
			new THREE.Mesh( sphereGeom.clone(), greenMaterial.clone() ),
			new THREE.Mesh( sphereGeom.clone(), greenMaterial.clone() )
		]
		this.sphere[0].visible = false
		this.sphere[1].visible = false
		
		this.scene.add( this.sphere[0] )
		this.scene.add( this.sphere[1] )



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
		this.controllerPosition = [new THREE.Vector3(), new THREE.Vector3()]
		this.controllerRotation = [new THREE.Quaternion(), new THREE.Quaternion()]
		this.newControllerPosition = [new THREE.Vector3(), new THREE.Vector3()]
		this.newControllerRotation = [new THREE.Quaternion(), new THREE.Quaternion()]

        this.sphereCollider = new THREE.Sphere()
        this.boxCollider = new THREE.Box3()


        window.addEventListener('buttonpressed', function (e) {
            if (e.detail.button == "R_GRIP") {
                self.grab(RIGHT)
            }
            if (e.detail.button == "L_GRIP") {
                self.grab(LEFT)
            }
        })
        window.addEventListener('buttonreleased', function (e) {
            if (e.detail.button == "R_GRIP") {
                self.unGrab(RIGHT)
            }
            if (e.detail.button == "L_GRIP") {
                self.unGrab(LEFT)
            }
        })

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
        if (!object.geometry) {
            return false
        }
		

        if (object.geometry.type == "Geometry") {
            if (object.geometry.boundingSphere === null) {
                //console.warn("Geometry dont seem to be a sphere")
                return false
            }
			console.assert(object.getWorldPosition(new THREE.Vector3()) !== "undefined");
            this.multiMathSphere.center.copy(object.getWorldPosition(new THREE.Vector3()))
            this.multiMathSphere.radius = object.geometry.boundingSphere.radius
            if (controller.sphere[rightOrLeft].position.distanceTo(this.multiMathSphere.center)
				< object.geometry.boundingSphere.radius*2) {
                return true
            }
        } else if (object.geometry.type == "BoxGeometry") {
            this.boxCollider.setFromObject(object)
            this.multiMathSphere.center.copy(this.sphere[rightOrLeft].getWorldPosition(new THREE.Vector3()))
            this.multiMathSphere.radius = this.sphere[rightOrLeft].geometry.boundingSphere.radius
			console.assert(this.multiMathSphere !== "undefined");
            if (this.boxCollider.intersectsSphere(this.multiMathSphere)) {
                return true
            }
        }
        return false
    }

/*
	allDescendants (node, cb) {
		for (var i = 0; i < node.children.length; i++) {
		  var child = node.children[i];
		  this.allDescendants(child, cb);
		  cb(child);
		}
		this.runningThreads --;
	}*/
	
		
    // check if were intersecting any grabbable objects, if we are, return that object
    intersectingFromArray(rightOrLeft, sphereGroup) {
		if (typeof sphereGroup === "undefined") {
			console.warn("sphereGroup not an array")
			console.warn(sphereGroup)
			var err = new Error();
			console.warn(err.stack);
			return null;
		}
		if ( sphereGroup == null) {
			console.warn("sphereGroup not an array")
			console.warn(sphereGroup)
			var err = new Error();
			console.warn(err.stack);
			return null;
		}
		var self = this;
		this.nearestObject[rightOrLeft] = null
		
		
        for (var i = 0; i < sphereGroup.length; i ++) {
			if (this.intersecting(sphereGroup[i], rightOrLeft)) {
				if (this.nearestObject[rightOrLeft]) {
					if (controller.sphere[rightOrLeft].position.distanceTo(
						this.nearestObject[rightOrLeft].getWorldPosition(new THREE.Vector3())) >
						controller.sphere[rightOrLeft].position.distanceTo(
						sphereGroup[i].getWorldPosition(new THREE.Vector3()))
						) {
						this.nearestObject[rightOrLeft] = sphereGroup[i]
					}
				} else {
					this.nearestObject[rightOrLeft] = sphereGroup[i]
				}
			}
			
        }
		
		//if (this.nearestObject[rightOrLeft] != null)
			//console.log(this.nearestObject[rightOrLeft].name)
		return this.nearestObject[rightOrLeft];
    }

    grabObject(object, rightOrLeft) {
		THREE.SceneUtils.attach(object, OS.scene, this.sphere[rightOrLeft])
    }

	grab(rightOrLeft) {
		this.sphere[rightOrLeft].material.opacity = 0.2
		console.assert(this.grabbableObjects != null)
		//console.log(this.grabbableObjects)
        var grabbable = this.intersectingFromArray(rightOrLeft, this.grabbableObjects)

        if (grabbable) {
			
			var sceneObject = this.getSceneParent(grabbable);
			if (rightOrLeft == RIGHT && sceneObject.uuid == this.sphere[LEFT].uuid) {
				detachAllChildren(sceneObject)
			    sceneObject = this.getSceneParent(grabbable);
			}
			if (rightOrLeft == LEFT && sceneObject.uuid == this.sphere[RIGHT].uuid) {
				detachAllChildren(sceneObject)
			    sceneObject = this.getSceneParent(grabbable);
			}
			
			if (sceneObject.uuid == OS.camera.uuid) {
				return null;
			}
			
            this.grabObject(sceneObject, rightOrLeft)
			
            var event = new CustomEvent('grabstart', {
                detail: {
                    "rightOrLeft": rightOrLeft,
                    "object": sceneObject
                }
            })
            window.dispatchEvent(event)
	    }
	}
	
	getSceneParent(object) {
		if (object.parent == null) {
			return object;
		}
		while(object.parent.type != "Scene") {
			object = object.parent;
		}
		return object
	}

	unGrab(rightOrLeft) {
		this.sphere[rightOrLeft].material.opacity = 0.5
        if (!this.isGrabbing(rightOrLeft)) {
            return
        }
		
        var event = new CustomEvent('grabend', {
            detail: {
                "rightOrLeft": rightOrLeft,
                "object": this.sphere[rightOrLeft].children[0]
            }
        })
        window.dispatchEvent(event)

		detachAllChildren(this.sphere[rightOrLeft])
		
		//clearInterval(this.grabTimer[rightOrLeft])
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
	
	isGrabbing(rightOrLeft) {
		if (controller.sphere[rightOrLeft].children.length > 0) {
			return true;
		} else {
			return false;
		}
	}
	
	grabbedObject(rightOrLeft) {
		this.getGrabbedObject(rightOrLeft)
	}
	
	getGrabbedObject(rightOrLeft) {
		if (!this.isGrabbing(rightOrLeft)) {
			return null
		}
		var grabGroup = controller.sphere[rightOrLeft].children;
		if (grabGroup.length > 1) {
			if (spheres.isSphere(grabGroup[0])) {
				if (spheres.getGroup(grabGroup[0]) > 0) {
					return this.intersectingFromArray(rightOrLeft, spheres.getGroup(grabGroup[0]));
				} else {
					return grabGroup[0];
				}
			}
			return this.intersectingFromArray(rightOrLeft, grabGroup[0]);
		}
		return controller.sphere[rightOrLeft].children[0];
	}

	handleController(controller, rightOrLeft) {
		if (OS.display !== "undefined") {
			this.sphere[rightOrLeft].visible = true
		}
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

		this.sphere[rightOrLeft].position.fromArray(position)
		this.sphere[rightOrLeft].quaternion.fromArray(orientation)

		//this.scene.updateMatrixWorld()

		this.handleButtons(controller, rightOrLeft)

        window.dispatchEvent(this.updateEvent[rightOrLeft])
	}

}
