import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, Dimensions, View } from 'react-native';
import Canvas from 'react-native-canvas';

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

export default function ControllerScreen({ setScreen }) {

  // const [drawCanvas, setDrawCanvas] = useState(false);
  const drawObjs = [new JoystickObj(150, 200), new ButtonObj(150, 600), new ButtonObj(300, 350), new ButtonObj(300, 500)];
  drawObjs[2].label = "LB";
  drawObjs[3].label = "RB";

  let canvas;
  let ctx;

  const handleCanvas = (c) => {
    if (c == null || canvas != null) return;
    canvas = c;
    ctx = canvas.getContext('2d');
    canvas.width = screenWidth;
    canvas.height = screenHeight;
    draw();
  }

  let coords = [];
  const getPositions = (evt) => {
    coords = [];
    for (i = 0; i < evt.nativeEvent.changedTouches.length; i++) {
      let mouse_x = evt.nativeEvent.changedTouches[i].locationX;
      let mouse_y = evt.nativeEvent.changedTouches[i].locationY;
      coords.push({
        id: evt.nativeEvent.changedTouches[i].identifier,
        x: mouse_x,
        y: mouse_y
      });
    }
  }

  const handleTouchStart = (evt) => {
    getPositions(evt);
    coords.forEach(c => {
      drawObjs.forEach(obj => {
        if (obj.isTouching(c.x, c.y)) {
          obj.setPressed(true, c.id);
        }
      });
    });
    draw();
  }

  const handleTouchMove = (evt) => {
    getPositions(evt);
    coords.forEach(c => {
      drawObjs.forEach(obj => {
        if (obj.pressID == c.id) {
          obj.movePress(c.x, c.y);
        }
      });
    });
    draw();
  }
    
  const handleTouchEnd = (evt) => {
    getPositions(evt);
    coords.forEach(c => {
      drawObjs.forEach(obj => {
        if (obj.pressID == c.id) {
          obj.setPressed(false, 0);
        }
      });
    });
    draw();
  }

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawObjs.forEach(obj => {
      obj.draw(ctx);
    });
  }

  let controllerState = '';
  const generateState = () => {
    let out = '';
    for (let i = 0; i < drawObjs.length; i++) {
      out += drawObjs[i].getState() + ', ';
    }
    return out;
  }

  const sendChanges = () => {
    let newState = generateState();
    if (newState != controllerState) {
      controllerState = newState;
      if (global.dataChannel) {
        global.dataChannel.send(newState);
      }
      else {
        console.log(newState);
      }
    }
  }

  useEffect(() => {
    setInterval(sendChanges, 1);
  }, []);

  return (
    <View
      style={styles.container2}
      onStartShouldSetResponder={() => true}
      onResponderStart={handleTouchStart}
      onResponderMove={handleTouchMove}
      onResponderEnd={handleTouchEnd}
    >
      <Canvas style={styles.container3} ref={handleCanvas}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container2: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container2: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

class JoystickObj {

    constructor(posX, posY) {
        this.posX = posX;
        this.posY = posY;

        this.outerRadius = 100;
        this.innerRadius = 50;
        this.outlineThickness = 8;
        this.bgColor = '#ECE5E5';
        this.fillColor = '#F08080';
        this.outlineColor = '#F6ABAB';

        this.pressID = 0;
        this.pressed = false;
        this.lockX = false;
        this.lockY = false;
        this.stickX = 0;
        this.stickY = 0;
    }

    setPressed(pressed, pid) {
        this.pressed = pressed;
        this.pressID = pid;
        if (!pressed) {
            this.movePress(this.posX, this.posY);
        }
    }

    setAxis(axis, value) {
        let localX = this.stickX;
        let localY = this.stickY;
        if (axis == 0) {
            localX = value * this.outerRadius;
        } else if (axis == 1) {
            localY = value * this.outerRadius;
        }

        let mag = Math.sqrt(Math.pow(localX, 2) + Math.pow(localY, 2));
        if (mag > this.outerRadius) {
            localX *= this.outerRadius / mag;
            localY *= this.outerRadius / mag;
        }
        if (!this.lockX)
            this.stickX = localX;
        if (!this.lockY)
            this.stickY = localY;
        
        // Draw();
    }

    getAxis(axis) {
        if (axis == 0) {
            return this.stickX / this.outerRadius;
        } else if (axis == 1) {
            return this.stickY / this.outerRadius;
        } 
    }

    movePress(x, y) {
        let localX = x - this.posX;
        let localY = y - this.posY;
        let mag = Math.sqrt(Math.pow(localX, 2) + Math.pow(localY, 2));
        if (mag > this.outerRadius) {
            localX *= this.outerRadius / mag;
            localY *= this.outerRadius / mag;
        }
        if (!this.lockX)
            this.stickX = localX;
        if (!this.lockY)
            this.stickY = localY;
    }

    draw(ctx) {
        // Background
        ctx.beginPath();
        ctx.arc(this.posX, this.posY, this.outerRadius, 0, Math.PI * 2, true);
        ctx.fillStyle = this.bgColor;
        ctx.fill();
        // Joystick
        ctx.beginPath();
        ctx.arc(this.stickX + this.posX, this.stickY + this.posY, this.innerRadius, 0, Math.PI * 2, true);
        ctx.fillStyle = this.fillColor;
        ctx.fill();
        ctx.strokeStyle = this.outlineColor;
        ctx.lineWidth = this.outlineThickness;
        ctx.stroke();
    }

    isTouching(x, y) {
        var current_radius = Math.sqrt(Math.pow(x - this.posX, 2) + Math.pow(y - this.posY, 2));
        if (this.outerRadius >= current_radius) return true;
        else return false
    }

    getState() {
        return `${this.getAxis(1)}, ${this.getAxis(0) * -1}`;
    }
}

class ButtonObj {

    constructor(posX, posY) {
        this.posX = posX;
        this.posY = posY;

        this.radius = 50;
        this.outlineThickness = 8;
        this.fillColor = '#F08080';
        this.outlineColor = '#F6ABAB';
        this.textFont = "30px Arial";
        this.textColor = '#ff0000';
        this.label = 'A';
        
        this.pressable = true;
        this.pressID = 0;
        this.pressed = false;
    }

    setPressed(pressed, pid) {
        if (this.pressable) {
            this.pressed = pressed;
            this.pressID = pid;
            // Draw();
        }
    }
    
    movePress(x, y) {

    }

    draw(ctx) {
        // Button
        ctx.beginPath();
        ctx.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, true);
        ctx.fillStyle = this.pressed ?  this.outlineColor : this.fillColor;
        ctx.fill();
        ctx.strokeStyle = this.outlineColor;
        ctx.lineWidth = this.outlineThickness;
        ctx.stroke();
        // Label
        ctx.font = this.textFont;
        ctx.fillStyle = this.textColor;
        ctx.textAlign = "center";
        ctx.fillText(this.label, this.posX, this.posY);
    }

    isTouching(x, y) {
        var current_radius = Math.sqrt(Math.pow(x - this.posX, 2) + Math.pow(y - this.posY, 2));
        if (this.radius >= current_radius) return true;
        else return false
    }

    getState() {
        return this.pressed;
    }
}