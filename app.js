import { getFunction } from "./universalModule.js";


// get the user selection 

const quizFilterForm = document.getElementById('filter');

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

// add event listener to the form to get the data 

quizFilterForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    let endpoint = createEndpoint();


    // function for fetching the data 
    const questions = await getFunction(endpoint);
    console.log(questions);


    // function for mapping the result to the html 
    let allQuestions = questions.results.map(question => {
        let singleQuestion = {
            category: question.category,
            title: question.question,
            answerList: [
                question.correct_answer,
                question.incorrect_answers[0],
                question.incorrect_answers[1],
                question.incorrect_answers[2]
            ]
        };
        return singleQuestion;
    });

    // TODO write function to save the list of questions to the localStorage 

    console.log(allQuestions);

    // let questionCard = document.getElementsByClassName('question-card');
    // let title = document.getElementsByClassName('question');
    // let answerList = document.getElementsByClassName('answer-list');


})