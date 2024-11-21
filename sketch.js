// JavaScript (p5.js Sketch)

// ======================================
// Compute Sizes and Scales
// ======================================

let TXT_SIZE; // Main text size
let KEYWORD_SIZE; // Keyword size
let NOISE_SCALE;
let KEYWORD_ATTRACTION_FORCE;
let MAX_SPEED;
let INITIAL_SPEED;
let PARTICLE_SIZE_MIN;
let PARTICLE_SIZE_MAX;
let DISTANCE_THRESHOLD;
let MOUSE_REPULSION_FORCE;
let MOUSE_REPULSION_RADIUS;
let KEYWORD_DRIFT_SPEED;
let NOISE_FORCE_MAGNITUDE;
let LIFETIME_MIN;
let LIFETIME_MAX;
let TIME_INCREMENT;
let BACKGROUND_FADE;

// Keyword repulsion from main text
let KEYWORD_REPULSION_FORCE;
let KEYWORD_REPULSION_RADIUS_MULTIPLIER;

// Canvas and buffer dimensions
// let canvasWidth = window.innerWidth;
// let canvasHeight = window.innerHeight;

// HERE YOU CAN CHANGE THE RESOLUTION. MOST LIKELY ALSO THE BLUR VALUES NEED TO BE ADJUSTED SINCE BLUR IS RESOLUTION DEPENDENT
let canvasWidth = 1920;
let canvasHeight = 1080;
let BUFFER_WIDTH = canvasWidth;
let BUFFER_HEIGHT = canvasHeight;

// Global canvas variable
let canvas; // Add this line

// Compute sizes and scales relative to canvas size
computeSizesAndScales();

function computeSizesAndScales() {
  // Sizes and scales
  TXT_SIZE = canvasHeight * 0.3; // 30% of canvas height
  KEYWORD_SIZE = canvasHeight * 0.05; // 5% of canvas height
  NOISE_SCALE = 0.05 * canvasWidth;
  KEYWORD_ATTRACTION_FORCE = canvasWidth * 0.05; // Pixels per second squared
  MAX_SPEED = canvasWidth * 0.01; // Pixels per second
  INITIAL_SPEED = canvasWidth * 0.005; // Pixels per second
  PARTICLE_SIZE_MIN = canvasWidth * 0.01;
  PARTICLE_SIZE_MAX = canvasWidth * 0.05;
  DISTANCE_THRESHOLD = canvasWidth * 0.005;
  MOUSE_REPULSION_FORCE = canvasWidth * 0.5; // Pixels per second squared
  MOUSE_REPULSION_RADIUS = canvasWidth * 0.05;
  KEYWORD_DRIFT_SPEED = canvasWidth * 0.005; // Pixels per second
  NOISE_FORCE_MAGNITUDE = canvasWidth * 0.1; // Pixels per second squared
  LIFETIME_MIN = 5; // In seconds
  LIFETIME_MAX = 30; // In seconds
  TIME_INCREMENT = 1;
  BACKGROUND_FADE = 4;

  // Repulsion parameters
  KEYWORD_REPULSION_FORCE = canvasWidth * 0.1;
  KEYWORD_REPULSION_RADIUS_MULTIPLIER = 1.5;
}

// ======================================
// Constants and Parameters
// ======================================

// Main text and keywords
const MAIN_TEXT = "CMTB25";
const KEYWORDS = [
  "AI", "VR", "Ethics", "Data", "Health",
  "Social Media", "Privacy", "E-learning",
  "Robotics", "Blockchain", "Quantum Computing", "Cybersecurity",
  "Machine Learning", "Big Data", "Cloud Computing", "Augmented Reality",
  "Internet of Things", "5G", "Biotechnology"
];

// Display options
let showFPS = true;
let showWords = true;
let showMainText = true;
let wasShowFPS = true; // For restoring FPS display state after recording

// Particle settings
const PARTICLE_COUNT = 5000;

// Other constants
const SAMPLE_FACTOR = 1;
const KEYWORD_DISTANCE_MULTIPLIER = 2.5;
const KEYWORD_PLACEMENT_ATTEMPTS = 10;
const BLUR_LEVELS = [3, 2, 1, 0]; // Includes 0 for unblurred version
const Z_MIN = -50;
const Z_MAX = 50;

// ======================================
// Global Variables
// ======================================

