
class FileSystem {
    constructor() {
        this.scene = OS.scene
        this.depth = 1
        this.fsSpheres = []

        this.sphereScale = 1.5;
        this.interacting = [false,false]

        var self = this

        this.fsData(function(data) {
            self.calculateNodes(data)
        })

        window.addEventListener('buttonpressed', function (e) {
            if (controller.buttonPressed["L_TRIGGER"]) {
                if (e.detail.button == "X") {
                    self.spawnFsObject()
                }
            }

            if (e.detail.button == "X") {
                var sphere = self.intersects(1)
                if (!sphere) {
                    return
                }
                self.operateFsSphere(sphere, 1)
            }

            if (e.detail.button == "Y") {
                var sphere = self.intersects(1)
                if (!sphere) {
                    return
                }
                self.goUp(sphere, 1)
            }

            if (e.detail.button == "B") {
                var sphere = controller.intersectingGrabbableObject(0)
                if (sphere) {
                    self.remove(sphere)
                }
            }
            if (e.detail.button == "A") {
            }
        })


        window.addEventListener('controllerupdate', function (e) {
		    var intersecting = self.intersects(
                e.detail.rightOrLeft
            )
		    if (intersecting) {
                self.interacting[e.detail.rightOrLeft] = true
                intersecting = self.intersectsChildren(
                    intersecting,
                    e.detail.rightOrLeft
                )
                if (intersecting) {
                    intersecting.material.opacity = 0.5
                    self.lightsOff(intersecting)
                }
		    } else {
                 if (self.interacting[e.detail.rightOrLeft]) {
                    self.lightsOff()
                    self.interacting[e.detail.rightOrLeft] = false
                }
            }
        })

        this.sphereCollider = new THREE.Sphere()
    }

    lightsOff(except = false) {
        for (var i = 0; i < this.fsSpheres.length; i ++) {
            for (var i2 = 0; i2 < this.fsSpheres[i].children.length; i2 ++) {
                if (except) {
                    if (this.fsSpheres[i].children[i2].id == except.id) {
                        continue
                    }
                }
                this.fsSpheres[i].children[i2].material.opacity = 0.1
            }
        }
    }

    arrangeFolders(folders) {
        var arrangedFolders = []
        if (folders.length > 10) {
            for (var i = 0; i < folders.length; i += 10) {
                var folderz = []
                for (var i2 = 0; i2 < 10; i2 ++) {
                    if (typeof folders[i+i2] !== "undefined") {
                        folderz.push(folders[i+i2])
                    }
                }
                arrangedFolders.push(folderz)
            }
            return arrangedFolders
        } else {
            return [folders]
        }
    }

    calculateNodes(data) {
        var margin = 0,
            padding = 0,
            root = data.root



        var diameter = ((40/1000)*this.sphereScale)*2
        var pack = d3.layout.pack()
            .padding(padding)
            .size([diameter, diameter])
            .value(function(d) {
                //return d.size;
                return 100
            }),
            arc = d3.svg.arc().innerRadius(0),
            pie = d3.layout.pie

        this.nodes = pack.nodes(root)
    }

    updateWorldMatrices(object) {
        var parent = object;
        while (parent.parent != null)
        {
            parent.updateMatrixWorld();
            parent = parent.parent;
        }
    }

