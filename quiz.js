import { db } from './firebase.js';

const quizList = document.getElementById('quizList');
const quizContainer = document.getElementById('quizContainer');
const questionsContainer = document.getElementById('questionsContainer');
const quizTitle = document.getElementById('quizTitle');
const quizResult = document.getElementById('quizResult');

let currentQuiz = null;

function loadQuizzes() {
  db.collection("quizzes").get().then(snapshot => {
    quizList.innerHTML = "<h2>Select a Quiz</h2>";
    snapshot.forEach(doc => {
      const quiz = doc.data();
      const button = document.createElement('button');
      button.textContent = quiz.title;
      button.onclick = () => showQuiz(doc.id, quiz);
      quizList.appendChild(button);
    });
  });
}

function showQuiz(id, quiz) {
  currentQuiz = quiz;
  quizTitle.textContent = quiz.title;
  questionsContainer.innerHTML = '';
  quiz.questions.forEach((q, idx) => {
    const div = document.createElement('div');
    div.innerHTML = `
      <p><strong>${q.question}</strong></p>
      ${q.options.map((opt, i) => `
        <label>
          <input type="radio" name="q${idx}" value="${i}" />
          ${opt}
        </label><br/>
      `).join('')}
    `;
    questionsContainer.appendChild(div);
  });
  quizList.style.display = 'none';
  quizContainer.style.display = 'block';
}

document.getElementById('submitQuiz').addEventListener('click', () => {
  let score = 0;
  currentQuiz.questions.forEach((q, idx) => {
    const answer = document.querySelector(`input[name="q${idx}"]:checked`);
    if (answer && parseInt(answer.value) === q.correctIndex) score++;
  });
  quizResult.textContent = `Your Score: ${score}/${currentQuiz.questions.length}`;
});
  
loadQuizzes();
