'use strict';
class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    plus(vector) {
        if (!(vector instanceof Vector)) {
            throw new Error('passed property must be a Vector');
        }
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    times(multiplicand) {
        return new Vector(this.x * multiplicand, this.y * multiplicand);
    }
}
class Actor {
    constructor(pos =  new Vector(0,0), size = new Vector(1,1), speed =  new Vector(0,0)) {
        this.pos = pos;
        this.size = size;
        this.speed = speed;

        for (let key in this) {
            if(!(this[key] instanceof Vector)) {
                throw new Error(`{key} must be a vector`);
            }
        }

    }

    act() {
    }

    get  left() {
        return this.pos.x;
    }

    get top() {
        return this.pos.y;
    }

    get  right() {
        return this.pos.x + this.size.x;
    }

    get  bottom() {
        return this.pos.y + this.size.y

    }

    get  type() {
        return 'actor';
    }

    isIntersect(actor) {
        if (!actor || !(actor instanceof  Actor)) {
            throw new Error(`parameter in isIntersect must be an Actor`);
        }
        if (actor == this) {
            return false;
        }
        if (actor.size.x < 0 || actor.size.y < 0) {
            return false;
        }
        return isInside(actor, this) || isInside(this, actor);


        function isInside(first, second) {
            if((first.left == second.left) && (first.right > second.right)) {
                let res = bottomTopCheck();
                if(res !== undefined){
                    return res;
                }
            }
            if((first.right == second.right) && (first.left > second.left)) {
                let res = bottomTopCheck();
                if(res !== undefined){
                    return res;
                }
            }
            if((first.right == second.right) && (first.left == second.left)) {
                let res = bottomTopCheck();
                if(res !== undefined){
                    return res;
                }
            }

            if((first.left < second.left) && (first.right > second.left)) {
                let res = bottomTopCheck();
                if(res !== undefined){
                    return res;
                }
            }

            if(first.left < second.right && first.right > second.right) {
                return bottomTopCheck();
            }
            return false;

            function bottomTopCheck(){
                if(first.bottom >= second.bottom && first.top < second.bottom) {
                    return true;
                }

                else if(first.bottom >= second.top && first.top < second.top) {
                    return true;
                }

                else if(first.bottom == second.bottom || first.top == second.top) {
                    return true;
                }

                else {
                    return false;
                }
            }
        }
    }
}

class Level {
    constructor(grid = [], actors = []) {
        this.grid = grid;
        this.actors = actors;
        this.player = actors.find(actor => { return actor.type == 'player'});
        this.height = this.grid.length;
        this.width = this.grid.reduce((rez,item) => {
            return rez = item.length > rez ? item.length : rez;
        }, 0);
        this.status = null;
        this.finishDelay = 1;
    }

    isFinished() {
        if (this.status !== null && this.finishDelay < 0) {
            return true;
        }
        return false;
    }

    actorAt(actor) {
        if (!actor || !(actor instanceof Actor)) {
            throw new Error(`You should pass an object type of Actor into actorAt method`);
        }
        for (let item of this.actors) {
            if (item instanceof Actor && actor.isIntersect(item)) {
                return item;
            }
        }
    }

    obstacleAt(pos, size) {
        if (!(pos instanceof Vector) || !(size instanceof Vector)) {
            throw new Error('Both params of obstacleAt should be type of Vector');
        }
        if(pos.x < 0 || pos.y < 0) {
            return 'wall';
        }
        if(pos.y > this.height || pos.y + size.y > this.height){
            return 'lava';
        }

        if (pos.y + size.y > this.height || pos.x + size.x > this.width) {
            return 'wall';
        }
        for (let y = Math.ceil(pos.y); y < Math.ceil(pos.y + size.y); y++) {
            for (let x = Math.ceil(pos.x); x < Math.ceil(pos.x + size.x); x++) {
                if (this.grid[y][x]) {
                    return this.grid[y][x];
                }
                return;
            }
        }
    }

    removeActor(actor) {
        this.actors.forEach((item, index) => {
            if (item === actor) {
                delete this.actors.splice(index, 1)[0];
            }
        });
    }

    noMoreActors(type) {
        return !this.actors.some(item => item.type === type);
    }

    playerTouched(obstacle, player) {
        if (this.status) return;
        if (obstacle == 'lava' || obstacle == 'fireball') {
            this.status = 'lost';
            return;
        }
        if (obstacle == 'coin' && player.type == 'coin') {
            if (!this.noMoreActors('coin')) {
                this.removeActor((player));
                if (this.noMoreActors('coin')) {
                    this.status = 'won';
                }
            }
        }
    }
}


class Fireball extends Actor {
    constructor(pos, speed){
        super(pos, speed);
        //this.pos = Object.assign({},pos);
        this.speed = Object.assign({},speed);
        this.pos = pos;
    }
    get type() {
        return 'fireball';
    }
    getNextPosition(time = 1){
        return new Vector(this.pos.x + this.speed.x*time, this.pos.y + this.speed.y*time);
    }
    handleObstacle(){
        this.speed.x = -1*this.speed.x;
        this.speed.y = -1*this.speed.y;
    }
    act(time, level){
        let pos = this.getNextPosition(time);
        if(!level.obstacleAt(pos, new Vector(1,1))){

            this.pos = pos;
        }
        else {
            this.handleObstacle();
        }
    }
}

class HorizontalFireball extends Fireball {
    constructor(pos, speed){
        super(pos, speed);
        this.speed = new Vector(2,0);
    }
    get type() {
        return 'fireball';
    }
}

class VerticalFireball extends Fireball {
    constructor(pos, speed){
        super(pos, speed);
        this.speed = new Vector(0,2);
    }
    get type() {
        return 'fireball';
    }
}

