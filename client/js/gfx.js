$(document).ready(onReady)
$(window).resize(resize)
window.onorientationchange = resize;
var GROW = GROW || {};


var loader;

var width = 480;
var height = 320;
var objectScale = 0.5;

var resources;

var shop;
var shopInventory = [];
var leaf;

var maxX = width;
var minX = 0;
var maxY = height;
var minY = 0;


var wobbleRad = 0.523599;

var stage;
var renderer;

//var shopContainer;
//var startBunnyCount = 2;
//var isAdding = false;
//var count = 0;
//var container;
//var pixiLogo;
//var clickImage;

var amount = 100;


function resize() {

  console.log('func resizing');

  var width = $(window).width();
  var height = $(window).height();

  if (width > 800) width = 800;
  if (height > 600) height = 600;

  maxX = width;
  minX = 0;
  maxY = height;
  minY = 0;

  var w = $(window).width() / 2 - width / 2;
  var h = $(window).height() / 2 - height / 2;

  renderer.view.style.left = $(window).width() / 2 - width / 2 + "px"
  renderer.view.style.top = $(window).height() / 2 - height / 2 + "px"

  //  stats.domElement.style.left = w + "px";
  //  stats.domElement.style.top = h + "px";

  title.style.left = w + "px";
  title.style.top = h + 49 + "px";

  //  pixiLogo.style.right = w + "px";
  //  pixiLogo.style.bottom = h + 8 + "px";
  //
  //  clickImage.style.right = w + 108 + "px";
  //  clickImage.style.bottom = h + 17 + "px";

  renderer.resize(width, height);
}









function onReady() {

  renderer = PIXI.autoDetectRenderer(800, 600, {
    backgroundColor: 0xdedbc8
  });
  stage = new PIXI.Stage(0xdedbc8);

  leafTexture = new PIXI.Texture.fromImage("asset/vegetation/opt/plant.png");

  title = document.createElement("div");
  title.className = "game-title";
  document.body.appendChild(title);

  requestAnimationFrame(update);

  shop = new Shop();
  
  $(renderer.view).click(function () {
    console.log('clicked in game');
    //shop.addItem();
  });



  // The renderer will create a canvas element for you that you can then insert into the DOM. 
  document.body.appendChild(renderer.view);

  // You need to create a root container that will hold the scene you want to draw. 
  //var stage = new PIXI.Container();

  // load the textures we need 
  loader = PIXI.loader;

  loader.add('leaf', 'asset/vegetation/opt/plant.png');
  loader.add('itemBg', 'asset/shopItem.png');
  loader.add('buyButtonIdle', 'asset/shopItem_buy_idle.png');
  loader.add('rejectButtonIdle', 'asset/shopItem_reject_idle.png');
  loader.add('buyButtonClick', 'asset/shopItem_buy_click.png');
  loader.add('rejectButtonClick', 'asset/shopItem_reject_click.png');
  
  loader.once('complete', onAssetsLoaded);
  loader.load();
}








function onAssetsLoaded(e) {

  // add debug window
  var debug = new Debug();
  var scoreBoard = new ScoreBoard();
//  stage.addChild(debug);
  
  
  
  resources = e.resources;
  console.log(e.resources);
  
  if (resources.leaf.texture instanceof PIXI.Texture) {
    console.log('leaf is an instance of texture');
  }
  
  else {
    console.log('leaf is not an instance of txture');
  }

  // This creates a texture from a 'bunny.png' image. 
  var l = new PIXI.Sprite(resources.leaf.texture);
  l.anchor.x = 0.5;
  l.anchor.y = 0.5;
  //shopInventory.push(leaf);

  // Setup the position and scale of the bunny 
  l.position.x = 400;
  l.position.y = 100;

  l.scale.x = 0.5;
  l.scale.y = 0.5;

  // Add the bunny to the scene we are building. 
  stage.addChild(l);

  resize();
  
  
  
  GROW.ee.on('add', function(item) {
    //console.log(item);
    shop.addItem(item);
  });
  
  
  // kick off the animation loop (defined below) 
  update();
  
  

}








function wobblePlant(plant) {

  if (!typeof (plant['_wobbleDir'])) plant['_wobbleDir'] = 1;

  // if plant wobble direction is right
  if (plant._wobbleDir == 1) {

    // if plant is at max wobble radians
    if (plant.rotation > wobbleRad) {

      // change directions
      plant._wobbleDir = 0;
    }

    // plant is not at max wobble angle
    else {

      // keep turning to right
      plant.rotation += 0.01;
    }
  }


  // plant wobble direction is left
  else {


    // if plant is at left max wobble radian
    if (plant.rotation < (wobbleRad - wobbleRad - wobbleRad)) {

      // change direction
      plant._wobbleDir = 1;

    }

    // plant is not at max wobble
    else {

      // rotate left
      plant.rotation -= 0.01;
    }
  }

}

