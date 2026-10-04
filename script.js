/* ============================================================
   GUESS THE SONG
   Telugu Picture Song Challenge
   ============================================================ */

"use strict";

/* ============================================================
   GAME CONFIGURATION
   ============================================================ */

const GAME_CONFIG = {
    timePerQuestion: 20,
    startingLives: 3,
    pointsPerCorrect: 100,
    hintPenalty: 25,
    streakBonus3: 50,
    streakBonus5: 100
};


/* ============================================================
   GAME STATE
   ============================================================ */

let gameQuestions = [];
let currentQuestionIndex = 0;

let score = 0;
let streak = 0;
let bestStreak = 0;

let lives = GAME_CONFIG.startingLives;

let correctAnswers = 0;
let wrongAnswers = 0;

let hintsUsed = 0;

let timerInterval = null;
let timeLeft = GAME_CONFIG.timePerQuestion;

let questionAnswered = false;


/* ============================================================
   DOM ELEMENTS
   ============================================================ */

const startScreen =
    document.getElementById("startScreen");

const gameScreen =
    document.getElementById("gameScreen");

const gameOverScreen =
    document.getElementById("gameOverScreen");

const startButton =
    document.getElementById("startButton");

const restartButton =
    document.getElementById("restartButton");

const playAgainButton =
    document.getElementById("playAgainButton");

const homeButton =
    document.getElementById("homeButton");

const hintButton =
    document.getElementById("hintButton");

const nextButton =
    document.getElementById("nextButton");

const cancelRestart =
    document.getElementById("cancelRestart");

const confirmRestart =
    document.getElementById("confirmRestart");

const restartModal =
    document.getElementById("restartModal");


/* Stats */

const scoreElement =
    document.getElementById("score");

const streakElement =
    document.getElementById("streak");

const livesElement =
    document.getElementById("lives");

const hintsUsedElement =
    document.getElementById("hintsUsed");

const finalHintsUsedElement =
    document.getElementById("finalHintsUsed");


/* Progress */

const currentQuestionElement =
    document.getElementById("currentQuestion");

const totalQuestionsElement =
    document.getElementById("totalQuestions");

const categoryLabel =
    document.getElementById("categoryLabel");

const questionCategory =
    document.getElementById("questionCategory");

const progressFill =
    document.getElementById("progressFill");


/* Question */

const clueImages =
    document.getElementById("clueImages");

const optionsContainer =
    document.getElementById("optionsContainer");

const answerButtons =
    document.querySelectorAll(".answer-button");


/* Timer */

const timerCircle =
    document.getElementById("timerCircle");

const timerElement =
    document.getElementById("timer");


/* Hint */

const hintBox =
    document.getElementById("hintBox");

const hintText =
    document.getElementById("hintText");


/* Feedback */

const feedback =
    document.getElementById("feedback");

const feedbackIcon =
    document.getElementById("feedbackIcon");

const feedbackTitle =
    document.getElementById("feedbackTitle");

const feedbackText =
    document.getElementById("feedbackText");


/* Results */

const finalScore =
    document.getElementById("finalScore");

const correctAnswersElement =
    document.getElementById("correctAnswers");

const wrongAnswersElement =
    document.getElementById("wrongAnswers");

const bestStreakElement =
    document.getElementById("bestStreak");

const performanceFill =
    document.getElementById("performanceFill");

const performanceText =
    document.getElementById("performanceText");


/* Loading */

const loadingScreen =
    document.getElementById("loadingScreen");


/* Score popup */

const scorePopup =
    document.getElementById("scorePopup");


/* ============================================================
   SAFETY CHECK
   ============================================================ */

if (!Array.isArray(window.SONGS)) {
    console.error(
        "SONGS data was not found. Make sure songs.js is loaded before script.js."
    );
}


/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */

/**
 * Shuffle an array using Fisher-Yates.
 */
function shuffleArray(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const randomIndex =
            Math.floor(Math.random() * (i + 1));

        [result[i], result[randomIndex]] =
            [result[randomIndex], result[i]];
    }

    return result;
}


/**
 * Safely get an element's text.
 */
function setText(element, value) {
    if (element) {
        element.textContent = value;
    }
}


/**
 * Show an element.
 */
function showElement(element) {
    if (element) {
        element.classList.remove("hidden");
    }
}


