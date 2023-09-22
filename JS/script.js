// DOM elements
let upperQuesCounter = document.querySelector("#upper-ques-counter");
let currentQuesSpan = document.querySelector("#curr-ques");
let numberOfQuesToShow = document.querySelector("#num-of-ques");
let quesTitle = document.querySelector("#ques-title");
let answersLabel = document.querySelectorAll("#answers-box label");
let answerInputs = document.getElementsByName("answers");
let timerBox = document.querySelector("#timer");
let countdownElement = document.querySelector("#timer-counter");
let nextBtn = document.querySelector("#next-btn");
let prevBtn = document.querySelector("#prev-btn");
let quizBox = document.querySelector("#quiz-box");
let quesTitleBoxMark = document.querySelector("#ques-title-box i");
let stopWatchIcon = document.querySelector("#timer #stop-watch");
let mainData = [];

// Quiz state variables
let dataLength;
let rightAnswers = 0;
let rightAnswersArr = new Map();
let currentQues = 1;
const time = 20;
let countdownInterval;
let clickListener;

// Fetch quiz data from a JSON file
function fetchData(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          const questionsData = JSON.parse(this.responseText);
          resolve(questionsData);
        } else {
          reject(new Error("Failed to fetch data"));
        }
      }
    };
    xhr.open("GET", url, true);
    xhr.send();
  });
}

// Display a question and its answers
function displayQuestion(data) {
  currentQuesSpan.textContent = currentQues;
  numberOfQuesToShow.textContent = dataLength;
  upperQuesCounter.innerHTML = "";

  for (let i = 0; i < dataLength; i++) {
    let currentTap = document.createElement("span");
    currentTap.classList = "current-tap bg-ccc rad-6 h-5 w-full";
    currentTap.id = `tap-${i + 1}`;
    if (i === currentQues - 1) {
      currentTap.classList = "current-tap bg-blue rad-6 h-5 w-full";
    }
    upperQuesCounter.appendChild(currentTap);
  }

  quesTitle.textContent = data.title;
  populateAnswers(data);
}

// Populate answer choices
function populateAnswers(data) {
  let answerCount = 1;
  answersLabel.forEach((answerLabel) => {
    let inputRad = answerLabel.querySelector("input[type='radio']");
    let divRad = answerLabel.querySelector(".radio-text");
    inputRad.value = data[`answer_${answerCount}`];
    divRad.textContent = data[`answer_${answerCount}`];
    answerCount++;
  });
}

// Start the countdown timer
function startCountdown(duration) {
  let minutes, seconds;
  countdownInterval = setInterval(() => {
    minutes = parseInt(duration / 60);
    seconds = parseInt(duration % 60);
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;
    countdownElement.textContent = `${minutes}:${seconds}`;
    if (duration === 15) {
      stopWatchIcon.style.cssText =
        "animation: wiggle 1s ease infinite; color: #ff0000;";
      timerBox.style.backgroundColor = "#ff00002e";
    }
    if (--duration < 0) {
      showResult();
    }
  }, 1000);
}

// Check the selected answer and update the state
function checkAnswer(correctAnswer) {
  let selectedAnswer = null;

  for (let i = 0; i < answerInputs.length; i++) {
    if (answerInputs[i].checked) {
      selectedAnswer = answerInputs[i];
      answerInputs[i].checked = false;
      break;
    }
  }

  if (selectedAnswer !== null) {
    if (selectedAnswer.value === correctAnswer) {
      rightAnswers++;
    }
    rightAnswersArr.set(currentQues, selectedAnswer.id);
  }
}

// Display the quiz result
function showResult() {
  nextBtn.removeEventListener("click", clickListener);
  clearInterval(countdownInterval);
  quizBox.classList.add("finished");
  let rate;
  if (dataLength % 2 === 0) {
    if (rightAnswers < dataLength / 2) rate = false;
    else rate = true;
  } else {
    if (rightAnswers < parseInt(dataLength / 2) + 1) rate = false;
    else rate = true;
  }
  popup(rate);
}

