/*
class Keyboard extends CanvasObject {
    constructor() {
        super()
        this.texture = {}
        this.canvasMouse = []
        this.heldButtons = [[], []]
        this.onKey = [false, false]
        this.keyCode = []
        this.created = false

        var self = this
        this.pointing = false

        window.addEventListener('buttonpressed', function (e) {
            if (e.detail.button == "A") {
                if (controller.buttonPressed["R_TRIGGER"]
                && controller.buttonPressed["B"]) {
                    self.spawnKeyboard(controller.controllerSphere[0].position)
                }
            }

            if (!self.pointing) {
                return
            }

            if (e.detail.button == "A") {
                if (self.keyCode[0]) {
                    if (!controller.buttonPressed["R_TRIGGER"]) {
                        socket.emit("keyboard event", {
                            "key": self.keyCode[0]
                        })
                    } else {
                        self.heldButtons[0].push(
                            self.keyCode[0]
                        )
                        socket.emit("keyboard hold", {
                            "key": self.keyCode[0]
                        })
                    }
                }
            }

            if (e.detail.button == "X") {
                if (self.keyCode[1]) {
                    if (!controller.buttonPressed["L_TRIGGER"]) {
                        socket.emit("keyboard event", {
                            "key": self.keyCode[1]
                        })
                    } else {
                        self.heldButtons[1].push(
                            self.keyCode[1]
                        )
                        socket.emit("keyboard hold", {
                            "key": self.keyCode[1]
                        })
                    }
                }
            }
        })

        window.addEventListener('buttonreleased', function (e) {

        	if (e.detail.button == "R_TRIGGER") {
        		for (var i = 0; i < self.heldButtons[0].length; i ++) {
        			socket.emit("keyboard release", {
                        "key" : self.heldButtons[0][i]
                    })
        		}
        		self.heldButtons[0] = []
        	}

            if (e.detail.button == "L_TRIGGER") {
        		for (var i = 0; i < self.heldButtons[1].length; i ++) {
        			socket.emit("keyboard release", {
                        "key" : self.heldButtons[1][i]
                    })
        		}
        		self.heldButtons[1] = []
            }
        })
    }

    update() {
        if (!this.created) {
            return
        }
        if (typeof this.texture !== "undefined") {
    	    this.texture.needsUpdate = true
        }
    }

    point(uv, rightOrleft) {
        var self = keyboard
        if (!self.created) {
            return
        }

    	if (typeof uv == "undefined") {
    		console.warn("uv is undefined")
    		return
    	}
    	if (typeof self.canvas == "undefined") {
    		console.warn("canvas is undefined")
    		return
    	}

        self.pointing = true
        clearTimeout(self.timer)
        self.timer = setTimeout(function() {
            self.pointing = false
        }, 1000)

    	uv.y = Math.abs(uv.y - 1)
    	// release all held buttons
    	self.canvasMouse[rightOrleft] = [
            self.canvas.width * uv.x, self.canvas.height * uv.y
        ]
    	self.drawToCanvas(rightOrleft)
    }

    keyToCode(key) {
    	if (typeof key === "undefined") {
    		return false
    	}
    	if (key.length < 0) {
    		return false
    	}
    	var code = {
    		"<--": "backspace",
    		"ENT": "enter",
    		"SP": "space",
    		"CTR": "control",
    		"TAB": "tab",
    		"DEL": "delete",
    		"ESC": "escape",
    		"UP": "up",
    		"DWN": "down",
    		"LFT": "left",
    		"RGT": "right",
    		"HOM": "home",
    		"END": "end",
    		"PGU": "pageup",
    		"PGD": "pagedown",
    		"WIN": "command",
    		"ALT": "alt",
    		"CTR": "control",
    		"SFT": "shift",
    		"SFL": "right_shift",
    		"INS": "insert",
    		"AGR": false,
    		"CPS": false,
    		"SPE": false
    	}
    	if (key.charAt(0) == "F") {
    		key = key.toLowerCase()
    	}
    	if (typeof code[key] !== "undefined") {
    		return code[key]
    	}
    	return key
    }

    drawToCanvas(rightOrLeft = 0) {
        this.ctx.font = '8pt Arial'
    	this.ctx.fillStyle = 'white'
    	this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    	this.ctx.fillStyle = 'black'
    	this.ctx.textAlign = "center"
    	this.ctx.textBaseline = "middle"

    	var keySize = [
            Math.abs(this.canvas.width / 18), Math.abs(this.canvas.height / 7)
        ]
    	var key = ["ESC", "", "F1", "F3", "F4", "", "F5", "F6", "F7", "F8", "", "F9", "F10", "F11", "F12", "", "", "",
    	"","","","","","","","","","","","","","","","","","",
    	"§","1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "+", "", "'", "<--", "INS", "HOM", "PGU",
    	"TAB","Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "Å", "^", "ENT", "ENT", "DEL", "END", "PGD",
    	"CPS","A", "S", "D", "F", "G", "H", "J", "K", "L", "Ö", "Ä", "ENT", "ENT", "ENT", "", "", "",
    	"SFT",">", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "-", "SFL", "SFT", "SFT", "", "UP", "",
    	"CTR","WIN", "ALT", "SP", "SP", "SP", "SP", "SP","SP","SP","SP", "AGR", "WIN", "SPE", "CTR", "LFT", "DWN", "RGT"]
    	var cnt = 0


    	for (var y = 0; y < this.canvas.height; y += keySize[1]) {
    		this.ctx.beginPath()
    		this.ctx.moveTo(0, y)
    		this.ctx.lineTo(this.canvas.width, y)
    		this.ctx.stroke()
    		for (var x = 0; x < this.canvas.width; x += keySize[0]) {
    			this.ctx.beginPath()
    			this.ctx.moveTo(x, 0)
    			this.ctx.lineTo(x, this.canvas.height)
    			this.ctx.stroke()

    			for (var i = 0; i < this.heldButtons.length; i ++) {
                    for (var i2 = 0; i2 < this.heldButtons[i].length; i2 ++) {
        				if (this.heldButtons[i][i2] == this.keyToCode(key[cnt])) {
        					this.ctx.fillStyle = 'blue';
        					this.ctx.fillRect(x, y, keySize[0], keySize[1]);
        					this.ctx.fillStyle = 'black';
        				}
                    }
    			}

    			for (var i = 0; i < this.canvasMouse.length; i ++) {
    				var mouse = this.canvasMouse[i]
    				if (typeof mouse !== "undefined") {
    					if (this.within(mouse, [x, y], keySize)) {
    						//console.log(key[cnt])
    						this.ctx.fillStyle = 'yellow';
    						this.ctx.fillRect(x, y, keySize[0], keySize[1]);
    						this.ctx.fillStyle = 'black';

                            this.keyCode[rightOrLeft] = this.keyToCode(key[cnt])
    					}
    				}
    			}

    			if (typeof key[cnt] !== "undefined") {
    				this.ctx.fillText(
                        key[cnt], x + (keySize[0]/2), y + (keySize[1]/2)
                    )
    			}

    			cnt ++
    		}
    	}
    }

    spawnKeyboard(position) {
        var kbd = this.createObject(position)
    	kbd.name = "keyboard"
        kbd.point = this.point
        this.created = true
    }

    within(crd, pos, size) {
    	if (crd[0] >= pos[0] && crd[0] <= pos[0]+size[0])
    		if (crd[1] >= pos[1] && crd[1] <= pos[1]+size[1])
    			return true
    	return false
    }

}

// This is a spherical version of the keyboard
class Keyboard2 {
    constructor() {
        var self = this
        loader.load( 'fonts/font_helvetiker_regular.typeface.json', function ( font ) {
        	self.loaded = true
        	self.font = font
        })
    }

    spawnSphere(position, text = "", scale = 1) {
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
        scene.add(sphere)
        return sphere
    }

	spawnText(text, position, textSize = 1) {
        if (!this.loaded) {
            return
        }

		var geometry = new THREE.TextGeometry( text, {
			font: this.font,
			size: (80/5000) * textSize,
            height: (20/5000) * textSize,
			curveSegments: 2
		})


		var materials = [
			new THREE.MeshBasicMaterial( { color: 0x000000, overdraw: 0.5 } )
		]

		var textGeometry = new THREE.Mesh( geometry, materials )

		textGeometry.position.copy(position)
		textGeometry.lookAt( camera.position )

        scene.add(textGeometry)

		return textGeometry
	}
}
*/

