import { getFunction } from "./universalModule.js";


const quizFilterForm = document.getElementById('filter');
const startQuiz = document.getElementById('start-quiz');
const nextQ = document.getElementById('nextq');
const questionContainer = document.getElementById('q-container');
const singleQuestion = document.getElementById('question');
const answersList = document.getElementById('answers-list');
const checkRes = document.getElementById('check');
const results = document.getElementById('results');

let i = 0;
let allQuestions = [];
let selectedAnswers = new Set();
let correct = '';


// create endpoint according to user selection 
function createEndpoint() {
    let amount = document.getElementById('amount').value;
    console.log(amount);
    let category = document.getElementById('category').value;
    console.log(category);
    let difficulty = document.getElementById('difficulty').value;
    console.log(difficulty);

    if (amount.value == '' || amount.value <= 0 || amount.value > 50) {
        alert("Ensure you input a value between 1 and 50!")
    }

    if (category === 'any') {
        category = '';
    } else if (category === 'general') {
        category = '&category=9';
    } else if (category === 'geography') {
        category = '&category=22';
    } else if (category === 'history') {
        category = '&category=23';
    }

    if (difficulty === 'any') {
        difficulty = '';
    } else {
        difficulty = `&difficulty=${difficulty}`;
    }

    return `amount=${amount}${category}${difficulty}`

}

// add event listener to the form to get the data and generate the quiz

function beginGame() {
    questionContainer.className = "hidden";
    results.className = "hidden";

    quizFilterForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        let endpoint = createEndpoint();

        // function for fetching the data 
        const questions = await getFunction(endpoint);

        allQuestions = questions.results.map(({ category, difficulty, question: title, correct_answer, incorrect_answers }) => {
            let singleQ = {
                category,
                difficulty,
                title,
                correctAnswer: correct_answer,
                incorrectAnswers: incorrect_answers
            };
            return singleQ;
        });

        // set item to local storage 
        localStorage.setItem('questions-list', JSON.stringify(allQuestions));

        console.log(allQuestions);

        startQuiz.style.display = "";

    });


}

// function for starting the quiz 
startQuiz.addEventListener('click', (e) => {
    e.preventDefault();
    quizFilterForm.style.display = "none";
    startQuiz.style.display = "none";
    nextQ.style.display = "";

    displayQuestion(allQuestions);

    i++;
});

// function for changing the question 
nextQ.addEventListener('click', (e) => {
    e.preventDefault();

    checkIfSelected(allQuestions, displayQuestion, selectOption);

    if (i === allQuestions.length - 1) {
        nextQ.style.display = "none";
        checkRes.style.display = "";
    }
    i++;
});


// function for displaying the questions one by one 
function displayQuestion(allQuestions) {
    questionContainer.className = "questions-container";
    nextQ.className = "button nextq";

    singleQuestion.innerHTML = allQuestions[i].title;
    correct = allQuestions[i].correctAnswer;
    let incorrectAnswer = allQuestions[i].incorrectAnswers;
    let options = incorrectAnswer;
    options.splice(Math.floor(Math.random() * (incorrectAnswer.length + 1)), 0, correct);
    console.log(options);

    answersList.innerHTML = ""; // Clear previous answers

    options.map((option, index) => {
        const li = document.createElement('li');
        li.className = 'radio-btn';
        const label = document.createElement('label');
        label.className = 'answer';
        label.innerHTML = `<input class="radio" type="radio" name="answer" value="${index + 1}"> ${option}`;
        li.appendChild(label);
        answersList.appendChild(li);

    });

    selectOption();
}


// answers selection function
function selectOption() {
    answersList.querySelectorAll('li').forEach(function (radioBtn) {
        radioBtn.addEventListener('click', function () {

            selectedAnswers.add(radioBtn.textContent);

            // save answers to local storage 
            localStorage.setItem('answers', Array.from(selectedAnswers));

        })
    });
}

checkRes.addEventListener('click', (e) => {
    e.preventDefault();

    checkIfSelected('', checkResult, selectOption);

});

// check results function 
function checkResult() {

    let count = 0;
    let rightAns = 0;

    // get data from localStorage 
    let correct = JSON.parse(localStorage.getItem('questions-list')).map(q => {
        return q.correctAnswer;
    });
    let answered = localStorage.getItem('answers');

    // compare data 
    correct.forEach(a => {
        count++;
        if (answered.includes(a)) {
            rightAns++;
        }
    })

    // display results 
    displayResult(rightAns, count);
}

// display results function
function displayResult(rightAns, count) {
    questionContainer.style.display = "none";
    results.className = "results";

    const p = document.createElement('p');
    p.className = ('result');
    p.textContent = `Your score is ${rightAns} correct answer/s out of ${count} questions!`;

    const div = document.createElement('div');
    div.className = ('result-buttons');

    const newGameBtn = document.createElement('button')
    newGameBtn.className = ('new-game button');
    newGameBtn.id = 'new-game';
    newGameBtn.textContent = "New Game!";

    const downloadBtn = document.createElement('button')
    downloadBtn.className = ('download button');
    downloadBtn.id = 'download';
    downloadBtn.textContent = "Download Results";


    div.appendChild(newGameBtn);
    div.appendChild(downloadBtn);
    results.appendChild(p);
    results.appendChild(div);

    downloadZipFile(downloadBtn, rightAns, count);

    // reset game
    resetQuiz(newGameBtn);
}

// function for download of the result in txt file
function downloadZipFile(downloadBtn, rightAns, count) {
    const worker = new Worker("./worker.js", { type: "module" });
    downloadBtn.addEventListener('click', () => {

        worker.onmessage = (e) => {
            const blob = e.data;
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "QuizResult.zip";
            link.click();
        }
        worker.postMessage({ rightAns, count });

    })

}

// function for reseting the game 
function resetQuiz(newGame) {
    newGame.addEventListener('click', (e) => {
        i = 0;
        selectedAnswers = new Set();
        quizFilterForm.style.display = '';
        singleQuestion.textContent = '';
        answersList.innerHTML = '';
        questionContainer.style.display = "";
        checkRes.style.display = 'none';
        results.innerHTML = '';
        localStorage.removeItem('answers');

        questionContainer.className = "hidden";
        results.className = "hidden";
    })
};



function checkIfSelected(variable, func1, func2) {
    let checked = document.querySelector('input[name = "answer"]:checked');

    if (checked != null) {  //Test if something was checked

        const alert = document.getElementById('alert');

        if (alert != null) {
            alert.remove();
        }

        func1(variable);
    } else {
        const p = document.createElement('p');
        p.id = ('alert');
        p.textContent = `Please select an Answer!`;
        questionContainer.appendChild(p);
        i--;
        func2();
    }
}


beginGame();