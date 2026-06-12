let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = []; 
let timerInterval = null;
let timeElapsed = 0; // Секундомір рахує з 0 вперед

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

function showMainMenu() {
    switchScreen('main-menu');
}

// Початок випадкового тесту
function startRandomQuiz() {
    let shuffled = [...mainQuestionsDB].sort(() => 0.5 - Math.random());
    currentQuestions = shuffled.slice(0, 20);
    currentQuestionIndex = 0;
    userAnswers = new Array(currentQuestions.length).fill(null);
    
    switchScreen('quiz-screen');
    startTimer();
    renderNavNumbers();
    renderQuestion();
}

// Генерація номерів питань вгорі
function renderNavNumbers() {
    const navContainer = document.getElementById('questions-nav');
    navContainer.innerHTML = '';

    currentQuestions.forEach((_, index) => {
        const btn = document.createElement('button');
        btn.className = 'nav-num-btn';
        btn.innerText = index + 1;

        if (index === currentQuestionIndex) {
            btn.classList.add('active');
        }

        if (userAnswers[index] === true) {
            btn.classList.add('correct-nav');
        } else if (userAnswers[index] === false) {
            btn.classList.add('wrong-nav');
        }

        btn.onclick = () => {
            currentQuestionIndex = index;
            renderQuestion();
        };

        navContainer.appendChild(btn);
    });
}

// Відображення тексту, картинок та кнопок питання
function renderQuestion() {
    renderNavNumbers();
    document.getElementById('next-btn').classList.add('hidden'); // ховаємо Продовжити

    const q = currentQuestions[currentQuestionIndex];
    document.getElementById('question-counter').innerText = `Питання ${currentQuestionIndex + 1} з ${currentQuestions.length}`;
    document.getElementById('question-text').innerText = q.question;
    
    // === ЛОГІКА ДЛЯ КАРТИНКИ ===
    const imgElement = document.getElementById('question-image');
    if (q.image) {
        imgElement.src = q.image;             // Встановлюємо шлях до картинки
        imgElement.classList.remove('hidden'); // Показуємо картинку
    } else {
        imgElement.src = '';                  // Очищуємо старий шлях
        imgElement.classList.add('hidden');    // Ховаємо, якщо в питанні немає картинки
    }
    // ===========================

    const container = document.getElementById('options-container');
    container.innerHTML = '';

    q.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = option;
        btn.style.marginBottom = "10px";

        if (userAnswers[currentQuestionIndex] !== null) {
            btn.classList.add('disabled');
            if (index === q.correctAnswer) {
                btn.classList.add('correct');
            }
        } else {
            btn.onclick = () => checkAnswer(index, btn);
        }
        
        container.appendChild(btn);
    });
}

// Перевірка натиснутої відповіді
function checkAnswer(selectedIndex, clickedButton) {
    const q = currentQuestions[currentQuestionIndex];
    const container = document.getElementById('options-container');
    const allButtons = container.querySelectorAll('.option-btn');

    allButtons.forEach(btn => btn.classList.add('disabled'));

    if (selectedIndex === q.correctAnswer) {
        // Якщо ПРАВИЛЬНО: автоматичний перехід через 1.5 секунди
        clickedButton.classList.add('correct');
        userAnswers[currentQuestionIndex] = true;
        
        setTimeout(() => {
            advanceQuiz();
        }, 1500);
    } else {
        // Якщо НЕПРАВИЛЬНО: підсвічуємо помилку, правильну відповідь і показуємо кнопку Продовжити
        clickedButton.classList.add('wrong');
        allButtons[q.correctAnswer].classList.add('correct');
        userAnswers[currentQuestionIndex] = false;
        
        document.getElementById('next-btn').classList.remove('hidden');
    }

    renderNavNumbers();
}

function goToNextQuestion() {
    document.getElementById('next-btn').classList.add('hidden');
    advanceQuiz();
}

function advanceQuiz() {
    if (currentQuestionIndex + 1 >= currentQuestions.length) {
        finishQuiz();
    } else {
        currentQuestionIndex++;
        renderQuestion();
    }
}

/* ================= ЛОГІКА СЕКУНДОМІРА ================= */
function startTimer() {
    clearInterval(timerInterval);
    timeElapsed = 0;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeElapsed++;
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    document.getElementById('timer').innerText = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function stopQuiz() {
    clearInterval(timerInterval);
    showMainMenu();
}

/* ================= ЕКРАН РЕЗУЛЬТАТІВ ================= */
function finishQuiz() {
    clearInterval(timerInterval);
    
    const correctCount = userAnswers.filter(ans => ans === true).length;
    const wrongCount = userAnswers.filter(ans => ans === false).length;
    const unansweredCount = userAnswers.filter(ans => ans === null).length;

    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    const finalTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Заповнюємо дані на екрані результатів
    document.getElementById('res-correct').innerText = correctCount;
    document.getElementById('res-wrong').innerText = wrongCount;
    document.getElementById('res-unanswered').innerText = unansweredCount;
    document.getElementById('res-time').innerText = finalTime;

    // Перемикаємо екран
    switchScreen('results-screen');
}

// Режим категорій
function showCategories() {
    switchScreen('categories-screen');
    const list = document.getElementById('categories-list');
    list.innerHTML = '';
    const categories = [...new Set(mainQuestionsDB.map(q => q.category))];
    
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'menu-btn';
        btn.style.marginBottom = "10px";
        btn.innerText = cat;
        btn.onclick = () => startCategoryQuiz(cat);
        list.appendChild(btn);
    });
}

function startCategoryQuiz(categoryName) {
    currentQuestions = mainQuestionsDB.filter(q => q.category === categoryName);
    currentQuestionIndex = 0;
    userAnswers = new Array(currentQuestions.length).fill(null);
    switchScreen('quiz-screen');
    startTimer();
    renderNavNumbers();
    renderQuestion();
}