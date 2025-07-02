let currentQuestionIndex = 0;
let selectedAnswer = null;
let score = 0;
let correctCount = 0;
let wrongCount = 0;

let correctSound = new Audio("correct.mp3");
let wrongSound = new Audio("wrong.mp3");

let userAnswers = []; // আগের উত্তরগুলো সংরক্ষণের জন্য

// প্রশ্ন দেখানোর ফাংশন (শাফেলিংসহ)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function showQuestion() {
  const container = document.getElementById("quiz-container");
  const q = quizSet.questions[currentQuestionIndex];

  const shuffledOptions = [...q.options];
  shuffleArray(shuffledOptions);

  const correctAnswerIndex = shuffledOptions.indexOf(q.options[q.answer]);

  container.innerHTML = `
    <div class="mb-4">
      <h2 class="text-lg font-semibold text-gray-800 mb-3">
        প্রশ্ন ${currentQuestionIndex + 1}: ${q.question}
      </h2>
      <div class="grid grid-cols-2 gap-3">
        ${shuffledOptions
          .map(
            (opt, i) => `
          <button class="option-btn px-4 py-3 border border-gray-300 rounded bg-white hover:bg-blue-100 transition text-sm"
                  onclick="selectAnswer(${i})" data-index="${i}">
            <span class="font-bold mr-2 text-blue-600">${i + 1}.</span> ${opt}
          </button>
        `,
          )
          .join("")}
      </div>
    </div>
    <button id="nextBtn" onclick="nextQuestion()" class="mt-4 w-full py-2 bg-blue-600 text-white rounded disabled:opacity-50" disabled>
      পরবর্তী প্রশ্ন (Enter)
    </button>
  `;

  // selectAnswer ফাংশন ওভাররাইড (শাফেল্ড অপশন অনুযায়ী)
  window.selectAnswer = function (index) {
    if (selectedAnswer !== null) return;

    selectedAnswer = index;

    document.querySelectorAll(".option-btn").forEach((btn) => {
      btn.disabled = true;
      btn.classList.add("bg-gray-100");
    });

    const correctBtn = document.querySelector(
      `[data-index="${correctAnswerIndex}"]`,
    );
    correctBtn.classList.remove("bg-gray-100");
    correctBtn.classList.add("bg-green-500", "text-white");

    if (index !== correctAnswerIndex) {
      const wrongBtn = document.querySelector(`[data-index="${index}"]`);
      wrongBtn.classList.remove("bg-gray-100");
      wrongBtn.classList.add("bg-red-500", "text-white");
      wrongCount++;

      wrongSound.play();
    } else {
      score++;
      correctCount++;
      correctSound.play();
    }

    // এখানে ইনডেক্স সেভ করো (টেক্সট নয়)
    userAnswers[currentQuestionIndex] = index;

    document.getElementById("correct-count").textContent = `✔️ ${correctCount}`;
    document.getElementById("wrong-count").textContent = `❌ ${wrongCount}`;
    document.getElementById("nextBtn").disabled = false;
  };
}

// পরবর্তী প্রশ্ন
function nextQuestion() {
  if (selectedAnswer === null) return;

  currentQuestionIndex++;
  selectedAnswer = null;

  if (currentQuestionIndex < quizSet.questions.length) {
    showQuestion();
  } else {
    showFinalResult();
  }
}

// কুইজ শেষ হলে ফলাফল দেখানো
function showFinalResult() {
  const container = document.getElementById("quiz-container");
  container.innerHTML = `
      <div class="text-center space-y-4">
        <h2 class="text-xl font-bold text-green-700">🎉 কুইজ শেষ!</h2>
        <p class="text-lg text-gray-800">সঠিকঃ ${correctCount}, ভুলঃ ${wrongCount}</p>
        <button onclick="showReview()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">রিভিউ দেখুন</button>
        <button onclick="saveScore()" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">লিডারবোর্ডে যোগ করুন</button>
        <button onclick="location.reload()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">🔁 আবার দিন</button>
      </div>
  `;
}

// রিভিউ দেখানোর ফাংশন (undefined সমস্যা ঠিক করা হয়েছে)
function showReview() {
  const container = document.getElementById("quiz-container");
  let reviewHTML = `
    <div class="text-center space-y-4">
      <h2 class="text-xl font-bold text-blue-700">📚 কুইজ রিভিউ</h2>
  `;

  for (let i = 0; i < quizSet.questions.length; i++) {
    const q = quizSet.questions[i];
    const userAnswerIndex = userAnswers[i];
    const isCorrect = userAnswerIndex === q.answer;

    reviewHTML += `
      <div class="mb-4 p-4 border rounded ${
        isCorrect ? "border-green-500" : "border-red-500"
      }">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">
          প্রশ্ন ${i + 1}: ${q.question}
        </h3>
        <p class="text-sm text-gray-700">
          সঠিক উত্তর: ${q.options[q.answer]}
        </p>
        <p class="text-sm text-gray-700">
          ব্যাখ্যা: ${q.explanation || "কোনো ব্যাখ্যা নেই"}
        </p>
    `;

    if (userAnswerIndex !== undefined) {
      reviewHTML += `
          <p class="text-sm ${isCorrect ? "text-green-600" : "text-red-600"}">
            আপনার উত্তর: ${q.options[userAnswerIndex]} (${
              isCorrect ? "সঠিক" : "ভুল"
            })
          </p>
        `;
    } else {
      reviewHTML += `<p class="text-sm text-yellow-600">আপনি এই প্রশ্নের উত্তর দেননি।</p>`;
    }

    reviewHTML += `</div>`;
  }

  reviewHTML += `
      <button onclick="location.reload()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        🔁 আবার দিন
      </button>
    </div>
  `;
  container.innerHTML = reviewHTML;
}

