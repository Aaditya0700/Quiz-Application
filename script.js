

  const QUESTIONS = {
    easy: [
      { q: "What is the capital of France?", options: ["Berlin", "Madrid", "Paris", "Rome"], answer: 2 },
      { q: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], answer: 1 },
      { q: "What is the chemical symbol for water?", options: ["O2", "CO2", "H2O", "HO"], answer: 2 },
      { q: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Leo Tolstoy", "Mark Twain"], answer: 1 },
      { q: "Which planet is the largest in our solar system?", options: ["Earth", "Saturn", "Neptune", "Jupiter"], answer: 3 },
      { q: "What color do you get when mixing red and blue?", options: ["Green", "Orange", "Purple", "Brown"], answer: 2 },
      { q: "How many days are in a week?", options: ["5", "6", "7", "8"], answer: 2 }
    ],
    medium: [
      { q: "Which language runs in a web browser?", options: ["Python", "Java", "C++", "JavaScript"], answer: 3 },
      { q: "What does CSS stand for?", options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Syntax", "Coded Style System"], answer: 1 },
      { q: "What is the value of π to two decimal places?", options: ["3.12", "3.14", "3.16", "3.18"], answer: 1 },
      { q: "Which element has atomic number 1?", options: ["Helium", "Lithium", "Hydrogen", "Carbon"], answer: 2 },
      { q: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Rembrandt"], answer: 2 },
      { q: "How many bones are in the adult human body?", options: ["186", "206", "216", "256"], answer: 1 },
      { q: "What is the smallest prime number?", options: ["0", "1", "2", "3"], answer: 2 },
      { q: "Which country invented the printing press?", options: ["China", "England", "Germany", "France"], answer: 2 }
    ],
    hard: [
      { q: "What is the speed of light (km/s)?", options: ["200,000", "299,792", "350,000", "400,000"], answer: 1 },
      { q: "Which sorting algorithm has O(n log n) average case?", options: ["Bubble sort", "Selection sort", "Merge sort", "Insertion sort"], answer: 2 },
      { q: "In which year was the first iPhone released?", options: ["2005", "2006", "2007", "2008"], answer: 2 },
      { q: "What does DNS stand for?", options: ["Domain Name System", "Data Network Service", "Dynamic Node Setup", "Direct Name Server"], answer: 0 },
      { q: "What is the chemical formula for table salt?", options: ["KCl", "NaOH", "NaCl", "CaCl2"], answer: 2 },
      { q: "Who proposed the theory of general relativity?", options: ["Newton", "Bohr", "Tesla", "Einstein"], answer: 3 },
      { q: "What base does hexadecimal use?", options: ["8", "10", "12", "16"], answer: 3 },
      { q: "Which data structure uses LIFO order?", options: ["Queue", "Heap", "Stack", "Tree"], answer: 2 },
      { q: "What does the 'S' in HTTPS stand for?", options: ["Standard", "Secure", "Safe", "Static"], answer: 1 }
    ]
  };

  const TIME_LIMITS = { easy: 20, medium: 15, hard: 10 };
  const Q_COUNTS   = { easy: 5, medium: 6, hard: 7 };
  const LETTERS    = ['A', 'B', 'C', 'D'];

  let diff = 'medium';
  let questions = [];
  let current = 0;
  let score = 0;
  let answered = false;
  let timerInterval = null;
  let timeLeft = 15;
  let totalTime = 15;
  let playerName = 'Player';

  // Stores each question's result for the review screen
  // { questionIndex, question, options, correctIndex, selectedIndex, timedOut }
  let answerLog = [];

  function shuffle(arr) { return arr.slice().sort(() => Math.random() - 0.5); }

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  function chooseDiff(d) {
    diff = d;
    showScreen('name-screen');
    setTimeout(() => document.getElementById('player-name').focus(), 100);
  }

  function startQuiz() {
    const n = document.getElementById('player-name').value.trim();
    playerName = n || 'Player';
    questions = shuffle(QUESTIONS[diff]).slice(0, Q_COUNTS[diff]);
    totalTime = TIME_LIMITS[diff];
    current = 0;
    score = 0;
    answered = false;
    answerLog = [];
    showScreen('quiz-screen');
    loadQuestion();
  }

  function loadQuestion() {
    clearInterval(timerInterval);
    answered = false;
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('next-btn').style.display = 'none';

    const q     = questions[current];
    const total = questions.length;

    document.getElementById('q-counter').textContent    = `Question ${current + 1} of ${total}`;
    document.getElementById('score-counter').textContent = `Score: ${score}`;
    document.getElementById('progress-bar').style.width  = (current / total * 100) + '%';
    document.getElementById('question-text').textContent = q.q;

    const opts = document.getElementById('options');
    opts.innerHTML = '';
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `<span class="opt-letter">${LETTERS[i]}</span>${opt}`;
      btn.onclick = () => selectAnswer(i, btn);
      opts.appendChild(btn);
    });

    startTimer();
  }

  function startTimer() {
    timeLeft = totalTime;
    updateTimerUI();
    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerUI();
      if (timeLeft <= 0) { clearInterval(timerInterval); timeExpired(); }
    }, 1000);
  }

  function updateTimerUI() {
    const pct = timeLeft / totalTime;
    const bar = document.getElementById('timer-bar');
    const num = document.getElementById('timer-num');
    bar.style.width = (pct * 100) + '%';
    if (pct > 0.5)       { bar.style.background = '#00e5b0'; num.style.color = '#00e5b0'; }
    else if (pct > 0.25) { bar.style.background = '#febc2e'; num.style.color = '#febc2e'; }
    else                 { bar.style.background = '#e24b4a'; num.style.color = '#e24b4a'; }
    num.textContent = timeLeft;
  }

  function timeExpired() {
    if (answered) return;
    answered = true;
    const q = questions[current];

    // Log timed-out answer
    answerLog.push({
      questionNum: current + 1,
      questionText: q.q,
      options: q.options,
      correctIndex: q.answer,
      selectedIndex: -1,
      timedOut: true
    });

    const allBtns = document.getElementById('options').querySelectorAll('.option-btn');
    allBtns.forEach(b => b.disabled = true);
    allBtns[q.answer].classList.add('correct');
    const fb = document.getElementById('feedback');
    fb.textContent = "⏱  Time's up! The correct answer is highlighted.";
    fb.className = 'feedback timeout';
    const nb = document.getElementById('next-btn');
    nb.style.display = 'block';
    nb.textContent = current < questions.length - 1 ? 'Next question →' : 'See my results →';
  }

  function selectAnswer(index, btn) {
    if (answered) return;
    answered = true;
    clearInterval(timerInterval);

    const q       = questions[current];
    const correct  = q.answer;
    const allBtns  = document.getElementById('options').querySelectorAll('.option-btn');
    allBtns.forEach(b => b.disabled = true);

    // Log the chosen answer
    answerLog.push({
      questionNum: current + 1,
      questionText: q.q,
      options: q.options,
      correctIndex: correct,
      selectedIndex: index,
      timedOut: false
    });

    const fb = document.getElementById('feedback');
    if (index === correct) {
      btn.classList.add('correct');
      fb.textContent = '✓  Correct!';
      fb.className = 'feedback correct';
      score++;
    } else {
      btn.classList.add('wrong');
      allBtns[correct].classList.add('correct');
      fb.textContent = '✗  Wrong — the correct answer is highlighted.';
      fb.className = 'feedback wrong';
    }
    document.getElementById('score-counter').textContent = `Score: ${score}`;
    const nb = document.getElementById('next-btn');
    nb.style.display = 'block';
    nb.textContent = current < questions.length - 1 ? 'Next question →' : 'See my results →';
  }

  document.getElementById('next-btn').onclick = () => {
    current++;
    if (current < questions.length) { loadQuestion(); } else { showResult(); }
  };

  /* ── Leaderboard ── */
  function getLeaderboard() {
    try { return JSON.parse(localStorage.getItem('quizLeaderboard') || '[]'); } catch (e) { return []; }
  }

  function saveScore() {
    const entry = { name: playerName, score, diff, total: questions.length, date: Date.now() };
    let lb = getLeaderboard();
    lb.push(entry);
    lb.sort((a, b) => b.score - a.score || a.date - b.date);
    lb = lb.slice(0, 10);
    try { localStorage.setItem('quizLeaderboard', JSON.stringify(lb)); } catch (e) {}
    return lb;
  }

  function clearLeaderboard() {
    try { localStorage.removeItem('quizLeaderboard'); } catch (e) {}
    renderLeaderboard([]);
  }

  function renderLeaderboard(lb) {
    const list = document.getElementById('lb-list');
    list.innerHTML = '';
    if (!lb.length) {
      list.innerHTML = '<div class="lb-empty">No scores yet — be the first!</div>';
      return;
    }
    lb.slice(0, 8).forEach((e, i) => {
      const row = document.createElement('div');
      row.className = 'lb-row' + (i === 0 ? ' top1' : '');
      row.innerHTML = `<span class="lb-rank">${i + 1}</span>
        <span class="lb-name">${e.name}</span>
        <span class="lb-score">${e.score}/${e.total}</span>
        <span class="lb-diff">${e.diff}</span>`;
      list.appendChild(row);
    });
  }

  /* ── Result ── */
  function showResult() {
    clearInterval(timerInterval);
    const lb    = saveScore();
    const total = questions.length;
    const pct   = Math.round(score / total * 100);

    document.getElementById('result-score').textContent = score;
    document.getElementById('result-total').textContent = `out of ${total} questions`;

    const badge = document.getElementById('result-badge');
    const msg   = document.getElementById('result-msg');
    if (pct === 100) {
      badge.textContent = '🏆 Perfect Score'; badge.className = 'result-badge badge-perfect';
      msg.textContent = 'Incredible! You answered every question correctly.';
    } else if (pct >= 75) {
      badge.textContent = '🎉 Great Job'; badge.className = 'result-badge badge-great';
      msg.textContent = 'Excellent work! You really know your stuff.';
    } else if (pct >= 50) {
      badge.textContent = '👍 Not Bad'; badge.className = 'result-badge badge-good';
      msg.textContent = "Good effort! A bit more practice and you'll ace it.";
    } else {
      badge.textContent = '💪 Keep Practicing'; badge.className = 'result-badge badge-tryagain';
      msg.textContent = "Don't give up — try again and beat your score!";
    }

    renderLeaderboard(lb);
    showScreen('result-screen');
  }

  /* ── Review Screen ── */
  function showReview() {
    const total = questions.length;
    const correct = answerLog.filter(a => !a.timedOut && a.selectedIndex === a.correctIndex).length;
    document.getElementById('review-summary').textContent = `${correct}/${total} correct`;

    const list = document.getElementById('review-list');
    list.innerHTML = '';

    answerLog.forEach((entry) => {
      const isCorrect = !entry.timedOut && entry.selectedIndex === entry.correctIndex;
      const isTimeout = entry.timedOut;

      const item = document.createElement('div');
      item.className = 'review-item';

      // Header row
      const statusIcon = isCorrect ? '✅' : (isTimeout ? '⏱️' : '❌');
      item.innerHTML = `
        <div class="review-item-header">
          <span class="review-q-num">Q${entry.questionNum}</span>
          <span class="review-q-text">${entry.questionText}</span>
          <span class="review-status-icon">${statusIcon}</span>
        </div>
        <div class="review-answers" id="review-answers-${entry.questionNum}"></div>
      `;

      list.appendChild(item);

      const answersDiv = item.querySelector(`#review-answers-${entry.questionNum}`);

      if (isTimeout) {
        // Show timeout note + correct answer
        answersDiv.innerHTML = `
          <div class="review-timeout-note">⏱️ Time ran out — no answer selected</div>
        `;
        const correctRow = document.createElement('div');
        correctRow.className = 'review-answer-row correct-ans';
        correctRow.innerHTML = `
          <span class="review-ans-letter">${LETTERS[entry.correctIndex]}</span>
          <span class="review-ans-text">${entry.options[entry.correctIndex]}</span>
          <span class="review-ans-tag">Correct answer</span>
        `;
        answersDiv.appendChild(correctRow);
      } else if (isCorrect) {
        // Show only the correct answer (which was also the selected one)
        const row = document.createElement('div');
        row.className = 'review-answer-row correct-ans';
        row.innerHTML = `
          <span class="review-ans-letter">${LETTERS[entry.selectedIndex]}</span>
          <span class="review-ans-text">${entry.options[entry.selectedIndex]}</span>
          <span class="review-ans-tag">Your answer ✓</span>
        `;
        answersDiv.appendChild(row);
      } else {
        // Show wrong answer + correct answer
        const wrongRow = document.createElement('div');
        wrongRow.className = 'review-answer-row wrong-ans';
        wrongRow.innerHTML = `
          <span class="review-ans-letter">${LETTERS[entry.selectedIndex]}</span>
          <span class="review-ans-text">${entry.options[entry.selectedIndex]}</span>
          <span class="review-ans-tag">Your answer ✗</span>
        `;
        answersDiv.appendChild(wrongRow);

        const correctRow = document.createElement('div');
        correctRow.className = 'review-answer-row correct-ans';
        correctRow.innerHTML = `
          <span class="review-ans-letter">${LETTERS[entry.correctIndex]}</span>
          <span class="review-ans-text">${entry.options[entry.correctIndex]}</span>
          <span class="review-ans-tag">Correct answer</span>
        `;
        answersDiv.appendChild(correctRow);
      }
    });

    showScreen('review-screen');
  }

  function showDiff() { showScreen('diff-screen'); }

  document.getElementById('player-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') startQuiz();
  });