// this is a remastered version
class Keyboard extends CanvasObject {
    constructor() {
        super()
        var self = this

        this.pointing = false

        this.scale = 1


        this.textHeight = 8
        this.ctx.font = this.textHeight+"pt Arial"

        this.keyboardImage = new Image()
        this.keyboardImage.src = '/img/keyboard.png';
        this.keyboardImage.onload = function() {
            //self.drawKeyboard()
        }

        this.currentKey = [0, 0]

        this.canvasMouse = []

        this.controllerWrapper()

        this.timeout = []
    }

    controllerWrapper() {
        var self = this
        window.addEventListener('buttonpressed', function (e) {
            if (e.detail.button == "A") {
                if (controller.buttonPressed["R_TRIGGER"]) {
                    self.spawnKeyboard(controller.controllerSphere[0].position)
                }
            }

            if (!self.pointing) {
                return
            }

            if (e.detail.button == "A") {
                self.mouseDown(self.canvasMouse[0], 0)
            }

            if (e.detail.button == "X") {
                self.mouseDown(self.canvasMouse[1], 1)
            }
        })

        window.addEventListener('buttonreleased', function (e) {
            if (!self.pointing) {
                return
            }


            if (e.detail.button == "R_TRIGGER") {
                self.keyUp("AltGr")
            }

            if (e.detail.button == "L_TRIGGER") {
                self.keyUp("Shift")
            }

            if (e.detail.button == "A") {
                self.mouseUp(e.detail.button, 0)
            }

            if (e.detail.button == "X") {
                self.mouseUp(e.detail.button, 1)
            }
        })
    }

