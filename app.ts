// Pages
const gamePage = document.getElementById("game-page") as HTMLElement;
const scorePage = document.getElementById("score-page") as HTMLElement;
const splashPage = document.getElementById("splash-page") as HTMLElement;
const countdownPage = document.getElementById("countdown-page") as HTMLElement;
// Splash Page
const startForm = document.getElementById("start-form") as HTMLFormElement;
const radioContainers = document.querySelectorAll(".radio-container")!;
const radioInputs = document.querySelectorAll("input")!;
const bestScores = document.querySelectorAll(".best-score-value")!;
// Countdown Page
const countdown = document.querySelector(".countdown") as HTMLElement;
// Game Page
const itemContainer = document.querySelector(".item-container") as HTMLElement;
// Score Page
const finalTimeElem = document.querySelector(".final-time") as HTMLElement;
const baseTimeElem = document.querySelector(".base-time") as HTMLElement;
const penaltyTimeElem = document.querySelector(".penalty-time") as HTMLElement;
const playAgainBtn = document.querySelector(".play-again") as HTMLButtonElement;

interface EquationObject {
  [key: string]: string;
}

interface bestScoreObjects {
  questions: number;
  bestScore: string;
}
// Equations
let numberOfQuestions: number;
let equationsArray: EquationObject[] = [];
let playerGuess: string[] = [];
let bestScoresArray: bestScoreObjects[];

// Game Page
let firstNumber: number = 0;
let secondNumber: number = 0;
let equationObject: EquationObject = {};
const wrongFormat: string[] = [];

// Time
let timer: number;
let timePlayed: number = 0;
let baseTime: number = 0;
let penaltyTime: number = 0;
let finalTime: number = 0;
let finalTimeDisplay: string = "0.0";

// Scroll
let valueY: number = 0;

// display game page
function showGamePage() {
  gamePage.hidden = false;
  countdownPage.hidden = true;
}

// for number of questions
function selectNumberOfQuestions(e: any) {
  e.preventDefault();
  numberOfQuestions = Number(getValueFromRadio());
  if (numberOfQuestions) {
    showCountdown();
  }
}

// value from selected radio button
function getValueFromRadio() {
  let radioValue;
  radioInputs.forEach((radioInput) => {
    if ((radioInput as HTMLInputElement).checked) {
      radioValue = radioInput.value;
    }
  });
  return radioValue;
}

// Navigate from splash page to countdown page
function showCountdown() {
  countdownPage.hidden = false;
  splashPage.hidden = true;
  countdownStart();
  populateGamePage();
}

// display 3,2,1 go
function countdownStart() {
  let count = 5;
  countdown.textContent = `${count}`;
  const timeCountDown = setInterval(() => {
    count--;
    if (count === 0) {
      countdown.textContent = "Go!";
    } else if (count === -1) {
      showGamePage();
      clearInterval(timeCountDown);
    } else {
      countdown.textContent = `${count}`;
    }
  }, 1000);
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

// Get random integar
function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

// scroll, store user selection in array
function select(guessTrue: string) {
  // scroll on Y axis by 80px
  valueY += 80;
  itemContainer.scroll(0, valueY);

  // add player guess
  return guessTrue ? playerGuess.push("true") : playerGuess.push("false");
}
// EVENT LISTENERS
startForm.addEventListener("click", () => {
  radioContainers.forEach((radioElem) => {
    // reset selected label styling
    radioElem.classList.remove("selected-label");

    // add back if radio is checked
    if ((radioElem.children[1] as HTMLInputElement).checked) {
      radioElem.classList.add("selected-label");
    }
  });
});

// start timer when game page is clicked
function startTimer() {
  // reset times
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;
  timer = setInterval(addTime, 100);
  gamePage.removeEventListener("click", startTimer);
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

// add time when the player miss a a question//
function addTime() {
  timePlayed += 0.1;
  checkTime();
}

// format & display time in DOM
function displayScores() {
  finalTimeDisplay = finalTime.toFixed(1);
  baseTime = Number(timePlayed.toFixed(1));
  penaltyTime = Number(penaltyTime.toFixed(1));
  baseTimeElem.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeElem.textContent = `Penalty: +${penaltyTime}s`;
  finalTimeElem.textContent = `${finalTimeDisplay}s`;
  updateBestScore();
  // scroll to top, go to score page
  itemContainer.scrollTo({
    top: 0,
    behavior: "smooth",
  });
  showScorePage();
}

//show score page and hide game page
function showScorePage() {
  // -----------------------
  setTimeout(() => {
    playAgainBtn.hidden = false;
  }, 1000);
  gamePage.hidden = true;
  scorePage.hidden = false;
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

// update best score array
function updateBestScore() {
  interface Score {
    bestScore: string;
    questions: number;
  }
  bestScoresArray.forEach((score, i) => {
    // select correct best score to update
    if (numberOfQuestions == (score as Score).questions) {
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

//
function displayBestScores() {
  // loop best score on the DOM
  // set each of them to the best score in the local storage
  bestScores.forEach((bestScore, i) => {
    const bestScoreElem = bestScore;
    bestScoreElem.textContent = `${bestScoresArray[i].bestScore}s`;
  });
}

// ================================== //
startForm.addEventListener("submit", selectNumberOfQuestions);
gamePage.addEventListener("click", startTimer);

//
getSavedBestScores();
