// INNER VOICES - Complete Project
// Scenes 1, 2, 3, 4 & 5
// by EO

// GLOBAL VARIABLES
let currentScene = 1;

// Audio
let sadBGM;
let doorSound;
let bgmPlaying = false;

// Fonts
let courierFont;

// Paintings (shared across scenes)
let paintings = [];

// Transition
let fadeAmount = 0;
let fadeDirection = 0; // 0 = no fade, 1 = fade out, 2 = fade in

// SCENE 1 VARIABLES
let dialogues = [
  { speaker: "MOM", text: "She's been in her room forever, how can a daughter never talks to her parents." },
  { speaker: "DAD", text: "I bet she's drawing some random stuff again." },
  { speaker: "MOM", text: "How does this even happened!? We have told her how tragic her life will be if she becomes an artist. She already can't handle her emotions well now!" },
  { speaker: "DAD", text: "Ask yourself, I'm barely around. How can I know what the hell that kid is thinking? Why can't she be a doctor like her brother!" }
];

let currentDialogue = 0;
let dialogueFinished = false;

// SCENE 2 VARIABLES
let innerThoughts = [
  { text: "......" },
  { text: "Why again...." },
  { text: "I just want to make art! I just want to be happy..." },
  { text: "Why no one understands me?" }
];

let currentThought = 0;
let thoughtsFinished = false;
let videoCapture;
let videoReady = false;
let blurredVideo; // Graphics buffer for blurred video
let bedClickable = false;

// SCENE 3 VARIABLES
let catDialogues = [
  { speaker: "YOU", text: "Where am I? Am I dreaming?" },
  { speaker: "CAT", text: "Hello." },
  { speaker: "YOU", text: "!Who are you? A speaking cat? OK I'm definitely dreaming." },
  { speaker: "CAT", text: "Yes and no, you're in the state of dreaming but it's still reality. My name is not important, I'm here to help you." },
  { speaker: "YOU", text: "What do you mean?" },
  { speaker: "CAT", text: "I'm here for you, I will listen to you, and I always understand you. You can tell me anything you want." },
  { speaker: "YOU", text: "Hmmm...Well, it's a dream anyway, so why not?" }
];

let currentCatDialogue = 0;
let catDialogueFinished = false;
let inputBox;
let submitButton;
let showInputBox = false;
let sentiment;
let sentimentScore = 0.5;
let sentimentAnalyzed = false;
let showDoor = false;
let doorOpacity = 0;

// Cat animation
let catBobOffset = 0;
let catHeadRotationX = 0;
let catHeadRotationY = 0;
let catTailWiggle = 0;
let catNodding = false;
let catNodAmount = 0;

// SCENE 4 VARIABLES
let projectVideo;
let videoAudio;
let videoLoaded = false;
let audioLoaded = false;
let playPauseButton;
let videoEndHoldTime = 0;
let videoHasEnded = false;
let holdDuration = 2000; // Hold last frame for 2 seconds

// SCENE 5 VARIABLES
let replayButton;
let fadeToBlackAmount = 0;
let fadingToBlack = false;

// PRELOAD
function preload() {
  // Load paintings
  for (let i = 1; i <= 6; i++) {
    paintings.push(loadImage('painting' + i + '.png'));
  }
  
  // Load font
  courierFont = loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Regular.otf');
  
  // Load door sound
  doorSound = loadSound('door_open.mp3', 
    () => { console.log('Door sound loaded'); },
    () => { console.log('Door sound failed to load'); }
  );
}

// SETUP 
function setup() {
  createCanvas(1024, 768, WEBGL);
  textFont(courierFont);
  
  // Try to load and play background music
  sadBGM = loadSound('sadbackgroundmusic.m4a', 
    () => {
      console.log('Music loaded successfully');
      sadBGM.setVolume(0.5);
      sadBGM.loop();
      bgmPlaying = true;
    },
    () => {
      console.log('Music failed to load, continuing without audio');
      bgmPlaying = false;
    }
  );
  
  // Initialize ml5 sentiment analysis
  sentiment = ml5.sentiment('movieReviews', () => {
    console.log('Sentiment model loaded');
  });
}