let particles = [];
let font;
let particleSpawnPoints = [];
let keywordObjects = []; // Array to store keyword objects
let particleBuffer; // Off-screen buffer for particles
let renderBuffer; // Off-screen buffer for rendering

let timeOffset = 0;
let textX, textY;

let mainTextRect; // Variable to store the main text rectangle

// Variables to store mouse position in buffer coordinates
let bufferMouseX, bufferMouseY;
let mouseOverCanvas = false;

// Color components
let colorRed;
let colorGreen;
let colorBlue;

// === Recording Variables ===
let recording = false;
let gifRecorder;
let recordingFrames = 0;

// ======================================
// Preload Function
// ======================================

function preload() {
  font = loadFont('Orbitron/static/Orbitron-Regular.ttf');
}

// ======================================
// Setup Function
// ======================================

function setup() {
  // Create the canvas
  canvas = createCanvas(canvasWidth, canvasHeight); // Assign the canvas to the global variable

  // Create off-screen buffers
  renderBuffer = createGraphics(BUFFER_WIDTH, BUFFER_HEIGHT);
  particleBuffer = createGraphics(BUFFER_WIDTH, BUFFER_HEIGHT);

  // Set text font for buffers
  renderBuffer.textFont(font);
  particleBuffer.textFont(font);

  // Generate particle spawn points based on the text
  generateParticleSpawnPoints();

  // Create keyword objects
  createKeywords();

  // Initialize particles
  initializeParticles();
}

// ======================================
// Generate Particle Spawn Points
// ======================================

function generateParticleSpawnPoints() {
  // Calculate bounding box to center the text
  let bbox = font.textBounds(MAIN_TEXT, 0, 0, TXT_SIZE);
  textX = BUFFER_WIDTH / 2 - bbox.w / 2;
  textY = BUFFER_HEIGHT / 2 + bbox.h / 2;

  // Store main text rectangle
  mainTextRect = {
    x: textX,
    y: textY - bbox.h, // Adjust y to top-left corner
    w: bbox.w,
    h: bbox.h
  };

  // Generate particle spawn points based on the text
  particleSpawnPoints = font.textToPoints(MAIN_TEXT, textX, textY, TXT_SIZE, {
    sampleFactor: SAMPLE_FACTOR
  });
}

// ======================================
// Create Keyword Objects
// ======================================

function createKeywords() {
  for (let keyword of KEYWORDS) {
    let keywordObj = new Keyword(keyword);
    keywordObjects.push(keywordObj);
  }
}

// ======================================
// Initialize Particles
// ======================================

function initializeParticles() {
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }
}

// ======================================
// Draw Function
// ======================================

function draw() {
  let timeDelta = deltaTime / 1000; // In seconds

  // Adjust timeOffset based on timeDelta
  timeOffset += timeDelta * TIME_INCREMENT;

  // Clear the render buffer
  renderBuffer.background(0);

  // Darken and blur the particle buffer to create fading trails
  particleBuffer.fill(0, BACKGROUND_FADE);
  particleBuffer.noStroke();
  particleBuffer.rect(0, 0, BUFFER_WIDTH, BUFFER_HEIGHT);

  // Calculate scaling factors
  let scaleX = canvasWidth / BUFFER_WIDTH;
  let scaleY = canvasHeight / BUFFER_HEIGHT;
  let scale = min(scaleX, scaleY);

  let drawWidth = BUFFER_WIDTH * scale;
  let drawHeight = BUFFER_HEIGHT * scale;
  let x = (canvasWidth - drawWidth) / 2;
  let y = (canvasHeight - drawHeight) / 2;

  // Map mouse position to buffer coordinates
  updateMousePosition(scale, x, y, drawWidth, drawHeight);

  // Update and display particles
  updateAndDisplayParticles(timeDelta);

  // Draw the particle buffer onto the render buffer
  renderBuffer.image(particleBuffer, 0, 0);

  // Draw the main text if enabled
  if (showMainText) {
    renderBuffer.fill(255);
    renderBuffer.noStroke();
    renderBuffer.textSize(TXT_SIZE);
    renderBuffer.text(MAIN_TEXT, textX, textY);
  }

  // Update and draw the keywords
  if (showWords) {
    updateAndDrawKeywords(timeDelta);
  }

  // Draw the render buffer onto the main canvas
  image(renderBuffer, x, y, drawWidth, drawHeight);

  // Display FPS if enabled and not recording
  if (showFPS && !recording) {
    displayFPS();
  }

  // === Capture Frame if Recording ===
  if (recording) {
    captureFrame();
  }
}

