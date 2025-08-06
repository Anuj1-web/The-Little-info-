// 🔧 Inject custom styles for quiz options and feedback
const style = document.createElement('style');
style.textContent = `
  .option-btn {
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

  .option-btn:hover {
    background-color: #555;
    transform: scale(1.02);
  }

  .option-btn.correct {
    background-color: #2ecc71 !important;
    color: #000;
    font-weight: bold;
  }

  .option-btn.wrong {
    background-color: #e74c3c !important;
    color: #000;
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

const container = document.getElementById('quizContainer');

async function loadAdminQuizzes() {
  try {
    const q = query(collection(db, 'admin_quizzes'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      container.innerHTML = '<p class="animated-subtext">No quizzes available yet.</p>';
      return;
    }

    querySnapshot.forEach(doc => {
      const data = doc.data();

      const card = document.createElement('div');
      card.className = 'topic-card fade-in';

      // Create options
      const optionsHTML = ['A', 'B', 'C', 'D'].map(letter => {
        const optionText = data[`option${letter}`];
        return `<button class="quiz-option" data-option="${letter}">${optionText}</button>`;
      }).join('');

      card.innerHTML = `
        <h3>📝 ${data.title}</h3>
        <p><strong>Q:</strong> ${data.question}</p>
        <div class="quiz-options">${optionsHTML}</div>
        <p class="quiz-result" style="display: none;"></p>
      `;

      // Add click events
      const resultPara = card.querySelector('.quiz-result');
      const optionButtons = card.querySelectorAll('.quiz-option');

      optionButtons.forEach(button => {
        button.addEventListener('click', () => {
          const userAnswer = button.getAttribute('data-option');
          const correctAnswer = data.answer?.toUpperCase();

          optionButtons.forEach(btn => btn.disabled = true);

          if (userAnswer === correctAnswer) {
            button.style.backgroundColor = '#28a745'; // Green
            resultPara.innerHTML = '✅ Correct!';
            resultPara.style.color = '#28a745';
          } else {
            button.style.backgroundColor = '#dc3545'; // Red
            resultPara.innerHTML = `❌ Wrong! Correct Answer: ${correctAnswer}`;
            resultPara.style.color = '#dc3545';
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