// MAIN DRAW LOOP
function draw() {
  // Handle fade transition
  if (fadeDirection === 1) {
    // Fade out
    fadeAmount += 2;
    if (fadeAmount >= 255) {
      fadeAmount = 255;
      fadeDirection = 2;
      // Switch scene during black screen
      if (currentScene === 2) {
        currentScene = 3;
        setupScene3();
      } else if (currentScene === 3) {
        currentScene = 4;
        setupScene4();
      }
    }
  } else if (fadeDirection === 2) {
    // Fade in
    fadeAmount -= 2;
    if (fadeAmount <= 0) {
      fadeAmount = 0;
      fadeDirection = 0;
    }
  }
  
  // Route to appropriate scene
  if (currentScene === 1) {
    drawScene1();
  } else if (currentScene === 2) {
    drawScene2();
  } else if (currentScene === 3) {
    drawScene3();
  } else if (currentScene === 4) {
    drawScene4();
  } else if (currentScene === 5) {
    drawScene5();
  }
  
  // Draw fade overlay
  if (fadeAmount > 0) {
    push();
    resetMatrix();
    ortho(-width/2, width/2, -height/2, height/2, 0, 1000);
    fill(0, 0, 0, fadeAmount);
    noStroke();
    rect(-width/2, -height/2, width, height);
    pop();
  }
}

// MOUSE PRESSED
function mousePressed() {
  // Enable audio on user interaction
  if (sadBGM && !sadBGM.isPlaying() && bgmPlaying) {
    sadBGM.loop();
  }
  
  if (currentScene === 1) {
    handleScene1Click();
  } else if (currentScene === 2) {
    handleScene2Click();
  } else if (currentScene === 3) {
    handleScene3Click();
  }
}

// KEY PRESSED
function keyPressed() {
  // Handle spacebar for Scene 2 → Scene 3 transition
  if (currentScene === 2 && bedClickable && key === ' ') {
    console.log("Spacebar pressed - transitioning to Scene 3");
    transitionToScene(3);
  }
  
  // Handle Enter key for input submission in Scene 3
  if (currentScene === 3 && showInputBox && keyCode === ENTER) {
    submitSentiment();
  }
}

// SCENE TRANSITION
function transitionToScene(sceneNumber) {
  fadeDirection = 1; // Start fade out
  fadeAmount = 0;
}

// SCENE 1 FUNCTIONS
function drawScene1() {
  background(60, 62, 65);
  orbitControl();
  
  ambientLight(120, 120, 130);
  directionalLight(150, 150, 160, 0, -1, -0.5);
  pointLight(180, 180, 190, 0, -200, 0);
  
  drawRoom();
  drawFurniture(false);
  drawPaintings();
  
  if (currentDialogue >= dialogues.length && !dialogueFinished) {
    dialogueFinished = true;
  }
  
  checkAudio();
  drawScene1UI();
}

function handleScene1Click() {
  if (currentDialogue < dialogues.length) {
    currentDialogue++;
  } else if (dialogueFinished) {
    console.log("Transitioning to Scene 2");
    currentScene = 2;
    setupScene2();
  }
}