// ======================================
// Update Mouse Position
// ======================================

function updateMousePosition(scale, x, y, drawWidth, drawHeight) {
  if (
    mouseX >= x &&
    mouseX <= x + drawWidth &&
    mouseY >= y &&
    mouseY <= y + drawHeight
  ) {
    bufferMouseX = (mouseX - x) / scale;
    bufferMouseY = (mouseY - y) / scale;
    mouseOverCanvas = true;
  } else {
    mouseOverCanvas = false;
  }
}

// ======================================
// Update and Display Particles
// ======================================

function updateAndDisplayParticles(timeDelta) {
  for (let particle of particles) {
    particle.followNoise();
    particle.update(timeDelta);
    particle.show(particleBuffer);
    particle.reduceLifetime(timeDelta);

    if (particle.isDead()) {
      particle.reset(); // Reset the particle when it "dies"
    }
  }
}

// ======================================
// Update and Draw Keywords
// ======================================

function updateAndDrawKeywords(timeDelta) {
  // Update positions and draw keywords
  for (let keywordObj of keywordObjects) {
    keywordObj.update(timeDelta);
    keywordObj.draw(renderBuffer);
  }
}

// ======================================
// Display FPS
// ======================================

function displayFPS() {
  fill(255);
  textSize(12);
  text(`FPS: ${nf(frameRate(), 1, 2)}`, 10, canvasHeight - 10);
}

// ======================================
// Particle Class
// ======================================

class Particle {
  constructor() {
    this.reset(); // Initialize the particle
  }

  reset() {
    // Set the particle to a random position within the text points
    let point = random(particleSpawnPoints);
    this.pos = createVector(point.x, point.y);
    this.startPos = this.pos.copy();
    this.vel = p5.Vector.random2D().mult(INITIAL_SPEED);
    this.acc = createVector(0, 0);
    this.maxSpeed = MAX_SPEED;
    this.startLifetime = random(LIFETIME_MIN, LIFETIME_MAX); // In seconds
    this.lifetime = this.startLifetime;

    // Set the target keyword if available
    if (keywordObjects.length > 0) {
      let randomObj = random(keywordObjects);
      this.targetKeyword = randomObj.position.copy(); // Copy the position vector
    }
  }