class FireRain extends Fireball {
    constructor(pos, speed){
        super(pos, speed);
        this.originalPos = Object.assign({},pos);
        this.speed = new Vector(0,3);
    }
    get type() {
        return 'fire rain';
    }
    handleObstacle(){
        this.pos = Object.assign({}, this.originalPos);
    }
}
class Coin extends Actor {
    constructor(pos){
        super(pos);
        this.pos = new Vector(this.pos.x + 0.2, this.pos.y + 0.1);
        this.size = new Vector(0.6, 0.6);
        this.springSpeed = 8;
        this.springDist = 0.07;
        this.spring = this.random(0, Math.PI);
    }
    get type() {
        return 'coin';
    }
    random(min, max) {
        var rand = min - 0.5 + Math.random() * (max - min + 1)
        rand = Math.round(rand);
        return rand;
    }
    updateSpring(time = 1){
        this.spring += this.springSpeed * time;
    }
    getSpringVector(){
        return new Vector(0, Math.sin(this.spring)*this.springDist)
    }
    getNextPosition(time = 1){
        this.updateSpring(time);
        return new Vector(this.pos.x, this.pos.y + Math.sin(this.spring)*this.springDist);
    }
    act(time = 1){
        this.pos = this.getNextPosition(time);
    }
}

class Player extends Actor {
    constructor(pos){
        super(pos);
        this.pos = new Vector(this.pos.x, this.pos.y - 0.5);
        this.size = new Vector(0.8, 1.5);
        this.speed = new Vector(0,0);

    }
    get type() {
        return 'player';
    }
}

const dict = {
    'x': 'wall',
    '!': 'lava',
    '@': Player,
    'o': Coin,
    '=': HorizontalFireball,
    '|': VerticalFireball,
    'v': FireRain
};
class LevelParser {
    constructor(actorDictionary = {}) {
        this.actorDictionary = actorDictionary;
        this.obstacles = {
            'x': 'wall',
            '!': 'lava'
        };
    }
    obstacleFromSymbol(symbol){
        if(!symbol) {
            return;
        }
        if(!this.obstacles[symbol]) {
            return;
        }
        return this.obstacles[symbol];
    }
    actorFromSymbol(symbol){
        if(!symbol){
            return;
        }
        if(!this.actorDictionary[symbol]){
            return;
        }
        try {
            let obj = new this.actorDictionary[symbol](new Vector());
            return obj instanceof Actor ? this.actorDictionary[symbol] : false;
        }
        catch(err) {
            return;
        }

    }
    createGrid(strings){
        return strings.map(string => {
            return string.split('').map(symbol => {
                if(!this.obstacles[symbol]) {
                    return;
                }
               return this.obstacles[symbol];
            })
        })
    }
    createActors(strings){
        if(!strings){
            return [];
        }
        return strings.reduce((rez,string, y) => {
            return rez.concat(string.split('').reduce((rez,symbol, x) => {

               return rez = this.actorFromSymbol(symbol) ? rez.concat(new this.actorDictionary[symbol](new Vector(x,y))) : rez;
            },[]));
        },[])
    }
    parse(plan){
        return new Level(this.createGrid(plan), this.createActors(plan));
    }
}

//const grid = [
//    new Array(3),
//    ['wall', 'wall', 'lava']
//];
//const level = new Level(grid);
//runLevel(level, DOMDisplay);

//const schema = [
//    '         ',
//    '         ',
//    '         ',
//    '         ',
//    '     !xxx',
//    '         ',
//    'xxx!     ',
//    '         '
//];
//const parser = new LevelParser();
//const level = parser.parse(schema);
//runLevel(level, DOMDisplay);

//const schema = [
//    '         ',
//    '         ',
//    '         ',
//    '         ',
//    '     !xxx',
//    ' @       ',
//    'xxx!     ',
//    '         '
//];
//const actorDict = {
//    '@': Player
//}
//const parser = new LevelParser(actorDict);
//const level = parser.parse(schema);
//runLevel(level, DOMDisplay);

//const schema = [
//    '         ',
//    '         ',
//    '    =    ',
//    '         ',
//    '     !xxx',
//    ' @       ',
//    'xxx!     ',
//    '         '
//];
//const actorDict = {
//    '@': Player,
//    '=': HorizontalFireball
//};
//const parser = new LevelParser(actorDict);
//const level = parser.parse(schema);
//new DOMDisplay(document.body, level);

//const schema = [
//    '         ',
//    '         ',
//    '    =    ',
//    '       o ',
//    '     !xxx',
//    ' @       ',
//    'xxx!     ',
//    '         '
//];
//const actorDict = {
//    '@': Player,
//    '=': HorizontalFireball
//}
//const parser = new LevelParser(actorDict);
//const level = parser.parse(schema);
//runLevel(level, DOMDisplay)
//    .then(status => console.log(`Игрок ${status}`));

//const schemas = [
//    [
//        '         ',
//        '         ',
//        '    =    ',
//        '       o ',
//        '     !xxx',
//        ' @       ',
//        'xxx!     ',
//        '         '
//    ],
//    [
//        '      v  ',
//        '    v    ',
//        '  v      ',
//        '        o',
//        '        x',
//        '@   x    ',
//        'x        ',
//        '         '
//    ]
//];
//const actorDict = {
//    '@': Player,
//    'v': FireRain
//}
//const parser = new LevelParser(actorDict);
//runGame(schemas, parser, DOMDisplay)
//    .then(() => console.log('Вы выиграли приз!'));

loadLevels().then(rez => {
    const schemas = JSON.parse(rez);
    const actorDict = {
        '@': Player,
        'v': FireRain
    }
    const parser = new LevelParser(actorDict);
    runGame(schemas, parser, DOMDisplay)
        .then(() => console.log('Вы выиграли приз!'));
});