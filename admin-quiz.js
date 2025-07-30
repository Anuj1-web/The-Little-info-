import { db } from "./firebase.js";

const form = document.getElementById("quizForm");
const container = document.getElementById("questionsContainer");

function createQuestionBlock() {
  const div = document.createElement("div");
  div.className = "question-block";
  div.innerHTML = `
    <input type="text" placeholder="Question" class="q-text" required/>
    <input type="text" placeholder="Option 1" class="q-option" required/>
    <input type="text" placeholder="Option 2" class="q-option" required/>
    <input type="text" placeholder="Option 3" class="q-option" required/>
    <input type="text" placeholder="Correct Answer" class="q-answer" required/>
    <hr/>
  `;
  container.appendChild(div);
}

window.addQuestion = createQuestionBlock;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("quizTitle").value.trim();
  const questions = [];

  container.querySelectorAll(".question-block").forEach(block => {
    const question = block.querySelector(".q-text").value.trim();
    const options = Array.from(block.querySelectorAll(".q-option")).map(i => i.value.trim());
    const answer = block.querySelector(".q-answer").value.trim();

    if (question && options.length && answer) {
      questions.push({ question, options, answer });
    }
  });

  await db.collection("quizzes").add({ title, questions });
  alert("Quiz saved successfully!");
  form.reset();
  container.innerHTML = "";
});