function popup(rate) {
  // Create the main popup container
  const popupDiv = document.createElement("div");
  popupDiv.className = "result-popup";

  // Create a container for the result message
  const resultSec = document.createElement("div");
  resultSec.className = "result-sec";

  // Create a <span> to display "Your Score Is:"
  const resultSecSpan = document.createElement("span");
  resultSecSpan.textContent = "Your Score Is: ";
  resultSecSpan.classList.add("result-sec-span");

  // Create a <span> to display the score (good or bad)
  const theResult = document.createElement("span");
  theResult.textContent = `${rightAnswers}/${dataLength}`;
  theResult.classList.add("result-score");
  if (rate) theResult.classList.add("good");
  else theResult.classList.add("bad");

  // Append the result message elements to the result container
  resultSec.appendChild(resultSecSpan);
  resultSec.appendChild(theResult);

  // Create a container for the popup buttons
  const popupBtnSec = document.createElement("div");
  popupBtnSec.classList.add("popup-btn-sec");
  // Create a "Revision" button
  const revisionBtn = document.createElement("button");
  revisionBtn.classList.add("revision-btn");
  revisionBtn.textContent = "Revision";
  revisionBtn.addEventListener("click", () => {
    popupDiv.remove();
    quizBox.classList.remove("finished");
    timerBox.style.display = "none";
    prevBtn.style.display = "block";
    prevBtn.parentElement.style.justifyContent = "space-between";
    answerInputs.forEach((ele) => {
      ele.disabled = true;
    });
    revisionShow();
  });

  // Create an "Another Try" button
  const anotherTryBtn = document.createElement("button");
  anotherTryBtn.classList.add("another-try-btn");
  anotherTryBtn.textContent = "Another Try";
  anotherTryBtn.addEventListener("click", () => {
    window.location.reload();
  });

  // Append the buttons to the popup button container
  popupBtnSec.appendChild(revisionBtn);
  popupBtnSec.appendChild(anotherTryBtn);

  // Append the result and button containers to the main popup container
  popupDiv.appendChild(resultSec);
  popupDiv.appendChild(popupBtnSec);

  // Append the popup to the body
  document.body.appendChild(popupDiv);
}
function revisionShow() {
  let currRevQues = 1;
  revisionShowQues(mainData[currRevQues - 1], currRevQues);
  nextBtn.addEventListener("click", () => {
    if (currRevQues < dataLength) {
      currRevQues++;
      revisionShowQues(mainData[currRevQues - 1], currRevQues);
    }
  });
  prevBtn.addEventListener("click", () => {
    if (currRevQues > 1) {
      currRevQues--;
      revisionShowQues(mainData[currRevQues - 1], currRevQues);
    }
  });
}

function revisionShowQues(quesData, quesNum) {
  currentQuesSpan.textContent = quesNum;
  numberOfQuesToShow.textContent = dataLength;
  upperQuesCounter.innerHTML = "";

  for (let i = 0; i < dataLength; i++) {
    let currentTap = document.createElement("span");
    currentTap.classList = "current-tap bg-ccc rad-6 h-5 w-full";
    currentTap.id = `tap-${i + 1}`;
    if (i === quesNum - 1) {
      currentTap.classList = "current-tap bg-blue rad-6 h-5 w-full";
    }
    upperQuesCounter.appendChild(currentTap);
  }

  quesTitle.textContent = quesData.title;
  RevPopulateAnswers(quesData, rightAnswersArr.get(quesNum));
}

function RevPopulateAnswers(quesData, userSelectedAnswerId) {
  let answerCount = 1; // Initialize an answer counter variable

  // Loop through each answer label in the quiz
  answersLabel.forEach((answerLabel) => {
    // Select the radio input and the element with the class "radio-text" within the answer label
    let inputRad = answerLabel.querySelector("input[type='radio']");
    let divRad = answerLabel.querySelector(".radio-text");

    // Set the value and text content of the radio input and "radio-text" element based on the question data
    inputRad.value = quesData[`answer_${answerCount}`];
    divRad.textContent = quesData[`answer_${answerCount}`];

    // Reset the styling of the "radio-text" element (removing previous custom styles)
    divRad.style.cssText = "background-color: none; border: 1px solid #ccc;";

    // Check if the user selected this answer and it's not the correct answer
    if (userSelectedAnswerId === inputRad.id) {
      if (quesData.right_answer !== quesData[`answer_${answerCount}`]) {
        // Apply a red background and border to highlight the user's incorrect choice
        divRad.style.cssText =
          "background-color: #ff000038; border: 1px solid #ff00008c;";
        quesTitleBoxMark.classList = "fa-solid fa-square-xmark";
        quesTitleBoxMark.style.color = "#ec4141";
      } else {
        quesTitleBoxMark.classList = "fa-solid fa-square-check";
        quesTitleBoxMark.style.color = "#4caf50";
      }
    }
    if (userSelectedAnswerId === null) {
      quesTitleBoxMark.classList = "fa-solid fa-square-xmark";
      quesTitleBoxMark.style.color = "#ec4141";
    }

    // Check if this answer is the correct answer
    if (quesData.right_answer === quesData[`answer_${answerCount}`]) {
      // Apply a green background and border to highlight the correct answer
      divRad.style.cssText =
        "background-color: #1dc65738; border: 1px solid #1dc6578c;";
    }

    // Increment the answer counter for the next iteration
    answerCount++;
  });
}

// Initialize the quiz
fetchData("html_questions.json")
  .then((data) => {
    mainData = data;
    dataLength = data.length;
    for (let i = 1; i <= dataLength; i++) {
      rightAnswersArr.set(i, null);
    }
    displayQuestion(data[currentQues - 1]);
    startCountdown(time);

    // Define the click event listener function
    clickListener = () => {
      checkAnswer(data[currentQues - 1].right_answer);
      currentQues++;
      if (currentQues > dataLength) {
        showResult(data);
      } else {
        displayQuestion(data[currentQues - 1]);
      }
    };

    // Add the click event listener using the defined function
    nextBtn.addEventListener("click", clickListener);
  })
  .catch((error) => {
    console.error(error);
  });
