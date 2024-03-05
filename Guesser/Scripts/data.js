let flagSizes = [20, 24, 40, 60, 80, 120, 240];
let currentFlagSize = 6;
let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ -';
let steps = 8;
let languages = ["en", "de", "es"];
let currentLanguage = 0;

let text = [["Guess the country", "Country Of This Flag:", "Correct", "Close", "Wrong", "Skip", "Next"],
["Errate das Land", "Land dieser Flagge:", "Richtig", "Fast", "Falsch", "Überspringen", "Nächstes"],
["Adivina el país", "País de esta bandera:", "Correcto", "Casi", "Falso", "Saltar", "Siguiente"]];

let countryNamesURL = "";
let countryNames = "";
let usedISOs = [];
let currentLettersArrays = [];
let currentISOindex = 0;

let flagDiv = document.getElementById("flag");
let answerDiv = document.getElementById("answer");

// gets all country names
function Get(countryNamesURL) {
  var Httpreq = new XMLHttpRequest();
  Httpreq.open("GET", countryNamesURL, false);
  Httpreq.send(null);
  return Httpreq.responseText;
}

function deleteAllStates(countries) {
  // filters all us-states
  countries = deleteStates(countries, "us");
  
  return countries;
}

function deleteStates(countries, isoCode) {
  let iso = Object.keys(countries);

  for (var i = 0; i < iso.length; i++) {
    if (iso[i].substring(0, 3) == (isoCode + "-")) {
      // delete specific entries from object and array
      delete countries[iso[i]];
      iso.splice(i, 1);
      // because others get shifted down
      i = i - 1;
    }
  }
  return countries;
}

// returns random int within a range
function getRandomInt(min, max) {
  let random = Math.floor(Math.random() * (max - min) + min);
  return random;
}

// gets ISO of the country with the specific index
function getKey(index) {
  let keys = Object.keys(countryNames);
  return keys[index];
}

// returns link with the image of the flag
function getFlagImage(key, size) {
  let imageSource = "https://flagcdn.com/h" + size + "/" + key + ".jpg";
  return imageSource;
}

// returns the country with the longest flag
function getLongestName() {
  let names = Object.values(countryNames);
  let word = names[0];
  for (var i = 1; i < names.length; i++) {
    if (names[i].length > word.length) {
      word = names[i];
    }
  }
  return word;
}

// creates letters that are clickable for each country
function createLetters(word) {
  let index = 0;
  let amount = determineAmount(word);
  let positions = positionLetters(word, amount);
  let order = Array(amount).fill(-1);

  for (var i = 0; i < positions.length; i++) {
    order[positions[i]] = word[index++].toUpperCase();
  }
  for (var i = 0; i < order.length; i++) {
    if (order[i] == -1) {
      let random = getRandomInt(0, characters.length);
      order[i] = characters[random].toUpperCase();
    }
  } 
  createButtons(order);
  currentLettersArrays[currentISOindex] = order;
}

// creates the buttons of each letter
function createButtons(order) {
  for (var i = 0; i < order.length; i++) {
    if (i % (steps) == 0) {
      document.getElementById("letters").appendChild(document.createElement('br'));
    }
    let button = document.createElement("button");
    button.id = i + "@" + order[i];
    button.onclick = function() {
      letterPressed(button);
    };
    button.innerHTML = order[i];
    if (order[i] == " ") {
      button.innerHTML = "&nbsp";
    }
    button.className = "letterButton";
    document.getElementById("letters").appendChild(button);
  }
}

// after letter is pressed, insert letter into in input and grey out the button
function letterPressed(button) {
  let input = document.getElementById("input");
  input.value += getLetter("@", button.id);
  button.style.color = "grey";
  button.style.backgroundColor = "grey";
  button.onclick = function() {};
}

function getLetter(char, name) {
  let index = name.indexOf(char);
  return name.substring(index + 1);
}

