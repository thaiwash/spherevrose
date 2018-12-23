
class Scaler {
    constructor() {
		var self = this
        this.scene = OS.scene
        this.exists = false

        /*
        window.addEventListener('buttonpressed', function (e) {
            //console.log(self.exists)
            if (e.detail.button == "L_JOYSTICK") {
                if (!self.exists) {
                    self.spawnSphere()
                } else {
                    self.deSpawnSphere()
                }
            }
        })*/
        window.addEventListener('joystickevent', function (e) {
            if (!self.exists) {
                return
            }
            if (e.detail.rightOrLeft == 1) {
                //self.scaleWorld(e.detail.horizontalAxe)
                self.scaleGrabbedObject(e.detail.horizontalAxe)
            }
        })
    }

    scaleGrabbedObject(axe) {
        if (!controller.grippedObject[0]) {
            return
        }

        this.scalerSphere.updateMatrixWorld()
        THREE.SceneUtils.attach(
            controller.grippedObject[0],
            this.scene,
            this.scalerSphere
        )

        var scale = 1 + (axe/50)
        this.scalerSphere.scale.set(scale,scale,scale)
        this.scalerSphere.updateMatrixWorld()
        //console.log(this.scalerSphere.children.length)

        while (this.scalerSphere.children.length) {
            THREE.SceneUtils.detach(
                this.scalerSphere.children[0],
                this.scalerSphere,
                this.scene
            )
            this.scalerSphere.updateMatrixWorld()
        }
        this.scalerSphere.scale.set(1,1,1)

        var event = new CustomEvent('scaling', {
            detail: {
                "sphere": controller.grippedObject[0]
            }
        })
        window.dispatchEvent(event)
    }

    scaleWorld(axe) {
        var group = new THREE.Group()
        function getScalable() {
            for (var i = 0; i < this.scene.children.length; i ++) {
                if (typeof this.scene.children[i].scalable !== "undefined") {
                    if (this.scene.children[i].scalable) {
                        //group.add(scene.children[i])
                        //console.log("scaling " + scene.children[i].name)
                        return this.scene.children[i]
                    }
                }
            }
            return false
        }

        while(getScalable()) {
            //this.scalerSphere.updateMatrixWorld()
            THREE.SceneUtils.attach(getScalable(), this.scene, this.scalerSphere)
        }

        var scale = 1 + (axe/50)
        this.scalerSphere.scale.set(scale,scale,scale)
        //this.scalerSphere.updateMatrixWorld()
        //console.log(this.scalerSphere.children.length)
        while (this.scalerSphere.children.length) {
            THREE.SceneUtils.detach(
                this.scalerSphere.children[0],
                this.scalerSphere,
                this.scene
            )
            //this.scalerSphere.updateMatrixWorld()
        }
        this.scalerSphere.scale.set(1,1,1)
        //for (var i = 0; i < this.scalerSphere.children.length; i ++) {
        //}
        //group.scale.set(0.5,0.5,0.5)
        //scene.add(group)      THREE.SceneUtils.detach(scaler.scalerSphere.children[0], scaler.scalerSphere, scene)
        //console.log(this.scalerSphere.children)
        //group.scale.addScaler(0.5)
        //for (var i = 0; i < group.children.length; i ++) {
        //    this.unGroup(group.children[i])
        //}
        //console.log(group.children)
        //scene.remove(group)
        //this.group = group


    }

    scaleWorld2(axe) {
        var group = new THREE.Group()
        for (var i = 0; i < this.scene.children.length; i ++) {
            if (typeof this.scene.children[i].scalable !== "undefined") {
                if (this.scene.children[i].scalable) {
                    group.add(this.scene.children[i])
                }
            }
        }
        this.this.scene.add(group)
        console.log(group.children)
        //group.scale.addScaler(0.5)
        for (var i = 0; i < group.children.length; i ++) {
            this.unGroup(group.children[i])
        }
        console.log(group.children)
        this.scene.remove(group)
        this.group = group
    }

    spawnSphere() {
		// radius, segments along width, segments along height
		var sphereGeom =  new THREE.SphereGeometry(
            (40/1000)*1.0,
            (32/1000)*1.0,
            (16/1000)*1.0
        )

		var blueMaterial = new THREE.MeshBasicMaterial( {
            color: 0x0000FF,
            transparent: true,
            opacity: 0.1
        } );
		this.scalerSphere = new THREE.Mesh( sphereGeom.clone(), blueMaterial )
		this.scalerSphere.position.copy(controller.controllerSphere[0].position)
        this.scene.add(this.scalerSphere)
        this.exists = true
        this.scalerSphere.visible = false
    }

    deSpawnSphere() {
        this.scene.remove(this.scalerSphere)
        this.exists = false
    }

    update() {
        if (this.exists) {
            this.scalerSphere.position.copy(
                controller.controllerSphere[0].position
            )
        } else {
            this.spawnSphere()
        }
    }
}