/**
 * Hide an element.
 */
function hideElement(element) {
    if (element) {
        element.classList.add("hidden");
    }
}


/**
 * Show one screen and hide the others.
 */
function showScreen(screen) {
    [
        startScreen,
        gameScreen,
        gameOverScreen
    ].forEach((item) => {
        if (item) {
            item.classList.add("hidden");
        }
    });

    if (screen) {
        screen.classList.remove("hidden");
    }
}


/* ============================================================
   START GAME
   ============================================================ */

function startGame() {

    if (!Array.isArray(window.SONGS) ||
        window.SONGS.length === 0) {

        alert(
            "No songs were found. Please check songs.js."
        );

        return;
    }

    resetGameState();

    /*
     * Shuffle all 100 songs.
     * This means the order changes every game.
     */
    gameQuestions =
        shuffleArray(window.SONGS);

    setText(
        totalQuestionsElement,
        gameQuestions.length
    );

    showScreen(gameScreen);

    loadQuestion();
}


/* ============================================================
   RESET GAME
   ============================================================ */

function resetGameState() {

    stopTimer();

    currentQuestionIndex = 0;

    score = 0;
    streak = 0;
    bestStreak = 0;

    lives = GAME_CONFIG.startingLives;

    correctAnswers = 0;
    wrongAnswers = 0;

    hintsUsed = 0;

    timeLeft =
        GAME_CONFIG.timePerQuestion;

    questionAnswered = false;

    updateStats();

    resetFeedback();
}


/* ============================================================
   LOAD QUESTION
   ============================================================ */

function loadQuestion() {

    stopTimer();

    questionAnswered = false;

    if (
        currentQuestionIndex >=
        gameQuestions.length
    ) {
        endGame();
        return;
    }


    const song =
        gameQuestions[currentQuestionIndex];


    /* ----------------------------------------
       Progress
    ---------------------------------------- */

    const questionNumber =
        currentQuestionIndex + 1;

    const totalQuestions =
        gameQuestions.length;

    setText(
        currentQuestionElement,
        questionNumber
    );

    setText(
        totalQuestionsElement,
        totalQuestions
    );


    const progress =
        (questionNumber / totalQuestions) * 100;

    if (progressFill) {
        progressFill.style.width =
            `${progress}%`;
    }


    /* ----------------------------------------
       Category
    ---------------------------------------- */

    const category =
        song.category || "Song";

    setText(
        categoryLabel,
        getCategoryDisplay(category)
    );

    setText(
        questionCategory,
        getCategoryDisplay(category)
    );


    /* ----------------------------------------
       Reset question UI
    ---------------------------------------- */

    resetFeedback();

    hideElement(nextButton);

    hideElement(hintBox);

    if (hintButton) {
    hintButton.disabled = false;
    hintButton.classList.remove("used");
    hintButton.dataset.used = "false";
}


    /* ----------------------------------------
       Load clues
    ---------------------------------------- */

    renderClues(song);


    /* ----------------------------------------
       Load answers
    ---------------------------------------- */

    renderOptions(song);


    /* ----------------------------------------
       Start timer
    ---------------------------------------- */

    startTimer();
}


/* ============================================================
   CATEGORY DISPLAY
   ============================================================ */

function getCategoryDisplay(category) {

    const value =
        String(category).toLowerCase();

    if (value.includes("movie")) {
        return "🎬 Movie";
    }

    if (value.includes("private") ||
        value.includes("independent")) {

        return "🎤 Private";
    }

    if (value.includes("folk")) {
        return "🌾 Folk";
    }

    if (value.includes("trending")) {
        return "🔥 Trending";
    }

    return "🎵 Song";
}


/* ============================================================
   RENDER CLUES
   ============================================================ */