    keyUp(key) {
        for (var i = 0; i < this.keys.length; i ++) {
            if (this.keys[i][0][0] == key) {
                this.keys[i][4] = false
            }
        }
    }


    point(uv, rightOrleft) {
        var self = keyboard
        if (!self.created) {
            return
        }

    	if (typeof uv == "undefined") {
    		console.warn("uv is undefined")
    		return
    	}
    	if (typeof self.canvas == "undefined") {
    		console.warn("canvas is undefined")
    		return
    	}

        self.pointing = true
        clearTimeout(self.timer)
        self.timer = setTimeout(function() {
            self.pointing = false
        }, 1000)

    	uv.y = Math.abs(uv.y - 1)
    	// release all held buttons
    	self.canvasMouse[rightOrleft] = [
            self.canvas.width * uv.x, self.canvas.height * uv.y
        ]
    	self.mouseMove(self.canvasMouse[rightOrleft], rightOrleft)
    }

    applyScale(num, xOry){
        return Math.round(num*this.scale[xOry])
    }

    drawKeyboard() {
        this.ctx.fillStyle = '#eeeeee'
        this.ctx.fillRect(
            0,
            0,
            this.applyScale(this.keyboardImage.width, 0),
            this.applyScale(this.keyboardImage.height, 1)
        )

        this.ctx.fillStyle = '#aaaaaa'
        for (var i = 0; i < this.keys.length; i ++) {
            if (this.keys[i][3]) {
                this.ctx.fillRect(
                    this.keys[i][1][0],
                    this.keys[i][1][1],
                    this.keys[i][2][0],
                    this.keys[i][2][1]
                )
                if (this.keys[i][0] == "Enter") {
                    this.ctx.fillRect(
                        this.applyScale(830, 0),
                        this.applyScale(129, 1),
                        this.applyScale(880 - 830, 0),
                        this.applyScale(238 - 129, 1)
                    )
                }
            }
        }


        this.ctx.fillStyle = '#555555'
        for (var i = 0; i < this.keys.length; i ++) {
            if (this.keys[i][4]) {
                this.ctx.fillRect(
                    this.keys[i][1][0],
                    this.keys[i][1][1],
                    this.keys[i][2][0],
                    this.keys[i][2][1]
                )
                if (this.keys[i][0] == "Enter") {
                    this.ctx.fillRect(
                        this.applyScale(830, 0),
                        this.applyScale(129, 1),
                        this.applyScale(880 - 830, 0),
                        this.applyScale(238 - 129, 1)
                    )
                }
            }
        }


        this.ctx.fillStyle = '#000000'
        for (var i = 0; i < this.keys.length; i ++) {
            var alignedChar = 0
            if (this.isShiftPressed()) {
                alignedChar += 1
            } else if (this.isAltGrPressed()) {
                alignedChar += 2
            }
            if (typeof this.keys[i][0][alignedChar] === "undefined"){
                this.keys[i][0][alignedChar] = ""
            }
            this.ctx.fillText(
                this.keys[i][0][alignedChar],
                Math.round(
                    this.keys[i][1][0] + (this.keys[i][2][0]/2)
                    - Math.round((
                        this.ctx.measureText(this.keys[i][0][alignedChar]).width /2
                    ))
                ),
                Math.round(
                    this.keys[i][1][1] + (this.keys[i][2][1]/2)
                ) + this.applyScale(6, 1)
            )
        }
        // remember onload - (this.keys[i][2][1]/2)
        this.ctx.drawImage(
            this.keyboardImage,
            0,
            0,
            this.applyScale(this.keyboardImage.width, 0),
            this.applyScale(this.keyboardImage.height, 1)
        )
    }

