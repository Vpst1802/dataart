let data;
let countries = [];
let colIndex = [];
let rentIndex = [];
let maxCol, minCol, maxRent, minRent;
let colors = [];
let margin = 150; // Increased margin for radial labels
let selectedCountry = -1; // Index of the selected country
let sortedRentIndices = [];
let centerX, centerY; // Define centerX and centerY globally

function preload() {
  data = loadTable('col.csv', 'csv', 'header', dataLoaded);
}

function dataLoaded(table) {
  console.log('Data loaded successfully');
  console.log('Number of rows:', table.getRowCount());
  console.log('Number of columns:', table.getColumnCount());
}

function setup() {
  createCanvas(1200, 1200); // Increased canvas size for more space
  colorMode(HSB, 360, 100, 100, 1);
  
  centerX = width / 2;  // Set centerX
  centerY = height / 2; // Set centerY
  
  if (data) {
    // Extract data
    for (let row of data.rows) {
      countries.push(row.getString('Country'));
      colIndex.push(row.getNum('Cost of Living Index'));
      rentIndex.push(row.getNum('Rent Index'));
    }
    
    console.log('Number of countries:', countries.length);
    
    // Sort data by Cost of Living Index (descending)
    let sorted = countries.map((c, i) => ({country: c, col: colIndex[i], rent: rentIndex[i]}));
    sorted.sort((a, b) => b.col - a.col);
    
    countries = sorted.map(item => item.country);
    colIndex = sorted.map(item => item.col);
    rentIndex = sorted.map(item => item.rent);
    
    // Find min and max values
    maxCol = max(colIndex);
    minCol = min(colIndex);
    maxRent = max(rentIndex);
    minRent = min(rentIndex);
    
    // Generate unique colors for each country
    for (let i = 0; i < countries.length; i++) {
      let hue = map(i, 0, countries.length, 0, 360);
      colors.push(color(hue, 70, 90));
    }

    // Calculate sortedRentIndices here
    sortedRentIndices = rentIndex.map((v, i) => ({value: v, index: i}))
                                 .sort((a, b) => b.value - a.value);
  } else {
    console.error('Data failed to load');
  }
}

function draw() {
  background(10);
  
  let outerRadius = min(width, height) / 2 - margin;
  let innerRadius = outerRadius * 0.6;
  
  // Draw basic structure even if there's no data
  noFill();
  stroke(200);
  ellipse(centerX, centerY, outerRadius * 2);
  ellipse(centerX, centerY, innerRadius * 2);
  
  if (countries.length === 0) {
    fill(200);
    textAlign(CENTER, CENTER);
    textSize(16);
    text("No data available", centerX, centerY);
    return;
  }
  
  let dotSize = 9;
  
  // Draw Cost of Living Index circle
  for (let i = 0; i < countries.length; i++) {
    let angle = map(i, 0, countries.length, 0, TWO_PI) - HALF_PI;
    let x = centerX + cos(angle) * outerRadius;
    let y = centerY + sin(angle) * outerRadius;
    
    // Draw country name with improved radial alignment and positioning
    push();
    fill(i === selectedCountry ? colors[i] : color(0, 0, 80));
    textAlign(angle < -HALF_PI || angle > HALF_PI ? RIGHT : LEFT, CENTER);
    textSize(12);
    let labelRadius = outerRadius + 15; // Reduced gap for closer positioning
    let labelX = centerX + cos(angle) * labelRadius;
    let labelY = centerY + sin(angle) * labelRadius;
    translate(labelX, labelY);
    
    // Adjust text rotation and position based on angle
    if (angle < -HALF_PI || angle > HALF_PI) {
      rotate(angle + PI);
      text(countries[i], -5, 0); // Start from circle edge, extend outwards
    } else {
      rotate(angle);
      text(countries[i], 5, 0); // Start from outer space, end at circle edge
    }
    pop();
    
    // Draw Cost of Living Index dot
    noStroke();
    fill(i === selectedCountry ? colors[i] : colors[i]);
    ellipse(x, y, i === selectedCountry ? dotSize * 1.5 : dotSize);
    
    // Draw rank
    push();
    fill(0, 0, 80);
    textAlign(CENTER);
    textSize(10);
    let rankX = centerX + cos(angle) * (outerRadius - 15);
    let rankY = centerY + sin(angle) * (outerRadius - 15);
    text(i+1, rankX, rankY);
    pop();
  }
  
  // Draw Rent Index circle
  for (let i = 0; i < countries.length; i++) {
    let originalIndex = sortedRentIndices[i].index;
    let angle = map(i, 0, countries.length, 0, TWO_PI) - HALF_PI;
    let x = centerX + cos(angle) * innerRadius;
    let y = centerY + sin(angle) * innerRadius;
    
    // Draw Rent Index dot
    noStroke();
    fill(originalIndex === selectedCountry ? colors[originalIndex] : colors[originalIndex]);
    ellipse(x, y, originalIndex === selectedCountry ? dotSize * 1.5 : dotSize);
    
    // Draw Rent Index rank
    push();
    fill(0, 0, 70);
    textAlign(CENTER);
    textSize(7);
    let rankX = centerX + cos(angle) * (innerRadius + 15);
    let rankY = centerY + sin(angle) * (innerRadius + 15);
    text(i+1, rankX, rankY);
    pop();
  }
  
  // Draw smooth connecting lines
  for (let i = 0; i < countries.length; i++) {
    let outerAngle = map(i, 0, countries.length, 0, TWO_PI) - HALF_PI;
    let innerAngle = map(sortedRentIndices.findIndex(item => item.index === i), 0, countries.length, 0, TWO_PI) - HALF_PI;
    
    let startX = centerX + cos(outerAngle) * outerRadius;
    let startY = centerY + sin(outerAngle) * outerRadius;
    let endX = centerX + cos(innerAngle) * innerRadius;
    let endY = centerY + sin(innerAngle) * innerRadius;
    
    // Calculate control points for the bezier curve
    let midRadius = (outerRadius + innerRadius) / 2;
    let controlAngle = (outerAngle + innerAngle) / 2;
    let controlX = centerX + cos(controlAngle) * midRadius;
    let controlY = centerY + sin(controlAngle) * midRadius;
    
    noFill();
    if (i === selectedCountry) {
      stroke(colors[i]);
      strokeWeight(2);
    } else {
      stroke(hue(colors[i]), saturation(colors[i]), brightness(colors[i]), 0.4);
      strokeWeight(0.8);
    }
    bezier(startX, startY, controlX, controlY, controlX, controlY, endX, endY);
  }
  
  // Draw curved "Cost of Living" label
  drawCurvedText("Cost of Living", centerX, centerY, outerRadius + 115, -HALF_PI/6, HALF_PI/6, 25, color(200));
  
  // Draw curved "Rent Index" label
  drawCurvedText("Rent Index", centerX, centerY, innerRadius - 30, -HALF_PI/6, HALF_PI/6, 20, color(200));
  
  // Draw source information and social media links
  fill(128);
  textAlign(CENTER);
  textSize(10);
  text("Source: Cost of Living Index by Country, 2024 Mid Year data Data scraped from Numbeo", centerX, height - 40);
  text("", centerX, height - 25);
  }