	intersectsChildren(sphere, rightOrLeft) {
		var intersecting = false
        var intersectingDistance;
		for (var i = 0; i < sphere.children.length; i ++) {
            if (sphere.children[i].geometry.type == "TextGeometry") {
                continue
            }
            //sphere.matrixAutoUpdate && sphere.updateMatrix()
            //sphere.children[i].matrixAutoUpdate && sphere.children[i].updateMatrix()
            this.updateWorldMatrices(sphere.children[i])
            var position = new THREE.Vector3();
            position.setFromMatrixPosition( sphere.children[i].matrixWorld );
            // = sphere.children[i].matrixWorld.position//multiplyVector4(
            //var position = sphere.children[i].worldToLocal( sphere.children[i].position
            //    new THREE.Vector3()

            //);
            this.sphereCollider.center.copy(
                position
            )

            sphere.children[i].geometry.computeBoundingSphere()

            if (sphere.children[i].geometry.boundingSphere === null) {
                console.warn("bounding sphere is null")
                continue
            }

            this.sphereCollider.radius =
                sphere.children[i].geometry.boundingSphere.radius

            //console.log("debug")
            //console.log(this.sphereCollider)
            //console.log(controller.mathSphere[rightOrLeft])
			if (controller.mathSphere[rightOrLeft].intersectsSphere(
                this.sphereCollider
            )) {
                //console.log("debug "+intersecting.name)
				if (intersecting) {
					if (intersectingDistance >
                        this.sphereCollider.distanceToPoint(
                            controller.mathSphere[rightOrLeft].center)) {
						intersecting = sphere.children[i]
					}
				} else {
					intersecting = sphere.children[i]
                    intersectingDistance =
                        this.sphereCollider.distanceToPoint(
                        controller.mathSphere[rightOrLeft].center
                    )
				}
			}
        }
		return intersecting
	}

    operateFsSphere(sphere, rightOrLeft) {
        var self = this
        var intersecting = this.intersectsChildren(sphere, rightOrLeft)
        if (!intersecting) {
            return
        }
        if (intersecting.sphereType == "dir")  {
            this.fsData(function(data) {
                if (typeof data.root.children !== "undefined") {
                    sphere.spheres = self.arrangeFolders(data.root.children)
                    sphere.currentPage = 0
                    data.root.children = sphere.spheres[0]
                    self.calculateNodes(data)
                }
                self.updateFsObject(sphere)
                //console.log(data)
            }, intersecting.path)
        }
        if (intersecting.sphereType == "file")  {
            if (intersecting.path.substr(
                    intersecting.path.length-12,
                    intersecting.path.length
                ) == ".bubble.json") {
                    socket.emit("load project", { "file": intersecting.path } )
            } else {
                console.log("not a supported filetype " + intersecting.path)
            }
        }
        if (intersecting.sphereType == "arrow")  {
            //console.log(intersecting)
            var sphere = intersecting.parent
            if (intersecting.name == "next") {
                sphere.currentPage += 1

                if (sphere.currentPage >= sphere.spheres.length) {
                    sphere.currentSphere = 0
                }

                self.calculateNodes({
                    "root": {
                        "path": sphere.path,
                        "children": sphere.spheres[sphere.currentPage]
                    }
                })
                self.updateFsObject(sphere)
            } else {
                sphere.currentPage -= 1

                if (sphere.currentPage < 0) {
                    sphere.currentPage = sphere.spheres.length - 1
                }

                self.calculateNodes({
                    "root": {
                        "path": sphere.path,
                        "children": sphere.spheres[sphere.currentPage]
                    }
                })
                self.updateFsObject(sphere)
            }
        }
    }

    goUp(sphere, rightOrLeft) {
        var self = this
        //console.log(sphere.path)
        if (sphere.path.length == 2) {
            sphere.path = "drives"
        } else {
            sphere.path = sphere.path.substring(0, sphere.path.lastIndexOf('/')+1 )
        }
        //console.log(sphere.path)
        this.fsData(function(data) {
            self.calculateNodes(data)
            self.updateFsObject(sphere)
            //console.log(data)
        }, sphere.path)
    }

    updateFsObject(fsSphere) {
        while (fsSphere.children.length) {
            var id = fsSphere.children[0].id
            THREE.SceneUtils.detach(fsSphere.children[0], fsSphere, this.scene)
            fsSphere.updateMatrixWorld()
            //console.log(id)
            this.scene.remove(this.scene.getObjectById( id, true ))
        }

        this.updateChildren(fsSphere)
    }

    remove(sphere) {
        for (var i = 0; i < this.fsSpheres.length; i ++) {
            if (this.fsSpheres[i].id == sphere.id) {
                this.scene.remove(sphere)
                this.fsSpheres.splice(i, 1)
            }
        }
    }

