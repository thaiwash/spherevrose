class ThreeInspect {
    constructor(socket, objectId) {
        var self = this
        this.chars = []
        this._text = "test"
        this.tildeAt = 0

        this.bgColor = '#282c34'
        this.textColor = '#fff'
        this.tildeColor = '#0000ff'
        this.selectColor = '#ffffff'

        this.width = 500
        this.height = 500
        this.padding = 10

        this.textSize = 8

        var Canvas = require('canvas')
        this.canvas = new Canvas(this.width, this.height)
        this.ctx = this.canvas.getContext('2d')

        this.ctx.font = this.textSize+"pt Courier"

        this.socket = socket
        this.objectId = objectId

    }

    update() {
        this.draw()
        //console.log("here")
        this.socket.emit("texture update", {
            "object_id": this.objectId,
            "texture": this.getTexture()
        })
    }

    draw() {
        // clear
        function clear (self) {
            self.ctx.fillStyle = self.bgColor
            self.ctx.fillRect(0, 0, self.width, self.height)
        }
        clear()
    }
    getTexture() {
        return this.canvas.toDataURL().substr("data:image/png;base64,".length);
    }
}


module.exports = function (socket, objectId) {
    return new ThreeInspect(socket, objectId)
}
