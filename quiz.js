import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js";

const container = document.getElementById("quizContainer");
const quizId = new URLSearchParams(window.location.search).get("id");

async function loadQuiz() {
  const quizDoc = await getDoc(doc(db, "quizzes", quizId));
  if (!quizDoc.exists()) {
    container.innerHTML = "<p>Quiz not found.</p>";
    return;
  }

  const quiz = quizDoc.data();
  container.innerHTML = `<h2>${quiz.title}</h2><p>${quiz.description}</p>`;

  quiz.questions.forEach((q, index) => {
    const qDiv = document.createElement("div");
    qDiv.classList.add("quiz-question");
    qDiv.innerHTML = `
      <p><strong>Q${index + 1}: ${q.q}</strong></p>
      <label><input type="radio" name="q${index}" value="A" /> A. ${q.options.A}</label><br />
      <label><input type="radio" name="q${index}" value="B" /> B. ${q.options.B}</label><br />
      <label><input type="radio" name="q${index}" value="C" /> C. ${q.options.C}</label><br />
      <label><input type="radio" name="q${index}" value="D" /> D. ${q.options.D}</label>
    `;
    container.appendChild(qDiv);
  });

  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Submit Quiz";
  submitBtn.onclick = () => {
    let score = 0;
    quiz.questions.forEach((q, index) => {
      const selected = document.querySelector(`input[name="q${index}"]:checked`);
      if (selected && selected.value === q.correct) {
        score++;
      }
    });
    container.innerHTML = `<h2>Your Score: ${score}/${quiz.questions.length}</h2>`;
  };
  container.appendChild(submitBtn);
}

loadQuiz();
