class Quiz {
    constructor() {
        console.log('Creating new Quiz instance');
        this.questions = [];
        console.log('DOM elements:', {
            landingPage: document.getElementById('landing'),
            quizContainer: document.getElementById('quiz'),
            startBtn: document.getElementById('start-btn')
        });
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.skipsRemaining = 3;
        this.timePerQuestion = 30;
        this.timeLeft = this.timePerQuestion;
        this.timerInterval = null;
        this.skippedQuestions = [];
        this.userAnswers = new Array(10).fill(null);

        // DOM Elements
        this.landingPage = document.getElementById('landing');
        this.quizContainer = document.getElementById('quiz');
        this.resultsContainer = document.getElementById('results');
        this.startBtn = document.getElementById('start-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.skipBtn = document.getElementById('skip-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.questionText = document.getElementById('question-text');
        this.optionsContainer = document.getElementById('options-container');
        this.timerDisplay = document.getElementById('timer');
        this.timerProgress = document.getElementById('timer-progress');
        this.skipsRemainingDisplay = document.getElementById('skips-remaining');
        this.currentQDisplay = document.getElementById('current-q');
        this.finalScoreDisplay = document.getElementById('final-score');
        this.correctAnswersDisplay = document.getElementById('correct-answers');
        this.wrongAnswersDisplay = document.getElementById('wrong-answers');
        this.skippedQuestionsDisplay = document.getElementById('skipped-questions');

        // Event Listeners
        this.startBtn.addEventListener('click', () => this.startQuiz());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.skipBtn.addEventListener('click', () => this.skipQuestion());
        this.restartBtn.addEventListener('click', () => this.restartQuiz());
    }

    async loadQuestions() {
        try {
            const response = await fetch('questions.json');
            this.questions = await response.json();
        } catch (error) {
            console.error('Error loading questions:', error);
            // Fallback questions if JSON fails to load
            this.questions = [
                {
                    question: "What is the correct syntax to declare a variable in Java?",
                    options: ["variable x;", "var x;", "int x;", "x = 0;"],
                    answer: "int x;"
                },
                {
                    question: "Which keyword is used for inheritance in Java?",
                    options: ["extends", "implements", "inherits", "uses"],
                    answer: "extends"
                }
            ];
        }
    }

    startQuiz() {
        this.landingPage.classList.add('hidden');
        this.quizContainer.classList.remove('hidden');
        this.loadQuestions().then(() => {
            this.displayQuestion();
            this.startTimer();
        });
    }

    displayQuestion() {
        const currentQuestion = this.questions[this.currentQuestionIndex];
        this.currentQDisplay.textContent = this.currentQuestionIndex + 1;
        this.questionText.textContent = currentQuestion.question;
        this.optionsContainer.innerHTML = '';

        currentQuestion.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.classList.add('option');
            optionElement.textContent = option;
            optionElement.addEventListener('click', () => this.selectOption(option, index));
            this.optionsContainer.appendChild(optionElement);
        });

        this.nextBtn.disabled = true;
    }

    selectOption(selectedOption, optionIndex) {
        // Clear previous selection
        const options = document.querySelectorAll('.option');
        options.forEach(option => option.classList.remove('selected'));

        // Mark selected option
        options[optionIndex].classList.add('selected');
        this.userAnswers[this.currentQuestionIndex] = selectedOption;
        this.nextBtn.disabled = false;
    }

    startTimer() {
        this.timeLeft = this.timePerQuestion;
        this.updateTimerDisplay();

        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.handleTimeOut();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        this.timerDisplay.textContent = this.timeLeft;
        const progress = (this.timeLeft / this.timePerQuestion) * 100;
        this.timerProgress.style.width = `${progress}%`;
    }

    handleTimeOut() {
        this.nextBtn.disabled = false;
        this.nextQuestion();
    }

    nextQuestion() {
        clearInterval(this.timerInterval);
        this.checkAnswer();

        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
            this.startTimer();
        } else {
            this.showResults();
        }
    }

    checkAnswer() {
        const currentQuestion = this.questions[this.currentQuestionIndex];
        const selectedOption = this.userAnswers[this.currentQuestionIndex];
        const options = document.querySelectorAll('.option');

        if (selectedOption === currentQuestion.answer) {
            this.score += 10;
        }
    }

    skipQuestion() {
        if (this.skipsRemaining > 0) {
            this.skippedQuestions.push(this.currentQuestionIndex);
            this.skipsRemaining--;
            this.skipsRemainingDisplay.textContent = this.skipsRemaining;
            this.nextQuestion();
        }

        if (this.skipsRemaining === 0) {
            this.skipBtn.disabled = true;
        }
    }

    showResults() {
        clearInterval(this.timerInterval);
        this.quizContainer.classList.add('hidden');
        this.resultsContainer.classList.remove('hidden');

        const correctCount = this.questions.reduce((count, question, index) => {
            return count + (this.userAnswers[index] === question.answer ? 1 : 0);
        }, 0);

        const wrongCount = this.questions.length - correctCount - this.skippedQuestions.length;

        this.finalScoreDisplay.textContent = this.score;
        this.correctAnswersDisplay.textContent = correctCount;
        this.wrongAnswersDisplay.textContent = wrongCount;
        this.skippedQuestionsDisplay.textContent = this.skippedQuestions.length;

        // Add correct answers list
        const answersList = document.createElement('div');
        answersList.className = 'answers-list';
        answersList.innerHTML = '<h3>Correct Answers:</h3><ol></ol>';
        
        const ol = answersList.querySelector('ol');
        this.questions.forEach((q, i) => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>Q${i+1}:</strong> ${q.question}<br><strong>Answer:</strong> ${q.answer}`;
            if (this.userAnswers[i] !== q.answer && this.userAnswers[i] !== null) {
                li.innerHTML += `<br><strong>Your answer:</strong> ${this.userAnswers[i]}`;
            }
            ol.appendChild(li);
        });

        this.resultsContainer.appendChild(answersList);
    }

    restartQuiz() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.skipsRemaining = 3;
        this.timeLeft = this.timePerQuestion;
        this.skippedQuestions = [];
        this.userAnswers = new Array(10).fill(null);

        this.resultsContainer.classList.add('hidden');
        this.quizContainer.classList.remove('hidden');
        this.skipBtn.disabled = false;
        this.skipsRemainingDisplay.textContent = this.skipsRemaining;

        this.displayQuestion();
        this.startTimer();
    }
}

// Initialize the quiz when the page loads
window.addEventListener('load', () => {
    console.log('Initializing quiz...');
    try {
        const quiz = new Quiz();
        console.log('Quiz initialized successfully');
    } catch (error) {
        console.error('Quiz initialization failed:', error);
        alert('Failed to initialize quiz. Please check console for details.');
    }
});
