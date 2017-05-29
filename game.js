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
    constructor(pos, size, speed) {
        const args = [
            {
                pos: pos,
                initX: 0,
                initY: 0
            },
            {
                size: size,
                initX: 1,
                initY: 1
            },
            {
                speed: speed,
                initX: 0,
                initY: 0
            }
        ];
        args.forEach(item => {
            let key = Object.keys(item)[0];
            if (!item[key]) {
                this[key] = new Vector(item.initX, item.initY);
            }
            else {
                if (item[key] instanceof Vector) {
                    this[key] = item[key];
                }
                else {
                    throw new Error(`passed ${key} must be a Vector`);
                }
            }
        });

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

        if (actor.left <= this.left && actor.right > this.left) {
            return true;
        }
        if (actor.left > this.right && actor.right <= this.right) {
            return true;
        }
        if (actor.top <= this.top && actor.bottom > this.top) {
            return true;
        }
        if (actor.top > this.bottom && actor.bottom <= this.bottom) {
            return true;
        }
        return false;
    }
}

class Level {
    constructor(greed = [[]], actors = []) {
        this.greed = greed;
        this.actors = actors;
        this.player;
        this.height = this.greed.length;
        this.width = Math.max(...this.greed.map(item => item.length));
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
            if (item.type == 'actor' && actor.isIntersect(item)) {
                return item;
            }
        }
    }

    obstacleAt(pos, size) {
        if (!(pos instanceof Vector) || !(size instanceof Vector)) {
            throw new Error('Both params of obstacleAt should be type of Vector');
        }
        if (pos.y + size.y > this.height || pos.x + size.x > this.width) {
            return 'wall';
        }
        for (let y = pos.y; y < pos.y + size.y; y++) {
            for (let x = pos.x; x < pos.x + size.x; x++) {
                if (this.greed[y][x]) {
                    return this.greed[y][x];
                }
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
class LevelParser {

}
const grid = [
    [undefined, undefined],
    ['wall', 'wall']
];

const goldCoin = {type: 'coin', title: 'Золото'};
const bronzeCoin = {type: 'coin', title: 'Бронза'};
const player = new Actor();
const fireball = new Actor();

const level = new Level(undefined, [goldCoin, bronzeCoin, player, fireball]);

level.playerTouched('coin', goldCoin);
level.playerTouched('coin', bronzeCoin);

if (level.noMoreActors('coin')) {
    console.log('Все монеты собраны');
    console.log(`Статус игры: ${level.status}`);
}

const obstacle = level.obstacleAt(new Vector(1, 1), player.size);
if (obstacle) {
    console.log(`На пути препятствие: ${obstacle}`);
}

const otherActor = level.actorAt(player);
if (otherActor === fireball) {
    console.log('Пользователь столкнулся с шаровой молнией');
}
/*
 const items = new Map();
 const player = new Actor();
 items.set('Игрок', player);
 items.set('Первая монета', new Actor(new Vector(10, 10)));
 items.set('Вторая монета', new Actor(new Vector(15, 5)));

 function position(item) {
 return ['left', 'top', 'right', 'bottom']
 .map(side => `${side}: ${item[side]}`)
 .join(', ');
 }

 function movePlayer(x, y) {
 player.pos = player.pos.plus(new Vector(x, y));
 }

 function status(item, title) {
 console.log(`${title}: ${position(item)}`);
 if (player.isIntersect(item)) {
 console.log(`Игрок подобрал ${title}`);
 }
 }

 items.forEach(status);
 movePlayer(10, 10);
 items.forEach(status);
 movePlayer(5, -5);
 items.forEach(status);

 const start = new Vector(30, 50);
 const moveTo = new Vector(5, 10);
 const finish = start.plus(moveTo.times(2));
 console.log(`Исходное расположение: ${start.x}:${start.y}`);
 console.log(`Текущее расположение: ${finish.x}:${finish.y}`);

 const grid = [
 new Array(3),
 ['wall', 'wall', 'lava']
 ];
 const level = new Level(grid);
 runLevel(level, DOMDisplay);
 */