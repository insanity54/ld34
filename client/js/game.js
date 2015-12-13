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
  {
    name: "clover",
    id: 2,
    initialCost: 38.2
  },
  {
    name: "daffodil",
    id: 3,
    initialCost: 834.2
  },
  {
    name: "daisy",
    id: 4,
    initialCost: 2.3
  },
  {
    name: "maple",
    id: 5,
    initialCost: 15.3
  },
  {
    name: "strawberry",
    id: 6,
    initialCost: 8
  }
];

GROW.welcome = function welcome() {
  console.log('welcome to the game');
}


GROW.init = function init() {
  GROW.game = new GROW.Game();
  GROW.game.levelUp();
  GROW.inProgress = true;
  GROW.timer = setInterval(GROW.main, 1000);
  GROW.talkBox = new GROW.TalkBox();
}


GROW.Shop = function Shop() {
  console.log('new shop ' + this);
  console.log(this);
  this.inventory = [];
  this.itemCounter = 0;
  var self = this;

  GROW.ee.on('day', function (e) {
    //console.log('shop new day ' + this.addItem);

    // shop releases 1-5 items per day
    _.times(_.random(1, 5), self.addItem.bind(self));

  });

}


GROW.Shop.prototype.addItem = function addItem() {

  // calculate market value of item
  var itemNewName = _.sample(_.pluck(GROW.catalog, 'name'));
  //console.log('new name ' + itemNewName + ' catalog: ');
  //console.log(GROW.catalog);
  //console.log(_.pluck(GROW.catalog, 'yesterdayCost'));
  var item = new GROW.Item({
    name: itemNewName,
    id: this.itemCounter += 1,
    cost: _.findWhere(GROW.catalog, {name: itemNewName}).yesterdayCost || _.findWhere(GROW.catalog, {name: itemNewName}).initialCost
  });
  this.inventory.push(item);
  console.log('adding item with name ' + itemNewName);
  //console.log(_.findWhere(GROW.catalog, {name: itemNewName}));
  GROW.ee.emitEvent('add', [item]);
}


GROW.Market = function Market() {

  // update prices every day
  GROW.ee.on('day', function () {
    console.log('market new day');
    
    // pseudo code
    // go through each catalog item
    // if item has a 'yesterdayCost'
    //   derive today's cost from yesterdayCost
    // else
    //   derive today's cost from initialCost
    // add today's cost to catalog item

    /**
     * @returns {object} item
     * @returns {string} item.name
     * @returns {number} item.todayCost
     * @returns {number} item.yesterdayCost
     * @returns {number} item.initialCost
     */
    function updateItem(item, index, list) {

      var todayCost;
      var yesterdayCost;

      // if there is today cost in catalog, move it to yesterday
      if (typeof (item.todayCost) !== 'undefined') {
        item.yesterdayCost = item.todayCost;
      }

      // if yesterday cost is available, derive today's cost from
      if (typeof(item.yesterdayCost) !== 'undefined') {
        todayCost = GROW.marketAlgo(item.yesterdayCost);
        
        if (typeof(item.todayCost) !== 'undefined') yesterdayCost = item.todayCost;
      }

      // yesterday's cost is not available, so use initial cost
      else {
        todayCost = GROW.marketAlgo(item.initialCost);
        yesterdayCost = item.initialCost;
      }
      
      return _.extend(item, {
        yesterdayCost: yesterdayCost,
        todayCost: todayCost
      });

    }
    
    GROW.catalog = _.map(GROW.catalog, updateItem);

    
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
  console.log('LEVEL UP. level=' + this.level);
}

GROW.TalkBox = function TalkBox() {
  GROW.ee.on('day', function (e) {
    //meSpeak.speak("a beautiful new day");
    //console.log('talkbox: beaut new day ' + GROW.game.time.day + 1);

  });


}



GROW.Time = function Time() {
  this.hour = 0;
  this.day = 0;
}

GROW.Time.prototype.increment = function increment(hours) {
  if (typeof (hours) === 'undefined') hours = 1;
  if (this.hour == 2) {
    this.hour = 0;
    this.day += 1;
    GROW.ee.emitEvent('day');
  } else {
    this.hour += 1;
  }
  return this.hour;
}




GROW.Item = function Item(options) {
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
  if (typeof (volatility) === 'undefined') volatility = 10;
  if (typeof (oldPrice) === 'unefined') {
    console.error('old price was not passed in');
    oldPrice = 500;
    //throw new Error('old price was not passed in');
  }

  (Math.random() >= 0.5) ? goUp = 1: goUp = 0;

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