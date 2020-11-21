
class Scaler {
    constructor() {
		var self = this
		window.addEventListener('joystickevent', function (e) {
            if (e.detail.rightOrLeft == 0) {
				if (controller.getGrabbedObject(0) != null) {
					//self.scale(e.detail.horizontalAxe)
					self.scaleObject(e.detail.horizontalAxe)
					//
				}
			}
        })
    }
	
	init() {
		var self = this
        this.scene = OS.scene
		
		self.originalScale = new THREE.Vector3()
        
        window.addEventListener('grabstart', function (e) {
            if (e.detail.rightOrLeft == 0) {
				self.originalScale.copy(controller.sphere[0].scale)
				self.scalerSphere.visible = true
			}
        })
        window.addEventListener('grabend', function (e) {
            if (e.detail.rightOrLeft == 0) {
				controller.sphere[0].scale.copy(self.originalScale)
				self.scalerSphere.visible = false
			}
        })
		this.scalerSphere = new THREE.Mesh( spheres.sphereGeom.clone(), spheres.blueMaterial.clone() )
        self.scalerSphere.material.color.setHex( 0x55FF55 )
		this.scalerSphere.material.opacity = 0.6
		self.scalerSphere.visible = false
		//this.scalerSphere = controller.sphere[0].clone()
		OS.scene.add(this.scalerSphere)
		
		
		this.packingEventTrigger = false
		this.unPackingEventTrigger = false
    }

	//init() {
		//this.scalerSphere = controller.sphere[0].clone()
		//OS.scene.add(this.scalerSphere)
	//}
	
    update() {
		this.scalerSphere.position.copy(controller.sphere[0].position)
		this.scalerSphere.rotation.copy(controller.sphere[0].rotation)
    }
	
	
	
	scaleUnlink(axe) {

		console.assert(typeof(axe) !== "undefined");
		console.assert(spheres.isSphere(controller.getGrabbedObject(0)));

		var scale = 1 + (axe/50)
		var object = controller.getGrabbedObject(0);
		
		console.assert(object)
		
		var realObj = controller.intersectingFromArray(0, spheres.getGroup(object));
		if(!realObj) {return;}
		var position = getMatrixPosition(realObj);
		//var position = object.position;
		object.scale.set(object.scale.x * scale, object.scale.y * scale, object.scale.z * scale)
		
		if (spheres.hasLinks(controller.getGrabbedObject(0))) {
			console.assert(typeof(realObj) !== "undefined");
			console.assert(typeof(spheres.getGroup(object).length)  !== "undefined")
			console.assert(realObj);
			//console.log(object)
			//console.log(spheres.getGroup(object))
			if( object == null) {
				return;
			}
			console.log(object)
			//if (realObj.id != object.id) {
			//	console.log("confirm")
			//}
				//spheres.makeMaster(realObj)
			var newPosition = getMatrixPosition(realObj)
			
			console.log((position.x))
			console.log((newPosition.x))
			console.log((newPosition.x - position.x))
			console.log(position.x)
			console.log(newPosition.x)
			object.position.x = object.position.x + (newPosition.x - position.x)
			object.position.y = object.position.y + (newPosition.y - position.y)
			object.position.z = object.position.z + (newPosition.z - position.z)
		}
		return;
		
			/*var sphere = spheres.add(controller.sphere[0].position)
			sphere.add(object)
			object = sphere;
			object.scale.set(object.scale.x * scale, object.scale.y * scale, object.scale.z * scale)*/
	}
	
	
	
	scaleWithController(axe) {
		var scale = 1 + (axe/50)
		var object = controller.getGrabbedObject(0);
		console.log(" hello")
		var saveScale = new THREE.Vector3()
		saveScale.copy(controller.sphere[0].scale)
		console.log("1")
		controller.sphere[0].scale.set(controller.sphere[0].scale.x * scale, controller.sphere[0].scale.y * scale, controller.sphere[0].scale.z * scale)
		console.log("2")
		OS.scene.updateMatrixWorld()
		THREE.SceneUtils.detach(object, OS.scene, controller.sphere[0])
		console.log("3")
		controller.sphere[0].scale.copy(this.originalScale)
		OS.scene.updateMatrixWorld()
		console.log("4")
		console.log(object)
		console.log(controller.sphere[0])
		console.log(OS.scene)
		THREE.SceneUtils.attach(object, OS.scene, controller.sphere[0])
		OS.scene.updateMatrixWorld()
	}
	
