
class Desktop {
    constructor() {
        var self = this
        this.scene = OS.scene
        this.video = document.createElement('video')
        this.video.autoplay = true
        var hasUserMedia = navigator.webkitGetUserMedia ? true : false
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                self.video.src = URL.createObjectURL(stream)
            })
            .catch(function(err) {
                console.log("Failed to get a stream due to", err)
            })

        this.videoTexture = new THREE.Texture( this.video )

        this.videoTexture.minFilter = THREE.LinearFilter

        var geometry = new THREE.BoxGeometry( 0.05, 0.5*0.75, 0.5 )
        var video_material = [
	        new THREE.MeshBasicMaterial( { map: this.videoTexture } ),
	        new THREE.MeshBasicMaterial( { color: 0x00ff00 } ),
	        new THREE.MeshBasicMaterial( { color: 0x00ff00 } ),
	        new THREE.MeshBasicMaterial( { color: 0x00ff00 } ),
	        new THREE.MeshBasicMaterial( { color: 0x00ff00 } ),
	        new THREE.MeshBasicMaterial( { color: 0x00ff00 } )
        ]

        this.desktopBox = new THREE.Mesh( geometry, video_material )
        this.desktopBox.name = "desktop"
        this.desktopBox.grabbable = true

        self.pointing = false
        this.desktopBox.point = function(uv, rightOrLeft) {
            //console.log(rightOrLeft)
            if (!controller.isTouching(rightOrLeft)) {
                return
            }
            self.pointing = true
            clearTimeout(self.timer)
            self.timer = setTimeout(function() {
                self.pointing = false
            }, 1000)
            socket.emit("screen mouse event", uv)
        }

        window.addEventListener('buttonpressed', function (e) {
            if (e.detail.button == "R_JOYSTICK") {
                self.scene.add( self.desktopBox )
                self.desktopBox.position.copy(
                    controller.controllerSphere[0].position
                )
            }

            if (!self.pointing) {
                return
            }

            if (controller.isTouching(0)) {
                if (e.detail.button == "A") {
                    socket.emit("left mouse down")
                }

                if (e.detail.button == "B") {
                    socket.emit("right mouse down")
                }
            }

            if (controller.isTouching(1)) {
                if (e.detail.button == "X") {
                    socket.emit("left mouse down")
                }

                if (e.detail.button == "Y") {
                    socket.emit("right mouse down")
                }
            }
        })

        window.addEventListener('joystickevent', function (e) {
            if (!self.pointing) {
                return
            }
            socket.emit("mouse scroll", {
                "vertical": Math.round(e.detail.verticalAxe * 100),
                "horizontal": Math.round(e.detail.horizontalAxe * 100)
            })
        })

        window.addEventListener('buttonreleased', function (e) {

            if (!self.pointing) {
                return
            }

            if (controller.isTouching(0)) {
                if (e.detail.button == "A") {
                    socket.emit("left mouse up")
                }

                if (e.detail.button == "B") {
                    socket.emit("right mouse up")
                }
            }

            if (controller.isTouching(1)) {
                if (e.detail.button == "X") {
                    socket.emit("left mouse up")
                }

                if (e.detail.button == "Y") {
                    socket.emit("right mouse up")
                }
            }
        })
    }


    update() {
    	if ( this.video.readyState === this.video.HAVE_ENOUGH_DATA ){
    	    this.videoTexture.needsUpdate = true;
    	}
    }
}