    isShiftPressed() {
        for (var i = 0; i < this.keys.length; i ++) {
            if (this.keys[i][0][0] == "Shift" && this.keys[i][4]) {
                return true
            }
        }
        return false;
    }

    isAltGrPressed() {
        var ctrl = false
        for (var i = 0; i < this.keys.length; i ++) {
            if (this.keys[i][0][0] == "Ctrl" && this.keys[i][4]) {
                ctrl = true
            }
        }
        for (var i = 0; i < this.keys.length; i ++) {
            if (this.keys[i][0][0] == "Alt" && this.keys[i][4]) {
                if (ctrl) {
                    return true
                }
            }
        }
        for (var i = 0; i < this.keys.length; i ++) {
            if (this.keys[i][0][0] == "AltGr" && this.keys[i][4]) {
                return true
            }
        }
        return false;
    }

    spawnKeyboard(position) {
        // todo, check for double creations
        var kbd = this.createObject(position)
    	kbd.name = "keyboard"
        kbd.point = this.point
        this.created = true
        //console.log(this.keyboardImage.width / this.keyboardImage.height)
        kbd.scale.y = 1 / (this.keyboardImage.width / this.keyboardImage.height)
        this.scale = [
            (this.canvas.width / this.keyboardImage.width),
            (this.canvas.height / this.keyboardImage.height)
        ]
        //this.scale = (this.canvas.width / this.keyboardImage.width)

        //this.keyboardImage.width = this.canvas.width
        //this.keyboardImage.height = this.canvas.height
        this.loadKeyData()
        this.drawKeyboard()
        //kbd.scale.y = height;

    }