function renderClues(song) {

    if (!clueImages) {
        return;
    }

    clueImages.innerHTML = "";


    /*
     * Current songs.js uses:
     *
     * images: [
     *   "images/q001_1.jpg",
     *   "images/q001_2.jpg"
     * ]
     *
     * Older versions may use:
     *
     * clues: [
     *   { src: "...", alt: "..." }
     * ]
     *
     * This function supports both.
     */

    let clues = [];


    if (Array.isArray(song.images)) {

        clues =
            song.images.map((image, index) => ({
                src: image,
                alt:
                    `${song.answer || "Song"} clue ${index + 1}`
            }));

    } else if (Array.isArray(song.clues)) {

        clues =
            song.clues.map((clue, index) => {

                if (typeof clue === "string") {

                    return {
                        src: clue,
                        alt:
                            `${song.answer || "Song"} clue ${index + 1}`
                    };
                }

                return {
                    src: clue.src,
                    alt:
                        clue.alt ||
                        `${song.answer || "Song"} clue ${index + 1}`
                };
            });
    }


    /* Limit to 9 clues */
    clues =
        clues.slice(0, 9);


    clues.forEach((clue, index) => {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "clue-image";


        const image =
            document.createElement("img");

        image.src =
            clue.src;

        image.alt =
            clue.alt;


        /*
         * Broken image protection.
         */
        image.addEventListener(
            "error",
            () => {

                image.style.display = "none";

                wrapper.classList.add(
                    "image-error"
                );

                wrapper.textContent =
                    "🖼️";
            }
        );


        wrapper.appendChild(image);

        clueImages.appendChild(wrapper);


        /*
         * Add + sign between clues.
         */
        if (index < clues.length - 1) {

            const plus =
                document.createElement("span");

            plus.className =
                "plus-symbol";

            plus.textContent =
                "+";

            clueImages.appendChild(plus);
        }

    });
}


/* ============================================================
   RENDER ANSWER OPTIONS
   ============================================================ */

function renderOptions(song) {

    if (!optionsContainer) {
        return;
    }


    /*
     * Get options from songs.js.
     */
    let options =
        Array.isArray(song.options)
            ? [...song.options]
            : [];


    /*
     * Make sure the correct answer exists.
     */
    if (
        song.answer &&
        !options.includes(song.answer)
    ) {
        options[0] =
            song.answer;
    }


    /*
     * Shuffle answers every question.
     */
    options =
        shuffleArray(options);


    const buttons =
        optionsContainer.querySelectorAll(
            ".answer-button"
        );


    buttons.forEach(
        (button, index) => {

            const optionText =
                button.querySelector(
                    ".option-text"
                );

            const optionLetter =
                button.querySelector(
                    ".option-letter"
                );


            const option =
                options[index];


            if (option === undefined) {

                button.style.display =
                    "none";

                return;
            }


            button.style.display =
                "";


            button.disabled =
                false;


            button.classList.remove(
                "correct",
                "wrong",
                "disabled"
            );


            button.dataset.answer =
                option;


            button.dataset.optionIndex =
                index;


            setText(
                optionLetter,
                String.fromCharCode(
                    65 + index
                )
            );


            setText(
                optionText,
                option
            );


            /*
             * Remove old click handlers
             * by cloning the button.
             *
             * This prevents duplicate
             * listeners if the game
             * is restarted.
             */
        }
    );
}


/* ============================================================
   ANSWER HANDLING
   ============================================================ */

function handleAnswer(button) {

    if (questionAnswered) {
        return;
    }

    if (!button) {
        return;
    }


    const song =
        gameQuestions[currentQuestionIndex];


    if (!song) {
        return;
    }


    questionAnswered = true;

    stopTimer();


    const selectedAnswer =
        button.dataset.answer;


    const correctAnswer =
        song.answer;


    const isCorrect =
        selectedAnswer ===
        correctAnswer;


    /*
     * Disable every answer button.
     */
    const buttons =
        optionsContainer
            ? optionsContainer.querySelectorAll(
                ".answer-button"
            )
            : [];


    buttons.forEach(
        (item) => {
            item.disabled = true;
            item.classList.add("disabled");
        }
    );


    if (isCorrect) {

        handleCorrectAnswer(
            button,
            song
        );

    } else {

        handleWrongAnswer(
            button,
            song
        );
    }
}


/* ============================================================
   CORRECT ANSWER
   ============================================================ */