    intersects(rightOrLeft) {
        var sphere = controller.intersectingGrabbableObject(rightOrLeft)
        if (!sphere) {
            return
        }
        for (var i = 0; i < this.fsSpheres.length; i ++) {
            if (this.fsSpheres[i].id == sphere.id) {
                return sphere
            }
        }
    }

    spawnSphere(scale, position, type = "file", name = false) {

        var sphereGeom = new THREE.SphereGeometry(
            (40/1000)*scale,
            (32/1000)*scale,
            (16/1000)*scale
        )

        var color = 0x0000FF
        if (type == "dir") {
            color = 0xFFFF00
        }
        if (type == "error") {
            color = 0xFF0000
        }
        var material = new THREE.MeshBasicMaterial( {
            "color": color,
            "transparent": true,
            "opacity": 0.1
        } )
        //material.alphaTest = 0.5;
        material.depthWrite = false
        var sphere = new THREE.Mesh( sphereGeom.clone(), material )
        sphere.sphereType = type
    	sphere.position.copy(position)

        if (name) {
            sphere.name = name
        }

        this.scene.add(sphere)
        return sphere
    }

	spawnText(text, position, textSize = 1) {
		var geometry = new THREE.TextGeometry( text, {
			font: OS.font,
			size: (80/5000) * textSize,
            height: (20/5000) * textSize,
			curveSegments: 2
		})


		var materials = [
			new THREE.MeshBasicMaterial( { color: 0x000000, overdraw: 0.5 } )
		]

		var textGeometry = new THREE.Mesh( geometry, materials )

		textGeometry.position.copy(position)
		//textGeometry.lookAt( camera.position )
        textGeometry.rotation.y = 0.5
        textGeometry.rotation.x = 0.5

        this.scene.add(textGeometry)

		return textGeometry
	}

    spawnFsObject() {
        var fsSphere = this.spawnSphere(
            this.sphereScale,
            controller.controllerSphere[1].position,
            "dir"
        )


        fsSphere.grabbable = true
        this.fsSpheres.push(fsSphere)

        this.updateChildren(fsSphere)
    }

    updateChildren(fsSphere) {
        fsSphere.path = this.nodes[0].path
        if (typeof fsSphere.spheres !== "undefined") {
            //console.log(fsSphere.spheres.length)
            if (fsSphere.spheres.length > 1) {
                this.nextPrevButtons(fsSphere)
            }
        }
        fsSphere.rotation.fromArray([0,0,0])
        for (var i = 0; i < this.nodes.length; i ++) {
            if (this.nodes[i].depth == 1) {
                //console.log(this.nodes[i].type)
                var scale = this.sphereScale * (this.nodes[i].r / this.nodes[i].parent.r)
                var position = [
                    //fsSphere.position.x + (this.nodes[i].x * Math.pow(scale, 2)),
                    //fsSphere.position.y + (this.nodes[i].y * Math.pow(scale, 2)),
                    fsSphere.position.x - this.nodes[i].x + this.nodes[i].parent.r,
                    fsSphere.position.y - this.nodes[i].y + this.nodes[i].parent.r,
                    fsSphere.position.z
                ]
                var posVec = (new THREE.Vector3()).fromArray(position)
                var sphere = this.spawnSphere(scale, posVec, this.nodes[i].type)
                sphere.name = this.nodes[i].name
                sphere.path = this.nodes[i].path
                sphere.type = this.nodes[i].type
                var text = this.spawnText(this.nodes[i].name, posVec)
                text.scale.set(scale,scale,scale)
                //fsSphere.updateMatrixWorld()
                fsSphere.updateMatrixWorld()
                sphere.updateMatrixWorld()
                text.updateMatrixWorld()
                THREE.SceneUtils.attach(sphere, this.scene, fsSphere)
                THREE.SceneUtils.attach(text, this.scene, fsSphere)
            }
        }
        //console.log("changed")
        fsSphere.lookAt(OS.camera.position)
    }

