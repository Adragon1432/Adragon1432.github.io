let tileSpriteSheet
let gamemap
let alienSpriteSheet
let alien
let alienSprites
let rows, cols
let tiles = []
let platforms = []
let rez = 2
let viewX = 0
let viewY = 0
let coins = 0
let lives = 3
let coinSound, hitSound, musicSound, jumpSound, deathSound
let enemySpriteSheet, enemySprites, pinkEnemySpriteSheet, greenEnemySpriteSheet
let pinkEnemy1, pinkEnemy2, greenEnemy1, greenEnemy2, enemySpritesPink, enemySpritesGreen, enemies
let gameOver = false
let coinCount = 0
let b1, b2, c1, c2;

const SPACE = 32

const WALKING_SPEED = 3
const JUMP_VELOCITY = 14
const GRAVITY = 0.6

// define player
const PLAYER = '-1'
const ENEMY = '-2'


// define tiles
const TILE_BRICK = '0'
const TILE_EMPTY = '3'

// cloud blocks
const CLOUD_LEFT = '5'
const CLOUD_RIGHT = '6'

// bush blocks
const BUSH_LEFT = '1'
const BUSH_RIGHT = '2'

// mushroom tiles
const MUSHROOM_TOP = '9'
const MUSHROOM_BOTTOM = '10'

// jump block
const JUMP_BLOCK = '4'
const JUMP_BLOCK_HIT = '8'

// pole
const POLE_TOP = '7'
const POLE_MIDDLE = '11'
const POLE_BOT = '15'

// flag
const FLAG_LEFT = '12'
const FLAG_MID = '13'
const FLAG_RIGHT = '14'

const COLLIDABLES = [TILE_BRICK, JUMP_BLOCK, JUMP_BLOCK_HIT, MUSHROOM_TOP, MUSHROOM_BOTTOM, PLAYER, POLE_BOT, POLE_MIDDLE]

// margins
const LEFT_MARGIN = 60
const VERTICAL_MARGIN = 15
const RIGHT_MARGIN = 150

function preload() {
    tileSpriteSheet = loadImage('graphics/spritesheet.png')
    alienSpriteSheet = loadImage('graphics/blue_alien.png')
    pinkEnemySpriteSheet = loadImage('graphics/pink_alien.png')
    greenEnemySpriteSheet = loadImage('graphics/green_alien.png')

    gamemap = loadTable('graphics/gamemap.csv')
    coinSound = loadSound('sounds/coin.wav')
    hitSound = loadSound('sounds/hit.wav')
    jumpSound = loadSound('sounds/jump.wav')
    deathSound = loadSound('sounds/death.wav')
    musicSound = loadSound('sounds/always.mp3')


}

function setup() {
    createCanvas(850, 480)
    frameRate(30)
    init()

    b1 = color(255);
    b2 = color(0);
    c1 = color(204, 204, 255);
    c2 = color(252, 177, 177);
    
    musicSound.loop()
    musicSound.setVolume(0.08)

}

function createAlien() {
  idleAlien = [alienSprites[0]]
  walkingAlien = alienSprites.slice(7, 11)
  jumpingAlien = [alienSprites[3]]

  alien = new AnimatedSprite(idleAlien[0], 50, 0, 'PLAYER', walkingAlien, idleAlien, jumpingAlien)

}

function createEnemies() {
  let idlePinkEnemy = [enemySpritesPink[0]]
  let walkingPinkEnemy = enemySpritesPink.slice(7, 11)
  pinkEnemy1 = new Enemy(idlePinkEnemy[0], 64, 284, 64, 164,  ENEMY, idlePinkEnemy, walkingPinkEnemy)
  pinkEnemy2 = new Enemy(idlePinkEnemy[0], 400, 380, 400, 580, ENEMY, idlePinkEnemy, walkingPinkEnemy)

  let idleGreenEnemy = [enemySpritesGreen[0]]
  let walkingGreenEnemy = enemySpritesGreen.slice(7, 11)
  greenEnemy1 = new Enemy(idleGreenEnemy[0], 353, 188, 352, 460,  ENEMY, idleGreenEnemy, walkingGreenEnemy)
  greenEnemy2 = new Enemy(idleGreenEnemy[0], 64, 380, 64, 224, ENEMY, idleGreenEnemy, walkingGreenEnemy)

  enemies = [pinkEnemy1, pinkEnemy2, greenEnemy1, greenEnemy2]



}


function createPlatforms(gamemap) {
  platforms = []
  coinCount = 0
  rows = gamemap.getRowCount()
  cols = gamemap.getColumnCount()

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let spriteIndex = gamemap.getString(r, c)
      let sprite = tiles[spriteIndex]
      let tile = new Sprite(sprite, sprite.width * c, sprite.height * r, spriteIndex)
      platforms.push(tile)
      if (spriteIndex == JUMP_BLOCK) {
        coinCount++
      }
    }
  }
}

function init() {
  viewX = 0
  viewY = 0
  coins = 0
  lives = 3
    tiles = generateTiles(tileSpriteSheet, 16, 16)
    createPlatforms(gamemap)

    alienSprites = generateTiles(alienSpriteSheet, 16, 20)
    createAlien()

    enemySpritesPink = generateTiles(pinkEnemySpriteSheet, 16, 20)
    enemySpritesGreen = generateTiles(greenEnemySpriteSheet, 16, 20)
    createEnemies()

}

