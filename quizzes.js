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

// 🚀 Load quizzes
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

      // 🎯 Options: A, B, C, D (optional fallback)
      const options = data.options || ['Option A', 'Option B', 'Option C', 'Option D'];
      const correctAnswer = data.answer;

      const card = document.createElement('div');
      card.className = 'topic-card fade-in';

      card.innerHTML = `
        <h3>📝 ${data.title}</h3>
        <p><strong>Q:</strong> ${data.question}</p>
        <div class="options"></div>
        <div class="feedback" style="margin-top:10px; font-weight:bold;"></div>
      `;

      const optionsContainer = card.querySelector('.options');
      const feedback = card.querySelector('.feedback');

      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;

        btn.addEventListener('click', () => {
          // Disable all buttons after selection
          const allBtns = card.querySelectorAll('.option-btn');
          allBtns.forEach(b => {
            b.disabled = true;
            if (b.textContent === correctAnswer) {
              b.classList.add('correct');
            }
            if (b.textContent === btn.textContent && btn.textContent !== correctAnswer) {
              b.classList.add('wrong');
            }
          });

          feedback.textContent = btn.textContent === correctAnswer
            ? '✅ Correct!'
            : `❌ Wrong! Correct Answer: ${correctAnswer}`;
        });

        optionsContainer.appendChild(btn);
      });

      container.appendChild(card);
    });

  } catch (error) {
    console.error('🔥 Failed to load quizzes:', error);
    container.innerHTML = '<p class="animated-subtext error">Failed to load quizzes.</p>';
  }
}

loadAdminQuizzes();
