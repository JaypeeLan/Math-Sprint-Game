// Pages
const gamePage = document.getElementById("game-page");
const scorePage = document.getElementById("score-page");
const splashPage = document.getElementById("splash-page");
const countdownPage = document.getElementById("countdown-page");
// Splash Page
const startForm = document.getElementById("start-form");
const radioContainers = document.querySelectorAll(".radio-container");
const radioInputs = document.querySelectorAll("input");
const bestScores = document.querySelectorAll(".best-score-value");
// Countdown Page
const countdown = document.querySelector(".countdown");
// Game Page
const itemContainer = document.querySelector(".item-container");
// Score Page
const finalTimeElem = document.querySelector(".final-time");
const baseTimeElem = document.querySelector(".base-time");
const penaltyTimeElem = document.querySelector(".penalty-time");
const playAgainBtn = document.querySelector(".play-again");

// Equations
let numberOfQuestions;
let equationsArray = [];
let playerGuess = [];
let bestScoresArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = "0.0";

// Scroll
let valueY = 0;

//
function displayBestScores() {
  // loop best score on the DOM
  // set each of them to the best score in the local storage
  bestScores.forEach((bestScore, i) => {
    const bestScoreElem = bestScore;
    bestScoreElem.textContent = `${bestScoresArray[i].bestScore}s`;
  });
}

// update best score array
function updateBestScore() {
  bestScoresArray.forEach((score, i) => {
    // select correct best score to update
    if (numberOfQuestions == score.questions) {
      // Return best score as number with one decimal
      const savedBestScore = Number(bestScoresArray[i].bestScore);
      // update if new final score <= 0
      if (savedBestScore === 0 || savedBestScore > finalTime) {
        bestScoresArray[i].bestScore = finalTimeDisplay;
      }
    }
  });
  // update splash page
  displayBestScores();
  // save to local storage
  localStorage.setItem("bestScores", JSON.stringify(bestScoresArray));
}

// ===========================//
function getSavedBestScores() {
  if (localStorage.getItem("bestScores")) {
    bestScoresArray = JSON.parse(localStorage.bestScores);
  } else {
    bestScoresArray = [
      {
        questions: 10,
        bestScore: finalTimeDisplay,
      },
      {
        questions: 25,
        bestScore: finalTimeDisplay,
      },
      {
        questions: 50,
        bestScore: finalTimeDisplay,
      },
      {
        questions: 99,
        bestScore: finalTimeDisplay,
      },
    ];
    localStorage.setItem("bestScores", JSON.stringify(bestScoresArray));
  }
  displayBestScores();
}

// reset game
function playAgain() {
  gamePage.addEventListener("click", startTimer);
  scorePage.hidden = true;
  splashPage.hidden = false;
  equationsArray = [];
  playerGuess = [];
  valueY = 0;
  playAgainBtn.hidden = true;
}

// =======
function showScorePage() {
  // -----------------------
  setTimeout(() => {
    playAgainBtn.hidden = false;
  }, 1000);
  gamePage.hidden = true;
  scorePage.hidden = false;
}

// format & display time in DOM
function displayScores() {
  finalTimeDisplay = finalTime.toFixed(1);
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);
  baseTimeElem.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeElem.textContent = `Penalty: +${penaltyTime}s`;
  finalTimeElem.textContent = `${finalTimeDisplay}s`;
  updateBestScore();
  // scroll to top, go to score page
  itemContainer.scrollTo({
    top: 0,
    behavior: "instant",
  });
  showScorePage();
}

// stop timer, process results, go to score page
function checkTime() {
  if (playerGuess.length == numberOfQuestions) {
    clearInterval(timer);

    // check for wrong guesses, add penalty time
    equationsArray.forEach((equation, i) => {
      if (equation.evaluated == playerGuess[i]) {
        // correct
      } else {
        // wrong guess,  add penalty
        penaltyTime += 0.5;
      }
    });
    finalTime = timePlayed + penaltyTime;

    displayScores();
  }
}

// =============================== //
function addTime() {
  timePlayed += 0.1;
  checkTime();
}

// start timer when game page is clicked
function startTimer() {
  // reset times
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;
  timer = setInterval(addTime, 100);
  gamePage.removeEventListener("click", startTimer);
}

// scroll, store user selection in array
function select(guessTrue) {
  // scroll on Y axis by 80px
  valueY += 80;
  itemContainer.scroll(0, valueY);

  // add player guess
  return guessTrue ? playerGuess.push("true") : playerGuess.push("false");
}

// Get random integar
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomInt(numberOfQuestions);

  // Set amount of wrong equations
  const wrongEquations = numberOfQuestions - correctEquations;

  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: "true" };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomInt(3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: "false" };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray);
}

function showEquations() {
  equationsArray.forEach((equation) => {
    // ----
    const item = document.createElement("div");
    item.classList.add("item");

    const equationText = document.createElement("h1");
    equationText.textContent = equation.value;

    item.appendChild(equationText);
    itemContainer.appendChild(item);
  });
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = "";
  // Spacer
  const topSpacer = document.createElement("div");
  topSpacer.classList.add("height-240");
  // Selected Item
  const selectedItem = document.createElement("div");
  selectedItem.classList.add("selected-item");
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  showEquations();

  // Set Blank Space Below
  const bottomSpacer = document.createElement("div");
  bottomSpacer.classList.add("height-500");
  itemContainer.appendChild(bottomSpacer);
}

// display 3,2,1 go
function countdownStart() {
  let count = 5;
  countdown.textContent = count;
  const timeCountDown = setInterval(() => {
    count--;
    if (count === 0) {
      countdown.textContent = "Go!";
    } else if (count === -1) {
      showGamePage();
      clearInterval(timeCountDown);
    } else {
      countdown.textContent = count;
    }
  }, 1000);
}

// Navigate from splash page to countdown page
function showCountdown() {
  countdownPage.hidden = false;
  splashPage.hidden = true;
  countdownStart();
  populateGamePage();
}

// display game page
function showGamePage() {
  gamePage.hidden = false;
  countdownPage.hidden = true;
}

// value from selected radio button
function getValueFromRadio() {
  let radioValue;
  radioInputs.forEach((radioInput) => {
    if (radioInput.checked) {
      radioValue = radioInput.value;
    }
  });
  return radioValue;
}

// for number of questions
function selectNumberOfQuestions(e) {
  e.preventDefault();
  numberOfQuestions = getValueFromRadio();
  if (numberOfQuestions) {
    showCountdown();
  }
}

// --------------------------------
startForm.addEventListener("click", () => {
  radioContainers.forEach((radioElem) => {
    // reset selected label styling
    radioElem.classList.remove("selected-label");

    // add back if radio is checked
    if (radioElem.children[1].checked) {
      radioElem.classList.add("selected-label");
    }
  });
});

// ================================== //
startForm.addEventListener("submit", selectNumberOfQuestions);
gamePage.addEventListener("click", startTimer);

//
getSavedBestScores();
