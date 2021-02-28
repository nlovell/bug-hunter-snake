document.addEventListener("DOMContentLoaded", function () {
  pTag = document.querySelector("div");
  newVal = document.createElement("p");
  newVal.innerHTML = "";
  pTag.appendChild(newVal);
});

const board_border = "black";
const board_background = "white";
const snake_col = "lightblue";
const snake_border = "darkblue";

// images
const bugseg = new Image();
bugseg.src = "img/segments/tbac1.png";

const tbac3 = new Image();
tbac3.src = "img/segments/tbac3.png";

const bugantenna = new Image();
bugantenna.src = "img/segments/tbacAnt.png";

const foodoreo = new Image();
foodoreo.src = "img/oreo.png";

const foodpebble = new Image();
foodpebble.src = "img/pebble.png";

const food = [foodpebble, foodoreo];

// Converts grid location to pixels for rendering
function gridToPx(_grid) {
  return _grid * 60;
}

let snake = [
  { img: bugseg, x: gridToPx(3), y: gridToPx(3) },
  { img: bugseg, x: gridToPx(4), y: gridToPx(3) },
  { img: bugseg, x: gridToPx(5), y: gridToPx(3) },
];

let score = 0;
// True if changing direction
let changing_direction = false;
let food_img;
let food_x;
let food_y;

// Horizontal velocity
let dx = 0;
// Vertical velocity
let dy = 0;

var gameSpeed = 100;

// Get the canvas element
const snakeboard = document.getElementById("snakeboard");
snakeboard.width = window.innerWidth - gridToPx(2);
snakeboard.height = window.innerHeight - gridToPx(2);

// Return a two dimensional drawing context
const ctx = snakeboard.getContext("2d");
// Start game
main();

gen_food();

document.addEventListener("keydown", change_direction);

// main function called repeatedly to keep the game running
function main() {
  if (has_game_ended()) {
    document.getElementById("score").innerHTML = "final score: " + score;
    return;
  }

  changing_direction = false;
  setTimeout(function onTick() {
    clear_board();
    drawFood();
    move_snake();
    drawSnake();
    // Repeat
    main();
  }, gameSpeed);
}

// draw a border around the canvas
function clear_board() {
  //  Select the colour to fill the drawing
  ctx.fillStyle = board_background;
  //  Select the colour for the border of the canvas
  ctx.strokestyle = board_border;
  // Draw a "filled" rectangle to cover the entire canvas
  ctx.fillRect(0, 0, snakeboard.width, snakeboard.height);
  // Draw a "border" around the entire canvas
  ctx.strokeRect(0, 0, snakeboard.width, snakeboard.height);
}

// Draw the snake on the canvas
function drawSnake() {
  // Draw each part
  snake.forEach(drawSnakePart);

  if (dx == gridToPx(-1)) {
    //ctx.drawImage(bugantenna, snake[0].x, snake[0].y-gridToPx(1), gridToPx(1), gridToPx(1));

    flipHorizontally(
      bugantenna,
      snake[0].x,
      snake[0].y - gridToPx(1),
      gridToPx(1),
      gridToPx(1)
    );
  } else {
    ctx.drawImage(
      bugantenna,
      snake[0].x,
      snake[0].y - gridToPx(1),
      gridToPx(1),
      gridToPx(1)
    );
  }
}

function flipHorizontally(img, x, y, scx, scy) {
  // move to x + img's width
  ctx.translate(x + scx, y);

  // scaleX by -1; this "trick" flips horizontally
  ctx.scale(-1, 1);

  // draw the img
  // no need for x,y since we've already translated
  ctx.drawImage(img, 0, 0, scx, scy);

  // always clean up -- reset transformations to default
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawFood() {
  ctx.drawImage(food_img, food_x, food_y, gridToPx(1), gridToPx(1));
}

// Draw one snake part
function drawSnakePart(snakePart) {
  ctx.drawImage(
    snakePart.img,
    snakePart.x,
    snakePart.y,
    gridToPx(1),
    gridToPx(1)
  );
}

function has_game_ended() {
  for (let i = 4; i < snake.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
  }
  const hitLeftWall = snake[0].x < 0;
  const hitRightWall = snake[0].x > snakeboard.width - gridToPx(1);
  const hitToptWall = snake[0].y < 0;
  const hitBottomWall = snake[0].y > snakeboard.height - gridToPx(1);
  return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall;
}

function random_food(min, max) {
  return (
    Math.round((Math.random() * (max - min) + min) / gridToPx(1)) * gridToPx(1)
  );
}

function gen_food() {
  // Generate a random number the food x-coordinate
  food_x = random_food(0, snakeboard.width - gridToPx(1));
  // Generate a random number for the food y-coordinate
  food_y = random_food(0, snakeboard.height - gridToPx(1));

  food_img = food[Math.floor(Math.random() * food.length)];

  // if the new food location is where the snake currently is, generate a new food location
  snake.forEach(function has_snake_eaten_food(part) {
    const has_eaten = part.x == food_x && part.y == food_y;
    if (has_eaten) gen_food();
  });
}

function change_direction(event) {
  const LEFT_KEY = 37;
  const RIGHT_KEY = 39;
  const UP_KEY = 38;
  const DOWN_KEY = 40;

  // Prevent the snake from reversing

  if (changing_direction) return;
  changing_direction = true;
  const keyPressed = event.keyCode;
  const goingUp = dy === -gridToPx(1);
  const goingDown = dy === gridToPx(1);
  const goingRight = dx === gridToPx(1);
  const goingLeft = dx === -gridToPx(1);
  if (keyPressed === LEFT_KEY && !goingRight) {
    dx = -gridToPx(1);
    dy = 0;
  }
  if (keyPressed === UP_KEY && !goingDown) {
    dx = 0;
    dy = -gridToPx(1);
  }
  if (keyPressed === RIGHT_KEY && !goingLeft) {
    dx = gridToPx(1);
    dy = 0;
  }
  if (keyPressed === DOWN_KEY && !goingUp) {
    dx = 0;
    dy = gridToPx(1);
  }
}

function move_snake() {
  // Create the new Snake's head
  const head = { img: tbac3, x: snake[0].x + dx, y: snake[0].y + dy };
  // Add the new head to the beginning of snake body
  snake.unshift(head);
  snake[1].img = bugseg;
  const has_eaten_food = snake[0].x === food_x && snake[0].y === food_y;
  if (has_eaten_food) {
    score += 1;
    gameSpeed += 5;
    document.getElementById("score").innerHTML = score;
    gen_food();
  } else {
    // Remove the last part of snake body
    snake.pop();
  }
}