function handleCorrectAnswer(
    selectedButton,
    song
) {

    selectedButton.classList.remove(
        "disabled"
    );

    selectedButton.classList.add(
        "correct"
    );


    correctAnswers++;

    streak++;


    if (streak > bestStreak) {
        bestStreak = streak;
    }


    let points =
        GAME_CONFIG.pointsPerCorrect;


    /*
     * Streak bonuses.
     */
    if (streak >= 5) {

        points +=
            GAME_CONFIG.streakBonus5;

    } else if (streak >= 3) {

        points +=
            GAME_CONFIG.streakBonus3;
    }


    /*
     * Hint penalty.
     *
     * If the hint was already used for
     * this question, subtract the
     * configured amount.
     */
    if (
        hintButton &&
        hintButton.dataset.used === "true"
    ) {
        points -=
            GAME_CONFIG.hintPenalty;
    }


    points =
        Math.max(0, points);


    score += points;


    updateStats();


    showFeedback(
        true,
        `+${points} points`
    );


    showScorePopup(
        `+${points}`
    );


    revealCorrectAnswer(song);
}


/* ============================================================
   WRONG ANSWER
   ============================================================ */

function handleWrongAnswer(
    selectedButton,
    song
) {

    selectedButton.classList.remove(
        "disabled"
    );

    selectedButton.classList.add(
        "wrong"
    );


    wrongAnswers++;

    streak = 0;

    lives--;

    updateStats();


    showFeedback(
        false,
        `Correct answer: ${song.answer}`
    );


    revealCorrectAnswer(song);


    if (lives <= 0) {

        setTimeout(
            () => {
                endGame();
            },
            1200
        );

        return;
    }


    showElement(nextButton);
}


/* ============================================================
   REVEAL CORRECT ANSWER
   ============================================================ */

function revealCorrectAnswer(song) {

    const buttons =
        optionsContainer
            ? optionsContainer.querySelectorAll(
                ".answer-button"
            )
            : [];


    buttons.forEach(
        (button) => {

            if (
                button.dataset.answer ===
                song.answer
            ) {

                button.classList.remove(
                    "disabled"
                );

                button.classList.add(
                    "correct"
                );
            }
        }
    );
}


/* ============================================================
   TIME UP
   ============================================================ */

function handleTimeUp() {

    if (questionAnswered) {
        return;
    }


    const song =
        gameQuestions[currentQuestionIndex];


    if (!song) {
        return;
    }


    questionAnswered = true;

    stopTimer();


    wrongAnswers++;

    streak = 0;

    lives--;


    updateStats();


    /*
     * Disable buttons.
     */
    const buttons =
        optionsContainer
            ? optionsContainer.querySelectorAll(
                ".answer-button"
            )
            : [];


    buttons.forEach(
        (button) => {

            button.disabled = true;

            button.classList.add(
                "disabled"
            );
        }
    );


    revealCorrectAnswer(song);


    showFeedback(
        false,
        `Time's up! Correct answer: ${song.answer}`
    );


    if (lives <= 0) {

        setTimeout(
            () => {
                endGame();
            },
            1200
        );

        return;
    }


    showElement(nextButton);
}


/* ============================================================
   TIMER
   ============================================================ */

function startTimer() {

    stopTimer();


    timeLeft =
        GAME_CONFIG.timePerQuestion;


    updateTimer();


    timerInterval =
        setInterval(
            () => {

                timeLeft--;

                updateTimer();


                if (timeLeft <= 0) {

                    stopTimer();

                    handleTimeUp();
                }

            },
            1000
        );
}


/**
 * Stop timer safely.
 */
function stopTimer() {

    if (timerInterval !== null) {

        clearInterval(
            timerInterval
        );

        timerInterval = null;
    }
}


/**
 * Update timer display.
 */
function updateTimer() {

    setText(
        timerElement,
        timeLeft
    );


    if (!timerCircle) {
        return;
    }


    timerCircle.classList.remove(
        "warning",
        "danger"
    );


    if (timeLeft <= 5) {

        timerCircle.classList.add(
            "danger"
        );

    } else if (timeLeft <= 10) {

        timerCircle.classList.add(
            "warning"
        );
    }
}


/* ============================================================
   HINT SYSTEM
   ============================================================ */

function useHint() {

    if (questionAnswered) {
        return;
    }


    if (
        hintButton &&
        hintButton.dataset.used === "true"
    ) {
        return;
    }


    const song =
        gameQuestions[currentQuestionIndex];


    if (!song) {
        return;
    }


    const hint =
        getHintText(song);


    if (!hint) {

        showHint(
            "No hint is available for this song."
        );

        return;
    }


    hintsUsed++;


    if (hintButton) {

        hintButton.dataset.used =
            "true";

        hintButton.disabled =
            true;

        hintButton.classList.add(
            "used"
        );
    }


    showHint(hint);

    updateStats();
}