// লিডারবোর্ড সংরক্ষণ এবং প্রদর্শন ফাংশনসমূহ (আগের মতোই)
// কীবোর্ড কন্ট্রোল সাপোর্ট
function setupKeyboard() {
  document.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !document.getElementById("nextBtn").disabled) {
      nextQuestion();
    }

    if (selectedAnswer === null) {
      if (event.key >= "1" && event.key <= "4") {
        let index = parseInt(event.key) - 1;
        let buttons = document.querySelectorAll(".option-btn");
        if (index < buttons.length) {
          selectAnswer(index);
        }
      }
    }
  });
}
// অন্যান্য ফাংশন যেমন setupKeyboard(), saveScore(), showLeaderboard(), resetLeaderboard(), toggleTheme() ইত্যাদি আগের মতোই থাকবে

// DOMContentLoaded ইভেন্টে কুইজ শুরু এবং প্রশ্ন শাফেল করা
document.addEventListener("DOMContentLoaded", () => {
  if (typeof quizSet !== "undefined") {
    document.getElementById("quiz-title").textContent = quizSet.name;

    shuffleArray(quizSet.questions);

    showQuestion();
    setupKeyboard();

    // থিম সেটআপ (আগের মতো)
  } else {
    document.getElementById("quiz-container").innerHTML =
      "<p class='text-red-600'>প্রশ্ন লোড হয়নি।</p>";
  }
});
// Fixed: Review was not displaying correctly due to incorrect answer comparison.
// The issue was at line `const isCorrect = userAnswerIndex === q.answer;`
// The fix is to compare userAnswerIndex with the index of the correct option in shuffledOptions

function showReview() {
    const container = document.getElementById("quiz-container");
    let reviewHTML = `
      <div class="text-center space-y-4">
        <h2 class="text-xl font-bold text-blue-700">📚 কুইজ রিভিউ</h2>
    `;

    for (let i = 0; i < quizSet.questions.length; i++) {
        const q = quizSet.questions[i];
        const userAnswerIndex = userAnswers[i];

        // Get the shuffled options for the current question
        const shuffledOptions = [...q.options];
        shuffleArray(shuffledOptions);

        // Find the index of the correct answer in the shuffled options
        const correctAnswerIndex = shuffledOptions.indexOf(q.options[q.answer]);

        // Determine if the user's answer is correct based on the shuffled options
        let isCorrect = false;
        if (userAnswerIndex !== undefined) {
            isCorrect = userAnswerIndex === correctAnswerIndex;
        }

        reviewHTML += `
          <div class="mb-4 p-4 border rounded ${isCorrect ? "border-green-500" : "border-red-500"}">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">
              প্রশ্ন ${i + 1}: ${q.question}
            </h3>
            <p class="text-sm text-gray-700">
              সঠিক উত্তর: ${q.options[q.answer]}
            </p>
            <p class="text-sm text-gray-700">
                ব্যাখ্যা: ${q.explanation || "কোনো ব্যাখ্যা নেই"}
            </p>
        `;

        if (userAnswerIndex !== undefined) {
            reviewHTML += `
              <p class="text-sm ${isCorrect ? "text-green-600" : "text-red-600"}">
                আপনার উত্তর: ${shuffledOptions[userAnswerIndex]} (${isCorrect ? "সঠিক" : "ভুল"})
              </p>
            `;
        } else {
            reviewHTML += `<p class="text-sm text-yellow-600">আপনি এই প্রশ্নের উত্তর দেননি।</p>`;
        }

        reviewHTML += `</div>`;
    }

    reviewHTML += `
        <button onclick="location.reload()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          🔁 আবার দিন
        </button>
      </div>
    `;
    container.innerHTML = reviewHTML;
}
// লিডারবোর্ড ডেটা লোকাল স্টোরেজে সেইভ করার ফাংশন
function saveScore() {
    let name = prompt("আপনার নাম লিখুন:");
    if (name) {
        let scoreData = { name: name, score: correctCount };
        let leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
        leaderboard.push(scoreData);

        // স্কোর অনুসারে সাজানো
        leaderboard.sort((a, b) => b.score - a.score);

        // সেরা ১০টি স্কোর রাখুন
        leaderboard = leaderboard.slice(0, 10);

        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
        showLeaderboard();
    }
}

// লিডারবোর্ড দেখানোর ফাংশন
function showLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    let leaderboardHTML = `
        <div class="text-center space-y-4">
            <h2 class="text-xl font-bold text-purple-700">🏆 লিডারবোর্ড</h2>
            <ol class="list-decimal list-inside text-lg text-gray-800">
    `;

    if (leaderboard.length === 0) {
        leaderboardHTML += `<p>লিডারবোর্ডে এখনো কেউ নেই!</p>`;
    } else {
        leaderboard.forEach((item, index) => {
            leaderboardHTML += `<li>${item.name} - ${item.score}</li>`;
        });
    }

    leaderboardHTML += `
            </ol>
            <button onclick="resetLeaderboard()" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                লিডারবোর্ড রিসেট করুন
            </button>
            <button onclick="location.reload()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                🔁 আবার খেলুন
            </button>
        </div>
    `;

    document.getElementById("quiz-container").innerHTML = leaderboardHTML;
}

// লিডারবোর্ড রিসেট করার ফাংশন
function resetLeaderboard() {
    localStorage.removeItem('leaderboard');
    showLeaderboard();
}