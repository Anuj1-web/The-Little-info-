import { db } from "./firebase.js";

const container = document.getElementById("quizzesContainer");

async function loadQuizzes() {
  const snapshot = await db.collection("quizzes").get();
  container.innerHTML = "";
  snapshot.forEach(doc => {
    const quiz = doc.data();
    const div = document.createElement("div");
    div.className = "quiz-card";
    div.innerHTML = `
      <h3>${quiz.title}</h3>
      <button onclick="attemptQuiz('${doc.id}')">Start Quiz</button>
    `;
    container.appendChild(div);
  });
}

window.attemptQuiz = async function (quizId) {
  const doc = await db.collection("quizzes").doc(quizId).get();
  const quiz = doc.data();
  const questions = quiz.questions;
  let score = 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const userAnswer = prompt(`${q.question}\n${q.options.join("\n")}`);
    if (userAnswer?.trim().toLowerCase() === q.answer.trim().toLowerCase()) {
      score++;
    }
  }

  alert(`You scored ${score} out of ${questions.length}`);
};

loadQuizzes();
