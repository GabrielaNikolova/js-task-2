import { getFunction } from "./universalModule.js";

const quizFilterForm = document.getElementById("filter");
const startQuiz = document.getElementById("start-quiz");
const nextQ = document.getElementById("nextq");
const questionContainer = document.getElementById("q-container");
const singleQuestion = document.getElementById("question");
const answersList = document.getElementById("answers-list");
const checkRes = document.getElementById("check");
const results = document.getElementById("results");

let i = 0;
let allQuestions = [];
let selectedAnswers = [];
let correct = "";

// create endpoint according to user selection
function createEndpoint() {
    let amount = document.getElementById("amount").value;
    console.log(amount);
    let category = document.getElementById("category").value;
    console.log(category);
    let difficulty = document.getElementById("difficulty").value;
    console.log(difficulty);

    if (amount.value == "" || amount.value <= 0 || amount.value > 50) {
        alert("Ensure you input a value between 1 and 50!");
    }

    if (category === "any") {
        category = "";
    } else if (category === "general") {
        category = "&category=9";
    } else if (category === "geography") {
        category = "&category=22";
    } else if (category === "history") {
        category = "&category=23";
    }

    if (difficulty === "any") {
        difficulty = "";
    } else {
        difficulty = `&difficulty=${difficulty}`;
    }

    return `amount=${amount}${category}${difficulty}`;
}

// add event listener to the form to get the data and generate the quiz
function generateQuiz() {
    questionContainer.className = "hidden";
    results.className = "hidden";

    quizFilterForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        let endpoint = createEndpoint();

        // function for fetching the data
        const questions = await getFunction(endpoint);

        allQuestions = questions.results.map(
            ({
                category,
                difficulty,
                question: title,
                correct_answer,
                incorrect_answers,
            }) => {
                let singleQ = {
                    category,
                    difficulty,
                    title,
                    correctAnswer: correct_answer,
                    incorrectAnswers: incorrect_answers,
                };
                return singleQ;
            }
        );

        // set item to local storage
        localStorage.setItem("questions-list", JSON.stringify(allQuestions));

        console.log(allQuestions);

        startQuiz.style.display = "";
    });
}

// function for starting the quiz
startQuiz.addEventListener("click", (e) => {
    e.preventDefault();
    quizFilterForm.style.display = "none";
    startQuiz.style.display = "none";
    nextQ.style.display = "";

    displayQuestion(allQuestions);

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
    options.splice(
        Math.floor(Math.random() * (incorrectAnswer.length + 1)),
        0,
        correct
    );
    console.log(options);

    answersList.innerHTML = ""; // Clear previous answers

    options.map((option, index) => {
        const li = document.createElement("li");
        li.className = "radio-btn";
        const label = document.createElement("label");
        label.className = "answer";
        label.innerHTML = `<input class="radio" type="radio" name="answer" value="${index + 1
            }"> ${option}`;
        li.appendChild(label);
        answersList.appendChild(li);
    });
}

// function for changing the question
nextQ.addEventListener("click", (e) => {
    e.preventDefault();

    checkIfSelected(allQuestions, displayQuestion);

    if (i === allQuestions.length - 1) {
        nextQ.style.display = "none";
        checkRes.style.display = "";
    }
    i++;
});

checkRes.addEventListener("click", (e) => {
    e.preventDefault();

    checkIfSelected("", checkResult);
});

//function for checking if there is a selected answer
function checkIfSelected(variable, func1, func2) {
    let checked = document.querySelector('input[name = "answer"]:checked');

    if (checked != null) {
        //Test if something was checked

        const alert = document.getElementById("alert");

        if (alert != null) {
            alert.remove();
        }

        //save answers to localStorage
        selectedAnswers.push(checked.parentNode.textContent.trim());
        localStorage.setItem("answers", JSON.stringify(Array.from(selectedAnswers)));

        func1(variable);
    } else {
        const p = document.createElement("p");
        p.id = "alert";
        p.textContent = `Please select an Answer!`;
        questionContainer.appendChild(p);
        i--;
    }
}

// check results function
function checkResult() {
    let count = 0;
    let rightAns = 0;

    // get data from localStorage
    let correct = JSON.parse(localStorage.getItem("questions-list")).map((q) => {
        let question = {
            title: HTMLDecode(q.title),
            correctAnswer: HTMLDecode(q.correctAnswer)
        }
        return question;
    });
    let answered = JSON.parse(localStorage.getItem("answers"));

    // compare data
    correct.forEach((a) => {
        count++;
        if (answered.includes(a.correctAnswer)) {
            rightAns++;
        }
    });

    // display results
    displayResults(rightAns, count, correct, answered);
}

// display results function
function displayResults(rightAns, count, correct, answered) {
    questionContainer.style.display = "none";
    results.className = "results";

    const div = document.createElement("div");
    div.className = "result-buttons";

    const newGameBtn = document.createElement("button");
    newGameBtn.className = "new-game button";
    newGameBtn.id = "new-game";
    newGameBtn.textContent = "New Game!";

    const downloadBtn = document.createElement("button");
    downloadBtn.className = "download button";
    downloadBtn.id = "download";
    downloadBtn.textContent = "Download Results";


    const text = correct.map((el, index) => {
        let i = index;
        return `- ${el.title}<br>Correct answer: ${el.correctAnswer}<br>Your answer: ${answered[i]}<br><br>`;

    });

    const p = document.createElement("p");
    p.className = "result";
    p.innerHTML = `Your score is ${rightAns} correct answer/s out of ${count} questions!<br><br>${text.join('')}`;


    div.appendChild(newGameBtn);
    div.appendChild(downloadBtn);
    results.appendChild(div);
    results.appendChild(p);

    //download results feedback
    downloadZipFile(downloadBtn, rightAns, count, correct);

    // reset game
    resetQuiz(newGameBtn);
}

// function for download of the result in txt file
function downloadZipFile(downloadBtn, rightAns, count, correct) {
    const worker = new Worker("./worker.js", { type: "module" });
    downloadBtn.addEventListener("click", () => {
        worker.onmessage = (e) => {
            const blob = e.data;
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "QuizResult.zip";
            link.click();
        };


        const text = correct.map((el, index) => {
            let i = index;
            return `- ${el.title}\nCorrect answer: ${el.correctAnswer}\nYour answer: ${answered[i]}\n\n`;

        });

        worker.postMessage({ rightAns, count, text });
    });
}

// function for reseting the game
function resetQuiz(newGame) {
    newGame.addEventListener("click", (e) => {
        i = 0;
        selectedAnswers = [];
        quizFilterForm.style.display = "";
        singleQuestion.textContent = "";
        answersList.innerHTML = "";
        questionContainer.style.display = "";
        checkRes.style.display = "none";
        results.innerHTML = "";
        localStorage.removeItem("answers");

        questionContainer.className = "hidden";
        results.className = "hidden";
    });
}

// to convert html entities into normal text
function HTMLDecode(textString) {
    let doc = new DOMParser().parseFromString(textString, "text/html");
    return doc.documentElement.textContent;
}

generateQuiz();

// //function to get data from second API
// async function time(){
//    const response = await fetch("http://worldtimeapi.org/api/ip");
//     const data1 = await response.json();

//     console.log(data1.datetime);
//     let header = document.querySelector("header");

//     const time = document.createElement("div");
//     time.className = ("localTime");
//     time.textContent = `Current Local Time: ${data1.datetime}`;
//     header.appendChild(time);
// }
// time();