	scaleObject(axe) {
		var scale = 1 + (axe/50)
		var object = controller.getGrabbedObject(0);
		controller.sphere[0].scale.set(controller.sphere[0].scale.x * scale, controller.sphere[0].scale.y * scale, controller.sphere[0].scale.z * scale)
		
		if (controller.getGrabbedObject(0)) {
			//this.scaleCheck(object)
		}
	}
	
	done() {
		controller.sphere[0].scale.copy(this.originalScale)
		this.scalerSphere.visible = false
	}
	
    scaleCheck(object) {
        //controller.multiMathSphere.center.copy(object.position)
        if (controller.sphere[0].scale.x < this.scalerSphere.scale.x /2 ) {
			if (!this.packingEventTrigger) {
				this.unPackingEventTrigger = false
				this.packingEventTrigger = true
				console.log("packing event")
				
				this.done()
				
				spheres.pack(controller.getGrabbedObject(0))
				
			}
		}
		
		if (controller.sphere[0].scale.x > this.scalerSphere.scale.x*2) {
			if (!this.unPackingEventTrigger) {
				this.unPackingEventTrigger = true
				this.packingEventTrigger = false
				console.log("unpacking event")
				spheres.unpack(controller.getGrabbedObject(0))
				this.done()
			}
		}
				//this.eventTrigger = false
			
		
/*
        this.mathSphere.center.copy(object.position)
        if ((object.geometry.boundingSphere.radius * object.scale.x) >
            this.mathSphere.distanceToPoint(OS.camera.position)) {
            this.enterWorld(object)
        }
        //console.log()
        //console.log(this.mathSphere.distanceToPoint(OS.camera.position))
        if ((object.geometry.boundingSphere.radius * object.scale.x) >
            this.mathSphere.distanceToPoint(OS.camera.position)) {
            this.enterWorld(object)
        }

        var isWithinControllerSphere = true
        for (var i = 0; i < object.children.length; i ++) {

            if (object.children[i].geometry.type == "Geometry") {
                //console.log(i + "sphere")
                this.childPosition = new THREE.Vector3()
                this.childScale = new THREE.Vector3()
                object.children[i].getWorldPosition(this.childPosition)
                object.children[i].getWorldScale(this.childScale)
                this.mathSphere.center.copy(this.childPosition)
                //console.log(this.childPosition)
                //console.log(this.childScale.x)
                var childRadius = (
                    object.children[i].geometry.boundingSphere.radius *
                    this.childScale.x
                )
                //console.log(childRadius)
                //console.log(object.children[i].geometry.boundingSphere.radius)
                var distanceToControllerCenter = this.mathSphere.distanceToPoint(
                    controller.controllerSphere[0].position
                )
                //console.log(distanceToControllerCenter)
                //console.log(controller.controllerSphere[0].geometry.boundingSphere.radius)
            //object.children[i].material.color.setHex( 0x000000 )
                //console.log(childRadius+" + "+distanceToControllerCenter + "<"+ controller.controllerSphere[0].geometry.boundingSphere.radius)
                if (childRadius + distanceToControllerCenter < controller.controllerSphere[0].geometry.boundingSphere.radius) {
                    //console.log("true")
                    object.children[i].material.color.setHex( 0x000000 )
                } else {
                    isWithinControllerSphere = false
                }
            }
        }
        // known bug, grabbed shprere has no within check
        //console.log(isWithinControllerSphere)

        if (isWithinControllerSphere && (spheres.fileName(object).substr(0, 6) != "Sphere")) {
            this.exitWorld(object)
        }
        for (object)
        if (object) {
            console.log(false);
        }
        */
    }
}
