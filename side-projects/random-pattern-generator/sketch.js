/*
 * Random Abstract Pattern Generator
 * Based on an idea from https://www.facebook.com/perlinfieldbot4150.
 * Code based on riginal github : https://github.com/dvalim/perlinfieldbot
 *
 * Other links : 
 * Fujii attractor : https://how-to-build-du-e.tumblr.com/
 * Clifford attractor : http://paulbourke.net/fractals/clifford/
 * DeJong attractor : http://paulbourke.net/fractals/peterdejong/
 */
 
// Pattern variables
var x, y, x_prev, y_prev;
var x_disp, y_disp; 
var hue1, hue2;
var a, f, t, v, p, q;
var minx, miny, maxx, maxy; 
var sketchHeight, sketchWidth;
var color1, color2;
var iterationNb, currentIteration, calculatedIterationNb;
var saturationValue;
var brightnessValue;
var method;
var seed;

// Constants
const pixelAlpha = 10/255;
const batchNb = 20000;
const colorRange = 1;

// Simulation boolean
var generating;
var settingOpen;
var pauseAfterGeneration;

// Countdown beetwen two generation
var countdown;

// HTML Objects 
var objCustomSeed;
var objCustomIteration;
var objIterationOutput;
var objCustomSaturation;
var objSaturationOutput;
var objCustomBrightness;
var objBrightnessOutput;
var objFujiiCheckBox;
var objCliffordCheckBox;
var objDejongCheckBox;
var objPercentage;
var objPauseGenerationLink;

function setup() {
  pixelDensity(1);
  frameRate(60);
  colorMode(RGB, 255, 255, 255, 255);

  defineHTMLObjects();

  // Computing nb of iterations based on sketch size
  sketchHeight = round(windowHeight * 0.7);
  sketchWidth = round(1.77 * sketchHeight);
  calculatedIterationNb = round(sketchWidth * 0.035);
  objIterationOutput.value(calculatedIterationNb);

  settingOpen = false;

  var canvas = createCanvas(sketchWidth, sketchHeight);
  canvas.parent('sketch-holder');
 
  // Generate new pattern environment with basic settings
  newPattern(customSettings=false);
}

function draw() {

  if(generating){

    loadPixels();

    for(var i = 0; i < batchNb; i++)
    {
      var coordinates = generateCoordinates();
      x = coordinates.x;
      y = coordinates.y;
      
      // Color handling
      var step = createVector(x-x_prev, y-y_prev).mult(10);
      var tt = constrain(map(step.magSq(), 0, PI*PI*2, 0, 1), -colorRange, colorRange);
      var newColor = interpolateColor(color1, color2, tt);

      // Normalization displaying
      minx = min(minx, x);
      miny = min(miny, y);
      maxx = max(maxx, x);
      maxy = max(maxy, y);
      x_disp = map(x, minx, maxx, 50, sketchWidth-50);
      y_disp = map(y, miny, maxy, 50, sketchHeight-80);

      var x_rounded = round(x_disp);
      var y_rounded = round(y_disp);
      displayPixel(x_rounded, y_rounded, newColor);

      // Save current coordinates for next run
      x_prev = x;
      y_prev = y;

    }

    currentIteration++;
    updatePixels();
    displayGenPercentage();

    if(currentIteration >= iterationNb) {
      generating = false;
    }

  }
  else{
    if(pauseAfterGeneration){
        // Countdown is paused at the end of custom settings generation
        noLoop();
    }
    else{
      if (frameCount % 60 == 0 && countdown > 0){
        countdown--;
        stringNewPattern = "New pattern in "+countdown+ " s";
        objPercentage.html(stringNewPattern);
        }
      if (countdown == 0){
          newPattern();
      }
    }
  }
}

/*
 * Settings functions :
 */

function newPattern(customSettings) {

  // Generate settings for next pattern
  // If customSettings = false, uses default settings
  // Else, uses input settings from settings panel.

  background(15,15,15,255);
  
  generating = true;
  currentIteration = 0;
  countdown = 15;

  x = 0; 
  y = 0;
  x_prev = 0; 
  y_prev = 0;

  x_disp = 0; 
  y_disp = 0;

  t = 0;
  a = [];
  f = [];

  minx = 10
  miny = 10
  maxx = -10
  maxy = -10

  if(customSettings){
    generateCustomSettings();
  }
  else{
    generateBasicSettings();
  }
  
  randomSeed(seed);
  objCurrentSeed.html("Seed: "+seed);
  objPauseGenerationLink.html("Pause generation");

  // Generate pattern equations coefficients
  generateCoefficients()

  // Select two random colors for pattern
  hue1 = int(random(0, 360));
  hue2 = (hue1+int(random(100, 260))) % 360;

  color1 = hsvToRgb(hue1, saturationValue, brightnessValue);
  color2 = hsvToRgb(hue2, saturationValue, brightnessValue);

  loop();

}

function generateCustomSettings(){
  pauseAfterGeneration = true;

  var customSeed = objCustomSeed.value();
  seed = (customSeed != "") ? customSeed : floor(Math.random() * 10 ** 12);

  saturationValue = objCustomSaturation.value() / 100;
  brightnessValue = objCustomBrightness.value() / 100;
  iterationNb = objCustomIteration.value();
  method = objCliffordCheckBox.checked ? "clifford" : objDejongCheckBox.checked ? "dejong" : "fujii";
}

function generateBasicSettings(){
  pauseAfterGeneration = false;
  seed = floor(Math.random() * 10 ** 12);
  saturationValue = 0.5;
  brightnessValue = 0.8;
  iterationNb = calculatedIterationNb;
  method = "fujii";
}

