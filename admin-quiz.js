import { db } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js";

document.getElementById("addQuestionBtn").addEventListener("click", () => {
  const container = document.getElementById("questionContainer");
  const qIndex = container.children.length + 1;

  const qDiv = document.createElement("div");
  qDiv.classList.add("question-block");
  qDiv.innerHTML = `
    <input type="text" placeholder="Question ${qIndex}" class="question" required />
    <input type="text" placeholder="Option A" class="optionA" required />
    <input type="text" placeholder="Option B" class="optionB" required />
    <input type="text" placeholder="Option C" class="optionC" required />
    <input type="text" placeholder="Option D" class="optionD" required />
    <select class="correctAnswer">
      <option value="">Correct Option</option>
      <option value="A">A</option>
      <option value="B">B</option>
      <option value="C">C</option>
      <option value="D">D</option>
    </select>
  `;
  container.appendChild(qDiv);
});

document.getElementById("saveQuizBtn").addEventListener("click", async () => {
  const title = document.getElementById("quizTitle").value;
  const description = document.getElementById("quizDescription").value;
  const tags = document.getElementById("quizTags").value.split(',').map(t => t.trim());

  const questionBlocks = document.querySelectorAll(".question-block");
  const questions = [];

  questionBlocks.forEach(block => {
    const q = block.querySelector(".question").value;
    const A = block.querySelector(".optionA").value;
    const B = block.querySelector(".optionB").value;
    const C = block.querySelector(".optionC").value;
    const D = block.querySelector(".optionD").value;
    const correct = block.querySelector(".correctAnswer").value;

    questions.push({ q, options: { A, B, C, D }, correct });
  });

  await addDoc(collection(db, "quizzes"), {
    title,
    description,
    tags,
    questions,
    createdAt: serverTimestamp()
  });

  alert("Quiz saved successfully!");
  location.reload();
});