  followNoise() {
    // Noise-based movement
    let noiseValue = noise(
      this.pos.x * NOISE_SCALE,
      this.pos.y * NOISE_SCALE,
      timeOffset
    );

    let force = p5.Vector.fromAngle(4 * noiseValue * PI);
    force.setMag(NOISE_FORCE_MAGNITUDE);
    this.applyForce(force);

    // Movement towards the assigned keyword, if any
    if (this.targetKeyword) {
      let targetPos = this.targetKeyword.copy();
      let attractionForce = p5.Vector.sub(targetPos, this.pos);

      attractionForce.setMag(KEYWORD_ATTRACTION_FORCE); // Strength of the attraction force
      this.applyForce(attractionForce);

      // Check if the particle is close to the target keyword
      if (this.pos.dist(targetPos) < DISTANCE_THRESHOLD) {
        let randomObj = random(keywordObjects);
        this.targetKeyword = randomObj.position.copy(); // Choose a new random keyword as the target
      }
    }

    // Repulsion from mouse cursor
    if (mouseOverCanvas) {
      let mousePos = createVector(bufferMouseX, bufferMouseY);
      let dir = p5.Vector.sub(this.pos, mousePos);
      let distance = dir.mag();
      if (distance < MOUSE_REPULSION_RADIUS) {
        dir.normalize();
        let repulsionStrength = map(
          distance,
          0,
          MOUSE_REPULSION_RADIUS,
          MOUSE_REPULSION_FORCE,
          0
        );
        dir.mult(repulsionStrength);
        this.applyForce(dir);
      }
    }
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update(timeDelta) {
    this.vel.add(p5.Vector.mult(this.acc, timeDelta));
    this.vel.limit(this.maxSpeed);
    this.pos.add(p5.Vector.mult(this.vel, timeDelta));
    this.acc.mult(0);

    // Wrap around the edges of the buffer
    if (this.pos.x > BUFFER_WIDTH) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = BUFFER_WIDTH;
    if (this.pos.y > BUFFER_HEIGHT) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = BUFFER_HEIGHT;
  }

  show(buffer) {
    // Calculate the gradient based on the remaining lifetime
    let lifeRatio = this.lifetime / this.startLifetime;
    let size = map(lifeRatio, 0, 1, PARTICLE_SIZE_MIN, PARTICLE_SIZE_MAX);

    // Calculate color components
    this.calculateColors();

    buffer.stroke(colorRed, colorGreen, colorBlue, 64);
    buffer.strokeWeight(size);
    buffer.point(this.pos.x, this.pos.y);
  }

  calculateColors() {
    let startDistance = map(
      this.startPos.dist(this.pos),
      0,
      BUFFER_WIDTH,
      255,
      0
    );

    let targetPos = this.targetKeyword.copy();
    let targetDistance = map(
      targetPos.dist(this.pos),
      0,
      BUFFER_WIDTH,
      0,
      255
    );

    let mouseDistance = 0;
    if (mouseOverCanvas) {
      let mousePos = createVector(bufferMouseX, bufferMouseY);
      mouseDistance = this.pos.dist(mousePos);
      mouseDistance = map(mouseDistance, 0, BUFFER_WIDTH / 2, 255, 0);
      mouseDistance = constrain(mouseDistance, 0, 255);
    } else {
      mouseDistance = 0;
    }

    colorRed = map(mouseDistance, 0, 255, 100, 255);
    colorGreen = map(startDistance, 0, 255, 200, 50);
    colorBlue = map(targetDistance, 0, 255, 150, 255);
  }

  reduceLifetime(timeDelta) {
    this.lifetime -= timeDelta; // Reduce lifetime based on timeDelta
  }

  isDead() {
    return this.lifetime <= 0; // Check if the lifetime has expired
  }
}

// ======================================
// Keyword Class
// ======================================

class Keyword {
  constructor(keyword) {
    this.text = keyword;
    this.position = createVector(
      random(KEYWORD_SIZE, BUFFER_WIDTH - KEYWORD_SIZE),
      random(KEYWORD_SIZE, BUFFER_HEIGHT - KEYWORD_SIZE)
    );
    this.velocity = p5.Vector.random2D().mult(KEYWORD_DRIFT_SPEED);
    this.sprites = [];
    this.currentSpriteIndex = 0;
    this.size = KEYWORD_SIZE;
    this.z = random(Z_MIN, Z_MAX);

    // Pre-render sprites with different blur levels
    for (let blurAmount of BLUR_LEVELS) {
      let spriteBuffer = this.createKeywordSprite(blurAmount);
      this.sprites.push(spriteBuffer);
    }

    // Set initial sprite based on z-position
    this.updateSpriteIndex();
  }

  createKeywordSprite(blurAmount) {
    let spriteBuffer = createGraphics(0, 0);
    spriteBuffer.pixelDensity(1);

    // Measure text dimensions
    spriteBuffer.textFont(font);
    spriteBuffer.textSize(this.size);
    let bounds = font.textBounds(this.text, 0, 0, this.size);

    // Calculate padding based on maximum blur amount
    let padding = canvasWidth * 0.05; // 5% of canvas width

    // Resize canvas with padding
    spriteBuffer.resizeCanvas(
      bounds.w + padding * 2,
      bounds.h + padding * 2
    );

    // Draw text onto the sprite buffer
    spriteBuffer.clear();
    spriteBuffer.fill(255);
    spriteBuffer.noStroke();
    spriteBuffer.textAlign(LEFT, TOP);
    spriteBuffer.text(this.text, padding, padding);

    // Apply blur if necessary
    if (blurAmount > 0) {
      spriteBuffer.filter(BLUR, blurAmount);
    }

    return spriteBuffer;
  }

  update(timeDelta) {
    // Update position with velocity
    this.position.add(p5.Vector.mult(this.velocity, timeDelta));

    // Keep keyword within buffer bounds
    this.constrainPosition();

    // Apply repulsion from main text
    this.applyMainTextRepulsion();

    // Update z-position and sprite index
    this.z += this.velocity.z * timeDelta;
    if (this.z < Z_MIN) this.z = Z_MAX;
    if (this.z > Z_MAX) this.z = Z_MIN;
    this.updateSpriteIndex();
  }