/*
 * UI functions :
 */

function defineHTMLObjects(){
  objCurrentSeed = select("#seed");
  objCustomSeed = select('#customSeed');
  objCustomIteration = select('#customIteration');
  objIterationOutput = select('#iterationOutput');
  objCustomSaturation = select('#customSaturation');
  objSaturationOutput = select('#saturationOutput');
  objCustomBrightness = select('#customBrightness');
  objBrightnessOutput = select('#brightnessOutput');
  objFujiiCheckBox = select('#fujii').elt;
  objCliffordCheckBox = select('#clifford').elt;
  objDejongCheckBox = select('#dejong').elt;
  objPercentage = select("#percentage");
  objPauseGenerationLink = select("#pauseGenerationLink");
}

function pauseResumeGeneration(){
  if(isLooping()){
    objPercentage.html("Generation paused");
    objPauseGenerationLink.html("Resume generation");
    noLoop();
  }
  else{
    objPauseGenerationLink.html("Pause generation");
    loop();
  }
}

function openCloseSettingsPanel(){
  var newWidth = settingOpen ? "0px" : "300px";
  select('#settingPanel').style('width', newWidth);
  settingOpen = !settingOpen;
}

function resetPanelSettings(){
  objCustomSeed.value("")
  objCustomSaturation.value(50);
  objSaturationOutput.value(50);
  objCustomBrightness.value(80);
  objBrightnessOutput.value(80);
  objCustomIteration.value(calculatedIterationNb);
  objIterationOutput.value(calculatedIterationNb);
  objFujiiCheckBox.checked = true;
}

/*
/* Equations functions : 
 */

function ssin(coord, coeff){
  if(coeff==0) return asin(sin(coord));
  else return pow(sin(coord), coeff);  
}

function ccos(coord, coeff){
  if(coeff==0) return acos(cos(coord));
  else return pow(cos(coord), coeff);  
}

function generateCoordinates(){
  var coordX, coordY;

  if(method=="clifford"){
    coordX = sin(f[0]*y_prev) + a[0] * cos(f[0]*x_prev);
    coordY = sin(f[1]*x_prev) + a[1] * cos(f[1]*y_prev);

  }
  else if(method=="dejong"){
    coordX = sin(f[0]*y_prev) - cos(f[1]*x_prev);
    coordY = sin(f[2]*x_prev) - cos(f[3]*y_prev);
  }
  else{ //fujii
    coordX = a[0]*ssin(f[0]*x_prev, p) + a[1]*ccos(f[1]*y_prev, q) + a[2]*ssin(f[2]*t, p);
    coordY = a[3]*ccos(f[3]*x_prev, q) + a[4]*ssin(f[4]*y_prev, p) + a[5]*ssin(f[5]*t, q);
    t += v;
  }
  return {x: coordX, y: coordY};
}


function generateCoefficients(){
  if(method == "clifford"){
       for(var i = 0; i < 2; i++){
        a[i] = random(1, 3) * (random() > 0.5 ? -1: 1);
        f[i] = random(1, 3) * (random() > 0.5 ? -1: 1);
      }
    }
    else if(method == "dejong"){
       for(var i = 0; i < 4; i++){
        f[i] = random(1, 3) * (random() > 0.5 ? -1: 1);
      }
    }
    else{
      for(var i = 0; i < 6; i++){
        a[i] = random(0.7, 1.2) * (random() > 0.5 ? -1: 1);
        f[i] = random(0.7, 1.2) * (random() > 0.5 ? -1: 1);
      }
      v = random(0.001, 0.5);
      p =int(random(1, 5));
      q = int(random(1, 5));
    }
}

/* 
 * Display functions 
 */

function displayPixel(coordX, coordY, pixelColor){
  var index = (coordX + coordY * sketchWidth)*4;
  pixels[index+0] += pixelColor.r*pixelAlpha;
  pixels[index+1] += pixelColor.g*pixelAlpha;
  pixels[index+2] += pixelColor.b*pixelAlpha;
}

function displayGenPercentage(){
    var currentLoadPercentage = floor(currentIteration*100/iterationNb);
    var stringPercentage = (currentLoadPercentage != 100) ? "Generating pattern... "+currentLoadPercentage+"%" : "";
    objPercentage.html(stringPercentage);
}

function hsvToRgb(hh, ss, vv){
  var rr, gg, bb, ii, ff, pp, qq, tt;
    if(hh >= 360.0) hh = 0.0;
    ii = floor(hh / 60.0);
    ff = hh / 60.0 - ii;
    pp = vv * (1 - ss);
    qq = vv * (1 - ff * ss);
    tt = vv * (1 - (1 - ff) * ss);
    switch (ii % 6) {
        case 0: rr = vv, gg = tt, bb = pp; break;
        case 1: rr = qq, gg = vv, bb = pp; break;
        case 2: rr = pp, gg = vv, bb = tt; break;
        case 3: rr = pp, gg = qq, bb = vv; break;
        case 4: rr = tt, gg = pp, bb = vv; break;
        case 5: rr = vv, gg = pp, bb = qq; break;
    }
    return {
        r: round(rr * 255),
        g: round(gg * 255),
        b: round(bb * 255)
    };
}

function interpolateColor(color1, color2, percent){
  var resultRed = color1.r + percent * (color2.r - color1.r);
  var resultGreen = color1.g + percent * (color2.g - color1.g);
  var resultBlue = color1.b + percent * (color2.b - color1.b);
  return {
    r: resultRed,
    g: resultGreen,
    b: resultBlue
  };
}

/* 
 * Miscellaneous
 */

function constrain(a, b, c){
  if(a < b) return b;
  else if (a > c) return c;
  else return a;
}