function positionLetters(word, amount) {
  let positions = [];
  while (positions.length < word.length) {
    let random = getRandomInt(0, amount);
    let alreadyUsed = checkIfUsed(positions, random);
    if (alreadyUsed == false) {
      positions.push(random);
    }
  }
  return positions;
}

function checkIfUsed(positions, random) {
  for (var i = 0; i < positions.length; i++) {
    if (positions[i] == random) {
      return true;
    }
  }
  return false;
}

function determineAmount(word) {
  let buttonsAmount = steps;
  while (buttonsAmount < word.length) {
    buttonsAmount += steps;
  }
  return buttonsAmount;
}

// checks user input if name is correct
function checkInput() {
  let input = document.getElementById("input").value;

  if (input.toLowerCase() == countryNames[usedISOs[currentISOindex]].toLowerCase()) {
    // correct country
    document.getElementById("correct").style.display = "block";
    document.getElementById("wrong").style.display = "none";
    document.getElementById("close").style.display = "none";
    changeSkipNext("NEXT");

  } else {
    // false country
    // check how false
    let nearlyCorrect = false;
    let howCorrect = 0;
    if (input.toLowerCase().length >= countryNames[usedISOs[currentISOindex]].toLowerCase()) {
      howCorrect = checkHowfalse(input.toLowerCase(), countryNames[usedISOs[currentISOindex]].toLowerCase());
    } else {
      howCorrect = checkHowfalse(countryNames[usedISOs[currentISOindex]].toLowerCase(), input.toLowerCase());
    }
    // when is it close
    if (howCorrect >= 0.6) {
      nearlyCorrect = true;
    }
    alert(howCorrect)
    // nearly correct
    if (nearlyCorrect == true) {
      document.getElementById("close").style.display = "block";
      document.getElementById("correct").style.display = "none";
      document.getElementById("wrong").style.display = "none";
    } else {
      // completely false
      document.getElementById("close").style.display = "none";
      document.getElementById("correct").style.display = "none";
      document.getElementById("wrong").style.display = "block";
    }
    changeSkipNext("SKIP");
  }
}

function changeSkipNext(text) {
  document.getElementById("skip").innerHTML = text;
}

