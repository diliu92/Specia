/***
 * Scaffolded by Jingjie (Vincent) Zheng on June 24, 2015.
 */

'use strict';

/**
 * A function that creates and returns the spaceship model.
 */

function createViewModule() {
    var SpaceshipView = function(model, canvas) {
    /**
     * Obtain the SpaceshipView itself.
     */
    var self = this;

    /**
     * Maintain the model.
     */
    this.model = model;

    /**
     * Maintain the canvas and its context.
     */
    this.canvas = canvas;
    this.context = canvas.getContext('2d');

    /**
     * Update the canvas.
     * You should be able to do this trivially by first clearing the canvas, then call the rootNode's
     * renderAll() with the context.
     */
    this.update = function() {
        this.context.clearRect(0, 0, canvas.width, canvas.height);
        this.model.rootNode.renderAll(this.context);
    };

    /**
     * You should add the view as a listener to each node in the scene graph, so that the view can get
     * updated when the model is changed.
     */
    this.model.rootNode.addListener(this);
    this.model.spaceshipNode.addListener(this);
    this.model.headNode.addListener(this);
    this.model.bodyNode.addListener(this);
    this.model.tailNode.addListener(this);
    this.model.handleNode.addListener(this);
    this.model.fireNode.addListener(this);

    var that = this;
    this.keysStates = { 37: false,
                        38: false,
                        39: false};
    this.dragging = false;
    this.resizing = false;
    this.notPowerUP = true;
    this.notMoving = true;
    /**
     * Handle mousedown events.
     * You should perform a hit detection here by calling the model's performHitDetection().
     */
    canvas.addEventListener('mousedown', function(e) {
        var x = e.layerX;
        var y = e.layerY;
        var point = [x,y];
        var hitNode = that.model.performHitDetection(point);
        if (hitNode == that.model.bodyNode){
            that.dragging = true;
        }
        else if (hitNode == that.model.handleNode){
            that.resizing = true;
        }
    });

    /**
     * Handle mousemove events.
     */
    canvas.addEventListener('mousemove', function(e) {
        if ((that.notPowerUP && that.notMoving && that.dragging) ||
            (that.notPowerUP && that.notMoving && that.resizing)){
            var theta = that.model.spaceshipNode.theta;
            var point = [e.movementX, e.movementY];
            var transformedPoint = [0,0]
            var matrix = new AffineTransform();
            matrix.rotate(-theta, 0, 0);
            matrix.transform(point, 0, transformedPoint, 0, 1);
            var x = transformedPoint[0];
            var y = transformedPoint[1];
            if (that.dragging){
                that.model.spaceshipNode.translate(x,y);
            }
            else{
                var spaceshipNode = that.model.spaceshipNode;
                var headNode = that.model.headNode;
                var bodyNode = that.model.bodyNode;
                var handleNode = that.model.handleNode;

                if (bodyNode.localBoundingBox.h - y < 15){
                    y = bodyNode.localBoundingBox.h - 15;
                }

                spaceshipNode.localBoundingBox.y = spaceshipNode.localBoundingBox.y + y;
                spaceshipNode.localBoundingBox.h = spaceshipNode.localBoundingBox.h - y;

                headNode.localBoundingBox.y = headNode.localBoundingBox.y + y;

                bodyNode.localBoundingBox.y = bodyNode.localBoundingBox.y + y;
                bodyNode.localBoundingBox.h = bodyNode.localBoundingBox.h - y;

                handleNode.localBoundingBox.y = handleNode.localBoundingBox.y + y;

                that.update();
            }
        }

        //change cursor
        var p = [e.layerX, e.layerY];
        var hitNode = that.model.performHitDetection(p);
        if (hitNode == that.model.bodyNode){
            that.canvas.style.cursor = "move";
        }
        else if (hitNode == that.model.handleNode){
            that.canvas.style.cursor = "pointer";
        }
        else{
            that.canvas.style.cursor = "default";
        }
    });


    /**
     * Handle mouseup events.
     */
    canvas.addEventListener('mouseup', function(e) {
        that.dragging = false;
        that.resizing = false;
    });

    this.keyEvents = function(){
        if(this.keysStates[38]){ // up
            that.notMoving = false;
            this.model.fireNode.visible = true;
            var theta = this.model.tailNode.getTheta() / 5;
            var shipNode = this.model.spaceshipNode;
            shipNode.theta -= theta;
            shipNode.rotate(-theta,0,0);
            shipNode.translate(0,-5);

            var headPoint = [0, shipNode.localBoundingBox.y];
            var acturalPoint = [0,0]
            shipNode.globalTransformation.transform(headPoint, 0, acturalPoint, 0, 1);
            // var acturalPoint = [shipNode.globalTransformation.m02_,shipNode.globalTransformation.m12_];
            if (acturalPoint[0] < 0){
                shipNode.rotate(-shipNode.theta, 0, 0);
                shipNode.translate(800,0);
                shipNode.rotate(shipNode.theta, 0, 0);
            }
            else if (acturalPoint[0] > 800){
                shipNode.rotate(-shipNode.theta, 0,0);
                shipNode.translate(-800,0);
                shipNode.rotate(shipNode.theta, 0, 0);
            }
            else if (acturalPoint[1] < 0){
                shipNode.rotate(-shipNode.theta, 0,0);
                shipNode.translate(0,600);
                shipNode.rotate(shipNode.theta, 0, 0);
            }
            else if (acturalPoint[1] > 600){
                shipNode.rotate(-shipNode.theta, 0,0);
                shipNode.translate(0,-600);
                shipNode.rotate(shipNode.theta, 0, 0);
            }
        }

        if (this.keysStates[39]){ //right
            var tailNode = this.model.tailNode;
            tailNode.rotate(-tailNode.getTheta(),0,0);
            tailNode.decreaseTheta();
            tailNode.rotate(tailNode.getTheta(),0,0);
        }
        if (this.keysStates[37]){ //left
            var tailNode = this.model.tailNode;
            tailNode.rotate(-tailNode.getTheta(),0,0);
            tailNode.increaseTheta();
            tailNode.rotate(tailNode.getTheta(),0,0);
        }

        if(!this.keysStates[38]){
            that.model.fireNode.visible = false;
            that.notMoving = true;
        }
        this.update();
    };

    /**
     * Handle keydown events.
     */
    document.addEventListener('keydown', function(e) {
        if(e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39){
            that.keysStates[e.keyCode] = true;
        }
    });

    /**
     * Handle keyup events.
     */
    document.addEventListener('keyup', function(e) {
        if(e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39){
            that.keysStates[e.keyCode] = false;
        }
        if (e.keyCode == 32){ //space
            that.notPowerUP = false;
            that.model.spaceshipNode.scale(2,2);
            that.model.spaceshipNode.increaseSpeed();
            that.model.spaceshipNode.scaleValue *= 2;
            setTimeout(function(){
                            that.notPowerUP = true;
                            that.model.spaceshipNode.scale(0.5,0.5);
                            that.model.spaceshipNode.decreaseSpeed();
                            that.model.spaceshipNode.scaleValue /= 2;
                        }, 5000);
        }
    });

    setInterval(function(){that.keyEvents();},100);

    /**
     * Update the view when first created.
     */
    this.update();
    };

    return {
        SpaceshipView: SpaceshipView
    };
}