function mousePressed() {
  let outerRadius = min(width, height) / 2 - margin;
  let innerRadius = outerRadius * 0.6;
  
  for (let i = 0; i < countries.length; i++) {
    let angle = map(i, 0, countries.length, 0, TWO_PI) - HALF_PI;
    let x = centerX + cos(angle) * outerRadius;
    let y = centerY + sin(angle) * outerRadius;
    
    // Check if mouse is over the outer dot or label
    if (dist(mouseX, mouseY, x, y) < 10 || isMouseOverLabel(i, angle, outerRadius)) {
      selectedCountry = i;
      return;
    }
    
    // Check if mouse is over the inner dot
    let innerIndex = sortedRentIndices.findIndex(item => item.index === i);
    let innerAngle = map(innerIndex, 0, countries.length, 0, TWO_PI) - HALF_PI;
    let innerX = centerX + cos(innerAngle) * innerRadius;
    let innerY = centerY + sin(innerAngle) * innerRadius;
    
    if (dist(mouseX, mouseY, innerX, innerY) < 10) {
      selectedCountry = i;
      return;
    }
  }
  
  // If no country was clicked, deselect
  selectedCountry = -1;
}

function isMouseOverLabel(index, angle, radius) {
  let labelRadius = radius + 15;
  let labelX = centerX + cos(angle) * labelRadius;
  let labelY = centerY + sin(angle) * labelRadius;
  
  push();
  textSize(10);
  let labelWidth = textWidth(countries[index]);
  let labelHeight = textAscent() + textDescent();
  pop();
  
  // Rotate the mouse coordinates to match the label's rotation
  let rotatedMouseX = cos(-angle) * (mouseX - labelX) - sin(-angle) * (mouseY - labelY);
  let rotatedMouseY = sin(-angle) * (mouseX - labelX) + cos(-angle) * (mouseY - labelY);
  
  // Check if the rotated mouse position is within the label's bounding box
  if (angle < -HALF_PI || angle > HALF_PI) {
    return rotatedMouseX >= -labelWidth && rotatedMouseX <= 0 &&
           rotatedMouseY >= -labelHeight/2 && rotatedMouseY <= labelHeight/2;
  } else {
    return rotatedMouseX >= 0 && rotatedMouseX <= labelWidth &&
           rotatedMouseY >= -labelHeight/2 && rotatedMouseY <= labelHeight/2;
  }
}

function drawCurvedText(str, x, y, radius, startAngle, endAngle, size, color) {
  let angleRange = endAngle - startAngle;
  let angleStep = angleRange / (str.length - 1);
  
  push();
  translate(x, y);
  rotate(startAngle);
  noStroke();
  fill(color);
  textAlign(CENTER, BOTTOM);
  textSize(size);
  
  for (let i = 0; i < str.length; i++) {
    push();
    rotate(i * angleStep);
    translate(0, -radius);
    text(str[i], 0, 0);
    pop();
  }
  
  pop();
}
