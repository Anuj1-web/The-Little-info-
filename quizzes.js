// 🔧 Inject custom styles for quiz options and layout
const style = document.createElement('style');
style.textContent = `
  .quiz-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin: 0;
    padding: 0 0 30px 0;
    gap: 0px;
  }

  .quiz-card {
    flex: 1 1 49%;
    margin: 0;
    background: #1c1c1c;
    border-radius: 14px;
    padding: 20px;
    box-shadow: 0 0 8px rgba(0,0,0,0.4);
    transition: transform 0.3s ease;
    min-width: 300px;
  }

  .quiz-card:hover {
    transform: scale(1.02);
  }

  .quiz-option {
    display: block;
    margin: 6px 0;
    padding: 10px 14px;
    border: none;
    border-radius: 8px;
    background-color: #333;
    color: #fff;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.2s ease;
    width: 100%;
    text-align: left;
  }

  .quiz-option:hover {
    background-color: #555;
    transform: scale(1.02);
  }

  .quiz-option.correct {
    background-color: #2ecc71 !important;
    color: #000;
    font-weight: bold;
  }

  .quiz-option.wrong {
    background-color: #e74c3c !important;
    color: #000;
    font-weight: bold;
  }

  .quiz-result {
    margin-top: 10px;
    font-weight: bold;
  }

  .attempted-note {
    margin-top: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    color: #ccc;
  }
`;
document.head.appendChild(style);

// 📦 Firebase
import { db } from './firebase.js';
import {
  collection,
  query,
  getDocs,
  orderBy
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const container = document.getElementById('quizContainer');

async function loadAdminQuizzes() {
  try {
    const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      container.innerHTML = '<p class="animated-subtext">No quizzes available yet.</p>';
      return;
    }

    // ✅ Container for grid layout
    const grid = document.createElement('div');
    grid.className = 'quiz-grid';

    querySnapshot.forEach(doc => {
      const data = doc.data();
      const { title, question, answer, optionA, optionB, optionC, optionD } = data;

      const card = document.createElement('div');
      card.className = 'quiz-card fade-in';

      // 🧠 Create options
      const optionsHTML = `
        <button class="quiz-option" data-option="A">A: ${optionA}</button>
        <button class="quiz-option" data-option="B">B: ${optionB}</button>
        <button class="quiz-option" data-option="C">C: ${optionC}</button>
        <button class="quiz-option" data-option="D">D: ${optionD}</button>
      `;

      card.innerHTML = `
        <h3>📝 <strong>${title}</strong></h3>
        <p><strong>Q:</strong> ${question}</p>
        <div class="quiz-options">${optionsHTML}</div>
        <p class="quiz-result" style="display: none;"></p>
      `;

      const resultPara = card.querySelector('.quiz-result');
      const optionButtons = card.querySelectorAll('.quiz-option');

      optionButtons.forEach(button => {
        button.addEventListener('click', () => {
          const userAnswer = button.getAttribute('data-option');
          const correctAnswer = answer?.toUpperCase();

          optionButtons.forEach(btn => {
            btn.disabled = true;
            if (btn.getAttribute('data-option') === correctAnswer) {
              btn.classList.add('correct');
            }
          });

          if (userAnswer === correctAnswer) {
            button.classList.add('correct');
            resultPara.innerHTML = '✅ Correct!';
            resultPara.style.color = '#2ecc71';
          } else {
            button.classList.add('wrong');
            resultPara.innerHTML = `❌ Wrong! Correct Answer: ${correctAnswer}`;
            resultPara.style.color = '#e74c3c';
          }

          resultPara.style.display = 'block';
          markAttempted(card, correctAnswer);
          saveQuizAttempt(doc.id, userAnswer, correctAnswer); // optional
        });
      });

      grid.appendChild(card);
    });

    container.appendChild(grid);
  } catch (error) {
    console.error('🔥 Failed to load quizzes:', error);
    container.innerHTML = '<p class="animated-subtext error">Failed to load quizzes.</p>';
  }
}

loadAdminQuizzes();

// ✅ Append attempt note below quiz
function markAttempted(card, correctAnswer) {
  const attemptedNote = document.createElement('div');
  attemptedNote.className = 'attempted-note';
  attemptedNote.innerHTML = `✅ <strong>Attempted</strong><br>Correct Answer: <span style="color:#2ecc71">${correctAnswer}</span>`;
  card.appendChild(attemptedNote);
}

// 🔐 Save attempt placeholder (for future Firestore)
function saveQuizAttempt(quizId, selected, correct) {
  // Optional future storage
  // console.log(`Saved: ${quizId} | Selected: ${selected} | Correct: ${correct}`);
}