  applyMainTextRepulsion() {
    // Compute centers
    let keywordCenter = createVector(
      this.position.x + this.sprites[0].width / 2,
      this.position.y + this.sprites[0].height / 2
    );
    let mainTextCenter = createVector(
      mainTextRect.x + mainTextRect.w / 2,
      mainTextRect.y + mainTextRect.h / 2
    );

    let dir = p5.Vector.sub(keywordCenter, mainTextCenter);
    let distance = dir.mag();
    let minDistance =
      (this.sprites[0].width + mainTextRect.w) / 2;

    if (distance < minDistance * KEYWORD_REPULSION_RADIUS_MULTIPLIER) {
      dir.normalize();
      let repulsionStrength =
        KEYWORD_REPULSION_FORCE / (distance * distance);
      dir.mult(repulsionStrength);
      // Apply force to velocity
      this.velocity.add(dir);
    }
  }

  updateSpriteIndex() {
    let zNorm = map(this.z, Z_MIN, Z_MAX, 0, 1);

    this.currentSpriteIndex = floor(
      map(zNorm, 0, 1, BLUR_LEVELS.length - 1, 0)
    );

    // Ensure index is within bounds
    this.currentSpriteIndex = constrain(
      this.currentSpriteIndex,
      0,
      BLUR_LEVELS.length - 1
    );
  }

  constrainPosition() {
    if (this.position.x < 0) {
      this.position.x = 0;
      this.velocity.x *= -1;
    } else if (
      this.position.x + this.sprites[0].width >
      BUFFER_WIDTH
    ) {
      this.position.x = BUFFER_WIDTH - this.sprites[0].width;
      this.velocity.x *= -1;
    }

    if (this.position.y < 0) {
      this.position.y = 0;
      this.velocity.y *= -1;
    } else if (
      this.position.y + this.sprites[0].height >
      BUFFER_HEIGHT
    ) {
      this.position.y = BUFFER_HEIGHT - this.sprites[0].height;
      this.velocity.y *= -1;
    }
  }

  draw(renderBuffer) {
    let sprite = this.sprites[this.currentSpriteIndex];
    renderBuffer.image(sprite, this.position.x, this.position.y);
  }
}

// ======================================
// Recording Functions
// ======================================

function captureFrame() {
  if (gifRecorder) {
    // Capture the current canvas frame
    gifRecorder.addFrame(canvas.elt, { copy: true, delay: 1000 / 30 }); // Assuming 30 FPS
    recordingFrames++;
  }
}

function startRecording() {
  gifRecorder = new GIF({
    workers: 2,
    quality: 10,
    width: canvasWidth,
    height: canvasHeight,
    workerScript: 'libraries/gif.worker.js' // Ensure this line is included
  });
  recordingFrames = 0;
  console.log("Recording started");
}

function stopRecording() {
  if (gifRecorder) {
    console.log("Recording stopped. Processing GIF...");
    gifRecorder.on('finished', function (blob) {
      let currentDate = new Date(); // Current date and time
      let timestamp = currentDate.toISOString().replace(/[:.-]/g, '');
      let filename = 'Recording_' + timestamp + '.gif';
      saveAs(blob, filename);
    });
    gifRecorder.render();
    gifRecorder = null;
  }
}

// ======================================
// Event Handlers
// ======================================

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvasWithTimestamp();
  }

  if (key === 'w' || key === 'W') {
    toggleShowWords();
  }

  if (key === 'f' || key === 'F') {
    toggleShowFPS();
  }

  if (key === 'g' || key === 'G') {
    toggleRecording();
  }

  if (key === 't' || key === 'T') {
    toggleShowMainText();
  }
}

function saveCanvasWithTimestamp() {
  let currentDate = new Date(); // Current date and time
  let timestamp = currentDate.toISOString().replace(/[:.-]/g, ''); // Generate a timestamp without special characters
  let filename = 'Tag_' + timestamp + '.jpg'; // Filename, e.g., "Tag_20241115T153000.jpg"

  saveCanvas(filename); // Save the canvas as a JPEG with the generated filename
}

function toggleShowWords() {
  showWords = !showWords;
  console.log("showWords = " + showWords);
}

function toggleShowFPS() {
  showFPS = !showFPS;
  console.log("showFPS = " + showFPS);
}

function toggleShowMainText() {
  showMainText = !showMainText;
  console.log("showMainText = " + showMainText);
}

function toggleRecording() {
  recording = !recording;
  console.log("recording = " + recording);
  if (recording) {
    wasShowFPS = showFPS;
    showFPS = false;
    startRecording();
  } else {
    showFPS = wasShowFPS;
    stopRecording();
  }
}