/**
 * Get hint text.
 *
 * Supports the current songs.js structure:
 *
 * hint: {
 *   type: "Movie",
 *   text: "..."
 * }
 *
 * Also supports older fields.
 */
function getHintText(song) {

    if (!song) {
        return "";
    }


    if (
        song.hint &&
        typeof song.hint === "object"
    ) {

        if (song.hint.text) {

            return formatHint(
                song.hint.type,
                song.hint.text
            );
        }
    }


    if (
        typeof song.hint ===
        "string"
    ) {

        return song.hint;
    }


    /*
     * Fallback support.
     */
    if (song.movie) {

        return formatHint(
            "Movie",
            song.movie
        );
    }


    if (song.actor) {

        return formatHint(
            "Actor",
            song.actor
        );
    }


    if (song.actress) {

        return formatHint(
            "Actress",
            song.actress
        );
    }


    return "";
}


/**
 * Format hint.
 */
function formatHint(type, text) {

    if (!text) {
        return "";
    }


    if (!type) {
        return text;
    }


    const cleanType =
        String(type)
            .charAt(0)
            .toUpperCase() +
        String(type)
            .slice(1);


    return `${cleanType}: ${text}`;
}


/**
 * Display hint.
 */
function showHint(text) {

    setText(
        hintText,
        text
    );

    showElement(hintBox);
}


/* ============================================================
   FEEDBACK
   ============================================================ */

function showFeedback(
    isCorrect,
    message
) {

    showElement(feedback);


    if (isCorrect) {

        setText(
            feedbackIcon,
            "✓"
        );

        setText(
            feedbackTitle,
            "Correct!"
        );

        feedback.classList.remove(
            "wrong"
        );

        feedback.classList.add(
            "correct"
        );

    } else {

        setText(
            feedbackIcon,
            "✕"
        );

        setText(
            feedbackTitle,
            "Not quite!"
        );

        feedback.classList.remove(
            "correct"
        );

        feedback.classList.add(
            "wrong"
        );
    }


    setText(
        feedbackText,
        message
    );


    showElement(nextButton);
}


/**
 * Reset feedback area.
 */
function resetFeedback() {

    hideElement(feedback);

    feedback?.classList.remove(
        "correct",
        "wrong"
    );


    setText(
        feedbackIcon,
        "✓"
    );

    setText(
        feedbackTitle,
        "Correct!"
    );

    setText(
        feedbackText,
        ""
    );
}


/* ============================================================
   STATS
   ============================================================ */

function updateStats() {

    setText(
        scoreElement,
        score
    );


    setText(
        streakElement,
        streak
    );


    setText(
        livesElement,
        getLivesDisplay()
    );


    setText(
        hintsUsedElement,
        hintsUsed
    );
}


/**
 * Create heart display.
 */
function getLivesDisplay() {

    const full =
        Math.max(0, lives);

    const empty =
        Math.max(
            0,
            GAME_CONFIG.startingLives - lives
        );


    return (
        "❤️".repeat(full) +
        "🖤".repeat(empty)
    );
}


/* ============================================================
   SCORE POPUP
   ============================================================ */

function showScorePopup(text) {

    if (!scorePopup) {
        return;
    }


    scorePopup.textContent =
        text;


    scorePopup.classList.remove(
        "show"
    );


    /*
     * Force browser reflow so the
     * animation can restart.
     */
    void scorePopup.offsetWidth;


    scorePopup.classList.add(
        "show"
    );


    setTimeout(
        () => {

            scorePopup.classList.remove(
                "show"
            );

        },
        1000
    );
}


/* ============================================================
   NEXT QUESTION
   ============================================================ */

function nextQuestion() {

    if (!questionAnswered) {
        return;
    }


    currentQuestionIndex++;


    if (
        currentQuestionIndex >=
        gameQuestions.length
    ) {

        endGame();

        return;
    }


    loadQuestion();
}


/* ============================================================
   END GAME
   ============================================================ */