function drawScene1UI() {
  push();
  resetMatrix();
  ortho(-width/2, width/2, -height/2, height/2, 0, 1000);
  
  if (currentDialogue < dialogues.length) {
    let dialogue = dialogues[currentDialogue];
    
    push();
    translate(-width/2 + 100, height/2 - 220, 0);
    
    if (dialogue.speaker === "MOM") {
      fill(100, 80, 120, 230);
    } else if (dialogue.speaker === "DAD") {
      fill(80, 100, 120, 230);
    }
    
    stroke(200, 200, 220);
    strokeWeight(2);
    rect(0, 0, 150, 40);
    
    fill(255, 255, 255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    textStyle(BOLD);
    text(dialogue.speaker, 75, 20);
    pop();
    
    push();
    translate(-width/2 + 100, height/2 - 170, 0);
    fill(40, 45, 50, 230);
    stroke(200, 200, 220);
    strokeWeight(2);
    rect(0, 0, width - 200, 140);
    
    fill(255, 255, 255);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(16);
    textStyle(NORMAL);
    text(dialogue.text, 20, 20, width - 240, 100);
    pop();
    
    if (frameCount % 60 < 30) {
      push();
      translate(width/2 - 250, height/2 - 50, 0);
      fill(255, 255, 255);
      noStroke();
      textAlign(RIGHT);
      textSize(14);
      text("Click to continue...", 0, 0);
      pop();
    }
  } else if (dialogueFinished) {
    if (frameCount % 60 < 30) {
      push();
      translate(0, -height/2 + 100, 0);
      fill(150, 200, 255);
      noStroke();
      textAlign(CENTER);
      textSize(20);
      text("Click to approach the mirror...", 0, 0);
      pop();
    }
  }
  
  pop();
}

// SCENE 2 FUNCTIONS
function setupScene2() {
  videoCapture = createCapture(VIDEO);
  videoCapture.size(320, 240);
  videoCapture.hide();
  
  blurredVideo = createGraphics(320, 240);
  
  setTimeout(() => {
    videoReady = true;
    console.log('Video capture ready!');
  }, 1000);
}

function drawScene2() {
  background(60, 62, 65);
  orbitControl();
  
  ambientLight(140, 140, 150);
  directionalLight(180, 180, 190, 0, -1, -0.5);
  pointLight(200, 200, 210, 0, 0, -500);
  pointLight(180, 180, 190, 0, -200, 0);
  
  if (videoReady && videoCapture) {
    updateBlurredVideo();
  }
  
  drawRoom();
  drawFurniture(true);
  drawPaintings();
  
  if (currentThought >= innerThoughts.length && !thoughtsFinished) {
    thoughtsFinished = true;
    bedClickable = true;
  }
  
  checkAudio();
  drawScene2UI();
}

function updateBlurredVideo() {
  blurredVideo.push();
  blurredVideo.clear();
  
  blurredVideo.image(videoCapture, 0, 0, 320, 240);
  blurredVideo.filter(BLUR, 8);
  
  blurredVideo.loadPixels();
  for (let y = 0; y < blurredVideo.height; y += 4) {
    for (let x = 0; x < blurredVideo.width; x += 4) {
      let index = (x + y * blurredVideo.width) * 4;
      let r = blurredVideo.pixels[index];
      let g = blurredVideo.pixels[index + 1];
      let b = blurredVideo.pixels[index + 2];
      
      for (let py = 0; py < 4; py++) {
        for (let px = 0; px < 4; px++) {
          let pindex = ((x + px) + (y + py) * blurredVideo.width) * 4;
          blurredVideo.pixels[pindex] = r;
          blurredVideo.pixels[pindex + 1] = g;
          blurredVideo.pixels[pindex + 2] = b;
        }
      }
    }
  }
  blurredVideo.updatePixels();
  
  blurredVideo.pop();
}

function handleScene2Click() {
  if (currentThought < innerThoughts.length) {
    currentThought++;
  }
}

function drawScene2UI() {
  push();
  resetMatrix();
  ortho(-width/2, width/2, -height/2, height/2, 0, 1000);
  
  if (currentThought < innerThoughts.length) {
    let thought = innerThoughts[currentThought];
    
    push();
    translate(-width/2 + 100, height/2 - 170, 0);
    fill(60, 80, 100, 230);
    stroke(200, 200, 220);
    strokeWeight(2);
    rect(0, 0, width - 200, 140);
    
    fill(255, 255, 255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(18);
    textStyle(ITALIC);
    text(thought.text, (width - 200) / 2, 70);
    pop();
    
    if (frameCount % 60 < 30) {
      push();
      translate(width/2 - 250, height/2 - 50, 0);
      fill(255, 255, 255);
      noStroke();
      textAlign(RIGHT);
      textSize(14);
      text("Click to continue...", 0, 0);
      pop();
    }
  } else if (bedClickable) {
    if (frameCount % 60 < 30) {
      push();
      translate(0, -height/2 + 100, 0);
      fill(150, 200, 255);
      noStroke();
      textAlign(CENTER);
      textSize(20);
      text("Press SPACE to fall asleep...", 0, 0);
      pop();
    }
  }
  
  pop();
}

// SCENE 3 FUNCTIONS
function setupScene3() {
  // Stop background music for Scene 3
  if (sadBGM && sadBGM.isPlaying()) {
    sadBGM.stop();
    bgmPlaying = false;
  }
  
  // Remove video capture
  if (videoCapture) {
    videoCapture.remove();
  }
  
  console.log('Scene 3 initialized - Dream world');
}

function drawScene3() {
  background(255); // Pure white
  
  // Allow camera orbit
  orbitControl();
  
  // Bright lighting for white void
  ambientLight(200);
  directionalLight(255, 255, 255, 0, -1, -0.5);
  
  // Update cat animations
  updateCatAnimation();
  
  // Draw cat
  drawCat();
  
  // Draw door if it should appear
  if (showDoor) {
    updateDoor();
    drawDoor();
  }
  
  // Draw UI
  drawScene3UI();
}

function updateCatAnimation() {
  // Gentle bobbing
  catBobOffset = sin(frameCount * 0.02) * 5;
  
  // Tail wiggle
  catTailWiggle = sin(frameCount * 0.1) * 0.3;
  
  // Head follows mouse (simplified)
  let mouseXNorm = map(mouseX, 0, width, -1, 1);
  let mouseYNorm = map(mouseY, 0, height, 1, -1);
  catHeadRotationY = lerp(catHeadRotationY, mouseXNorm * 0.3, 0.05);
  catHeadRotationX = lerp(catHeadRotationX, mouseYNorm * 0.2, 0.05);
  
  // Nodding animation when typing
  if (catNodding) {
    catNodAmount = sin(frameCount * 0.15) * 0.15;
  } else {
    catNodAmount = lerp(catNodAmount, 0, 0.1);
  }
}

function drawCat() {
  push();
  
  // Position cat - NO ROTATION, stationary
  translate(0, catBobOffset, 0);
  
  // Cat color: orange-yellow
  let catColor = color(255, 180, 60);
  let catDarkColor = color(230, 150, 40);
  
  // BODY
  push();
  translate(0, 20, 0);
  fill(catColor);
  noStroke();
  sphere(40); // Body
  pop();
  
  // HEAD (follows mouse)
  push();
  translate(0, -30, 0);
  rotateY(catHeadRotationY);
  rotateX(catHeadRotationX + catNodAmount);
  
  fill(catColor);
  noStroke();
  sphere(30); // Head
  
  // EARS
  push();
  translate(-15, -20, 0);
  fill(catColor);
  rotateZ(-0.3);
  rotateX(PI); 
  cone(10, 25);
  pop();
  
  push();
  translate(15, -20, 0);
  fill(catColor);
  rotateZ(0.3);
  rotateX(PI); 
  cone(10, 25);
  pop();
  
  // EYES
  push();
  translate(-10, -5, 25);
  fill(50);
  sphere(4);
  pop();
  
  push();
  translate(10, -5, 25);
  fill(50);
  sphere(4);
  pop();
  
  // NOSE
  push();
  translate(0, 5, 28);
  fill(255, 150, 150);
  sphere(3);
  pop();
  
  // WHISKERS
  stroke(100);
  strokeWeight(1);
  line(-15, 0, 25, -35, 0, 30);
  line(-15, 0, 25, -35, 5, 30);
  line(15, 0, 25, 35, 0, 30);
  line(15, 0, 25, 35, 5, 30);
  
  pop(); // End head
  
  // TAIL (with wiggle)
  push();
  translate(0, 25, -35);
  rotateX(PI/4 + catTailWiggle);
  fill(catDarkColor);
  noStroke();
  cylinder(5, 50);
  
  // Tail tip
  translate(0, 30, 0);
  sphere(6);
  pop();
  
  // LEGS 
  let legPositions = [
    [-15, 50, 15],
    [15, 50, 15],
    [-15, 50, -15],
    [15, 50, -15]
  ];
  
  for (let pos of legPositions) {
    push();
    translate(pos[0], pos[1], pos[2]);
    fill(catDarkColor);
    noStroke();
    cylinder(4, 30);
    pop();
  }
  
  pop(); // End cat
}

function updateDoor() {
  // Fade in door
  if (doorOpacity < 255) {
    doorOpacity += 3;
  }
}

function drawDoor() {
  push();
  
  // Position door in center
  translate(0, 50, -300);
  
  // Door frame
  push();
  fill(255, 220, 80, doorOpacity);
  stroke(200, 180, 60, doorOpacity);
  strokeWeight(8);
  box(140, 220, 15);
  pop();
  
  // Door surface
  push();
  translate(0, 0, 8);
  fill(60, 100, 180, doorOpacity);
  stroke(40, 70, 140, doorOpacity);
  strokeWeight(2);
  box(130, 210, 8);
  
  // Door panels
  noFill();
  stroke(40, 70, 140, doorOpacity);
  strokeWeight(3);
  
  // Top panel
  push();
  translate(0, -60, 1);
  box(90, 60, 1);
  pop();
  
  // Bottom panel
  push();
  translate(0, 60, 1);
  box(90, 60, 1);
  pop();
  
  pop();
  
  // Door handle
  push();
  translate(45, 20, 12);
  fill(200, 180, 60, doorOpacity);
  noStroke();
  sphere(6);
  pop();
  
  // Magical glow effect
  push();
  fill(100, 150, 255, doorOpacity * 0.2);
  noStroke();
  translate(0, 0, -10);
  box(160, 240, 20);
  pop();
  
  pop();
}

function handleScene3Click() {
  if (currentCatDialogue < catDialogues.length) {
    currentCatDialogue++;
    
    // Check if dialogue finished
    if (currentCatDialogue >= catDialogues.length) {
      catDialogueFinished = true;
      showInputBox = true;
      createInputElements();
    }
  } else if (sentimentAnalyzed && showDoor) {
    // Transition to Scene 4
    console.log("Door clicked - transitioning to Scene 4");
    transitionToScene(4);
  }
}

function createInputElements() {
  // Create input box 
  inputBox = createInput('');
  inputBox.position(width/2 - 200, height - 200);
  inputBox.size(400, 40);
  inputBox.style('font-size', '16px');
  inputBox.style('font-family', 'Courier New');
  inputBox.style('padding', '10px');
  inputBox.attribute('placeholder', 'Express yourself...');
  
  // Create submit button
  submitButton = createButton('Submit');
  submitButton.position(width/2 + 220, height - 200);
  submitButton.size(80, 40);
  submitButton.style('font-size', '14px');
  submitButton.style('font-family', 'Courier New');
  submitButton.mousePressed(submitSentiment);
  
  // Enable cat nodding when typing
  inputBox.input(() => {
    catNodding = inputBox.value().length > 0;
  });
}

function submitSentiment() {
  let userText = inputBox.value();
  
  if (userText.length > 0) {
    console.log('Analyzing sentiment:', userText);
    
    // Analyze sentiment
    let prediction = sentiment.predict(userText);
    sentimentScore = prediction.score;
    
    console.log('Sentiment score:', sentimentScore);
    
    // Hide input elements
    inputBox.remove();
    submitButton.remove();
    showInputBox = false;
    catNodding = false;
    
    // Mark as analyzed
    sentimentAnalyzed = true;
    
    // Show door and play sound
    showDoor = true;
    if (doorSound) {
      doorSound.play();
    }
  }
}

function drawScene3UI() {
  push();
  resetMatrix();
  ortho(-width/2, width/2, -height/2, height/2, 0, 1000);
  
  if (currentCatDialogue < catDialogues.length) {
    let dialogue = catDialogues[currentCatDialogue];
    
    // Speaker name box
    if (dialogue.speaker === "YOU") {
      push();
      translate(-width/2 + 100, height/2 - 220, 0);
      fill(80, 100, 140, 230);
      stroke(200, 200, 220);
      strokeWeight(2);
      rect(0, 0, 150, 40);
      
      fill(255, 255, 255);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(20);
      textStyle(BOLD);
      text(dialogue.speaker, 75, 20);
      pop();
    } else if (dialogue.speaker === "CAT") {
      push();
      translate(-width/2 + 100, height/2 - 220, 0);
      fill(180, 100, 150, 230);
      stroke(200, 200, 220);
      strokeWeight(2);
      rect(0, 0, 150, 40);
      
      fill(255, 255, 255);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(20);
      textStyle(BOLD);
      text(dialogue.speaker, 75, 20);
      pop();
    }
    
    // Dialogue box
    push();
    translate(-width/2 + 100, height/2 - 170, 0);
    fill(240, 240, 245, 230);
    stroke(200, 200, 220);
    strokeWeight(2);
    rect(0, 0, width - 200, 140);
    
    fill(50);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(16);
    textStyle(NORMAL);
    text(dialogue.text, 20, 20, width - 240, 100);
    pop();
    
    // Click prompt
    if (frameCount % 60 < 30) {
      push();
      translate(width/2 - 250, height/2 - 50, 0);
      fill(100);
      noStroke();
      textAlign(RIGHT);
      textSize(14);
      text("Click to continue...", 0, 0);
      pop();
    }
  } else if (sentimentAnalyzed && showDoor) {
    // Final cat message
    push();
    translate(-width/2 + 100, height/2 - 220, 0);
    fill(180, 100, 150, 230);
    stroke(200, 200, 220);
    strokeWeight(2);
    rect(0, 0, 150, 40);
    
    fill(255, 255, 255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    textStyle(BOLD);
    text("CAT", 75, 20);
    pop();
    
    push();
    translate(-width/2 + 100, height/2 - 170, 0);
    fill(240, 240, 245, 230);
    stroke(200, 200, 220);
    strokeWeight(2);
    rect(0, 0, width - 200, 140);
    
    fill(50);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(16);
    textStyle(NORMAL);
    text("I hear you and you have the right to feel this way. I wish you can feel better, so please open that door. I have a surprise for you.", 20, 20, width - 240, 100);
    pop();
    
    // Prompt to click door
    if (frameCount % 60 < 30) {
      push();
      translate(0, -height/2 + 100, 0);
      fill(100, 150, 255);
      noStroke();
      textAlign(CENTER);
      textSize(20);
      text("Click the door to continue...", 0, 0);
      pop();
    }
  }
  
  pop();
}

// SCENE 4 FUNCTIONS
function setupScene4() {
  console.log('Scene 4 initialized - Video playback');
  console.log('Sentiment score from Scene 3:', sentimentScore);
  
  // Reset video end tracking
  videoHasEnded = false;
  videoEndHoldTime = 0;
  
  // Load video
  projectVideo = createVideo('finalproject_video.mp4', () => {
    videoLoaded = true;
    console.log('Video loaded');
  });
  projectVideo.hide();
  projectVideo.size(1024, 768);
  
  // Load audio
  videoAudio = loadSound('videoaudio.mp3', () => {
    audioLoaded = true;
    console.log('Video audio loaded');
  });
  
  // Create play/pause button (will hide after playback starts)
  playPauseButton = createButton('❚❚');
  playPauseButton.position(width/2 - 30, height - 60);
  playPauseButton.size(60, 40);
  playPauseButton.style('font-size', '18px');
  playPauseButton.style('background-color', 'rgba(255, 255, 255, 0.8)');
  playPauseButton.style('border', '2px solid #333');
  playPauseButton.style('border-radius', '5px');
  playPauseButton.style('cursor', 'pointer');
  playPauseButton.mousePressed(togglePlayPause);
  
  // Wait for both to load, then play
  checkAndPlayVideo();
}

function checkAndPlayVideo() {
  if (videoLoaded && audioLoaded) {
    // Start both at the same time
    projectVideo.play();
    videoAudio.play();
    console.log('Video and audio playing');
    
    // Hide play/pause button after video starts
    setTimeout(() => {
      if (playPauseButton) {
        playPauseButton.hide();
      }
    }, 1000);
    
    // Monitor video end
    projectVideo.onended(() => {
      console.log('Video ended - holding last frame for 2 seconds');
      videoHasEnded = true;
      videoEndHoldTime = millis();
      
      // Remove button if still exists
      if (playPauseButton) {
        playPauseButton.remove();
      }
    });
  } else {
    // Check again in 100ms
    setTimeout(checkAndPlayVideo, 100);
  }
}

function togglePlayPause() {
  if (projectVideo.elt.paused) {
    projectVideo.play();
    videoAudio.play();
    playPauseButton.html('❚❚');
  } else {
    projectVideo.pause();
    videoAudio.pause();
    playPauseButton.html('▶');
  }
}

function drawScene4() {
  // Black background (cinematic)
  background(0);
  
  // Check if video has ended and hold time has passed
  if (videoHasEnded && millis() - videoEndHoldTime > holdDuration) {
    // Transition to Scene 5
    console.log('Hold duration complete - transitioning to Scene 5');
    currentScene = 5;
    setupScene5();
    videoHasEnded = false; // Reset flag
    return;
  }
  
  // Draw video full-screen if loaded
  if (videoLoaded && projectVideo) {
    push();
    resetMatrix();
    ortho(-width/2, width/2, -height/2, height/2, 0, 1000);
    
    // Center video
    imageMode(CENTER);
    image(projectVideo, 0, 0, 1024, 768);
    
    pop();
  } else {
    // Loading screen
    push();
    resetMatrix();
    ortho(-width/2, width/2, -height/2, height/2, 0, 1000);
    
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(24);
    text("Loading video...", 0, 0);
    
    pop();
  }
}

// SCENE 5 FUNCTION
function setupScene5() {
  console.log('Scene 5 initialized - End credits');
  fadingToBlack = true;
  fadeToBlackAmount = 0;
  
  // Create replay button (initially hidden)
  replayButton = createButton('Replay');
  replayButton.position(width/2 - 50, height/2 + 50);
  replayButton.size(100, 50);
  replayButton.style('font-size', '18px');
  replayButton.style('font-family', 'Courier New');
  replayButton.style('background-color', 'rgba(255, 255, 255, 0.9)');
  replayButton.style('border', '2px solid #fff');
  replayButton.style('border-radius', '5px');
  replayButton.style('cursor', 'pointer');
  replayButton.style('display', 'none'); // Hidden initially
  replayButton.mousePressed(restartProject);
  
  // Show button after 3 seconds
  setTimeout(() => {
    if (replayButton) {
      replayButton.style('display', 'block');
    }
  }, 3000);
}

function restartProject() {
  console.log('Restarting project from Scene 1');
  
  // Clean up Scene 5
  if (replayButton) {
    replayButton.remove();
  }
  
  // Stop any audio
  if (videoAudio && videoAudio.isPlaying()) {
    videoAudio.stop();
  }
  
  // Reset all variables
  currentScene = 1;
  currentDialogue = 0;
  dialogueFinished = false;
  currentThought = 0;
  thoughtsFinished = false;
  bedClickable = false;
  currentCatDialogue = 0;
  catDialogueFinished = false;
  sentimentAnalyzed = false;
  showDoor = false;
  doorOpacity = 0;
  fadeAmount = 0;
  fadeDirection = 0;
  
  // Restart background music
  if (sadBGM) {
    sadBGM.loop();
    bgmPlaying = true;
  }
}

function drawScene5() {
  // Black background
  background(0);
  
  // Fade to black effect
  if (fadingToBlack && fadeToBlackAmount < 255) {
    fadeToBlackAmount += 3;
  }
  
  push();
  resetMatrix();
  ortho(-width/2, width/2, -height/2, height/2, 0, 1000);
  
  // Draw "Special thanks..." text
  fill(255, 255, 255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(32);
  textStyle(NORMAL);
  
  text("Special thanks to", 0, -20);
  text("Professor Robert Twomey", 0, 30);
  
  // Black overlay for fade effect
  fill(0, 0, 0, fadeToBlackAmount);
  noStroke();
  rect(-width/2, -height/2, width, height);
  
  pop();
}

// SHARED FUNCTIONS
function drawRoom() {
  push();
  
  push();
  translate(0, 384, 0);
  rotateX(HALF_PI);
  fill(70, 72, 75);
  noStroke();
  plane(1200, 1200);
  pop();
  
  push();
  translate(0, -384, 0);
  rotateX(HALF_PI);
  fill(80, 82, 85);
  noStroke();
  plane(1200, 1200);
  pop();
  
  push();
  translate(0, 0, -600);
  fill(75, 77, 80);
  noStroke();
  plane(1200, 768);
  pop();
  
  push();
  translate(-600, 0, 0);
  rotateY(HALF_PI);
  fill(72, 74, 77);
  noStroke();
  plane(1200, 768);
  pop();
  
  push();
  translate(600, 0, 0);
  rotateY(HALF_PI);
  fill(72, 74, 77);
  noStroke();
  plane(1200, 768);
  pop();
  
  pop();
}

function drawFurniture(showMirrorVideo) {
  // DESK
  push();
  translate(-400, 200, -400);
  fill(80, 70, 60);
  noStroke();
  box(150, 10, 100);
  
  fill(70, 60, 50);
  push();
  translate(-60, 40, -40);
  box(10, 80, 10);
  pop();
  push();
  translate(60, 40, -40);
  box(10, 80, 10);
  pop();
  push();
  translate(-60, 40, 40);
  box(10, 80, 10);
  pop();
  push();
  translate(60, 40, 40);
  box(10, 80, 10);
  pop();
  pop();
  
  // BED
  push();
  translate(100, 250, -400);
  fill(60, 65, 70);
  noStroke();
  box(300, 60, 200);
  
  fill(70, 60, 50);
  push();
  translate(0, 40, 0);
  box(320, 20, 220);
  pop();
  
  fill(60, 50, 40);
  push();
  translate(-150, 60, -100);
  box(15, 40, 15);
  pop();
  push();
  translate(150, 60, -100);
  box(15, 40, 15);
  pop();
  push();
  translate(-150, 60, 100);
  box(15, 40, 15);
  pop();
  push();
  translate(150, 60, 100);
  box(15, 40, 15);
  pop();
  pop();
  
  // MIRROR
  push();
  translate(0, 0, -595);
  
  fill(70, 60, 50);
  stroke(50, 40, 30);
  strokeWeight(2);
  box(180, 230, 10);
  
  if (showMirrorVideo && videoReady && blurredVideo) {
    push();
    translate(0, 0, 6);
    
    tint(180, 180, 200, 200);
    texture(blurredVideo);
    noStroke();
    plane(170, 220);
    pop();
    
    push();
    translate(0, 0, 7);
    fill(80, 90, 100, 100);
    noStroke();
    plane(170, 220);
    pop();
  } else {
    fill(140, 150, 160, 150);
    noStroke();
    translate(0, 0, 6);
    plane(170, 220);
  }
  
  pop();
  
  // DOOR
  push();
  translate(-450, 50, -595);
  fill(60, 55, 50);
  stroke(40, 35, 30);
  strokeWeight(2);
  box(120, 250, 10);
  
  fill(100, 100, 110);
  push();
  translate(50, 0, 8);
  sphere(5);
  pop();
  pop();
}

function drawPaintings() {
  push();
  translate(-300, -100, -595);
  fill(80, 70, 60);
  stroke(50, 40, 30);
  strokeWeight(3);
  box(100, 120, 5);
  translate(0, 0, 3);
  texture(paintings[0]);
  noStroke();
  plane(90, 110);
  pop();
  
  push();
  translate(300, -100, -595);
  fill(80, 70, 60);
  stroke(50, 40, 30);
  strokeWeight(3);
  box(100, 120, 5);
  translate(0, 0, 3);
  texture(paintings[1]);
  noStroke();
  plane(90, 110);
  pop();
  
  push();
  translate(-400, 155, -400);
  rotateX(-HALF_PI);
  rotateZ(random(-0.1, 0.1));
  texture(paintings[2]);
  noStroke();
  plane(60, 80);
  pop();
  
  push();
  translate(-450, 379, -300);
  rotateX(-HALF_PI);
  rotateZ(0.3);
  texture(paintings[3]);
  noStroke();
  plane(70, 90);
  pop();
  
  push();
  translate(250, 379, -350);
  rotateX(-HALF_PI);
  rotateZ(-0.2);
  texture(paintings[4]);
  noStroke();
  plane(65, 85);
  pop();
  
  push();
  translate(50, 379, -200);
  rotateX(-HALF_PI);
  rotateZ(0.5);
  texture(paintings[5]);
  noStroke();
  plane(55, 75);
  pop();
}

function checkAudio() {
  if (sadBGM && !sadBGM.isPlaying() && bgmPlaying && currentScene < 3) {
    sadBGM.loop();
  }
}