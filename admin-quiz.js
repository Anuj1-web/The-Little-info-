import { db } from './firebase.js';

const form = document.getElementById('quizForm');
const questionsArea = document.getElementById('questionsArea');
const addQuestionBtn = document.getElementById('addQuestion');

let questionCount = 0;

addQuestionBtn.addEventListener('click', () => {
  const div = document.createElement('div');
  div.innerHTML = `
    <input type="text" placeholder="Question" class="question" required /><br/>
    <input type="text" placeholder="Option 1" class="opt" required />
    <input type="text" placeholder="Option 2" class="opt" required />
    <input type="text" placeholder="Option 3" class="opt" required />
    <input type="text" placeholder="Option 4" class="opt" required /><br/>
    <input type="number" min="0" max="3" placeholder="Correct Option Index (0-3)" class="correct" required /><br/><br/>
  `;
  questionsArea.appendChild(div);
  questionCount++;
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('quizTitle').value.trim();
  const questionDivs = questionsArea.querySelectorAll('div');
  const questions = [];

  questionDivs.forEach(div => {
    const question = div.querySelector('.question').value;
    const options = Array.from(div.querySelectorAll('.opt')).map(input => input.value);
    const correctIndex = parseInt(div.querySelector('.correct').value);
    questions.push({ question, options, correctIndex });
  });

  db.collection("quizzes").add({ title, questions })
    .then(() => {
      alert("Quiz saved successfully!");
      form.reset();
      questionsArea.innerHTML = '';
    })
    .catch(error => {
      console.error("Error saving quiz:", error);
      alert("Failed to save quiz.");
    });
});