function endGame() {

    stopTimer();


    /*
     * Final score.
     */
    setText(
        finalScore,
        score
    );


    /*
     * Final statistics.
     */
    setText(
        correctAnswersElement,
        correctAnswers
    );


    setText(
        wrongAnswersElement,
        wrongAnswers
    );


    setText(
        bestStreakElement,
        bestStreak
    );


    /*
     * IMPORTANT:
     * This uses the NEW result-screen ID:
     *
     * finalHintsUsed
     *
     * instead of the gameplay ID:
     *
     * hintsUsed
     */
    setText(
        finalHintsUsedElement,
        hintsUsed
    );


    /*
     * Calculate performance.
     */
    const totalAnswered =
        correctAnswers +
        wrongAnswers;


    let percentage = 0;


    if (totalAnswered > 0) {

        percentage =
            Math.round(
                (correctAnswers /
                    totalAnswered) *
                100
            );
    }


    if (performanceFill) {

        performanceFill.style.width =
            `${percentage}%`;
    }


    if (performanceText) {

        if (percentage >= 80) {

            performanceText.textContent =
                "Excellent! Keep going! 🔥";

        } else if (percentage >= 60) {

            performanceText.textContent =
                "Great job! 🎵";

        } else if (percentage >= 40) {

            performanceText.textContent =
                "Good effort! Keep practicing! 💪";

        } else {

            performanceText.textContent =
                "Keep playing and improve your score! 🎯";
        }
    }


    showScreen(gameOverScreen);
}


/* ============================================================
   RESTART MODAL
   ============================================================ */

function openRestartModal() {

    if (!restartModal) {
        return;
    }

    showElement(restartModal);
}


function closeRestartModal() {

    if (!restartModal) {
        return;
    }

    hideElement(restartModal);
}


/**
 * Actually restart the game.
 */
function confirmGameRestart() {

    closeRestartModal();

    startGame();
}


/* ============================================================
   HOME
   ============================================================ */

function goHome() {

    stopTimer();

    closeRestartModal();

    showScreen(startScreen);
}


/* ============================================================
   BUTTON EVENT LISTENERS
   ============================================================ */


/* Start */

if (startButton) {

    startButton.addEventListener(
        "click",
        startGame
    );
}


/* Restart */

if (restartButton) {

    restartButton.addEventListener(
        "click",
        openRestartModal
    );
}


/* Cancel restart */

if (cancelRestart) {

    cancelRestart.addEventListener(
        "click",
        closeRestartModal
    );
}


/* Confirm restart */

if (confirmRestart) {

    confirmRestart.addEventListener(
        "click",
        confirmGameRestart
    );
}


/* Play again */

if (playAgainButton) {

    playAgainButton.addEventListener(
        "click",
        startGame
    );
}


/* Home */

if (homeButton) {

    homeButton.addEventListener(
        "click",
        goHome
    );
}


/* Hint */

if (hintButton) {

    hintButton.addEventListener(
        "click",
        useHint
    );
}


/* Next */

if (nextButton) {

    nextButton.addEventListener(
        "click",
        nextQuestion
    );
}


/* Answer buttons */

if (optionsContainer) {

    optionsContainer.addEventListener(
        "click",
        (event) => {

            const button =
                event.target.closest(
                    ".answer-button"
                );


            if (!button) {
                return;
            }


            handleAnswer(button);
        }
    );
}


/* ============================================================
   MODAL BACKGROUND CLICK
   ============================================================ */

if (restartModal) {

    restartModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                restartModal
            ) {
                closeRestartModal();
            }
        }
    );
}


/* ============================================================
   ESCAPE KEY
   ============================================================ */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            restartModal &&
            !restartModal.classList.contains(
                "hidden"
            )
        ) {

            closeRestartModal();
        }
    }
);


/* ============================================================
   INITIAL UI STATE
   ============================================================ */

function initializeGame() {

    stopTimer();

    showScreen(startScreen);

    updateStats();

    setText(
        totalQuestionsElement,
        Array.isArray(window.SONGS)
            ? window.SONGS.length
            : 0
    );

    /*
     * Make sure the result hint counter
     * starts at zero.
     */
    setText(
        finalHintsUsedElement,
        0
    );

    hideElement(hintBox);

    hideElement(feedback);

    hideElement(nextButton);

    console.log(
        "Guess the Song initialized."
    );

    console.log(
        `Songs loaded: ${
            Array.isArray(window.SONGS)
                ? window.SONGS.length
                : 0
        }`
    );
}


/* ============================================================
   START INITIALIZATION
   ============================================================ */

initializeGame();