// global namespace
var GROW = GROW || {};


//GROW.level = 0;
//GROW.shop;
//GROW.inProgress;
GROW.timer;
GROW.day;
GROW.game;
GROW.ee = new EventEmitter();
GROW.catalog = [
  { name: "clover", id: 2, initialCost: 38.2 },
  { name: "daffodil", id: 3, initialCost: 834.2 },
  { name: "daisy", id: 4, initialCost: 2.3 },
  { name: "maple", id: 5, initialCost: 15.3 },
  { name: "strawberry", id: 6, initialCost: 8 }
];

GROW.welcome = function welcome() {
  console.log('welcome to the game');
}


GROW.init = function init() {
  
  //shop = new Shop();
  GROW.game = new GROW.Game();
  GROW.game.levelUp();
  GROW.inProgress = true;
  GROW.timer = setInterval(GROW.main, 1000);
  GROW.talkBox = new GROW.TalkBox();
}


GROW.Shop = function Shop() {
  this.inventory = [];
  
  GROW.ee.on('day', function(e) {
    //console.log('shop new day ' + this.addItem);
    
    // shop releases 1-5 items per day
    _.times(_.random(1, 5), GROW.game.shop.addItem);
    
  });
  
}


GROW.Shop.prototype.addItem = function addItem() {
  // @todo decouple generating random market value from addItem
  
  // calculate market value of item
  var item = new Item();
  console.log('new item added');
  //GROW.gfx.addItem(item);
}



GROW.Market = function Market() {
  
  // update prices every day
  GROW.ee.on('day', function() {
    //console.log('market new day');
    _.each(GROW.catalog, function(item, index, catalog) {
      // If item has had an updated price, work off of that
      var todayCost;
      if (item.yesterdayCost) {
        todayCost = GROW.marketAlgo(item.yesterdayCost);
        console.log('calculated today\'s price based on yesterday: ' + todayCost);
      }
      // yesterday's cost is not available, so use initial cost
      else {
        todayCost = GROW.marketAlgo(item.initialCost);
        console.log('calc today price based on initial: ' + todayCost);
      }
      item['yesterdayCost'] = todayCost;
    });
  });
}


GROW.Game = function Game() {
  this.level = 0;
  this.market = new GROW.Market();
  this.shop = new GROW.Shop();
  this.inProgress = true;
  this.time = new GROW.Time;
}

// (levels are days)
GROW.Game.prototype.levelUp = function levelUp() {
  this.level += 1;
  console.log('LEVEL UP. level='+this.level);
}

GROW.TalkBox = function TalkBox() {
  GROW.ee.on('day', function(e) {
    //meSpeak.speak("a beautiful new day");
    //console.log('talkbox: beaut new day ' + GROW.game.time.day + 1);
    
  });
  

}



GROW.Time = function Time() {
  this.hour = 0;
  this.day = 0;
}

GROW.Time.prototype.increment = function increment(hours) {
  if (typeof(hours) === 'undefined') hours = 1;
  if (this.hour == 2) {
    this.hour = 0;
    this.day += 1;
    GROW.ee.emitEvent('day');
  }
  else {
    this.hour += 1;
  }
  return this.hour;
}




GROW.Item =  function Item(options) {
  var defaultOptions = {
    name: 'maple sapling',
    cost: 11.65,
  }
  var opts = _.extend({}, defaultOptions, options);
  this.name = opts.name;
  this.cost = opts.cost;
  
  
  return this;
}


GROW.main = function main() {
  //console.log('main tick');
  GROW.game.time.increment();
  //console.log(' hour is '+ GROW.game.time.hour + ' day is ' + GROW.game.time.day);
}



//
///**
// * greets http://snipplr.com/view/37687/random-number-float-generator/
// */
//GROW.randomFloat = function randomFloat(minValue, maxValue) {
//  if (typeof(minValue) === 'undefined') minValue = 0;
//  if (typeof(maxValue) === 'undefined') maxValue = 1;
//  return parseFloat(Math.min(minValue + (Math.random() * (maxValue - minValue)),maxValue).toFixed(2));
//}


GROW.marketAlgo = function marketAlgo(oldPrice, volatility) {
  var goUp;
  var newPrice;
  var changeAmount;
  if (typeof(volatility) === 'undefined') volatility = 10;
  if (typeof(oldPrice) === 'unefined') {
    console.error('old price was not passed in');
    oldPrice = 500;
    //throw new Error('old price was not passed in');
  }
  
  (Math.random() >= 0.5) ? goUp = 1 : goUp = 0;
  
  changeAmount = _.random(0, volatility);
  if (goUp) newPrice = oldPrice + changeAmount;
  if (!goUp) newPrice = oldPrice - changeAmount;
  
  // boost this item if it gets low (people love cheap stuff)
  if (newPrice < 2) newPrice += 2;
  if (newPrice < 1) newPrice = 1.3; // disallow negatives
  
  return Number((newPrice).toFixed(2));
}


GROW.welcome();
GROW.init();
