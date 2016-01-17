/************ FAMOUS INTERNALS INTITIALIZATION ************/
'use strict';

var DOMElement = require('famous/dom-renderables/DOMElement');
var FamousEngine = require('famous/core/FamousEngine');

var scene = FamousEngine.createScene();

/***************** NON-FAMOUS GLOBALS ********************/

// Background colors
var bgs = ['#F6F6F6','#F87D09','#004A55','#A7CDCC'];
// Mount points
var mountX = [-0.5,-0.5,0.5,0.5];
var mountY = [-0.5,0.5,0.5,-0.5];
// Branching factor
var bFactor = mountX.length;

// Storage for updating, stores sets of nodes corresponding to each level of the fractal
var levels = [];

/*********** SCENE AND BUTTON INTITIALIZATION ***********/

// Parent is the main element of the scene. Everything else happens inside this
var parent = scene.addChild();
new DOMElement(parent, {
  properties: {
    'background-color' : '#49afeb'
  }
});

var generate = parent.addChild();
new DOMElement(generate, {
  tagName: 'img',
  properties: {
    'border-radius' : '50%',
    'cursor' : 'pointer'
  }
})
.setAttribute('src', './images/famous_logo.png');
generate
  .setSizeMode('absolute','absolute','absolute')
  .setAbsoluteSize(100,100,100)
  .setAlign(0,1)
  .setMountPoint(-0.5,1.5);

var reduce = parent.addChild();
new DOMElement(reduce, {
  properties: {
    'border-radius' : '50%',
    'background-color' : 'red',
    'cursor' : 'pointer'
  }
});
reduce
  .setSizeMode('absolute','absolute','absolute')
  .setAbsoluteSize(100,100,100)
  .setAlign(1,1)
  .setMountPoint(1.5,1.5);

/***************** BASE SET GENERATION ******************/

var children = [];
for (var i = 0; i < 4; i++) {
  children[i] = parent.addChild();
  new DOMElement(children[i], {
    properties : {
      'background-color' : bgs[i]
    }
  });

  children[i]
    .setSizeMode('absolute','absolute','absolute')
    .setAbsoluteSize(200,200,200)
    .setAlign(0.5,0.5)
    .setMountPoint(mountX[i],mountY[i]);
}
levels.push(children);

delete window.children;

/**************** GENERATING LEVELS ********************/

// Click handler for button to generate children for the next fractal level
generate.addUIEvent('click');
generate.onReceive = function(event, payload) {
  if (event === 'click') {
    var depth = levels.length;
    var children = [];
    if(levels[depth-1].length > 4000) {
      alert("There are over 4000 elements in the current level of the fractal! Adding more levels is neither wise or necessary");
      return;
    }
    // Add children to the currently last level of the fractal. Add as many children as supported by the branching factor
    levels[depth-1].forEach(function(element, index) {
      for (var i = 0; i < bFactor; i++) {
        var ind = index*bFactor + i;
        children[ind] = element.addChild();
        new DOMElement(children[ind], {
          properties : {
            'background-color' : bgs[i]/*,
            'opacity' : 1/(depth/2)*/
          }
        });

        children[ind]
          .setSizeMode('absolute','absolute','absolute')
          .setAbsoluteSize(200/(depth+1),200/(depth+1),200/(depth+1))
          .setAlign(0.5,0.5)
          .setMountPoint(mountX[i],mountY[i]);
      }
    });

    // Add the new level to the end of the node list for updating
    levels.push(children);
  }
};


// Click handler for button to reduce the fractal level
reduce.addUIEvent('click');
reduce.onReceive = function(event, payload) {
  if (event === 'click') {
    var length = levels.length;
    if (length > 1) {
      // Remove children from DOM tree and parent Famous Node
      var parents = levels[length-1];
      parents.forEach(function(element) {
        element.dismount();
      });

      // Remove the children from the levels list for updating
      levels.pop();
    }
  }
};

/******************* GET THE SPINNING GOING ********************/

var spinner = parent.addComponent({
  onUpdate: function(time) {
    var s = 1;
    levels.forEach(function(element) {
      element.forEach(function(elem) {
        elem.setRotation(0, 0, s*time / 1000);
      });
      s *= -2;
    });
    parent.requestUpdateOnNextTick(spinner);
  }
});

// Starting the damn thing
parent.requestUpdate(spinner);
FamousEngine.init();