function draw() {

  setGradient(0, 0, width, height, c1, c2);
  scale(rez)
  scroll()

  for (let tile of platforms) {
    tile.display()
  }


  alien.display()

  for (let enemy of enemies) {
    enemy.display()
    enemy.update()
  }

  resolvePlatformCollisions(alien, platforms)
  checkGameOver()
  displayScore()
}

function setGradient(x, y, w, h, c1, c2) {
  noFill();
  for (let i = y; i <= y + h; i++) {
    let inter = map(i, y, y + h, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(x, i, x + w, i);
    }
}



function checkGameOver() {
  if (!gameOver) {
    checkDeath()
  }

  if (lives == 0) {

    fill(255, 0, 0)
    textAlign(CENTER)
    text("Game Over", width/4 + viewX, height/4 + viewY)
    text("Click to Restart", width/4 + viewX, height/4 + 20 + viewY)
    noLoop()

  }
  else if (coins == coinCount) {
    fill(255, 0, 0)
    textAlign(CENTER)
    text("You collected all the coins!", width/4 + viewX, height/4 + viewY)
    text("Click to Restart", width/4 + viewX, height/4 + 20 + viewY)
    gameOver = true
    noLoop()
  }
}

function mousePressed() {
  if (gameOver) {
    gameOver = false
    init()
    loop()
  }
}
function checkDeath() {
    if (alien.getTop() > rows * 16 + 1000 || checkCollisionList(alien, enemies).length) {
    lives--

    if (lives == 0) {
      gameOver = true
    }
    else {
      viewX = 0
      viewY = 0
      deathSound.play()
      translate(viewX, viewY)
      alien.x = 160
      alien.y = 188
      deathSound.play()

    }
    }
}

function displayScore(){
  fill(255, 225, 255)
  textAlign(LEFT)
  text("COINS: " + coins + "/16", viewX + 15, viewY + 20)
  text("LIVES: " +  lives, viewX + 15, viewY + 35)
}
function scroll() {
  let rightBound = viewX + width / rez - RIGHT_MARGIN
  if (alien.getRight() > rightBound && viewX < 1000) {
    viewX += alien.getRight() - rightBound
  }

  let leftBound = viewX + LEFT_MARGIN
  if (alien.getLeft() < leftBound && viewX > 0) {
    viewX -= leftBound - alien.getLeft()
  }

  let bottomBound = viewY + height / rez - VERTICAL_MARGIN
  if (alien.getBottom() > bottomBound) {
    viewY += alien.getBottom() - bottomBound
  }

  let topBound = viewY + VERTICAL_MARGIN
  if (alien.getTop() < topBound) {
    viewY -= topBound - alien.getTop()
  }
  translate(-viewX, -viewY)
}

function resolvePlatformCollisions(s, list) {
  s.dy += GRAVITY
  s.y += s.dy

  let collisions = checkCollisionList(s, list)
  if (collisions.length > 0) {
    let collided = collisions[0]
    if (s.dy > 0) {

      s.setBottom(collided.getTop())

    }
    else if (s.dy < 0) {
      s.setTop(collided.getBottom())

      if (collided.type == JUMP_BLOCK) {
          collided.img = tiles[JUMP_BLOCK_HIT]
          collided.type = JUMP_BLOCK_HIT
          coinSound.play()
          coins++
      }
      else if (collided.type == JUMP_BLOCK_HIT) {

        hitSound.play()

      }
    }
    s.dy = 0
  }


  s.x += s.dx
  collisions = checkCollisionList(s, list)
  if (collisions.length > 0){
    let collided = collisions[0]
    if (s.dx > 0) {
        s.setRight(collided.getLeft())
    }

    else if (s.dx < 0) {
      s.setLeft(collided.getRight())
    }
  }
}

function keyPressed() {
  if (!gameOver){
    if (keyCode == LEFT_ARROW) {
        alien.dx = -WALKING_SPEED
        alien.state = 'walking'
    }
    else if (keyCode == RIGHT_ARROW) {
      alien.dx = WALKING_SPEED
      alien.state = 'walking'
    }
    else if (keyCode == SPACE && isOnPlatform(alien, platforms)) {
      alien.dy = -JUMP_VELOCITY
      alien.state = 'jumping'
      jumpSound.play()

    }
    else {
      alien.state = 'idle'
    }
  }
}
function keyReleased() {
  if (keyCode == LEFT_ARROW) {
    alien.dx = 0
    alien.state = 'idle'
}
else if (keyCode == RIGHT_ARROW) {
  alien.dx = 0
  alien.state = 'idle'
}
else if (keyCode == SPACE) {
  alien.dy = 0
  alien.state = 'idle'
}
}

function checkCollision(s1, s2) {
  let noXOverlap = s1.getRight() <= s2.getLeft() || s1.getLeft() >= s2.getRight()
  let noYOverlap = s1.getBottom() <= s2.getTop() || s1.getTop() >= s2.getBottom()

  if(noXOverlap || noYOverlap) {
    return false
  }

  else {
    return true
  }
}

function checkCollisionList(s, list) {
  let collisionList = []
  for (let sprite of list) {
    if (checkCollision(s, sprite) && sprite.collidable) {
      collisionList.push(sprite)
    }
  }
  return collisionList
}

function isOnPlatform(s, list) {
  s.y += 5
  let collisions = checkCollisionList(s, list)
  s.y -= 5
  if (collisions.length > 0) {
      return true
  }
  else {
    return false
  }
}