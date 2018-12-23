
class HeadText {
    constructor() {
        this.setFPSText("Initializing...")
        this.log = []
        var self = this
        setInterval(function() {
            self.updateFPSText()
        }, 3000)
    }

    setText(text) {
        if (typeof this.text !== "undefined") {
            OS.camera.remove(this.text)
        }

        var geometry = new THREE.TextGeometry( text, {
            font: OS.font,
            size: (80/5000) * 0.5,
            height: (20/5000) * 0.5,
            curveSegments: 2
        });


        var materials = [
            new THREE.MeshBasicMaterial( { color: 0x000000, overdraw: 0.5 } )
        ];

        var textGeometry = new THREE.Mesh( geometry, materials );

        //scene.add(textGeometry)
        OS.camera.add(textGeometry)

        //textGeometry.position.set(-0.5,0.2,-0.5)
        textGeometry.position.set(-0.2,0.1,-0.5)
        this.text = textGeometry
    }

    setFPSText(text) {
        if (typeof this.fpsText !== "undefined") {
            OS.camera.remove(this.fpsText)
        }

        var geometry = new THREE.TextGeometry( text, {
            font: OS.font,
            size: (80/5000) * 0.5,
            height: (20/5000) * 0.5,
            curveSegments: 2
        });


        var materials = [
            new THREE.MeshBasicMaterial( { color: 0x000000, overdraw: 0.5 } )
        ];

        var textGeometry = new THREE.Mesh( geometry, materials );

        //scene.add(textGeometry)
        OS.camera.add(textGeometry)

        //textGeometry.position.set(-0.5,0.2,-0.5)
        textGeometry.position.set(-0.2,0.1,-0.5)
        this.fpsText = textGeometry
    }

    add(text) {
        if (text.length > 100) {
            //this.log.push("text too long")
            this.log.push(text.substr(0, 100))
            this.add(text.substr(100, text.length))
            //this.updateText()
            return
        }
        this.log.push(text)
        this.updateText()
    }

    update() {
        /*var ms = (new Date()).getTime()
        if (typeof this.lastTime === "undefined") {
            this.lastTime = ms
        }
        this.fps = Math.round(1000 / (ms - this.lastTime))
        this.lastTime = ms
        if (this.fps < 2) {
            this.add(ms+" performacia problematica")
            //this.pause(1000)
        }*/
    }

    updateFPSText() {
        this.setFPSText("FPS " +po.status.FPS + " IPS " +po.status.IPS + "\n")
    }

    updateText() {
        if (this.log.length > 10) {
            //text = text.substring(text.length-200, text.length);
            this.log.shift()
        }

        var text = this.log.join("\n")
        this.setText("\n"+text)
    }
}
