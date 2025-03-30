class Quiz {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.skipsRemaining = 3;
        this.timePerQuestion = 30;
        this.timeLeft = this.timePerQuestion;
        this.timerInterval = null;
        this.skippedQuestions = [];
        this.userAnswers = new Array(10).fill(null);

        // Initialize DOM elements
        this.initializeElements();
        // Set up event listeners
        this.setupEventListeners();
    }

    initializeElements() {
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
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startQuiz());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.skipBtn.addEventListener('click', () => this.skipQuestion());
        this.restartBtn.addEventListener('click', () => this.restartQuiz());
    }

    async loadQuestions() {
        try {
            const response = await fetch('questions.json');
            if (!response.ok) throw new Error('Failed to load questions');
            this.questions = await response.json();
            if (!this.questions || this.questions.length === 0) {
                throw new Error('No questions found');
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            this.questions = this.getFallbackQuestions();
        }
    }

    getFallbackQuestions() {
        return [
            {
                question: "What is the correct syntax to declare a variable in Java?",
                options: ["variable x;", "var x;", "int x;", "x = 0;"],
                answer: "int x;"
            },
            {
                question: "Which keyword is used for inheritance in Java?",
                options: ["extends", "implements", "inherits", "uses"],
                answer: "extends"
            },
            {
                question: "What is the default value of a boolean variable in Java?",
                options: ["true", "false", "null", "0"],
                answer: "false"
            },
            {
                question: "Which of the following is not a Java keyword?",
                options: ["class", "interface", "string", "extends"],
                answer: "string"
            },
            {
                question: "What is the output of System.out.println(10 + 20 + '30');?",
                options: ["1030", "330", "30", "Error"],
                answer: "1030"
            },
            {
                question: "Which of the following is a valid declaration of a char?",
                options: ["char c = 'a';", "char c = 'ab';", "char c = \"a\";", "char c = a;"],
                answer: "char c = 'a';"
            },
            {
                question: "What is the size of an int variable in Java?",
                options: ["16 bits", "32 bits", "64 bits", "8 bits"],
                answer: "32 bits"
            },
            {
                question: "Which of the following is a valid way to create an array in Java?",
                options: ["int arr[] = new int[5];", "int arr = new int[5];", "int arr[] = new int();", "int arr = new int;"],
                answer: "int arr[] = new int[5];"
            },
            {
                question: "What is the purpose of the 'final' keyword in Java?",
                options: ["To declare a constant", "To declare a method that cannot be overridden", "To declare a class that cannot be inherited", "All of the above"],
                answer: "All of the above"
            },
            {
                question: "Which of the following is used to handle exceptions in Java?",
                options: ["try-catch", "throw", "throws", "All of the above"],
                answer: "All of the above"
            }
        ];
    }

    async startQuiz() {
        try {
            this.landingPage.classList.add('hidden');
            this.quizContainer.classList.remove('hidden');
            await this.loadQuestions();
            this.displayQuestion();
            this.startTimer();
        } catch (error) {
            console.error('Error starting quiz:', error);
            alert('Failed to start quiz. Please try again.');
        }
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
        const options = document.querySelectorAll('.option');
        options.forEach(option => option.classList.remove('selected'));
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
        this.timerProgress.style.background = `conic-gradient(var(--primary) ${progress}%, #e2e8f0 0%)`;
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

        // Display correct answers
        const answersList = document.getElementById('answers-list');
        answersList.innerHTML = '<div class="correct-answers-heading"><h3>Correct Answers</h3></div>';

        this.questions.forEach((question, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            const questionElement = document.createElement('div');
            questionElement.className = 'question';
            questionElement.textContent = `${index + 1}. ${question.question}`;
            resultItem.appendChild(questionElement);
            
            const answerElement = document.createElement('div');
            answerElement.className = 'answer';
            
            if (this.skippedQuestions.includes(index)) {
                answerElement.innerHTML = `
                    <span class="correct-answer">Correct: ${question.answer}</span><br>
                    <span class="skipped-answer">Skipped</span>
                `;
                answerElement.style.color = 'var(--secondary)';
            } else {
                if (this.userAnswers[index] === question.answer) {
                    answerElement.innerHTML = `
                        <span class="correct-answer">Correct: ${question.answer}</span>
                    `;
                    answerElement.style.color = 'var(--success)';
                } else {
                    answerElement.innerHTML = `
                        <span class="correct-answer">Correct: ${question.answer}</span><br>
                        <span class="user-answer">Your answer: ${this.userAnswers[index] || 'Unanswered'}</span>
                    `;
                    answerElement.style.color = 'var(--danger)';
                }
            }
            
            resultItem.appendChild(answerElement);
            answersList.appendChild(resultItem);
        });
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
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new Quiz();
});
