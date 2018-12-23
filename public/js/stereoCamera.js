
class Zed {
    constructor() {
        var self = this
        this.scene = OS.scene

        this.rightEye = new CanvasObject()
        this.rightEye.createObject([0,0,-1], OS.camera)
        //OS.camera.add( this.rightEye.cvs )
        //this.rightEye.position.set(-0.2,0.1,-0.5)
        //this.rightEye.lookAt(OS.camera.position)
        OS.camera.layers.enable(2)
        //OS.camera.layers.set(1)
        this.rightEye.cvs.layers.set(2)

        this.leftEye = new CanvasObject()
        this.leftEye.createObject([0,0,-1], OS.camera)
        //OS.camera.add( this.rightEye.cvs )
        //this.rightEye.position.set(-0.2,0.1,-0.5)
        //this.rightEye.lookAt(OS.camera.position)
        navigator.getUserMedia  = navigator.getUserMedia ||
                                  navigator.webkitGetUserMedia ||
                                  navigator.mozGetUserMedia ||
                                  navigator.msGetUserMedia;

        if ( !navigator.getUserMedia ) { console.log("epic fail") }

        OS.camera.layers.enable(1)
        //OS.camera.layers.set(1)
        this.leftEye.cvs.layers.set(1)

        var video = document.createElement('video'),
            track;
        video.setAttribute('autoplay',true);

        window.vid = video;
        this.getWebcam()

        var self = this
        this.loopFrame
        this.loaded = false
        video.addEventListener('loadedmetadata',function(){
          self.width = video.videoWidth;
          self.height = video.videoHeight;
          self.loaded = true
          //self.startLoop();
          // krupen nikolay fi83 1045 3500 8932 34
        });
    }

    getWebcam() {
        navigator.getUserMedia({ video: true, audio: false }, function(stream) {
          vid.src = window.URL.createObjectURL(stream);
          window.track = stream.getTracks()[0];
        }, function(e) {
          console.error('Rejected!', e);
        });
    }

    update(){
        if (!this.loaded) {
            return
        }
        this.rightEye.ctx.fillStyle = '#eeeeee'
        this.rightEye.ctx.fillRect(
            0,
            0,
            100,
            100
        )
        this.rightEye.ctx.drawImage(vid, this.width/2, 0, this.width, this.height, 0, 0, 100, 100);


        this.rightEye.update()
    }

    /*
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

        this.zed = new THREE.Mesh( geometry, video_material )
        this.zed.name = "zed"
        this.zed.grabbable = true

        OS.camera.add( this.zed )
        this.zed.position.set(-0.2,0.1,-0.5)
        this.zed.lookAt(OS.camera.position)
        /*window.addEventListener('buttonpressed', function (e) {
            if (e.detail.button == "R_JOYSTICK") {
                self.scene.add( self.desktopBox )
                self.zed.position.copy(
                    controller.controllerSphere[0].position
                )
            }
        })
    }


    update() {
    	if ( this.video.readyState === this.video.HAVE_ENOUGH_DATA ){
    	    this.videoTexture.needsUpdate = true;
    	}
    }
    */
}