function wobblePlants() {
  _.each(shopInventory, wobblePlant);
}






/**
 * scoreboard class
 */
var Scoreboard = function Scoreboard() {
  this.container.
}




/**
 * debug class
 */
var Debug = function Debug() {
  this.container = new PIXI.Container();
  this.textHistory = [];
  var self = this;
  this.text = new PIXI.Text("debug", {
    font: "12px Arial",
    fill:"red"
  });
  this.text.position.y = 200;
  this.text.anchor.y = 1;
  
//  var text = new PIXI.extras.BitmapText("debug", {
//    //font: "24px Times New Roman",
//    align: "right",
//  });
  
  console.log('debug self');
  console.log(self);
  
  
  this.container.addChild(this.text);
  stage.addChild(this.container);
  
  GROW.ee.on('add', function(item) {
//    console.log('got add witih item');
//    console.log(item);
    //console.log(self.log);
    self.log(item.name);
  });
};


Debug.prototype.log = function log(input) {
  var self = this;
  var compileLog = function (i) {
    var output = '';
    
    //console.log(self.textHistory.reverse());
    _.each(self.textHistory.reverse(), function (text) {
      output += text += '\n';
    });
    //console.log('outputting ' + output);
    self.text.text = output;
    return output;
  }
  
  self.textHistory.push(input); // add input to history
  self.textHistory = self.textHistory.reverse().slice(0, 10); // truncate history so it doesnt get huge
  return compileLog(input);
}








/**
 * shop class
 */
var Shop = function Shop() {
  this.container = new PIXI.Container();
  this._x = width - 100;
  this._x = height - 100;
  this._itemSpacing = 150;
  
  stage.addChild(this.container);
};

Shop.prototype.addItem = function addItem(opts) {
  console.log('adding item to shop');
  var item = new Item(opts);
  
  // calculate item position based on shop position
  item.position.x = this._x;
  item.position.y = this._itemSpacing * (this.container.children.length-1);

  this.container.addChild(item);
  
  
}

//
//Shop.prototype.removeItem(opts) {
//  
//}


/**
 * item class
 *
 */
var Item = function Item(opts) {
  //console.log('item make');
  
  var defaultOpts = {
    texture: resources.leaf.texture,
    name: 'maple sapling',
    cost: 11.64
  };
  var o = _.extend({}, defaultOpts, opts);
  
  var picTexture = o.texture;
  var buyButtonIdleTexture = resources.buyButtonIdle.texture;
  var rejectButtonIdleTexture = resources.rejectButtonIdle.texture;
  var itemBgTexture = resources.itemBg.texture;
  
  if (! (picTexture instanceof PIXI.Texture)) throw new Error('The new item\'s texture you\'re trying to add to the shop is not an instance of PIXI.Texture');
  
//  console.log(defaultOpts);
//  console.log(opts);
//  console.log(o);
//  console.log('o.name=' + o.name);
//  console.log('o.cost=' + o.cost + ' opts.cost=' + opts.cost);
  
  // create sprites
  this.background = new PIXI.Sprite(itemBgTexture);
  this.picture = new PIXI.Sprite(picTexture);
  this.buyButton = new PIXI.Sprite(buyButtonIdleTexture);
  this.rejectButton = new PIXI.Sprite(rejectButtonIdleTexture);
  this.title = new PIXI.Text(o.name, {font: "bold 12px Arial", fill:"black"});
  this.cost = new PIXI.Text(o.cost + ' mBTC', {font: "13px Arial", fill:"black"});
  
  // scale sprites
  this.rejectButton.scale.x = objectScale;
  this.rejectButton.scale.y = objectScale;
  this.buyButton.scale.x = objectScale;
  this.buyButton.scale.y = objectScale;
  this.picture.scale.x = objectScale;
  this.picture.scale.y = objectScale;
  this.background.scale.x = objectScale;
  this.background.scale.y = objectScale;
  
  
  // position sprites
  this.rejectButton.position.x += 155;
  this.rejectButton.position.y += 95;
  this.buyButton.position.x += 155;
  this.buyButton.position.y += 25;
  this.picture.position.x += 52;
  this.picture.position.y += 25;
  this.title.position.x += 50;
  this.title.position.y += 80;
  this.cost.position.x += 50;
  this.cost.position.y += 100;
  
  
  var item = new PIXI.Container();
  item.addChild(this.background);
  item.addChild(this.picture);
  item.addChild(this.buyButton);
  item.addChild(this.rejectButton);
  item.addChild(this.title);
  item.addChild(this.cost);
  
  return item;
}







function update() {

  // start the timer for the next animation loop 
  requestAnimationFrame(update);

  // each frame we spin the bunny around a bit
  wobblePlants();
  //leaf.rotation += 0.01;

  // this is the main render call that makes pixi draw your container and its children. 
  renderer.render(stage);
}