function checkHowfalse(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

document.addEventListener('keydown', function(event) {
  // checks if input field is focused
  if (document.activeElement.tagName != "INPUT") {
    return;
  }

  // check if enter is pressed to start checking input
  if (event.key == "Enter") {
    checkInput();
    return;
  }

  let letter = event.key.toUpperCase();
  
  // checks if letter exists
  letterExists = findLetter(letter);

  // letter does not exist
  if (letterExists == false && event.key != "Backspace") {
    event.preventDefault();
    return;
  } else {
    // reverse button click if input is already done
    if (event.key == "Backspace") {
      let value = document.getElementById("input").value;
      
      // gets the position of cursor inside of input field
      let position = event.target.selectionStart;
      if (value.length > 0) {
        // make button clickable again
        reverseButton(value.charAt(position - 1));
      }
      return;
    }
    let buttons = document.getElementsByClassName("letterButton");
    let index = findButton(event.key);
    letterPressed(buttons[index]);
    event.preventDefault();
    return;
  }
});

function reverseButton(letter) {
  let buttons = document.getElementsByClassName("letterButton");
  let index = findReverseButton(letter);
  buttons[index].onclick = function() {
    letterPressed(buttons[index]);
  };
  buttons[index].style.color = "white";
  buttons[index].style.backgroundColor = "indigo";
}

function findReverseButton(key) {
  let buttons = document.getElementsByClassName("letterButton");
  for (var i = buttons.length - 1; i >= 0; i--) {
    if (getLetter("@", buttons[i].id).toUpperCase() == key.toUpperCase() && buttons[i].style.color == "grey") {
      return i;
    }
  }
}

function findButton(key) {
  let buttons = document.getElementsByClassName("letterButton");
  for (var i = 0; i < buttons.length; i++) {
    if (getLetter("@", buttons[i].id).toUpperCase() == key.toUpperCase() && buttons[i].style.color != "grey") {
      return i;
    }
  }
}

function findLetter(letter) {
  let buttons = document.getElementsByClassName("letterButton");
  if (letter == "Backspace") {
    return true;
  }
  for (var i = 0; i < currentLettersArrays[currentISOindex].length; i++) {
    if (letter == currentLettersArrays[currentISOindex][i] && buttons[i].style.color != "grey") {
      return true;
    }
  }
  return false;
}

// show next flag after previous is skipped or correctly answered
function nextFlag() {
  // checks if all flags are done
  let finished = checkCompleted();
  if (finished == true) {
    location.reload();
    return;
  }

  currentISOindex++;
  document.getElementById("answer").style.display = "none";
  showCountry();
}

// check if all countries were tested
function checkCompleted() {
  let length = Object.keys(countryNames).length;
  if (usedISOs.length == length) {
    return true;
  }
  return false;
} 

// chooses a random iso of countryNames
function chooseRandomCountry() {
  let randomISO = "";
  do {
    randomISO = getKey(getRandomInt(0, Object.keys(countryNames).length));
  } while (IsoAlreadyUsed(randomISO) == true)
  usedISOs.push(randomISO);
}

// checks if the country was already used, to avoid repetition
function IsoAlreadyUsed(ISO) {
  for (var i = 0; i < usedISOs.length; i++) {
    if (usedISOs[i] == ISO) {
      return true;
    }
  }
  return false;
}

function resetDisplay() {
  // reset input
  document.getElementById("input").value = "";

  // delete all buttons
  let buttons = document.getElementsByClassName("letterButton");
  while (buttons.length > 0) {
    buttons[0].remove();
  }

  // delete all br
  let brs = document.getElementsByTagName("br");
  while (brs.length > 0) {
    brs[0].remove();
  }

  // make results invisible
  let results = document.getElementsByClassName("result");
  for (var i = 0; i < results.length; i++) {
    if (results[i].style.display = "none");
  }
}

// shows the solution of current country
function showAnswer() {
  let answer = document.getElementById("answer");
  if (answer.style.display == "none") {
    answer.style.display = "block";
  } else {
    answer.style.display = "none";
  }
}

// displays a random country in formular
function showCountry() {
  resetDisplay();
  chooseRandomCountry();
  answerDiv.innerHTML = "" + countryNames[usedISOs[currentISOindex]];
  flagDiv.src = getFlagImage(usedISOs[currentISOindex], flagSizes[currentFlagSize]);
  createLetters(countryNames[usedISOs[currentISOindex]]);
  document.getElementById("answer").style.display = "none";
}

// choose language
function chooseLanguage(index) {
  currentLanguage = index;
  countryNamesURL = "https://flagcdn.com/" + languages[currentLanguage] + "/codes.json";
  countryNames = JSON.parse(Get(countryNamesURL));
  countryNames = deleteAllStates(countryNames);

  // change interface of website
  document.getElementById("languageFormular").style.display = "none";
  document.getElementById("formular").style.display = "block";
  document.getElementById("changeLanguageButton").style.display = "block";
  
  // change language of shown text
  changeAllInnerHTMLLanguage(index)
  showCountry();
}

// change button is clicked while answering questions
function changeLanguageDuring() {
  document.getElementById("languageFormular").style.display = "block";
  document.getElementById("formular").style.display = "none";
  document.getElementById("changeLanguageButton").style.display = "none";
}

// change all text to chosen language
function changeAllInnerHTMLLanguage(index) {
  document.getElementById("title").innerHTML = text[index][0];
  document.getElementById("subtitle").innerHTML = text[index][1];
  document.getElementById("correct").innerHTML = text[index][2];
  document.getElementById("close").innerHTML = text[index][3];
  document.getElementById("wrong").innerHTML = text[index][4];
  document.getElementById("skip").innerHTML = text[index][5];
}