    loadKeyData() {
        this.keys = [
            [
                ["Esc"],
                [this.applyScale(4, 0), this.applyScale(2, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["F1"],
                [this.applyScale(131, 0), this.applyScale(2, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["F2"],
                [this.applyScale(190, 0), this.applyScale(2, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["F3"],
                [this.applyScale(249, 0), this.applyScale(2, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["F4"],
                [this.applyScale(307, 0), this.applyScale(2, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["F5"],
                [this.applyScale(392, 0), this.applyScale(2, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["F6"],
                [this.applyScale(451, 0), this.applyScale(2, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["F7"],
                [this.applyScale(510, 0), this.applyScale(2, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["F8"],
                [this.applyScale(569, 0), this.applyScale(2, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["F9"],
                [this.applyScale(653, 0), this.applyScale(2, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["F10"],
                [this.applyScale(712, 0), this.applyScale(2, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["F11"],
                [this.applyScale(771, 0), this.applyScale(2, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["F12"],
                [this.applyScale(829, 0), this.applyScale(2, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["PrtSc"],
                [this.applyScale(913, 0), this.applyScale(2, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["ScLck"],
                [this.applyScale(972, 0), this.applyScale(2, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["Pause"],
                [this.applyScale(1031, 0), this.applyScale(2, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["1", "!"],
                [this.applyScale(63, 0), this.applyScale(70, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["2", "\"", "@"],
                [this.applyScale(122, 0), this.applyScale(70, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["3", "#", "£"],
                [this.applyScale(181, 0), this.applyScale(70, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["4", "¤", "$"],
                [this.applyScale(240, 0), this.applyScale(70, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["5", "%"],
                [this.applyScale(299, 0), this.applyScale(70, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["6", "&"],
                [this.applyScale(358, 0), this.applyScale(70, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["7", "/", "{"],
                [this.applyScale(417, 0), this.applyScale(70, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["8", "(", "["],
                [this.applyScale(476, 0), this.applyScale(70, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["9", ")", "]"],
                [this.applyScale(535, 0), this.applyScale(70, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["0", "=", "}"],
                [this.applyScale(594, 0), this.applyScale(70, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["+", "?", "\\"],
                [this.applyScale(712, 0), this.applyScale(70, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],

            [
                ["´", "`"],
                [this.applyScale(653, 0), this.applyScale(70, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["q", "Q"],
                [this.applyScale(97, 0), this.applyScale(129, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["w", "W"],
                [this.applyScale(156, 0), this.applyScale(129, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["e", "E", "€"],
                [this.applyScale(215, 0), this.applyScale(129, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["r", "R"],
                [this.applyScale(274, 0), this.applyScale(129, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["t", "T"],
                [this.applyScale(333, 0), this.applyScale(129, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["y", "Y"],
                [this.applyScale(392, 0), this.applyScale(129, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["u", "U"],
                [this.applyScale(451, 0), this.applyScale(129, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["i", "I"],
                [this.applyScale(510, 0), this.applyScale(129, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["o", "O"],
                [this.applyScale(569, 0), this.applyScale(129, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["p", "P"],
                [this.applyScale(628, 0), this.applyScale(129, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["å", "Å"],
                [this.applyScale(687, 0), this.applyScale(129, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["¨", "^"], // missing floating sign
                [this.applyScale(746, 0), this.applyScale(129, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["Enter"],
                [this.applyScale(805, 0), this.applyScale(129, 1)],
                [this.applyScale(879 - 805, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["a", "A"],
                [this.applyScale(122, 0), this.applyScale(188, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["s", "S"],
                [this.applyScale(181, 0), this.applyScale(188, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["d", "D"],
                [this.applyScale(240, 0), this.applyScale(188, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["f", "F"],
                [this.applyScale(299, 0), this.applyScale(188, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["g", "G"],
                [this.applyScale(358, 0), this.applyScale(188, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["h", "H"],
                [this.applyScale(417, 0), this.applyScale(188, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["j", "J"],
                [this.applyScale(476, 0), this.applyScale(188, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["k", "K"],
                [this.applyScale(535, 0), this.applyScale(188, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["l", "L"],
                [this.applyScale(594, 0), this.applyScale(188, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["ä", "Ä"],
                [this.applyScale(653, 0), this.applyScale(188, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["ö", "Ö"],
                [this.applyScale(712, 0), this.applyScale(188, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["*"],
                [this.applyScale(771, 0), this.applyScale(188, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["<", ">", "|"],
                [this.applyScale(97, 0), this.applyScale(247, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["z", "Z"],
                [this.applyScale(156, 0), this.applyScale(247, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["x", "X"],
                [this.applyScale(215, 0), this.applyScale(247, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["c", "C"],
                [this.applyScale(274, 0), this.applyScale(247, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["v", "V"],
                [this.applyScale(333, 0), this.applyScale(247, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["b", "B"],
                [this.applyScale(392, 0), this.applyScale(247, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["n", "N"],
                [this.applyScale(451, 0), this.applyScale(247, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["m", "M"],
                [this.applyScale(510, 0), this.applyScale(247, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                [",", ";"],
                [this.applyScale(569, 0), this.applyScale(247, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                [".", ":"],
                [this.applyScale(628, 0), this.applyScale(247, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["-", "_"],
                [this.applyScale(687, 0), this.applyScale(247, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["Ctrl"],
                [this.applyScale(4, 0), this.applyScale(306, 1)],
                [this.applyScale(64, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["Alt"],
                [this.applyScale(151, 0), this.applyScale(306, 1)],
                [this.applyScale(64, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                [" "],
                [this.applyScale(224, 0), this.applyScale(306, 1)],
                [this.applyScale(585-224, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["AltGr"],
                [this.applyScale(594, 0), this.applyScale(306, 1)],
                [this.applyScale(64, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["Ctrl"],
                [this.applyScale(815, 0), this.applyScale(306, 1)],
                [this.applyScale(64, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["Shift"],
                [this.applyScale(4, 0), this.applyScale(247, 1)],
                [this.applyScale(87-4, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["CapsLock"],
                [this.applyScale(4, 0), this.applyScale(188, 1)],
                [this.applyScale(112-4, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["Tab"],
                [this.applyScale(4, 0), this.applyScale(129, 1)],
                [this.applyScale(87-4, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["§"],
                [this.applyScale(4, 0), this.applyScale(70, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["Shift"],
                [this.applyScale(746, 0), this.applyScale(247, 1)],
                [this.applyScale(879-746, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["Backspace"],
                [this.applyScale(771, 0), this.applyScale(70, 1)],
                [this.applyScale(879-771, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["→"],
                [this.applyScale(1031, 0), this.applyScale(306, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["↓"],
                [this.applyScale(972, 0), this.applyScale(306, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["←"],
                [this.applyScale(913, 0), this.applyScale(306, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["↑"],
                [this.applyScale(972, 0), this.applyScale(247, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["Insert"],
                [this.applyScale(917, 0), this.applyScale(70, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["Delete"],
                [this.applyScale(917, 0), this.applyScale(129, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["Home"],
                [this.applyScale(972, 0), this.applyScale(70, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["End"],
                [this.applyScale(972, 0), this.applyScale(129, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["PgUp"],
                [this.applyScale(1031, 0), this.applyScale(70, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["PgDwn"],
                [this.applyScale(1031, 0), this.applyScale(129, 1)],
                [this.applyScale(49, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["  "],
                [this.applyScale(77, 0), this.applyScale(306, 1)],
                [this.applyScale(64, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["  "],
                [this.applyScale(668, 0), this.applyScale(306, 1)],
                [this.applyScale(64, 0), this.applyScale(49, 1)],
                false,
                false
            ],
            [
                ["Cmd"],
                [this.applyScale(742, 0), this.applyScale(306, 1)],
                [this.applyScale(64, 0), this.applyScale(49, 1)],
                false,
                false
            ]
        ]
    }

    // todo, optimize performance, so that you dont redraw every second
    // todo fix graphical bug
    mouseMove(crd, rightOrLeft) {
        var self = this
        for (var i = 0; i < this.keys.length; i ++) {
            if (this.within(
                crd,
                this.keys[i][1],
                this.keys[i][2]
            ) || this.keys[i][0] == "Enter" && this.within(
                crd,
                [this.applyScale(830, 0),
                    this.applyScale(129, 1)],
                [this.applyScale(880 - 830, 0),
                    this.applyScale(238 - 129, 1)]
            )) {
                this.keys[i][3] = true
                this.currentKey[rightOrLeft] = i
                this.drawKeyboard()
                clearTimeout(this.timeout[i])
                this.timeout[i] = setTimeout(
                    "keyboard.keys["+i+"][3] = false; "
                    + "keyboard.keys["+i+"][4] = false; "
                    + "keyboard.drawKeyboard()",
                    100
                )
            }


           if (this.keys[i][0][0] == "Shift" && controller.buttonPressed["L_TRIGGER"]) {
               this.keys[i][4] = true
           }
           if (this.keys[i][0][0] == "AltGr" && controller.buttonPressed["R_TRIGGER"]) {
               this.keys[i][4] = true
           }


        }

    }

    // todo, optimize performance, so that you dont redraw every second
    mouseDown(crd, rightOrLeft) {
        this.keys[this.currentKey[rightOrLeft]][4] = true
    }

    mouseUp(crd, rightOrLeft) {
        this.keys[this.currentKey[rightOrLeft]][4] = false
    }

    within(crd, pos, size) {
        if (crd[0] >= pos[0] && crd[0] <= pos[0]+size[0])
            if (crd[1] >= pos[1] && crd[1] <= pos[1]+size[1])
                return true
        return false
    }
}

// this keyboard is made of an object file
/*
class Keyboard3 {

var kbdobject
function load_kbd_model() {
	// instantiate a loader
	var loader = new THREE.OBJLoader();

	// load a resource
	loader.load(
		// resource URL
		'res/keyboard/key board.obj',
		// called when resource is loaded
		function ( object ) {

			console.log(object)
			object.traverse( function ( child ) {
				if ( child instanceof THREE.Mesh ) {

					if (child.type == "Mesh") {
						//child.material.color.set( 0x00ff00 )
						console.log(child)
					}
				}
			} );

			kbdobject = object
			//object.material.color.set( 0x00ff00 );
			scene.add( kbdobject );

		},
		// called when loading is in progresses
		function ( xhr ) {

			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

		},
		// called when loading has errors
		function ( error ) {

			console.log( 'An error happened' );

		}
	);
}

*/
