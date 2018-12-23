
class CanvasObject {
    constructor() {
        this.scene = OS.scene
        this.canvas = document.createElement('canvas')
        this.ctx = this.canvas.getContext('2d')
    }

    createObject(position, to) {
        if (typeof position === "undefined") {
            position = new THREE.Vector3()
        } else if (Array.isArray(position)) {
            position = (new THREE.Vector3()).fromArray(position)
        } else {
            position = new THREE.Vector3(position.x, position.y, position.z)
        }

        this.texture = new THREE.Texture(this.canvas);

        //var geometry = new THREE.BoxGeometry( 0.05, 0.25, 0.5 );
        var geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.01 );
        //this.mathBox = new THREE.Box3( 0.05, 0.25, 0.5 );
        var material = [
            new THREE.MeshBasicMaterial( { color: 0xffffff } ),
            new THREE.MeshBasicMaterial( { color: 0xffffff } ),
            new THREE.MeshBasicMaterial( { color: 0xffffff } ),
            new THREE.MeshBasicMaterial( { color: 0xffffff } ),
            new THREE.MeshBasicMaterial( { map: this.texture } ),
            new THREE.MeshBasicMaterial( { color: 0xffffff } )
        ]

        this.cvs = new THREE.Mesh( geometry, material )
        //cvs.name = "keyboard"
        this.cvs.position.copy(position)
        this.cvs.grabbable = true
        //this.mathBox = new THREE.Box3().setFromObject(this.cvs);
        //this.mathBox.setFromCenterAndSize(position, new THREE.Vector3( 0.05, 0.25, 0.5 ))
        if (to !== "undefined") {
            to.add( this.cvs )
        } else {
            this.scene.add( this.cvs )
        }

        this.canvas.width = 256 * 0.5 * 4
        this.canvas.height = 256 * 0.5 * 4

        this.cvs.lookAt(OS.camera.position)

        return this.cvs
    }

    update() {
        if (typeof this.texture !== "undefined") {
    	    this.texture.needsUpdate = true
        }
    }
}
