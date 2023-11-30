import { getFunction } from "./universalModule.js";


// get the user selection 
const quizFilterForm = document.getElementById('filter');
const startQuiz = document.getElementById('start-quiz');

const singleQuestion = document.getElementById('question');
const answersList = document.getElementById('answers-list');
const checkAnswer = document.getElementById('check');
const newGame = document.getElementById('new-game');


let allQuestions = [];
let correct = '';
let incorrect = '';

// create endpoint according to user selection 
const createEndpoint = () => {
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

quizFilterForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    let endpoint = createEndpoint();

// function for fetching the data 
    const questions = await getFunction(endpoint);

    allQuestions = questions.results.map(({category, question: title, correct_answer, incorrect_answer}) => {
        let singleQ = {
            category,
            title,
            correctAnswer: correct_answer,
            incorrectAnswers: incorrect_answers
        };
        return singleQ;
    });

// set item to local storage 
    localStorage.setItem('questions-list', JSON.stringify(allQuestions));

    console.log(allQuestions);

    startQuiz.textContent = 'Start the Quiz!'
    startQuiz.disabled = false;

});

// function for starting the quiz 
let i = 0;
startQuiz.addEventListener('click', () => {
    displayQuestion(allQuestions);
    
    if (i === allQuestions.length - 1) {
        startQuiz.disabled = true;
        checkAnswer.disabled = true;
        newGame.disabled = false;

        newGame.addEventListener('click', () =>{
            singleQuestion.textContent = '';
            answersList.innerHTML = '';
            localStorage.clear();
        })
    }

    if (i >= 0) {
        startQuiz.textContent = 'Next Question'
        checkAnswer.disabled = false;
    }
    i++;

});


// function for displaying the questions one by one 
function displayQuestion(allQuestions) {
    singleQuestion.innerHTML = allQuestions[i].title;
    correct = allQuestions[i].correctAnswer;
    let incorrectAnswer = allQuestions[i].incorrectAnswers;
    let options = incorrectAnswer;
    options.splice(Math.floor(Math.random() * (incorrectAnswer.length + 1)), 0, correct);
    console.log(options);

    answersList.innerHTML = ""; // Clear previous answers

    options.map((option, index) => {
        const li = document.createElement('li');
        const label = document.createElement('label');
        label.className = 'answer';
        label.innerHTML = `<input type="radio" name="answer" value="${index + 1}"> ${option}`;
        li.appendChild(label);
        answersList.appendChild(li);

    });

    // selectOption(allQuestions[i]);
}


// options selection
// function selectOption(currentQustion) {
//     const selectedAnswer = document.querySelector('input[name="answer"]:checked');

//     console.log(selectedAnswer.textContent);
//     console.log(currentQustion.correct_answer);
    
//     if (selectedAnswer.textContent === currentQustion.correct_answer) {
        
//     }

// }



// TODO write function to save the list of questions to the localStorage

// // get item from local storage 
// let newObject = localStorage.getItem("questions-list");
// console.log(JSON.parse(newObject));