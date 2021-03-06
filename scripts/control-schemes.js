ready(function() {
  function handleSourceCodeClick(e) {
    e.preventDefault();
    var source = document.getElementById('source-code');
    source.style.display = source.style.display === 'none' ? 'block' : 'none';
  }
  document.getElementById('show-source').addEventListener('click', handleSourceCodeClick);

  const CANVAS_W = 800;
  const CANVAS_H = 450;

  const TAU = 2 * Math.PI;
  const DELTA_TIME = 5;
  const MAX_SPEED = 4;
  const TURN_SPEED = 0.05;

  const KEY_MAP = {
    'ArrowUp'     : 'up',
    'ArrowLeft'   : 'left',
    'ArrowRight'  : 'right'
  };

  // Render points relative to the ship's center
  const POINTS = [
    { x:  16, y:  0 },
    { x: -12, y: -9 },
    { x:  -8, y:  0 },
    { x: -12, y:  9 }
  ];

  var player = {
    x: CANVAS_W / 2, y: CANVAS_H / 2,
    xVel: 0, yVel: 0, thrust: false,
    radians: 0, radAcc: 0
  };

  // Get hypoteneuse of a right triangle given the two shorter sides
  function getHypoteneuse(x, y) {
    return Math.sqrt(x * x + y * y);
  }

  // Restrict a value to a specified range
  function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
  }

  function update() {
    if (player.radAcc) {
      var radians = player.radians + player.radAcc * TURN_SPEED;
      if (radians < 0) {
        radians += TAU;
      }
      else if (radians >= TAU) {
        radians -= TAU;
      }
      player.radians = radians;
    }
    // Update the player's speed in the x and y directions
    if (player.thrust) {
      var cos = Math.cos(player.radians);
      var sin = Math.sin(player.radians);

      // Calculate the combined speed of both directions
      player.xVel += cos / MAX_SPEED;
      player.yVel += sin / MAX_SPEED;

      var speed = getHypoteneuse(player.xVel, player.yVel);
      if (speed < -MAX_SPEED || speed > MAX_SPEED) {
        speed = clamp(speed, -MAX_SPEED, MAX_SPEED);
        player.xVel = speed * cos;
        player.yVel = speed * sin;
      }
    }

    player.x += player.xVel;
    player.y += player.yVel;

    // If the player passes an edge of the canvas, move it to the opposite edge
    if (player.x < 0) {
      player.x += CANVAS_W;
    }
    else if (player.x > CANVAS_W) {
      player.x -= CANVAS_W;
    }

    if (player.y < 0) {
      player.y += CANVAS_H;
    }
    else if (player.y > CANVAS_H) {
      player.y -= CANVAS_H;
    }
  }

  function handleInput(action, isActivated) {
    switch (action) {
      case 'up'     : player.thrust = isActivated; break;
      case 'left'   : player.radAcc += isActivated ? -1 :  1; break;
      case 'right'  : player.radAcc += isActivated ?  1 : -1; break;
    }
  }

  var context = document.getElementById('canvas').getContext('2d');

  function handleKeydown(e) {
    // Extra step to check whether the canvas is visible
    var rect = context.canvas.getBoundingClientRect();

    // ctrlKey refers to control on Apple computers, ctrl on Windows
    // metaKey refers to command on Apple, the Windows key on Windows
    if (rect.top < window.innerHeight && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }

    var key = KEY_MAP[e.key];
    if (!e.repeat && key) {
      handleInput(key, true);
    }
  }
  function handleKeyup(e) {
    var key = KEY_MAP[e.key];
    if (key) {
      handleInput(key);
    }
  }
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('keyup', handleKeyup);
  // Track whether the mouse button is down for mouseout events
  var mouseDown = false;

  function handleButtonInput(e) {
    // Prevents unwanted touch event behavior
    if (e.type === 'touchstart') {
      e.preventDefault();
    }
    e.stopPropagation();

    // Ensure the mouse or touch event came from a button, is not a right click, and that the button has an "action" data attribute
    if (e.target.tagName === 'BUTTON' && e.button !== 2 && e.target.dataset.action) {
      mouseDown = e.type === 'mousedown';
      var isActivated = mouseDown || e.type === 'touchstart';
      handleInput(e.target.dataset.action, isActivated);
    }
  }
  var buttonControls = document.getElementById('canvas-button-controls');

  buttonControls.addEventListener('mousedown', handleButtonInput);
  buttonControls.addEventListener('mouseup', handleButtonInput);
  // buttonControls.addEventListener('mouseout', handleButtonInput);

  function handleButtonMouseout(e) {
    // We only need to handleButtonInput if the mouse button was down when the mouse moved out
    if (e.target.tagName === 'BUTTON' && mouseDown) {
      mouseDown = false;
      handleButtonInput(e);
    }
  }
  buttonControls.addEventListener('mouseout', handleButtonMouseout);

  buttonControls.addEventListener('touchstart', handleButtonInput);
  buttonControls.addEventListener('touchend', handleButtonInput);

  function preventEverything(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  buttonControls.addEventListener('touchmove', preventEverything);

  buttonControls = null;

  var lastTimestamp = Date.now();
  var accumulator = DELTA_TIME;

  function frameStep(timestamp) {
    // Update
    var now = Date.now();
    accumulator += now - lastTimestamp;
    lastTimestamp = now;
    // Update player
    while (accumulator >= DELTA_TIME) {
      update();
      accumulator -= DELTA_TIME;
    }

    // Fill the background
    context.fillStyle = '#000';
    context.fillRect(0, 0, CANVAS_W, CANVAS_H);

    var sin = Math.sin(player.radians);
    var cos = Math.cos(player.radians);

    // Apply rotation transform to each point
    context.beginPath();
    for (var i = 0; i < 4; i++) {
      var pointX = POINTS[i].x * cos + POINTS[i].y * sin;
      var pointY = POINTS[i].x * sin - POINTS[i].y * cos;

      context[i === 0 ? 'moveTo' : 'lineTo'](player.x + pointX, player.y + pointY);
    }
    context.closePath();

    context.lineWidth = 2;
    context.strokeStyle = '#FFF';
    context.stroke();

    if (!start) {
      var start = timestamp;
    }
    if (timestamp - start < 2000) {
      window.requestAnimationFrame(frameStep);
    }
  }
  window.requestAnimationFrame(frameStep);
});