    nextPrevButtons(fsSphere) {
        var position = [
            fsSphere.position.x + (this.sphereScale/30),
            fsSphere.position.y + (this.sphereScale/30),
            fsSphere.position.z
        ]
        var scale = this.sphereScale/4
        var posVec = (new THREE.Vector3()).fromArray(position)
        var upSphere = this.spawnSphere(
            this.sphereScale/4,
            posVec,
            "arrow",
            "next"
        )
        var upText = this.spawnText("next", posVec)
        upText.scale.set(scale,scale,scale)

        position = [
            fsSphere.position.x + (this.sphereScale/30) + (this.sphereScale/80),
            fsSphere.position.y + (this.sphereScale/30) + (this.sphereScale/80),
            fsSphere.position.z
        ]
        posVec = (new THREE.Vector3()).fromArray(position)
        var downSphere = this.spawnSphere(
            this.sphereScale/4,
            posVec,
            "arrow",
            "previous"
        )
        var downText = this.spawnText("previous", posVec)
        downText.scale.set(scale,scale,scale)
        fsSphere.updateMatrixWorld()
        upSphere.updateMatrixWorld()
        downSphere.updateMatrixWorld()
        upText.updateMatrixWorld()
        downText.updateMatrixWorld()
        THREE.SceneUtils.attach(upSphere, this.scene, fsSphere)
        THREE.SceneUtils.attach(upText, this.scene, fsSphere)
        THREE.SceneUtils.attach(downSphere, this.scene, fsSphere)
        THREE.SceneUtils.attach(downText, this.scene, fsSphere)
    }

    updateChildren2(fsSphere) {
        fsSphere.path = this.nodes[0].path
        if (typeof fsSphere.spheres !== "undefined") {
            //console.log(fsSphere.spheres.length)
            if (fsSphere.spheres.length > 0) {
                this.nextPrevButtons(fsSphere)
            }
        }
        for (var i = 0; i < this.nodes.length; i ++) {
            if (this.nodes[i].depth == 1) {
                window.fsSphere = fsSphere
                window.self = this
                window.i = i
                po.call(`
                var scale = self.sphereScale * (self.nodes[`+i+`].r / self.nodes[`+i+`].parent.r)
                var position = [
                    //fsSphere.position.x + (self.nodes[`+i+`].x * Math.pow(scale, 2)),
                    //fsSphere.position.y + (self.nodes[`+i+`].y * Math.pow(scale, 2)),
                    fsSphere.position.x - self.nodes[`+i+`].x + self.nodes[`+i+`].parent.r,
                    fsSphere.position.y - self.nodes[`+i+`].y + self.nodes[`+i+`].parent.r,
                    fsSphere.position.z
                ]
                var posVec = (new THREE.Vector3()).fromArray(position)
                var sphere = self.spawnSphere(scale, posVec, self.nodes[`+i+`].type)
                sphere.name = self.nodes[`+i+`].name
                sphere.path = self.nodes[`+i+`].path
                sphere.type = self.nodes[`+i+`].type
                var text = self.spawnText(self.nodes[`+i+`].name, posVec)
                text.scale.set(scale,scale,scale)
                //fsSphere.updateMatrixWorld()
                fsSphere.updateMatrixWorld()
                sphere.updateMatrixWorld()
                text.updateMatrixWorld()
                THREE.SceneUtils.attach(sphere, scene, fsSphere)
                THREE.SceneUtils.attach(text, scene, fsSphere)
                `)
            }
        }
    }

    fsData(cb, dir = "drives") {
		socket.on("fs data", function(data) {
            cb(data)
        })
        socket.emit("get fs data", {"root": dir})
    }

    fsTestData() {
        return {
            "name": "filesystem",
            "children": [{
                "name": "C:",
                "size": 50
            },{
                "name": "D:"
            },{
                "name": "E:"
            },{
                "name": "E:"
            },{
                "name": "E:"
            }]
        }
    }

    update() {
        // dont work for some reason, maybe unattach and reattach after update?
        for (var i = 0; i < this.fsSpheres.length; i ++) {
            for (var i2 = 0; i2 < this.fsSpheres[i].children.length; i2 ++) {
                if (this.fsSpheres[i].children[i2].geometry.type == "TextGeometry") {
                    //lookAt(this.fsSpheres[i].children[i2], controller.controllerSphere[0] )
                }
            }
        }
    }
}
