// 🔧 Inject custom styles for quiz layout, cards, and options
const style = document.createElement('style');
style.textContent = `
  /* Two-column responsive layout */
  #quizContainer.quiz-columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    padding: 20px;
  }

  @media (max-width: 768px) {
    #quizContainer.quiz-columns {
      grid-template-columns: 1fr;
    }
  }

  /* Card box styling */
  .topic-card {
    background: linear-gradient(to bottom right, #1f1f1f, #2b2b2b);
    border-radius: 12px;
    padding: 18px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .topic-card:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 4px 14px rgba(255, 255, 255, 0.15);
  }

  /* Quiz options */
  .quiz-option {
    display: block;
    margin: 5px 0;
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

// 🎯 Target container
const container = document.getElementById('quizContainer');
container.classList.add('quiz-columns'); // Apply 2-column layout

// 🚀 Load all admin quizzes
async function loadAdminQuizzes() {
  try {
    const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      container.innerHTML = '<p class="animated-subtext">No quizzes available yet.</p>';
      return;
    }

    querySnapshot.forEach(doc => {
      const data = doc.data();
      const { title, question, answer, optionA, optionB, optionC, optionD } = data;

      const card = document.createElement('div');
      card.className = 'topic-card fade-in';

      const optionsHTML = `
        <button class="quiz-option" data-option="A">A: ${optionA}</button>
        <button class="quiz-option" data-option="B">B: ${optionB}</button>
        <button class="quiz-option" data-option="C">C: ${optionC}</button>
        <button class="quiz-option" data-option="D">D: ${optionD}</button>
      `;

      card.innerHTML = `
        <h3>📝 ${title}</h3>
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
        });
      });

      container.appendChild(card);
    });
  } catch (error) {
    console.error('🔥 Failed to load quizzes:', error);
    container.innerHTML = '<p class="animated-subtext error">Failed to load quizzes.</p>';
  }
}

loadAdminQuizzes();
