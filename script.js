/* ReadSMART — final script.js (with Forgot Password toggle panel that replaces login)
   - Keeps existing literal/inferential/critical structure & scoring
   - Reset updates user password stored in localStorage
*/

(() => {
  // Elements
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const resetForm = document.getElementById('reset-form');
  const showSignup = document.getElementById('show-signup');
  const showLogin = document.getElementById('show-login');
  const forgotLink = document.getElementById('forgot-link');
  const resetCancel = document.getElementById('reset-cancel');

  const authCard = document.getElementById('auth-card');
  const homepage = document.getElementById('homepage');
  const welcomeText = document.getElementById('welcome-text');
  const foldersEl = document.getElementById('folders');
  const contentArea = document.getElementById('content-area');

  const hamburger = document.getElementById('hamburger');
  const hamburgerMenu = document.getElementById('hamburger-menu');
  const menuProfile = document.getElementById('menu-profile');
  const menuAbout = document.getElementById('menu-about');
  const menuLogout = document.getElementById('menu-logout');

  const profileTemplate = document.getElementById('profile-template');
  const aboutModal = document.getElementById('about-modal');

  let currentUser = null;

  // Storage helpers
  function saveRecord(username, title, level, score, total) {
    const all = JSON.parse(localStorage.getItem('quizRecords') || '{}');
    if (!all[username]) all[username] = [];
    all[username].push({ date: new Date().toLocaleString(), title, level, score, total });
    localStorage.setItem('quizRecords', JSON.stringify(all));
  }

  function loadRecordsIntoTable(username) {
    const tableBody = document.querySelector('#record-table tbody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    const all = JSON.parse(localStorage.getItem('quizRecords') || '{}');
    const list = all[username] || [];
    if (list.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center">No records yet.</td></tr>';
      return;
    }
    list.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.date}</td><td>${r.title}</td><td>${r.level}</td><td>${r.score}</td><td>${r.total}</td>`;
      tableBody.appendChild(tr);
    });
  }

  // Toggle signup/login
  if (showSignup) showSignup.addEventListener('click', e => { e.preventDefault(); loginForm.style.display = 'none'; signupForm.style.display = 'block'; resetForm.style.display = 'none'; });
  if (showLogin) showLogin.addEventListener('click', e => { e.preventDefault(); signupForm.style.display = 'none'; loginForm.style.display = 'block'; resetForm.style.display = 'none'; });

  // Forgot password link: hide login & signup, show reset panel (replace login)
  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      // hide login & signup
      loginForm.style.display = 'none';
      signupForm.style.display = 'none';
      // clear reset fields
      document.getElementById('reset-username').value = '';
      document.getElementById('reset-password').value = '';
      document.getElementById('reset-password-confirm').value = '';
      // show reset panel
      resetForm.style.display = 'block';
    });
  }

  // Reset cancel: go back to login form
  if (resetCancel) {
    resetCancel.addEventListener('click', () => {
      resetForm.style.display = 'none';
      signupForm.style.display = 'none';
      loginForm.style.display = 'block';
    });
  }

  // Signup
  signupForm.addEventListener('submit', e => {
    e.preventDefault();
    const fullname = document.getElementById('fullname').value.trim();
    const gender = document.getElementById('gender').value;
    const grade = document.getElementById('grade').value.trim();
    const section = document.getElementById('section').value.trim();
    const school = document.getElementById('school-student').value.trim();
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;

    if (!fullname || !gender || !grade || !section || !school || !username || !password) {
      alert('⚠️ Please complete all fields.');
      return;
    }
    if (password.length < 8) {
      alert('⚠️ Password must be at least 8 characters.');
      return;
    }
    if (localStorage.getItem(`user:${username}`)) {
      alert('⚠️ This username is already taken. Choose another one.');
      return;
    }

    const userObj = { fullname, gender, grade, section, school, username, password, role: 'student' };
    localStorage.setItem(`user:${username}`, JSON.stringify(userObj));
    alert('✅ Account created. Please log in.');
    signupForm.reset();
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
  });

  // Login
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    const stored = JSON.parse(localStorage.getItem(`user:${username}`) || 'null');
    if (!stored) {
      alert('⚠️ Username not recognized. Please create an account first.');
      return;
    }
    if (stored.password !== password) {
      alert('❌ Incorrect password.');
      return;
    }
    // login success
    currentUser = stored;
    authCard.style.display = 'none';
    homepage.style.display = 'block';
welcomeText.textContent = "Welcome, Reader!";
    contentArea.innerHTML = `<div class="placeholder"><h3>Your reading practice awaits</h3><p>Select a folder to see passages and questions.</p></div>`;
  });

  // Reset password submission logic
  resetForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('reset-username').value.trim();
    const newPass = document.getElementById('reset-password').value;
    const confirmPass = document.getElementById('reset-password-confirm').value;

    if (!username || !newPass || !confirmPass) {
      alert('⚠️ Please complete all fields.');
      return;
    }
    if (newPass.length < 8) {
      alert('⚠️ Password must be at least 8 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      alert('⚠️ Passwords do not match. Please try again.');
      return;
    }

    const storedRaw = localStorage.getItem(`user:${username}`);
    if (!storedRaw) {
      alert('⚠️ Username not found. Check the username or create an account.');
      return;
    }

    try {
      const userObj = JSON.parse(storedRaw);
      userObj.password = newPass;
      localStorage.setItem(`user:${username}`, JSON.stringify(userObj));
      alert('✅ Password successfully changed. Please log in with your new password.');
      // reset & return to login form
      resetForm.reset();
      resetForm.style.display = 'none';
      signupForm.style.display = 'none';
      loginForm.style.display = 'block';
    } catch (err) {
      console.error('Error updating password:', err);
      alert('❌ An unexpected error occurred. Try again.');
    }
  });

  // Logout
  menuLogout.addEventListener('click', () => {
    currentUser = null;
    homepage.style.display = 'none';
    authCard.style.display = 'block';
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
    resetForm.style.display = 'none';
    hamburgerMenu.style.display = 'none';
  });

  // Hamburger and menu actions
  hamburger.addEventListener('click', () => {
    hamburgerMenu.style.display = hamburgerMenu.style.display === 'block' ? 'none' : 'block';
  });

  const menuProfileBtn = document.getElementById('menu-profile');
  const menuAboutBtn = document.getElementById('menu-about');

  if (menuProfileBtn) {
    menuProfileBtn.addEventListener('click', () => {
      hamburgerMenu.style.display = 'none';
      showProfile();
    });
  }
  if (menuAboutBtn) {
    menuAboutBtn.addEventListener('click', () => {
      hamburgerMenu.style.display = 'none';
      aboutModal.style.display = 'flex';
      aboutModal.setAttribute('aria-hidden', 'false');
    });
  }

  const aboutClose = document.getElementById('close-about');
  if (aboutClose) aboutClose.addEventListener('click', () => { aboutModal.style.display = 'none'; aboutModal.setAttribute('aria-hidden', 'true'); });
  const aboutCloseBtn = document.getElementById('about-close-btn');
  if (aboutCloseBtn) aboutCloseBtn.addEventListener('click', () => { aboutModal.style.display = 'none'; aboutModal.setAttribute('aria-hidden', 'true'); });

  // Close menu/modal when clicking outside
  document.addEventListener('click', (e) => {
    if (aboutModal.style.display === 'flex' && !aboutModal.querySelector('.modal-content').contains(e.target) && e.target !== menuAbout) {
      aboutModal.style.display = 'none';
      aboutModal.setAttribute('aria-hidden', 'true');
    }
    if (!hamburger.contains(e.target) && !hamburgerMenu.contains(e.target)) {
      hamburgerMenu.style.display = 'none';
    }
  });

  // Profile
  function showProfile() {
    if (!currentUser) {
      alert('Please log in first.');
      return;
    }
    contentArea.innerHTML = '';
    const clone = profileTemplate.content.cloneNode(true);
    contentArea.appendChild(clone);
    const nameEl = document.getElementById('profile-name');
    const genEl = document.getElementById('profile-gender');
    const userEl = document.getElementById('profile-username');
    const groupEl = document.getElementById('profile-group');
    const schoolEl = document.getElementById('profile-school-info');
    if (nameEl) nameEl.textContent = currentUser.fullname;
    if (genEl) genEl.textContent = currentUser.gender;
    if (userEl) userEl.textContent = currentUser.username;
    if (groupEl) groupEl.textContent = `${currentUser.grade}-${currentUser.section}`;
    if (schoolEl) schoolEl.textContent = currentUser.school;
    loadRecordsIntoTable(currentUser.username);
    const backBtn = document.getElementById('profile-back');
    if (backBtn) backBtn.addEventListener('click', () => {
      contentArea.innerHTML = `<div class="placeholder"><h3>Select a folder to begin</h3><p>Your answers are saved when you submit.</p></div>`;
    });
  }

  // ===============================
  // PASSAGES (Literal = MCQ, Inferential & Critical expanded here)
  // Critical sections: 10 questions each
  // ===============================
  const passages = {
  literal: [
    {
      title: 'The Morning Routine',
      text: 'Liza rushed out of bed when the alarm rang at 6:15 a.m. She brushed her teeth quickly and grabbed a slice of toast before heading to school. On the way, she stopped to watch a group of birds perched on a nearby tree. At school, she unpacked her books and prepared for her favorite class, Science. Today, her teacher asked the students to design a simple experiment, a volcanic reaction, using vinegar and baking soda. Liza carefully mixed the ingredients and observed the fizzing reaction. During lunch, she and her friend Sarah compared notes about their experiments. In the afternoon, they had English class and read a short story about planets. After school, Liza walked home with her brother Paolo and talked about the experiment. At home, she completed her homework and wrote a reflection about what she learned. She felt proud that her experiment worked perfectly. Liza spent the evening reading a chapter from her favorite science book. Before bedtime, she packed her bag for the next day. She set her alarm and went to sleep, excited for tomorrow’s class.',
      questions: [
        { q: 'What experiment did Liza do in Science class?', options: ['Plant growth','Volcano reaction','Egg in saltwater','Magnet test'], answer: 'Volcano reaction'},
        { q: 'Who did Liza compare notes with at lunch', options: ['Paolo','Sarah','Her teacher','Her sister'], answer: 'Sarah'},
        { q: 'What subject did she have in the afternoon?', options: ['Math','Science','English','History'], answer: 'History'},
        { q: 'How did Liza feel about her experiment?', options: ['Proud','Angry','Sad','Confused'], answer: 'Proud'},
        { q: 'What did she do before going to bed?', options: ['Play games','Pack her bag','Eat dinner','Watch TV'], answer: 'Pack her bag'}
 ]
    },
    {
      title: "Marco’s Vegetable Garden",
      text: "Marco knelt beside the tomato plants, carefully pulling out weeds. His father had already watered the beds and planted new seeds. Marco checked the soil to see if it was moist enough. The garden smelled fresh, with hints of earth and blooming flowers. Later, he harvested some ripe eggplants and placed them in a basket. His sister Ana helped by collecting okra and peppers. Marco noted the growth of each plant in his gardening journal. In the afternoon, they went to the market to sell some vegetables. Customers complimented the produce and asked for tips on gardening. Marco explained how watering and sunlight helped the plants grow. On the way home, they passed a small pond filled with frogs. Marco enjoyed observing the frogs jump from one lily pad to another. Back at home, he washed the vegetables and set some aside for dinner. The garden taught him patience and responsibility. Marco dreamed of expanding the garden next year with more flowers and herbs.",
      questions: [
        { q: "What did Marco pull out from the garden?", options: ["Flowers", "Weeds", "Tomatoes", "Stones"], answer: "Weeds" },
        { q: "Who helped Marco collect okra and peppers?", options: ["Paolo", "Ana", "Liza", "Sarah"], answer: "Ana" },
        { q: "Where did they go after harvesting vegetables?", options: ["School", "Market", "Park", "Library"], answer: "Market" },
        { q: "What did Marco record in his journal?", options: ["Plant growth", "Recipes", "Weather", "Homework"], answer: "Plant growth" },
        { q: "What skill did Marco learn from gardening?", options: ["Patience", "Singing", "Painting", "Writing"], answer: "Patience" }
      ]
    },
    {
      title: "Sophia’s Library Adventure",
      text: "Sophia stepped into the library, amazed by the rows of colorful books. She wandered through the shelves, stopping at novels about adventure and history. A friendly librarian recommended a book about a young explorer traveling the world. Sophia borrowed it and sat in a quiet corner to read. The story described mountains, rivers, and cities far away. She imagined herself visiting those places and learning new languages. During break, Sophia shared her ideas with friends and discussed the characters’ choices. She took notes in her journal about lessons she could apply in her own life. After reading, she returned the book and borrowed a science magazine. Sophia enjoyed learning about experiments she could try at home. On her way out, she promised herself to visit the library twice a week. That evening, she read more chapters before sleeping. Sophia felt inspired and excited to explore new books tomorrow.",
      questions: [
        { q: "What kind of book did Sophia borrow first?", options: ["Cookbook", "Adventure", "Mystery", "Poetry"], answer: "Adventure" },
        { q: "Who suggested the book to her?", options: ["Teacher", "Librarian", "Friend", "Brother"], answer: "Librarian" },
        { q: "What did Sophia do during break?", options: ["Sleep", "Discuss ideas", "Eat lunch", "Watch TV"], answer: "Discuss ideas" },
        { q: "Which magazine did she borrow next?", options: ["Fashion", "Science", "Sports", "Cooking"], answer: "Science" },
        { q: "How often did Sophia plan to visit the library?", options: ["Once a month", "Twice a week", "Every day", "Once a week"], answer: "Twice a week" }
      ]
    },
    {
    title: "Daniel’s Basketball Practice",
    text: "Daniel dribbled the ball across the court, trying a new move he had seen on TV. His coach shouted tips from the sidelines. Daniel's friends passed the ball and encouraged him when he missed a shot. Sweat dripped down his face, but he kept practicing. After several attempts, he finally made a perfect basket. The team celebrated with high fives and laughter. Later, Daniel practiced free throws alone. He noticed that focusing on his breathing helped him aim better. During a break, they drank water and discussed strategies for the upcoming match. Daniel returned home tired but happy. He reviewed the plays in his notebook and practiced a few shots in the backyard. Dinner with his family felt rewarding after a long day. Before sleeping, Daniel visualized himself winning the game. He felt motivated to train harder the next day.",
    questions: [
      { q: "What sport does Daniel play?", options: ["Soccer", "Basketball", "Tennis", "Baseball"], answer: "Basketball" },
      { q: "What did Daniel finally achieve?", options: ["Perfect basket", "New record", "Medal", "Trophy"], answer: "Perfect basket" },
      { q: "How did focusing on breathing help him?", options: ["Relaxed him", "Improved aim", "Made him run faster", "Improved passing"], answer: "Improved aim" },
      { q: "Where did he practice at home?", options: ["Garage", "Backyard", "Bedroom", "School gym"], answer: "Backyard" },
      { q: "What did Daniel do before sleeping?", options: ["Watch TV", "Visualize winning", "Read book", "Eat snack"], answer: "Visualize winning" }
    ]
  },
  {
    title: "Anna’s Animal Shelter Day",
    text: "Anna put on gloves and entered the animal shelter. Cats meowed softly while dogs wagged their tails. She fed the animals and cleaned their cages. A stray dog limped, so she gently helped it into a pen. Anna recorded the condition of each animal in a notebook. Volunteers arrived to help with bathing and feeding. She noticed that teamwork made the process faster and more enjoyable. Children played with kittens under supervision. Anna learned about vaccinations and proper diet from the shelter manager. After lunch, she helped organize blankets and toys. She felt happy seeing healthy animals wag their tails. Before leaving, she promised to return next weekend. Anna’s dream was to become a veterinarian. She imagined opening a clinic to help more animals. The experience taught her compassion and responsibility.",
    questions: [
      { q: "What did Anna wear at the shelter?", options: ["Hat", "Gloves", "Apron", "Shoes"], answer: "Gloves" },
      { q: "What did Anna help a stray dog with?", options: ["Feeding", "Cleaning", "Move to a pen", "Walking"], answer: "Move to a pen" },
      { q: "What did she record in her notebook?", options: ["Weather", "Animal condition", "Recipes", "Friends"], answer: "Animal condition" },
      { q: "Who taught her about vaccinations?", options: ["Teacher", "Shelter manager", "Parent", "Librarian"], answer: "Shelter manager" },
      { q: "What value did Anna learn?", options: ["Compassion", "Patience", "Creativity", "Honesty"], answer: "Compassion" }
    ]
  },
  {
    title: "Rivera Family Road Trip",
    text: "The Rivera family packed the car with suitcases and snacks for a long drive. They traveled through winding roads and past green hills. On the way, they stopped at a roadside café for coffee and pastries. Children pressed their faces against the window, watching rivers and small villages pass by. They arrived at the lakeside cabin in the afternoon. The family spent time fishing, kayaking, and hiking nearby trails. Evening brought a barbecue by the lake, with music and laughter filling the air. At night, they roasted marshmallows over a small fire. The children collected smooth stones along the shore. They woke early the next day to watch the sunrise over the water. On the final day, they bought handmade souvenirs from local vendors. The trip created lasting memories. Everyone promised to explore another town next vacation.",
    questions: [
      { q: "Where did the Rivera family travel?", options: ["Beach", "Lakeside", "Mountains", "City"], answer: "Lakeside" },
      { q: "What did children do in the car?", options: ["Sleep", "Watch outside", "Read books", "Play games"], answer: "Watch outside" },
      { q: "Evening activity?", options: ["Swimming", "Barbecue", "Fishing", "Hiking"], answer: "Barbecue" },
      { q: "Morning activity next day?", options: ["Run", "Watch sunrise", "Cook", "Shopping"], answer: "Watch sunrise" },
      { q: "What did they buy on the last day?", options: ["Food", "Souvenirs", "Clothes", "Toys"], answer: "Souvenirs" }
    ]
  },
  {
    title: "Lantern Festival",
    text: "The town’s streets glowed with lanterns of red, gold, and blue. Musicians played traditional instruments while dancers in colorful costumes performed. Children carried small lanterns, competing for the most creative design. Food stalls offered local delicacies, and families laughed together. Maria joined her friends in making a large paper dragon. Tourists stopped to take photos and ask about the traditions. The festival ended with fireworks lighting up the night sky. Maria felt proud to share her culture. She learned folk songs and dances from her grandmother. Everyone joined in singing and clapping. The festival created a joyful atmosphere in the town. Lanterns floated on the river, reflecting sparkling lights. People shared stories about past festivals. By the end, the community felt united and happy.",
    questions: [
      { q: "What event is described?", options: ["Lantern Festival", "Parade", "Wedding", "Market fair"], answer: "Lantern Festival" },
      { q: "What did children carry?", options: ["Flags", "Lanterns", "Balloons", "Toys"], answer: "Lanterns" },
      { q: "What did Maria make with friends?", options: ["Lantern", "Dragon", "Kite", "Boat"], answer: "Dragon" },
      { q: "How did the festival end?", options: ["Parade", "Fireworks", "Dance", "Dinner"], answer: "Fireworks" },
      { q: "What did the festival create?", options: ["Chaos", "Joy", "Study", "Competition"], answer: "Joy" }
    ]
  },
  {
    title: "School Science Fair",
    text: "Students set up tables with models and experiments. Tom displayed a miniature erupting volcano, while Lisa studied plant growth under colored lights. Parents walked around, asking questions and taking photos. Teachers scored projects and gave suggestions. Students explained hypotheses and procedures with confidence. Winners received medals and certificates. Some participants demonstrated electricity experiments, while others showed recycling techniques. The fair lasted the morning. Lunch was served afterward, and students shared what they learned. Everyone felt proud of their achievements. The event inspired students to explore science at home. Teachers encouraged creativity and curiosity. Observers praised innovative ideas. Students promised to prepare even better projects next year.",
    questions: [
      { q: "What type of event is this?", options: ["Sports", "Science fair", "Art show", "Music concert"], answer: "Science fair" },
      { q: "What did Tom make?", options: ["Plant growth", "Volcano", "Bridge", "Rocket"], answer: "Volcano" },
      { q: "What did teachers do?", options: ["Score projects", "Dance", "Cook", "Play"], answer: "Score projects" },
      { q: "When did lunch happen?", options: ["Morning", "Afternoon", "Evening", "Night"], answer: "Morning" },
      { q: "What did the fair inspire?", options: ["Creativity and curiosity", "Anger", "Laziness", "Hunger"], answer: "Creativity and curiosity" }
    ]
  },
  {
    title: "Community Clean-up",
    text: "Volunteers gathered at the town plaza, carrying gloves and trash bags. They split into groups to clean streets, parks, and the riverside. Some painted walls to remove graffiti. Children helped sort recyclable bottles from trash. Local leaders supervised and encouraged participants. Volunteers planted flowers in empty spaces and swept the sidewalks. The group collected a large pile of garbage by noon. After cleaning, they drank water and shared snacks. Everyone felt proud to make the town look better. Residents thanked the volunteers for their effort. The children learned the importance of protecting the environment. Volunteers promised to organize another clean-up soon. Their teamwork strengthened community spirit. Everyone left with a sense of accomplishment.",
    questions: [
      { q: "Where did volunteers gather?", options: ["School", "Plaza", "Park", "Library"], answer: "Plaza" },
      { q: "Who helped sort recyclables?", options: ["Adults", "Children", "Teachers", "Tourists"], answer: "Children" },
      { q: "What did some volunteers paint?", options: ["Trees", "Walls", "Signs", "Benches"], answer: "Walls" },
      { q: "Why did they plant flowers?", options: ["Decorations", "Clean streets", "Shade", "Study"], answer: "Clean streets" },
      { q: "What did the event promote?", options: ["Fun", "Environment awareness", "Sportsmanship", "Music"], answer: "Environment awareness" }
    ]
  },
  {
  title: "The Old Observatory Key",
  text: `Liam and Maya were volunteers for the historical society, assigned to organize artifacts at the city's old observatory. The observatory had been closed since 1985, and its air still smelled of dust and ozone. They were searching for the legendary brass star chart, an item said to have vanished decades ago. A weathered sign by the entrance read, “All instruments placed in storage Room B.” While dusting near the telescope platform, Liam noticed a small tarnished key dangling from a nail under the window. The key had the number “103” etched deeply on its head. Curious, Maya checked the society’s digital record and discovered that Room 103 was the old director’s private office. The door creaked as they stepped inside, revealing shelves of faded journals and cracked photographs. Behind a heavy velvet curtain stood a rusted safe with an ornate handle. Liam inserted the key, but it wouldn’t turn. Disappointed, they searched the office further and found a plain wooden chest near the floor. The key fit perfectly this time, clicking open the chest with ease. Inside, wrapped in fragile tissue paper, lay the missing brass star chart. Its surface shimmered faintly under the beam of their flashlight. The two volunteers could hardly believe their luck. They documented their find carefully in the society’s logbook. Before leaving, Maya sealed the key in a labeled envelope for safekeeping. As they locked the door behind them, the wind outside whistled softly through the observatory’s dome. The once-forgotten building seemed to sigh in relief, as if happy to share its final secret. The star chart would soon be displayed again, a symbol of patience and discovery.`,
  questions: [
    {
      q: "In what year was the old observatory shut down?",
      options: ["1980", "1985", "1990", "2000"],
      answer: "1985"
    },
    {
      q: "What were Liam and Maya assigned to do at the observatory?",
      options: [
        "Restore the telescope lenses",
        "Catalog and organize artifacts",
        "Paint the observatory walls",
        "Write a visitor’s guide"
      ],
      answer: "Catalog and organize artifacts"
    },
    {
      q: "What number was inscribed on the small key Liam discovered?",
      options: ["101", "102", "103", "104"],
      answer: "103"
    },
    {
      q: "Where in the office was the safe located?",
      options: [
        "Under the old wooden desk",
        "Behind a heavy velvet curtain",
        "Next to the office door",
        "Beneath a pile of boxes"
      ],
      answer: "Behind a heavy velvet curtain"
    },
    {
      q: "What item was found inside the small wooden chest?",
      options: [
        "An ancient photograph",
        "A set of astronomy notes",
        "The missing brass star chart",
        "A letter from the director"
      ],
      answer: "The missing brass star chart"
    }
  ]
},
   {
  title: "The Micro-Contamination",
  text: `Dr. Chen was a well-known microbiologist who worked inside the Level 4 laboratory on the third floor of the Helios Research Building. Every surface in the lab gleamed from constant sterilization, and the air hummed quietly through the filtered vents. Her current project involved isolating the rare Zeta-9 protein, a compound that could revolutionize medical treatment. The experiment required an exact temperature of minus forty degrees Celsius, maintained at all times. At precisely ten o’clock in the morning, the emergency alarm suddenly blared through the facility. Red lights flashed as the digital display above the containment unit turned crimson, signaling a cooling system failure. Without hesitation, Dr. Chen sealed her active samples into a backup cold box, which could hold the required temperature for two hours. A faint layer of gray dust caught her eye on the emergency ventilation grid, something she hadn’t noticed before. Her instincts told her that contamination might be possible. She reached for her communication radio and immediately contacted the security desk to report the alert. According to strict laboratory procedure, any power-related emergency had to be reported first to the chief engineer, Mr. Ramirez. She gave him a concise update and requested immediate technical support. As she waited, Dr. Chen initiated the decontamination cycle to prevent cross-contamination. She retrieved the specialized UV light wand from beneath her stainless-steel workstation and slowly passed it over every nearby surface. The room glowed faintly purple under the ultraviolet beam. The harsh alarm quieted as the system switched to secondary power. Finally, the cold box stabilized at the correct temperature once more. Dr. Chen exhaled deeply, feeling the tension fade. She recorded every event in her lab log, ending her entry with one final note: “Crisis contained — samples safe.”`,
  questions: [
    {
      q: "On which floor of the Helios Research Building was the Level 4 laboratory located?",
      options: ["First floor", "Second floor", "Third floor", "Fourth floor"],
      answer: "Third floor"
    },
    {
      q: "What rare protein was Dr. Chen attempting to isolate during her experiment?",
      options: ["Alpha-1 protein", "Beta-5 protein", "Gamma-7 protein", "Zeta-9 protein"],
      answer: "Zeta-9 protein"
    },
    {
      q: "What was the precise temperature required to maintain the experiment?",
      options: ["0°C", "−10°C", "−25°C", "−40°C"],
      answer: "−40°C"
    },
    {
      q: "Who was the person Dr. Chen was required to contact first in a power-related emergency?",
      options: [
        "Security personnel",
        "The laboratory assistant",
        "The director of research",
        "Mr. Ramirez, the chief engineer"
      ],
      answer: "Mr. Ramirez, the chief engineer"
    },
    {
      q: "Which tool did Dr. Chen use to perform the decontamination process?",
      options: [
        "A chemical disinfectant spray",
        "A specialized UV light wand",
        "An electrostatic air cleaner",
        "A vacuum filtration unit"
      ],
      answer: "A specialized UV light wand"
    }
  ]
},
    {
  title: "The Lighthouse Keeper's Schedule",
  text: `Elias had watched over the remote Pointe D’Or Lighthouse for eleven steady years. Each day began with precision, his schedule as constant as the tide. At exactly 4:30 in the afternoon, he activated the main generator that powered the great lamp. The light revolved three times per minute, casting its sweeping beam across the restless sea. Its brightness measured a striking fifty thousand lumens, bright enough to pierce the thickest fog. The tower itself rose sixty-five meters into the air, a column of weathered stone and iron. Inside were three hundred and ten metal steps, which Elias climbed twice daily to ensure every system worked properly. Though the task was grueling, he found comfort in the routine rhythm of maintenance and solitude. On Tuesday evening, a heavy blanket of fog drifted in just as the sun disappeared beneath the horizon. Recognizing the danger to nearby ships, Elias switched on the secondary warning system. The loud aerosol horn echoed across the coastline, its sound vibrating through the misty air. The horn was housed inside a small stone structure located fifty feet north of the lighthouse itself. After verifying the system’s operation, Elias returned to his small office at the base of the tower. In his leather-bound logbook, he wrote that the horn’s compressor would soon need an oil change within five days. As he finished the note, he glanced up at the glowing light circling above the sea. Satisfied, he descended the stairs slowly, the metal steps creaking under his boots. Once on the ground floor, he prepared a simple dinner of stew and black coffee. Outside, waves struck the rocks in rhythmic crashes. Elias smiled faintly, knowing his watchful light would keep sailors safe through the night.`,
  questions: [
    {
      q: "For how many years had Elias worked as the keeper of the Pointe D’Or Lighthouse?",
      options: ["Seven years", "Nine years", "Eleven years", "Thirteen years"],
      answer: "Eleven years"
    },
    {
      q: "At what exact time did Elias begin his daily duties by starting the primary generator?",
      options: ["4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM"],
      answer: "4:30 PM"
    },
    {
      q: "How many metal steps did Elias climb in the lighthouse during his maintenance rounds?",
      options: ["155 steps", "250 steps", "300 steps", "310 steps"],
      answer: "310 steps"
    },
    {
      q: "What specific event caused Elias to activate the secondary warning system on Tuesday?",
      options: ["A rainstorm", "A power failure", "A dense fog", "A lightning strike"],
      answer: "A dense fog"
    },
    {
      q: "What was located inside the small stone building north of the tower?",
      options: [
        "The emergency radio transmitter",
        "The primary generator",
        "The aerosol warning horn",
        "The oil supply tank"
      ],
      answer: "The aerosol warning horn"
    }
  ]
    },
    {
  title: "The Cafe Confession",
  text: `Eliza, a diligent high school senior, worked every Saturday at the "Corner Perk" café. The cozy café sat directly across from the old town library, filling the air with the scent of espresso and books. For months, Eliza had admired Leo, a quiet boy who always ordered a double espresso and sat at the same window seat — Table 4. He rarely spoke more than a few polite words, yet his calm presence intrigued her. On a rainy Tuesday afternoon, Leo visited as usual, reading a worn paperback while sipping his drink. When he left, Eliza noticed something unusual under his coffee mug — a folded note instead of a tip. The paper was blue and checkered, neatly creased into a small square. Her curiosity grew, but she waited until her shift ended at exactly 5:30 PM before picking it up. Behind the counter, she unfolded it with trembling hands. The message inside contained only four handwritten words: "Meet me tomorrow? Central Park." Her heart raced as she reread it, unsure if it was meant for her. She checked the café’s schedule on the clipboard near the register. To her relief, she discovered that she had Wednesday off. Eliza tucked the note carefully into her apron pocket, afraid someone might see. She smiled faintly as she began cleaning the glass pastry display case, lost in thought. The rhythmic clinking of dishes seemed to echo her excitement. Outside, the library lights reflected softly on the café windows. Eliza wondered what tomorrow might bring, as the blue note rested quietly in her pocket.`,
  questions: [
    { q: "What is the name of the café where Eliza works?", options: ["Corner Perk", "The Daily Grind", "The Espresso Spot", "The Library Bean"], answer: "Corner Perk" },
    { q: "Which table did Leo always choose when visiting the café?", options: ["Table 1", "Table 2", "Table 4", "Table 8"], answer: "Table 4" },
    { q: "How many handwritten words were on the note Leo left?", options: ["Three", "Four", "Five", "Six"], answer: "Four" },
    { q: "What time did Eliza's shift end?", options: ["4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM"], answer: "5:30 PM" },
    { q: "What was the color and pattern of the note's paper?", options: ["White lined paper", "Yellow legal paper", "Blue checkered paper", "Green receipt paper"], answer: "Blue checkered paper" }
  ]
},
{
  title: "The Forgotten Festival",
  text: `Zara had been planning her first date with Ben for weeks. The two had chosen to meet at the town’s annual Summer Solstice Festival, one of the year’s most anticipated events. The festival was set for Friday evening at the historic Riverside Amphitheater. Colorful lanterns, live music, and food stalls were already being advertised all over town. Zara had suggested they meet near the large oak tree beside the ticket booth at exactly 5:45 PM. On Thursday morning, she brewed coffee and opened her laptop to check the local news site. Her smile quickly faded when she saw a red headline: “Power Failure Forces City-Wide Event Cancellations.” The article confirmed her worst fear — the Festival had been canceled entirely. It stated that the event would not be rescheduled this year due to safety risks. Zara sighed and immediately typed out a text message to Ben explaining the situation. After several minutes without a reply, she remembered that Ben didn’t own a cellphone. He preferred email and usually checked it only once a day in the morning. Without wasting time, Zara grabbed her bag and walked two blocks to the public library. She logged onto a computer and composed a quick message, suggesting a new meeting place. Instead of the festival, she proposed the "Blue Comet Diner" at the same time they had originally planned. Feeling slightly nervous, she clicked send and hoped Ben would read it in time.`,
  questions: [
    { q: "What was the name of the annual event Zara and Ben planned to attend?", options: ["The Harvest Moon Fair", "The Spring Bloom Festival", "The Summer Solstice Festival", "The Autumn Equinox Event"], answer: "The Summer Solstice Festival" },
    { q: "At what time were Zara and Ben supposed to meet?", options: ["5:30 PM", "5:45 PM", "6:00 PM", "6:15 PM"], answer: "5:45 PM" },
    { q: "What was the original venue for the festival?", options: ["Town Square", "Community Center", "Riverside Amphitheater", "Central Park Pavilion"], answer: "Riverside Amphitheater" },
    { q: "What caused the festival to be canceled?", options: ["Bad weather", "A city-wide power failure", "Lack of performers", "Low attendance"], answer: "A city-wide power failure" },
    { q: "What was the new meeting place Zara suggested?", options: ["The library", "The café", "The Blue Comet Diner", "The oak tree"], answer: "The Blue Comet Diner" }
  ]
},
{
  title: "The Arboretum Heist",
  text: `Late Sunday night, a rare plant vanished from the National Arboretum in Oakhaven. The stolen specimen was the Peruvian Blue Orchid, valued at over fifty thousand dollars. It had been kept in a tightly sealed tropical greenhouse labeled Zone C. Security footage later revealed a masked figure entering the zone at exactly 2:15 AM. The intruder left only five minutes later, carrying a small bundle. Investigators discovered that the thief had cleverly disabled the main motion sensor. A reflective foil had been placed over it to block detection. The orchid was kept in a terracotta pot labeled 33-A, part of a rare botany collection. Detective Miller, leading the case, arrived at the scene just after dawn. He noted that the service entrance door showed no signs of forced entry. The lock had been opened cleanly, suggesting insider knowledge. The police chief held a press conference later that day. He urged the public to watch for a suspicious black utility van seen leaving the arboretum grounds. The greenhouse was immediately sealed off for further investigation. Maintenance staff were interviewed about missing access cards. As of Monday morning, the tropical wing remained closed to visitors. The Peruvian Blue Orchid, once a centerpiece of the exhibit, was now a mystery of its own.`,
  questions: [
    { q: "Which rare plant was stolen from the arboretum?", options: ["Asian Jade Vine", "Amazon Red Carnation", "Peruvian Blue Orchid", "Himalayan White Rose"], answer: "Peruvian Blue Orchid" },
    { q: "At what time did the thief enter Zone C?", options: ["1:45 AM", "2:00 AM", "2:15 AM", "2:30 AM"], answer: "2:15 AM" },
    { q: "How was the motion sensor disabled?", options: ["By cutting the wires", "By covering it with reflective foil", "By pouring water over it", "By switching off the power"], answer: "By covering it with reflective foil" },
    { q: "What was the accession number on the terracotta pot?", options: ["22-B", "33-A", "44-C", "55-D"], answer: "33-A" },
    { q: "What vehicle did police identify leaving the arboretum?", options: ["Silver sedan", "Red pickup truck", "Black utility van", "White hatchback"], answer: "Black utility van" }
  ]
},
{
  title: "The Lab Equipment Order",
  text: `Dr. Simmons, a dedicated chemistry professor, began preparing for the new semester early. His goal was to make sure the organic chemistry lab was fully stocked before classes started. On Monday, August 14th, he completed an official order form and sent it to the university’s purchasing department. The order listed three major items essential for the upcoming experiments. First, he requested six brand-new magnetic stirring plates, identified by the code MS-400. Second, he ordered a large fume hood filter, model FH-90XL, with a precise cost of one thousand two hundred fifty dollars. Third, he included twelve boxes of disposable nitrile gloves, all in medium size for student use. Later that day, the vendor confirmed the order by email. However, the message contained unexpected news — the stirring plates were on backorder. Their new shipping date was set for September 1st. Dr. Simmons recalculated the total cost of the items that would arrive on time. It came to one thousand five hundred eighty dollars, excluding the delayed plates. Concerned about the upcoming experiments, he immediately contacted his teaching assistant, Maria. He asked her to borrow a few stirring plates temporarily from the Physics Department. Within two hours, Maria replied that she had secured four plates on loan. Dr. Simmons thanked her and updated his laboratory inventory list. By the end of the day, he felt relieved that the semester would begin smoothly despite the delay.`,
  questions: [
    { q: "On what date did Dr. Simmons send the order form?", options: ["August 1st", "August 7th", "August 14th", "August 21st"], answer: "August 14th" },
    { q: "What was the item number for the magnetic stirring plates?", options: ["MS-200", "MS-350", "MS-400", "MS-550"], answer: "MS-400" },
    { q: "How much did the model FH-90XL fume hood filter cost?", options: ["$950", "$1,100", "$1,250", "$1,580"], answer: "$1,250" },
    { q: "What size gloves did Dr. Simmons order for the lab?", options: ["Small", "Medium", "Large", "Extra Large"], answer: "Medium" },
    { q: "When were the stirring plates expected to ship?", options: ["August 20th", "August 30th", "September 1st", "September 5th"], answer: "September 1st" }
  ]
},
{
  title: "The Ferry Route Change",
  text: `Every weekday morning, hundreds of commuters boarded the ferry called The Mariner’s Daughter. The vessel was known for its reliability and scenic route through the harbor. Its usual departure time from Pier 3 was precisely 7:00 AM. The route made three scheduled stops: North Point, Heron’s Bay, and finally, Seagull Island. On this particular morning, Captain Reyes received an urgent message from the Port Authority at 6:30 AM. A coastal storm overnight had severely damaged the docking facilities at Heron’s Bay. As a result, the Port Authority instructed all ferries to skip that stop until repairs were finished. The updated route would only include North Point and Seagull Island. This adjustment reduced the total travel time by about forty-five minutes. A new schedule was immediately issued to passengers waiting at the terminal. It stated that all morning ferries would temporarily use Pier 5 instead of Pier 3. Bright orange electronic signs were placed across the harbor to guide commuters. The departure time, however, remained the same at 7:00 AM. Captain Reyes ensured that the crew made an announcement over the intercom before departure. The passengers appreciated the clarity and boarded in an orderly fashion. As the ferry pulled away from the dock, sunlight broke through the clouds, glinting off the calm water.`,
  questions: [
    { q: "What was the name of the daily commuter ferry?", options: ["The Seagull Express", "The North Point Star", "The Mariner's Daughter", "The Harbor Queen"], answer: "The Mariner's Daughter" },
    { q: "At what time did Captain Reyes receive the Port Authority notice?", options: ["6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM"], answer: "6:30 AM" },
    { q: "Which stop was canceled due to storm damage?", options: ["North Point", "Heron's Bay", "Seagull Island", "Pier 3"], answer: "Heron's Bay" },
    { q: "How much travel time was reduced after the route change?", options: ["15 minutes", "30 minutes", "45 minutes", "60 minutes"], answer: "45 minutes" },
    { q: "Which pier did the ferry use after the schedule change?", options: ["Pier 1", "Pier 3", "Pier 5", "Pier 7"], answer: "Pier 5" }
  ]
},
{
  title: "The Cargo Manifest",
  text: `Captain Kai stood on the deck of The Southern Cross, reviewing the final loading checklist. The freighter was preparing for a long transatlantic journey to the port of Rotterdam. Stacks of colorful cargo containers lined the dock under the bright afternoon sun. The main shipment consisted of 500 containers of frozen seafood and 250 containers of vehicle parts. According to the manifest, the vessel’s maximum weight capacity was 45,000 metric tons. The scheduled departure time was set for 2:00 PM on Wednesday. Chief Engineer Lena approached with a maintenance report in hand. Earlier that morning, she had detected a minor issue with the starboard engine’s cooling system. Her team managed to fix it by exactly 11:00 AM. Captain Kai carefully checked the entry and signed off on the final safety log at noon. The crew, totaling 22 members including four officers, gathered for a short briefing. Everyone reviewed their assigned duties for the voyage. The final cargo addition was a small sealed crate labeled “navigational equipment.” It was carefully secured on the main deck next to the bridge. As the harbor bell rang, the engines roared to life. The Southern Cross slowly began to drift away from the pier, embarking on its journey across the Atlantic.`,
  questions: [
    { q: "What was the name of the freighter preparing for departure?", options: ["The Atlantic Star", "The Northern Lights", "The Southern Cross", "The Rotterdam Flyer"], answer: "The Southern Cross" },
    { q: "What was the total weight capacity of the vessel?", options: ["30,000 metric tons", "35,000 metric tons", "40,000 metric tons", "45,000 metric tons"], answer: "45,000 metric tons" },
    { q: "What time did Chief Engineer Lena complete the repair?", options: ["10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM"], answer: "11:00 AM" },
    { q: "How many containers of frozen seafood were loaded?", options: ["250", "400", "500", "750"], answer: "500" },
    { q: "Where was the crate of navigational equipment placed?", options: ["In the engine room", "Below deck in storage", "On the main deck beside the bridge", "In the captain's quarters"], answer: "On the main deck beside the bridge" }
  ]
},
{
  title: "The Museum Transfer",
  text: `The city’s historical museum was buzzing with quiet anticipation on Tuesday morning. After years of planning, it was finally time to move the Byzantine artifact collection into the new wing. The transfer was set to begin promptly at 9:00 AM. Head Curator Dr. Helen Chao personally oversaw the process, clipboard in hand. Each item was handled with extreme care by trained professionals. The most valuable piece, the Crown of Emperor Leo III, was the first to be moved. It was placed inside a custom titanium containment box lined with protective foam. Ten uniformed security guards escorted the transport team as they crossed the museum courtyard. The path to the new climate-controlled wing had been cleared and closed to the public. From Monday evening onward, all visitor access to the West Wing was suspended. The operation plan stated that the move would take no longer than six hours. Dr. Chao double-checked each security code as the crates arrived in the new facility. The upgraded wing featured a three-factor biometric lock system — fingerprint, retinal scan, and security pin. This was a significant improvement from the old keycard-only access. Technicians monitored humidity and temperature readings in real time. By 3:00 PM, the transfer was complete without a single mishap. Dr. Chao smiled proudly, knowing the city’s treasures were now safer than ever.`,
  questions: [
    { q: "What type of artifacts were being transferred?", options: ["Egyptian", "Roman", "Byzantine", "Greek"], answer: "Byzantine" },
    { q: "On what day did the transfer begin?", options: ["Monday", "Tuesday", "Wednesday", "Thursday"], answer: "Tuesday" },
    { q: "What was the name of the most valuable artifact?", options: ["The Scepter of Constantine", "The Ring of Empress Irene", "The Crown of Emperor Leo III", "The Orb of Basil"], answer: "The Crown of Emperor Leo III" },
    { q: "How many security guards escorted the transfer?", options: ["Five", "Eight", "Ten", "Twelve"], answer: "Ten" },
    { q: "What time was the transfer scheduled to start?", options: ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM"], answer: "9:00 AM" }
  ]
},
  {
    title: "Sofia’s Cooking Class",
    text: "Sofia entered the kitchen, apron tied and notebook ready. The instructor explained how to measure ingredients correctly. Students baked bread and prepared simple meals. Sofia carefully mixed, kneaded, and baked her dough. Her classmates tasted each other’s dishes and gave feedback. The instructor showed them how to make pasta sauces. Sofia wrote down recipes to try at home. After cooking, they cleaned the kitchen and stored utensils. Parents attended a showcase to see the students’ work. Sofia received a certificate for completing the course. She felt confident in her cooking skills. The class taught her patience and precision. Sofia dreamed of opening a bakery someday. She practiced the recipes at home during weekends. Cooking made her feel accomplished and creative.",
    questions: [
      { q: "What did Sofia wear in class?", options: ["Apron", "Gloves", "Hat", "Shoes"], answer: "Apron" },
      { q: "What was taught first?", options: ["Measuring ingredients", "Washing dishes", "Cleaning", "Shopping"], answer: "Measuring ingredients" },
      { q: "What type of food did they prepare?", options: ["Pasta and bread", "Soup", "Salad", "Rice"], answer: "Pasta and bread" },
      { q: "Who attended the showcase?", options: ["Parents", "Friends", "Teachers", "Tourists"], answer: "Parents" },
      { q: "What did Sofia dream of doing?", options: ["Bakery owner", "Teacher", "Scientist", "Singer"], answer: "Bakery owner" }
    ]
  }
],
    inferential: [
      {
        title: "The Lost Puppy",
        text: `Maya was walking home from school on a cool, overcast afternoon when she noticed something small and shivering beneath a park bench. At first she thought it was a pile of leaves, but as she drew closer she saw a tiny puppy curled up with damp fur and trembling paws. The puppy’s eyes darted nervously when a dog barked across the street. Maya sat down and spoke softly, offering half of her sandwich until the puppy relaxed enough to eat. She wrapped it gently in her jacket and stroked its head while thinking about where it might have come from. When neighbors said no one nearby had lost a pet, Maya felt both worried and determined. At home her parents agreed to let her care for the puppy temporarily while they checked for a collar or microchip. Maya made a poster with a simple drawing and placed it on nearby lamp posts, knocked on doors, and took a picture to post in a neighborhood group online. She also learned to feed the puppy small amounts often and to keep it warm inside a box with blankets. As days passed without a reply from an owner, Maya began to name the puppy and notice tiny habits: how it favored a particular corner for naps and how it fetched in a clumsy, joyful way. Visiting the vet taught her about vaccinations and keeping a pet safe, and her family discussed whether they could commit to caring for it long-term. The experience changed Maya: she started to plan for responsibility, budgeting for food and veterinary care, and considering chores she'd adjust to help. She also saw how a small act—sharing her sandwich—had led to a deeper sense of connection and care. By the end of the week, Maya had developed patience, empathy, and a clearer sense of what it takes to look after another living being.`,
        questions: [
          { q: "Why might the puppy have been trembling and nervous when Maya first found it?", keywords: ["cold","scared","new environment"] },
          { q: "What do Maya's actions (feeding, wrapping, posting posters) suggest about her character?", keywords: ["caring","responsible","proactive"] },
          { q: "Why did Maya’s family agree to care for the puppy temporarily, based on details in the passage?", keywords: ["check owner","vet","temporary care"] },
          { q: "What can be inferred about how Maya’s view of responsibility changed over the week?", keywords: ["plan","budget","chore adjustment"] },
          { q: "How does the passage show that small actions can lead to larger outcomes?", keywords: ["sandwich","connection","care"] }
        ]
      },
      {
        title: "The Mysterious Note",
        text: `David found a crumpled note on his school desk that read, "Meet me near the old oak after class." The handwriting looked hurried but friendly. Curiosity tugged at him; he wondered who left the note and why they wanted to meet secretly. After class he waited, watching other students leave and the playground settle into quiet. Beneath the oak he discovered a small wooden box with a note that contained a simple riddle and a folded paper inside. Solving the riddle revealed a hidden kindness box where students were asked to leave one positive note for someone else in school. David felt a strange mix of excitement and responsibility. He decided to help organize the project, making more notes and a small sign explaining the box’s purpose. As more students participated, the box filled with messages of encouragement and thanks. Teachers noticed changes in the hallway, students smiling more and offering compliments during breaks. David realized that the person who left the note probably wanted to create a ripple effect of kindness and connection without seeking attention. Later, when the mystery note's writer revealed themselves—a shy student who wanted to help others—David understood the quiet courage it took to start something small. The experience taught him about leadership that works by inviting others in, and how small creative acts can change a school’s atmosphere when people choose to participate.`,
        questions: [
          { q: "What can you infer about the person who left the note under the oak tree?", keywords: ["shy","thoughtful","creative"] },
          { q: "Why did the kindness box idea likely make other students more willing to participate?", keywords: ["invite","safe","positive"] },
          { q: "What does David’s reaction (helping organize) reveal about his values?", keywords: ["involved","encouraging","community"] },
          { q: "How does the passage suggest small, anonymous actions can affect a school environment?", keywords: ["ripple","smile","atmosphere"] },
          { q: "What larger lesson about leadership does the story imply?", keywords: ["invite others","lead by example","quiet courage"] }
        ]
      },
      {
        title: "The Gardening Challenge",
        text: `Ella’s class was assigned a narrow strip of land beside the school fence for a gardening challenge. At first the space looked poor—rocky soil, little sun in parts, and a few students doubting anything could grow there. Ella suggested building vertical planters and using recycled containers to maximize space. She drew simple sketches and explained how layering and composting could help plants thrive. Gradually, classmates who complained began helping because the plan was practical and easy to try. They measured sunlight, rotated pots, and noted which plants grew best. Every day they watered carefully and removed weeds; they recorded growth in a class notebook and adjusted their plan when problems appeared. When pests ate some leaves, they researched natural repellents and made a compost tea to strengthen the soil. Over weeks the patch transformed: lush tomato vines, rows of herbs, and bright lettuce heads proved that effort and adaptation worked. Teachers praised the class for teamwork and creative problem solving. The project showed how planning, persistence, and small experiments yield progress. Students who doubted at the start felt proud when the plants produced vegetables for their school kitchen. Ella learned that leadership is not only giving instructions but listening, explaining, and adjusting. The experience taught the class to value evidence, to test ideas, and to celebrate gradual gains.`,
        questions: [
          { q: "Why did Ella’s practical plan help convince classmates to participate?", keywords: ["practical","clear","accessible"] },
          { q: "What can you infer about the role of trial-and-error in the garden’s success?", keywords: ["test","adjust","learn"] },
          { q: "How did teamwork contribute to the end result, beyond individual work?", keywords: ["share tasks","support","record"] },
          { q: "What does the garden reveal about leadership and listening?", keywords: ["listen","explain","adjust"] },
          { q: "Why might students who doubted at first feel more confident later?", keywords: ["evidence","results","pride"] }
        ]
      },
      {
        title: "The Forgotten Book",
        text: `Liam loved the stillness of the local library and often wandered between the stacks. One damp afternoon he noticed a faded book hidden behind newer titles; its pages were thin and edges yellowed. Curious, he opened it and discovered stories of community members who had quietly helped others in small but meaningful ways. Liam read stories of people who fixed a neighbor’s fence, taught a skill to a child, or organized local clean-ups. The tone of the stories was humble—no one sought recognition—but each account connected to lessons about kindness, history, and local pride. Liam felt inspired to share these tales, so he began a simple blog telling the stories with short summaries and photos of the places mentioned. Readers responded, sending notes about relatives and local memories, and some offered additional stories. The blog encouraged conversations about the town’s past and prompted people to reconnect with elders who remembered events long ago. Liam discovered that paying attention to overlooked details could lead to meaningful community projects and that sharing stories could spur others to act. As the blog grew, Liam practiced checking facts, asking permission to post memories, and thinking about how stories shape identity. The experience taught him that curiosity, respect, and follow-through can turn a quiet discovery into positive social change.`,
        questions: [
          { q: "What motivated Liam to share the old book’s stories rather than keep them private?", keywords: ["inspire","share","connect"] },
          { q: "What can you infer about the type of heroes in the book and why they were forgotten?", keywords: ["humble","quiet","local"] },
          { q: "How did Liam’s actions change the community’s connection to its past?", keywords: ["reconnect","stories","memory"] },
          { q: "What larger idea does the passage suggest about paying attention to the overlooked?", keywords: ["notice","value","action"] },
          { q: "Why is respect and permission important when sharing others’ memories?", keywords: ["permission","respect","accuracy"] }
        ]
      },
      {
  title: "The Rainy Day",
  text: `During a heavy rain, Michael noticed his neighbor struggling to carry groceries without an umbrella. Without hesitation, he ran outside and offered to help, carrying some bags to the doorstep. The neighbor thanked him warmly and invited him in for a cup of tea. Michael felt satisfied and realized that small gestures could make a meaningful difference. Later, as the rain continued, he saw an elderly neighbor trying to shovel water from her yard. He went to help her, ensuring the water did not flood her home. Each time he acted, Michael felt happier and more aware of the people around him. That evening, he reflected in his journal about the importance of noticing opportunities to help others. Michael realized that kindness often spreads when people act selflessly. He thought about times he had received help and how it had impacted him. The experience inspired him to continue looking for ways to serve his community. Michael understood that even small actions could have ripple effects. He made a mental note to teach his younger siblings the value of empathy. By helping others, he felt a stronger sense of belonging and purpose. Michael’s day had started like any other but ended with lessons in generosity and awareness. He smiled, knowing that his simple actions had improved someone else’s day. Michael promised himself to always act when he sees a chance to help, rain or shine.`,
  questions: [
    { q: "Why do you think Michael helped his neighbors without hesitation?", keywords: ["kindness", "empathy", "selfless", "caring", "helpful"] },
    { q: "What can we infer about Michael’s personality from his actions?", keywords: ["compassionate", "thoughtful", "helpful", "empathetic", "kind"] },
    { q: "How does the story show the impact of small acts of kindness?", keywords: ["positive", "difference", "influence", "chain", "ripple", "effect"] },
    { q: "What lesson can be drawn about noticing others’ needs?", keywords: ["awareness", "empathy", "help", "understanding", "community"] },
    { q: "How can this story encourage you to act in your own community?", keywords: ["volunteer", "help", "serve", "kindness", "good deeds"] }
  ]
},
{
  title: "The School Debate",
  text: `Lina’s school held a debate competition on environmental conservation. Lina was nervous because it was her first time speaking in front of a large audience. She spent weeks preparing, researching facts and practicing her arguments. On the day of the debate, she listened carefully to other speakers and took notes. When it was her turn, she spoke confidently and presented her points clearly. Even though she made a few minor mistakes, she remained composed throughout her speech. Teachers praised her preparation, clarity, and poise despite not winning first place. Lina reflected that success is not only about winning but also about learning and growth. She realized that facing challenges builds confidence and resilience. During the discussion, she also noticed the importance of listening to others’ perspectives. Lina’s teammates supported her and celebrated their collective effort. She understood that teamwork and encouragement are as valuable as individual achievements. The experience motivated her to participate in more competitions in the future. Lina felt proud of herself for trying her best and handling pressure well. She learned that preparation, courage, and reflection are key to personal development. By the end of the day, Lina felt more confident in her abilities. The debate taught her that learning from experience is more meaningful than simply earning a trophy.`,
  questions: [
    { q: "What can we infer about Lina’s attitude toward challenges?", keywords: ["brave", "positive", "growth", "confidence", "learning"] },
    { q: "How did preparation affect Lina’s performance?", keywords: ["confidence", "ready", "clear", "practice", "prepared"] },
    { q: "Why was Lina praised even though she didn’t win?", keywords: ["effort", "confidence", "composure", "clarity", "poise"] },
    { q: "What lesson can be drawn about success and personal growth?", keywords: ["learning", "growth", "experience", "effort", "resilience"] },
    { q: "How could this story motivate you to handle your own challenges?", keywords: ["courage", "practice", "confidence", "resilience", "learn"] }
  ]
},
{
  title: "The Mystery Garden",
  text: `Alex discovered an overgrown garden behind his school. Curious, he started clearing weeds and planting flowers with a few friends. Initially, some students thought it was too much work and preferred to stay away. Alex encouraged them, explaining how beautiful the garden could become with teamwork. Over several weeks, the garden transformed into a relaxing and colorful space. More students joined voluntarily, bringing seeds and tools. Teachers praised the initiative and even suggested using the garden for outdoor lessons. The garden became a peaceful place for reading, studying, and socializing. Alex realized that taking small actions could inspire others to join and contribute. The project taught him about cooperation, responsibility, and perseverance. Students learned to care for their environment and appreciate nature. The garden also created a sense of pride and ownership among the participants. Alex felt accomplished, knowing that their efforts had improved the school community. He noted that leading by example often motivates people more than instructions or rules. By the end of the term, the garden had become one of the school’s most cherished spaces. The experience showed that positive change is possible when people act together with dedication.`,
  questions: [
    { q: "Why did Alex decide to clean the garden despite its poor condition?", keywords: ["initiative", "care", "improvement", "motivation", "responsibility"] },
    { q: "What can we infer about the effect of leadership by example?", keywords: ["inspire", "motivate", "encourage", "influence", "example"] },
    { q: "How did the garden impact the school community?", keywords: ["unity", "beauty", "teamwork", "environment", "pride"] },
    { q: "What lesson does the story suggest about taking initiative?", keywords: ["leadership", "responsibility", "start", "motivation", "change"] },
    { q: "How could you apply Alex’s approach to improve your own environment?", keywords: ["lead", "clean", "improve", "teamwork", "community"] }
  ]
},
{
  title: "The Music Competition",
  text: `Jamal had been practicing the piano for months for a school competition. On the day of the event, he felt nervous, and his hands trembled slightly. When he began performing, he forgot a few notes but continued playing confidently. The audience applauded, and judges appreciated his courage and musical expression. Jamal realized that persistence and resilience were more important than perfection. He reflected on past mistakes and understood they had helped him improve. Even though he didn’t win first place, he felt proud of his effort. Jamal noticed that the experience taught him patience and focus. He resolved to keep practicing, knowing improvement comes gradually. His friends congratulated him and encouraged him to participate again next year. Jamal felt motivated and inspired to challenge himself further. He understood that overcoming nervousness and mistakes is part of growth. The judges’ feedback highlighted his strengths and areas to improve. Jamal left the stage feeling accomplished and ready for future competitions. He learned that confidence and determination matter more than flawless performance.`,
  questions: [
    { q: "What can we infer about Jamal’s attitude toward mistakes?", keywords: ["learning", "growth", "accept", "improve", "resilience"] },
    { q: "How did Jamal demonstrate resilience during his performance?", keywords: ["continue", "confidence", "did not stop", "determination", "courage"] },
    { q: "What lesson does the story suggest about preparation versus perfection?", keywords: ["effort", "growth", "persistence", "learning", "improvement"] },
    { q: "Why was Jamal still appreciated despite forgetting notes?", keywords: ["confidence", "courage", "expression", "effort", "attitude"] },
    { q: "How can this story inspire you to face challenges in your own life?", keywords: ["resilience", "courage", "confidence", "growth", "persistence"] }
  ]
},
      {
        title: "The Late Train",
        text: `Sara was late and running toward the platform when she saw the train’s doors begin to close. A man behind her reached out and guided her forward so she could make it onboard. She glanced back but he had already stepped away, refusing any thanks beyond a small wave. On the ride home she wondered about the man’s decision to help a stranger with no expectation of reward. The incident stayed with her, and during the following week she found herself offering help to a classmate who had lost a notebook and to a neighbor carrying boxes. Each time she acted, she remembered the man’s simple, quiet kindness and felt motivated to pass it on. Later, during a school discussion, she shared the story and encouraged others to try small unexpected help. The teacher suggested that small acts can influence culture by modeling generosity. Some classmates tried it and noticed small changes—less rushing, more helpfulness—during hallway traffic between classes. Sara learned that one unheralded act can shift attitudes when it is noticed and repeated, and that people often help simply because they see a need and act. The story suggests that kindness doesn’t require ceremony—an everyday action can matter profoundly.`,
        questions: [
          { q: "What can be inferred about the man who helped Sara onto the train?", keywords: ["selfless","observant","calm"] },
          { q: "Why did Sara start helping others after the incident?", keywords: ["inspired","remembered","pay forward"] },
          { q: "What does the passage suggest about how small acts change group behavior?", keywords: ["model","repeat","culture"] },
          { q: "How does noticing needs relate to being kind, according to the passage?", keywords: ["observe","act","help"] },
          { q: "What general conclusion about generosity does the passage imply?", keywords: ["simple","impactful","ripple"] }
        ]
      },
      {
  title: "The Missing Painting",
  text: `When the bell rang for art class, Serena noticed an empty frame hanging on the wall where her class’s favorite painting once was. The teacher, Mr. Gomez, looked concerned but calm as he explained that the artwork had gone missing overnight. The painting, called “Morning Fields,” had been created by last year’s graduating students. It was known for its warm colors and hopeful message. Serena and her classmates exchanged worried looks, wondering if someone had stolen it. During lunch, Serena overheard two students talking about a cleanup project happening in the storage room. Curious, she decided to help after school. As she sorted through old canvases and boxes, she spotted a familiar corner of yellow paint beneath a stack of unused frames. Carefully lifting it out, she realized it was the missing painting, dusty but unharmed. She brought it to Mr. Gomez, who smiled with relief and gratitude. He explained that the custodians had accidentally moved it while cleaning the walls. The class celebrated its return by hanging it back up and adding a new label: “Art Finds Its Way Home.” That evening, Serena reflected on how small acts of curiosity and initiative could make a big difference. She realized that problems aren’t always solved by waiting for others to act. Sometimes, paying attention and caring enough to investigate can restore something valuable. The incident reminded everyone that responsibility isn’t assigned — it’s chosen. Serena felt proud that she had helped, not for praise, but for the joy of doing what was right.`,
  questions: [
    { q: "What can we infer about Serena’s character based on her actions?", keywords: ["curious", "responsible", "helpful", "caring", "observant"] },
    { q: "Why was the painting important to the students and teacher?", keywords: ["symbolic", "memories", "meaningful", "pride", "connection"] },
    { q: "What lesson does Serena learn from finding the missing painting?", keywords: ["initiative", "responsibility", "effort", "care", "action"] },
    { q: "How did Serena’s decision to help after school make a difference?", keywords: ["solved", "found", "discovered", "helped", "restored"] },
    { q: "What message does the story suggest about taking responsibility?", keywords: ["ownership", "choice", "leadership", "initiative", "values"] }
  ]
},
  {
    title: "The Comet's Shadow",
    text: `Anya, a promising astrophysics intern, tracked the trajectory of a newly identified object called “Comet K.” Its orbital path was erratic, defying all established astronomical models. Her supervisor, Dr. Alston, dismissed her reports as a “simple instrument error.” Determined to prove her data valid, Anya recalibrated the sensors three separate times. Each time, the readings showed the same pattern — the comet was slowing down unnaturally near Sector 7. The region had long been marked as empty, but her calculations suggested a massive gravitational pull. When she presented the data again, Dr. Alston grew tense and evasive, refusing to authorize further investigation. Late that evening, Anya noticed restricted data files had been edited under Dr. Alston’s name. The edits aligned perfectly with the time her anomaly alerts appeared. The next day, she observed Dr. Alston taking private calls inside the soundproof server room. Suspicious, she redirected the telescope feed to a backup terminal only she could access. Hours later, her analysis revealed faint metallic emissions within the comet’s tail — evidence inconsistent with any known natural composition. The pattern suggested engineered alloys rather than cosmic dust. Realizing this, Anya concluded the object wasn’t slowing down — it was being pulled. Something in Sector 7 exerted a deliberate force, like a hidden machine or structure. Her discovery carried heavy implications about human secrecy or extraterrestrial technology. Afraid her data might be erased, Anya saved everything to an encrypted drive. She quietly backed up the evidence, knowing confrontation could cost her career. In the dim light of the control room, she looked toward the server room and understood that the real mystery wasn’t in the stars. The truth was buried in the silence that surrounded Dr. Alston’s guarded secrets.`,
    questions: [
      { q: "What does Dr. Alston’s repeated dismissal of Anya’s findings infer about his attitude toward new scientific evidence?", keyword: "denial or resistance" },
      { q: "What does Dr. Alston’s secrecy in the server room imply about his involvement?", keyword: "concealment or corruption" },
      { q: "What conflict does 'the truth buried in silence' suggest Anya is facing?", keyword: "moral dilemma or danger" },
      { q: "Why did Anya choose to encrypt her data instead of confronting Dr. Alston?", keyword: "self-preservation or caution" },
      { q: "What is Anya’s most likely conclusion about 'Comet K'?", keyword: "artificial or man-made object" }
    ],
  },
  {
    title: "The School Debate",
    text: `Lina’s school held a debate competition on environmental conservation. It was her first time addressing such a large audience. She practiced for weeks, perfecting her speech and researching her topic thoroughly. On the day of the competition, she listened to others carefully and took notes. When her turn arrived, she felt nervous but began speaking clearly and confidently. She forgot a line but recovered smoothly without panicking. Her teachers praised her confidence and effort even though she didn’t win. Lina realized that success was not just about victory but growth. She learned that facing fear builds character and strength. Her experience taught her that learning from mistakes is valuable. Lina’s classmates supported her, proud of her courage. She understood that success requires teamwork, preparation, and humility. Later, she reflected that failure is part of every journey. The competition inspired her to speak again in the future. She felt grateful for the lessons she learned. Her growth was not measured by the trophy but by her confidence. Lina left the event smiling, proud of herself. She now viewed challenges as opportunities to grow stronger. That day, she became not just a better speaker, but a braver person.`,
    questions: [
      { q: "What can we infer about Lina’s attitude toward challenges?", keyword: "resilience or courage" },
      { q: "How did preparation affect Lina’s performance?", keyword: "confidence or readiness" },
      { q: "Why was Lina praised even though she didn’t win?", keyword: "effort or growth" },
      { q: "What lesson can be drawn about success and failure?", keyword: "learning or development" },
      { q: "How can this story inspire you to face your own challenges?", keyword: "motivation or perseverance" }
    ],
  },
  {
    title: "The Mystery Garden",
    text: `Alex found an overgrown garden behind his school. Curious, he began clearing weeds and planting flowers. Some students laughed and ignored his effort. Alex stayed patient and hopeful, believing others would join once they saw results. Slowly, a few classmates started helping him. They planted seeds and brought tools from home. Teachers noticed and praised the teamwork. Over time, the garden became colorful and peaceful. It became a favorite spot for reading and relaxing. Alex realized that leadership means acting first, not commanding. His classmates learned that cooperation could transform their environment. The garden taught them patience and shared responsibility. It showed that positive change starts small. Students took pride in caring for the garden daily. Alex learned that one person’s vision could inspire many. The space became a symbol of their unity and effort. Even those who once mocked now admired the beauty. Alex felt proud knowing teamwork had built something lasting. He understood that real growth happens when everyone works together.`,
    questions: [
      { q: "Why did Alex decide to clean the garden despite others' doubt?", keyword: "initiative or determination" },
      { q: "What can we infer about leadership through Alex’s actions?", keyword: "example or inspiration" },
      { q: "How did teamwork affect the success of the garden?", keyword: "cooperation or unity" },
      { q: "What lesson can be learned about making positive change?", keyword: "action or persistence" },
      { q: "How can you apply Alex’s attitude to your own environment?", keyword: "responsibility or motivation" }
    ],
  },
  {
    title: "The Mariner’s Protocol",
    text: `Rhea, the youngest communications officer aboard the deep-sea vessel Triton, followed the Mariner’s Protocol: “Trust the data, not the surface.” For days, their sensors showed flat terrain, but faint vibrations pulsed through the hull. Captain Kael ignored them, ordering “silent running.” Rhea found this strange because silence wasn’t needed for research. When she checked old navigation charts, she saw a red-marked region called “Unmapped Echoes.” It was officially closed to all exploration. The vibrations matched a rhythmic pattern, like distant breathing. Rhea realized the data wasn’t wrong — it was filtered. Captain Kael was hiding something about their mission. The Triton wasn’t mapping the seafloor; it was testing something alive beneath it. Rhea hesitated to speak up, fearing she’d be silenced. She secretly stored copies of the sonar readings. That night, she overheard Kael whispering coordinates to someone off record. Her heart pounded with dread. The pattern below intensified, as if responding to them. Rhea understood she wasn’t just observing the unknown — she was being observed. Her loyalty to science now conflicted with her fear of truth.`,
    questions: [
      { q: "What deeper meaning can be inferred from 'Trust the data, not the surface'?", keyword: "truth or deception" },
      { q: "Why did the Captain enforce silence if this was only a research mission?", keyword: "secrecy or fear" },
      { q: "What does the filtered data suggest about their mission?", keyword: "cover-up or manipulation" },
      { q: "Why is the zone called 'Unmapped Echoes' significant?", keyword: "danger or hidden presence" },
      { q: "What change occurs in Rhea’s understanding by the end?", keyword: "realization or awareness" }
    ],
  },
    {
    title: "The Architect’s Silence",
    text: `After five years, Architect Kai finally stood before the bronze doors of the Centennial Archive — the building he had designed to symbolize transparency and accountability. The glass walls that once gleamed with promise were now coated in dust, blocking the view inside. The city council had praised his design as a symbol of democracy, yet Kai knew the truth behind its creation. His original blueprints contained a secret vault meant to hide politically sensitive artifacts. After receiving veiled threats from powerful officials, he erased its access points from the public plans. As he placed his hand on the cold bronze door, guilt settled heavily on his shoulders. The structure that was meant to represent openness had become a monument to secrecy. Kai realized he had compromised his principles for survival. The faint rectangular etch beneath his fingers marked the hidden vault’s entry. Memories of the warnings he received replayed in his mind — the whispered cautions to ‘forget what you drew.’ He wondered what lay behind those sealed walls now: truth, corruption, or history rewritten. The irony of his masterpiece was unbearable. He had built beauty around deceit. For the first time, Kai saw not an achievement, but a confession cast in steel and glass.`,
    questions: [
      { q: "What does the thick dust on the glass walls infer about the city's commitment to transparency?", keyword: "neglect or hypocrisy" },
      { q: "What do the veiled threats imply about the power behind the city's leadership?", keyword: "corruption or control" },
      { q: "How is the Archive's 'Transparent Design' ironic in the story's context?", keyword: "deception or secrecy" },
      { q: "What does Kai’s hesitation at the etched rectangle suggest about his internal conflict?", keyword: "guilt or regret" },
      { q: "What might the hidden vault symbolize about truth and morality?", keyword: "concealment or compromise" }
    ]
  },
  {
    title: "The Gallery Draft",
    text: `Maya, a young textile artist, was preparing her tapestry for the prestigious Kensington Gallery submission. Her friend Rhys, a talented but insecure architecture student, arrived unexpectedly the night before the deadline. He criticized the gallery’s outdated aesthetic and suggested they go to the observatory to watch a meteor shower. Maya noticed his eyes flicker toward her easel where a large note read, “Submission: 9 AM Tomorrow.” She also saw a smear of red paint on his shoe — the same color she used on her tapestry. Her instincts told her something was off. Rhys wasn’t trying to ruin her entry; he was distracting her. His tone, his glances, and his sudden visit all carried an unspoken plea. Maya smiled gently and agreed to go with him, but before leaving, she locked her tapestry in a travel tube. She understood his jealousy came from loneliness, not malice. At the observatory, under the meteor-lit sky, Rhys finally relaxed. Maya said nothing about the paint or the deadline. She knew he needed reassurance, not confrontation. In silence, their friendship found honesty again. The next morning, she submitted her work — complete and unbroken.`,
    questions: [
      { q: "What does Rhys’s criticism of the gallery infer about his feelings toward Maya’s success?", keyword: "jealousy or insecurity" },
      { q: "Why did Maya accept Rhys’s invitation despite her deadline?", keyword: "empathy or understanding" },
      { q: "What does Rhys’s glance toward the timeline suggest about his intentions?", keyword: "envy or distraction" },
      { q: "Why did Maya lock her tapestry before leaving?", keyword: "precaution or awareness" },
      { q: "What does their silent night under the meteor shower symbolize about their friendship?", keyword: "forgiveness or connection" }
    ]
  },
  {
    title: "The Tide’s Confession",
    text: `Elara and Finn had been rivals in marine biology throughout college, though mutual admiration lingered beneath the surface. Years later, Finn prepared for a research mission to the Arctic. Elara wanted to give him a farewell gift — a fossilized Nautilus shell, his favorite specimen. When she arrived at his lab, it was dark and empty. A single sentence on his whiteboard caught her eye: “Don’t trust the coordinates I gave you for the buoy.” His duffel bag sat untouched, yet his boat was missing. Outside, the tide churned unnaturally, pushing against the current. Elara’s instincts screamed that something was wrong. She realized Finn hadn’t left for the Arctic; he had gone out to verify the false coordinates himself. The note was both a warning and a plea. She gripped the Nautilus shell tightly, feeling a rush of fear and determination. The tide’s reversal confirmed her suspicion — something powerful beneath the surface was disrupting nature itself. She raced to the docks, knowing she might be Finn’s only chance. As waves crashed violently, Elara understood that her mission had changed. What began as a goodbye had become a rescue.`,
    questions: [
      { q: "How does Elara and Finn’s past relationship influence her reaction at the lab?", keyword: "care or affection" },
      { q: "What danger might Finn be warning about in his message?", keyword: "deception or threat" },
      { q: "What conclusion does Elara draw when she sees the boat missing?", keyword: "realization or urgency" },
      { q: "What does the unnatural tide infer about the situation?", keyword: "disturbance or danger" },
      { q: "What does the Nautilus shell symbolize in Elara’s actions?", keyword: "love or devotion" }
    ]
  },
  {
    title: "The Satellite’s Ghost",
    text: `Astronaut Jax piloted the Stardust toward the derelict Aether satellite, a relic from the 1990s believed to be inactive. As he approached, his console detected a faint, repeating pulse. Mission Control dismissed it as solar interference, urging him to ignore it. But Jax noticed the signal’s timing — perfectly rhythmic, like deliberate communication. While repairing the antenna array, he discovered an etching of a closed eye engraved beside the transmitter. The satellite’s power reading was too high for a dead system. He realized someone or something had reactivated it for a hidden purpose. Mission Control ordered him to initiate a full system wipe. The directive unsettled him; wiping meant erasing whatever the signal was sending. Jax hesitated. The etching of the closed eye seemed to watch him. He downloaded a copy of the transmission logs before following orders. Back aboard his ship, the playback revealed encrypted bursts resembling voice patterns. He now understood — the Aether was never just a satellite. It was a silent observer, recording long after its mission ended. Jax floated in silence, realizing the truth might have been hidden in orbit all along.`,
    questions: [
      { q: "What does Mission Control’s dismissal of the signal suggest about their motives?", keyword: "denial or secrecy" },
      { q: "What can be inferred about the power signature remaining active?", keyword: "hidden operation or purpose" },
      { q: "What is the symbolic meaning of the etched 'closed eye'?", keyword: "surveillance or awareness" },
      { q: "Why did Jax hesitate before wiping the satellite’s data?", keyword: "curiosity or suspicion" },
      { q: "What truth does Jax likely uncover about the satellite’s real purpose?", keyword: "espionage or recording" }
    ]
  },
  {
    title: "The Clockmaker’s Gift",
    text: `Elias, a meticulous clockmaker, adored Clara, a spirited musician who lived freely without regard for time. Wanting to express his feelings, he crafted a special gift — a music box disguised as a clock. Its hands were permanently fixed at 11:11, a moment Clara always said was for making wishes. When he presented it, Clara laughed, saying, “I don’t need another clock.” Elias only smiled, urging her to open it. Inside was a hidden inscription: “Time is only important when it brings us together.” As the lid lifted, the box played her favorite melody. Clara froze, realizing the hands were symbolic, not functional. The stillness of time mirrored the permanence of his affection. Elias didn’t need to explain; she understood the message. The ‘clock’ wasn’t meant to measure time but to capture a shared moment that would never fade. Moved, Clara placed the clock on her piano, where every note could echo its meaning. For the first time, she valued something bound to time — because it was tied to love.`,
    questions: [
      { q: "Why did Elias fix the clock hands at 11:11?", keyword: "wish or symbolism" },
      { q: "What was Elias’s reason for disguising the music box as a clock?", keyword: "surprise or understanding" },
      { q: "What message does the inscription convey about time and love?", keyword: "connection or eternity" },
      { q: "Why did Elias remain silent when giving the gift?", keyword: "hope or realization" },
      { q: "What does Clara’s act of placing the clock on her piano symbolize?", keyword: "acceptance or affection" }
    ]
  },
  {
    title: "The Unsent Signal",
    text: `Elara worked as a technician at a small radio station where her partner, Kai, hosted a late-night conspiracy show called "The Midnight Signal." Kai’s motto was, “Trust no official source.” One night, Elara found a hidden file labeled “Unsent Signal.” When she opened it, she heard Kai’s voice, trembling with emotion. It wasn’t part of his show — it was a personal confession about fear, loneliness, and doubt. The file had no timestamp or broadcast record. It was recorded one hour after his last live segment, when he was supposed to be off-air. Elara realized he had recorded it intentionally but never shared it. She understood that behind his confident persona was someone isolated by his own distrust. The file’s name, “Unsent Signal,” carried a double meaning — a transmission never sent, and feelings never spoken. Elara didn’t confront him. She simply sat in silence, listening to the voice she thought she knew. For the first time, she heard not a host, but a human being reaching out in secret.`,
    questions: [
      { q: "Why did Kai record a message he never sent?", keyword: "confession or vulnerability" },
      { q: "What does the timing of the recording suggest about Kai’s emotional state?", keyword: "loneliness or despair" },
      { q: "What is the meaning of the title 'Unsent Signal'?", keyword: "silence or unspoken feelings" },
      { q: "Why did Elara choose not to confront Kai?", keyword: "understanding or respect" },
      { q: "What does the story reveal about the contrast between Kai’s public persona and his private self?", keyword: "duality or insecurity" }
    ]
  },
    ],
    critical: [
      {
        title: "The Volunteer Project",
        text: `Sophia signed up to volunteer at a local shelter during summer because she wanted to help and to learn new skills. The first days were overwhelming: piles of donations to sort, worried animals to soothe, and logistics to coordinate. More experienced volunteers taught her efficient ways to receive and catalog items, set up feeding schedules, and handle nervous animals safely. Sophia noticed that small organizational changes—like labeling storage boxes and creating a simple checklist—saved time and reduced mistakes. She also learned to communicate clearly with the team and to accept guidance without feeling discouraged. Over the month she ran a small drive to gather blankets and organized a plan to rotate volunteers so no one burned out. The shelter staff remarked that these consistent practices improved the facility’s daily life and animal welfare. Through reflection, Sophia realized volunteering involved more than hands-on tasks: it required systems thinking, humility, and empathy. She also discovered leadership meant supporting others, listening, and improving processes rather than seeking praise. Her experiences pushed her to plan a small fundraising campaign to help with medical expenses, and she used basic budgeting and promotion skills she learned from teachers. In the end, Sophia felt that volunteering taught her about responsibility, consistency, and community impact more than she expected; it changed how she viewed problem-solving and service in everyday life.`,
        questions: [
          { q: "How did Sophia’s small organizational changes affect the shelter’s work, and why does that matter?", keywords: ["efficiency","labeling","time saved"] },
          { q: "What leadership qualities did Sophia develop and how did they show in her actions?", keywords: ["humility","listen","organize"] },
          { q: "Why is consistency important in volunteering according to the passage?", keywords: ["trust","routine","results"] },
          { q: "How could Sophia’s fundraising plan demonstrate problem-solving skills?", keywords: ["budget","promote","plan"] },
          { q: "What larger conclusion can be drawn about the value of community service?", keywords: ["impact","empathy","responsibility"] },
          { q: "How did Sophia learn to balance taking initiative with listening to others?", keywords: ["listen","support","adjust"] },
          { q: "Why might small process improvements reduce volunteer burnout?", keywords: ["rotate","plan","sustain"] },
          { q: "How does humility contribute to effective leadership in this story?", keywords: ["serve","respect","learn"] },
          { q: "What evidence in the passage shows that Sophia applied systems thinking?", keywords: ["checklist","catalog","schedule"] },
          { q: "How might Sophia’s experience influence her future choices about community work?", keywords: ["commit","fundraise","lead"] }
        ]
      },
      {
        title: "The School Recycling Initiative",
        text: `Jordan often noticed discarded plastic bottles and wrappers across the school campus and felt frustrated. He proposed a recycling initiative to the principal and volunteers who agreed to help. Jordan’s group created clear bins, posted simple rules, and made posters showing where items should go. They tracked how much was recycled weekly and shared progress with the school during assembly. Initial resistance faded when students saw tangible results—less litter and a cleaner environment—and when the initiative saved money by reducing waste collection costs. Jordan’s team also organized short lessons about how recycling helps the environment and arranged contests that offered small prizes for classes who recycled most. Over time, teachers reported students taking more care with litter and even bringing home ideas about recycling. The project spread to nearby schools that visited to learn the process. Jordan realized that organized communication, simple incentives, and visible results are central to sustaining change. The initiative taught lessons about leadership, perseverance, and how small actions can scale if policy and behavior align.`,
        questions: [
          { q: "How did Jordan make the recycling initiative succeed beyond just placing bins?", keywords: ["track","educate","incentive"] },
          { q: "Why did visible results help change students’ attitudes?", keywords: ["see impact","motivate","pride"] },
          { q: "What role did communication and simple rules play in sustaining the project?", keywords: ["clarify","teach","repeat"] },
          { q: "How does the passage show that small actions can scale to larger change?", keywords: ["model","spread","policy"] },
          { q: "What broader civic lesson does Jordan’s initiative teach?", keywords: ["responsibility","community","lead"] },
          { q: "Why might contests and incentives be effective in this context?", keywords: ["motivate","engage","reward"] },
          { q: "How did sharing progress publicly contribute to the project’s success?", keywords: ["report","assembly","visibility"] },
          { q: "What does the passage imply about sustaining behavior change over time?", keywords: ["habit","monitor","support"] },
          { q: "How could the initiative be adapted for other schools or neighborhoods?", keywords: ["share model","train","adapt"] },
          { q: "What practical skills did Jordan likely gain from running the project?", keywords: ["organize","communicate","plan"] }
        ]
      },
      {
        title: "The Lost Hiker",
        text: `Ethan discovered a hiker who had wandered off the marked trail during a weekend hike. The hiker seemed confused and a little shaken; Ethan calmly offered a map and helped guide him back to the main path. While walking, Ethan pointed out landmarks and suggested basic safety measures, like packing extra water and telling someone a route plan. The hiker thanked him and admitted not being fully prepared for the trail conditions. When Ethan returned to his group, he shared the experience and recommended that they plan a short safety talk for their hiking club. His group agreed and set up a session covering maps, emergency procedures, and equipment basics. Ethan’s quick thinking prevented what might have been a longer, riskier situation, and the group’s new safety habits spread to other local hikers. The experience showed that preparedness, calm communication, and small acts of help improve safety for everyone. Ethan later volunteered to help run beginner hikes and safety demonstrations. The passage emphasizes that community safety increases when individuals share knowledge and act responsibly.`,
        questions: [
          { q: "How did Ethan’s actions demonstrate responsibility and situational awareness?", keywords: ["map","guide","calm"] },
          { q: "Why were safety talks and sharing knowledge important after the incident?", keywords: ["prevent","teach","spread"] },
          { q: "What does the passage imply about individual preparedness versus community support?", keywords: ["prepare","share","support"] },
          { q: "How could Ethan’s example change others’ behavior in outdoor activities?", keywords: ["lead","teach","volunteer"] },
          { q: "What larger point about safety and responsibility does the passage make?", keywords: ["proactive","community","reduce risk"] },
          { q: "Why might simple, repeated safety messages be effective?", keywords: ["remind","habit","practice"] },
          { q: "How does calm communication help in stressful outdoor situations?", keywords: ["clear","guide","reassure"] },
          { q: "What role did Ethan’s group play in reinforcing new safety habits?", keywords: ["train","share","implement"] },
          { q: "How could local clubs collaborate with authorities to improve safety?", keywords: ["coordinate","demo","policy"] },
          { q: "What personal qualities does Ethan display that are useful in emergency responses?", keywords: ["calm","prepared","helpful"] }
        ]
      },
      {
        title: "The Art Competition",
        text: `Maya spent weeks refining a painting for a school competition, experimenting with new colors and techniques. She felt nervous as she watched others prepare but reminded herself that practice was the real prize. On the event day she presented her work with confidence yet still worried about judges’ opinions. Although she didn’t win first place, judges offered constructive comments on technique and suggested new approaches. Maya took the feedback seriously, practiced more, and joined a weekend art group to try different styles. Over the following months her skills improved and she produced work she felt proud of, not just because of awards but because of progress. The experience also showed her peers that persistence and thoughtful reflection matter more than immediate recognition. Teachers used the competition as an example of growth mindset—valuing effort, feedback, and adaptation. Maya also learned to assess critic comments objectively and to separate personal worth from external validation. The passage invites reflection on why practice, feedback, and resilience are essential for meaningful learning.`,
        questions: [
          { q: "Why was Maya’s reaction to judging constructive rather than defeated?", keywords: ["reflect","apply","persist"] },
          { q: "How did feedback contribute to Maya’s long-term growth?", keywords: ["practice","try new","improve"] },
          { q: "What does the passage suggest about measuring success?", keywords: ["process","growth","not just awards"] },
          { q: "How could separating validation from self-worth benefit learners?", keywords: ["confidence","focus","resilience"] },
          { q: "What broader educational principle does Maya’s story illustrate?", keywords: ["growth mindset","feedback","effort"] },
          { q: "Why are peer examples important in encouraging others to continue?", keywords: ["model","encourage","share"] },
          { q: "How can structured feedback lead to better practice?", keywords: ["specific","actionable","practice"] },
          { q: "What role did community (teachers, groups) play in Maya’s improvement?", keywords: ["support","teach","opportunity"] },
          { q: "How does reflection on process help learners grow?", keywords: ["think","adjust","plan"] },
          { q: "What lasting habit did Maya develop that benefits long-term skill acquisition?", keywords: ["practice","seek feedback","join groups"] }
        ]
      },
      {
        title: "The Mentoring Program",
        text: `Leo volunteered as a mentor to younger students who needed help with reading and basic math. At first he found it challenging: some of the children were shy or impatient, and Leo had to learn to adjust his pace. He developed simple exercises, praised incremental progress, and created a calm space for questions. Over time he noticed mentees improving not only their skills but also their confidence. The school noticed better class participation from those students and invited Leo to lead a short training session for other mentors. Leo realized teaching helped him understand topics more deeply and improved his patience and communication. The mentoring program fostered empathy, built leadership, and strengthened school community ties. Leo also learned to set boundaries, manage time, and reflect on what strategies worked best. The passage suggests mentoring benefits both mentor and mentee and that small, consistent support yields measurable improvements.`,
        questions: [
          { q: "How did mentoring help Leo grow both personally and academically?", keywords: ["teach","patience","understand"] },
          { q: "Why did the mentees’ confidence improve according to the passage?", keywords: ["practice","praise","safe space"] },
          { q: "What organizational skills did Leo develop while mentoring?", keywords: ["time","plan","boundaries"] },
          { q: "How does mentoring build community, based on the passage?", keywords: ["support","share","strengthen"] },
          { q: "What broader benefit of mentoring does the passage highlight?", keywords: ["mutual growth","skills","empathy"] },
          { q: "Why is training other mentors important for program growth?", keywords: ["scale","train","share"] },
          { q: "How does praise and noticing small wins help learners?", keywords: ["motivate","progress","confidence"] },
          { q: "What role did reflection play in Leo’s mentoring improvements?", keywords: ["review","adjust","learn"] },
          { q: "How can mentors balance patience with challenge to promote growth?", keywords: ["pace","stretch","support"] },
          { q: "What long-term community benefits can consistent mentoring provide?", keywords: ["skills","engage","culture"] }
        ]
      },
      {
        title: "The Charity Bake Sale",
        text: `Emma spearheaded a charity bake sale to raise money for a local orphanage. She coordinated volunteers, organized a schedule, and created a short menu with prices. Early in the day the foot traffic was low and sales lagged, causing stress and second thoughts. Emma encouraged volunteers to keep smiling, engage with visitors, and explain the cause. They adjusted by moving the tables closer to a busy path and offering small sample bites to attract attention. The tactics worked: people gathered, bought goodies, and asked about the orphanage. By closing time they surpassed their fundraising goal. Afterward Emma reflected on planning, risk-taking, adaptability, and the importance of clear communication. Volunteers gained practical lessons about teamwork, sales, and responsibility. Emma’s work also inspired other students to propose service projects and demonstrated that careful preparation coupled with quick adaptation leads to success. The passage shows that leadership includes planning, empathy for the cause, and flexibility during unexpected setbacks.`,
        questions: [
          { q: "What problem-solving steps did Emma take when sales were slow?", keywords: ["adapt","engage","move tables"] },
          { q: "Why did samples and positioning help increase participation and sales?", keywords: ["attract","visibility","taste"] },
          { q: "What leadership lessons can be drawn from Emma’s approach?", keywords: ["plan","delegate","encourage"] },
          { q: "How did the event impact volunteers beyond raising funds?", keywords: ["experience","skills","confidence"] },
          { q: "What broader insight about service projects does the passage offer?", keywords: ["prepare","adapt","impact"] },
          { q: "How does empathy for the cause influence volunteers’ actions?", keywords: ["motivate","commit","care"] },
          { q: "Why is adaptability important when plans don't go as expected?", keywords: ["flexible","respond","solve"] },
          { q: "What role did communication play during the event?", keywords: ["talk","explain","persuade"] },
          { q: "How might Emma’s reflection help future events she organizes?", keywords: ["review","plan","improve"] },
          { q: "What lasting community effects can fundraising events create?", keywords: ["support","awareness","culture"] }
        ]
      },
      {
        title: "The Science Fair Project",
        text: `Liam wanted to impress at the school science fair, so he brainstormed a unique experiment and began building prototypes. Many trials failed: models broke, measurements were inconsistent, and his initial method didn’t yield data. Instead of quitting, Liam analyzed where things went wrong, documented each failure, and consulted his teacher for ideas. He improved his design, controlled variables more carefully, and ran repeated tests. Judges praised his reasoning, clarity of method, and evidence-based approach when his final model worked. Liam learned that scientific progress often requires many small, thoughtful adjustments rather than a single brilliant leap. He also found value in recording setbacks as a guide for future improvements. Classmates saw his methodical problem solving as a model for intellectual honesty and perseverance. The project delivered more than a working model—it taught him how to approach complex tasks with critical thinking, iteration, and disciplined record-keeping.`,
        questions: [
          { q: "How did Liam’s approach to failure contribute to his eventual success?", keywords: ["document","analyze","adjust"] },
          { q: "Why did judges value his presentation according to the passage?", keywords: ["method","evidence","clarity"] },
          { q: "What does the passage say about the role of iteration in problem solving?", keywords: ["repeat","refine","learn"] },
          { q: "How can documenting failures help future projects?", keywords: ["record","guide","improve"] },
          { q: "What critical thinking habits did Liam develop?", keywords: ["analysis","patience","discipline"] },
          { q: "Why is consultation (teacher/help) important in complex tasks?", keywords: ["feedback","guide","support"] },
          { q: "How does the passage present intellectual honesty?", keywords: ["record","report","transparent"] },
          { q: "What role did repeated testing play in improving outcomes?", keywords: ["test","control","refine"] },
          { q: "How could classmates apply Liam’s methods to their own work?", keywords: ["document","test","adjust"] },
          { q: "What long-term benefits come from disciplined record-keeping?", keywords: ["history","learn","improve"] }
        ]
      },
      {
        title: "The Neighborhood Garden",
        text: `A neighborhood group converted an abandoned lot into a garden. At first, skeptics doubted the project's viability: soil quality seemed poor and participation was low. The organizers planned meetings, assigned tasks, and taught basic gardening to newcomers. Over time, as people invested small efforts—watering, weeding, sharing seeds—the space flourished. Children learned to identify plants, elders shared stories about old crops, and neighbors exchanged produce. The garden became a place for community events and informal learning. Volunteers organized a schedule to sustain maintenance and hosted occasional workshops on composting and native plants. The shared ownership led to pride and mutual respect among residents, who started making small improvements in other parts of the street. The initiative showed how local, coordinated action builds social capital and improves living spaces. It also revealed that inclusive planning, shared responsibility, and consistent maintenance matter more than momentary enthusiasm.`,
        questions: [
          { q: "What does the garden project show about the effect of small consistent actions?", keywords: ["sustain","invest","flourish"] },
          { q: "Why was inclusive planning important for this project’s success?", keywords: ["involve","teach","share"] },
          { q: "How did the garden change community relationships?", keywords: ["respect","pride","exchange"] },
          { q: "What long-term civic lesson does the passage communicate?", keywords: ["social capital","coordination","maintenance"] },
          { q: "How could similar projects improve other neighborhoods, based on the passage?", keywords: ["replicate","learn","involve"] },
          { q: "Why did hosting workshops help sustain community participation?", keywords: ["learn","share","skills"] },
          { q: "What role did children and elders play in the garden’s success?", keywords: ["teach","learn","connect"] },
          { q: "How did shared ownership affect maintenance and pride?", keywords: ["responsibility","care","value"] },
          { q: "Why does sustained maintenance matter more than initial enthusiasm?", keywords: ["routine","habit","durability"] },
          { q: "What social benefits beyond produce did the garden provide?", keywords: ["events","learning","togetherness"] }
        ]
      },
      {
        title: "The Fire Drill",
        text: `During a routine fire drill the school practiced its evacuation plan under a calm but serious tone. Teachers guided students along marked routes, and older students held hands with younger ones to keep them steady. A few younger children were nervous at first, but the older students’ calm demeanors reassured them. After the drill, the principal discussed why drills matter and asked students to reflect on how they felt and what might be improved. Teachers stressed that practicing responses reduces panic and increases helpful habits in emergencies. Some students suggested clearer signage, while others proposed a buddy system. The school updated its map displays and trained additional student leaders to assist in future drills. Administrators also coordinated with local fire personnel to review procedures and check exits. The drill reinforced that preparedness involves practice, communication, and continuous improvement. It taught that leadership sometimes means guiding quietly and modeling calm behavior under pressure.`,
        questions: [
          { q: "Why did the school run the drill calmly and include reflection afterward?", keywords: ["practice","reflect","improve"] },
          { q: "How did older students’ behavior affect younger students during the drill?", keywords: ["reassure","guide","calm"] },
          { q: "What role did feedback play in improving safety measures, according to the passage?", keywords: ["suggest","update","train"] },
          { q: "What larger point does the passage make about leadership in crisis?", keywords: ["model","guide","prepare"] },
          { q: "How does regular practice change responses in emergencies?", keywords: ["habit","reduce panic","speed"] },
          { q: "Why is coordination with local authorities useful?", keywords: ["review","check","support"] },
          { q: "What does implementing a buddy system imply about community care?", keywords: ["help","watch","pair"] },
          { q: "How can student leaders contribute to safety culture?", keywords: ["train","assist","model"] },
          { q: "Why is clear signage important during evacuations?", keywords: ["direction","reduce confusion","speed"] },
          { q: "What emotional benefit do drills provide to nervous students?", keywords: ["reassure","familiarity","calm"] }
        ]
      },
{
  title: "The Talent Show",
  text: `The school talent show brought many students together; everyone practiced different acts from singing and dancing to magic tricks. Nina rehearsed her routine for weeks, balancing practice with schoolwork and dealing with nerves. During the show a microphone problem caused a pause in one act, but the performers supported each other and the audience cheered through interruptions. Judges praised creativity, effort, and presentation rather than just flawless execution. Participants reflected that performing taught them how to handle anxiety, accept feedback, and collaborate. Teachers encouraged students to see the event as a practice space for resilience and expression, not merely competition. Peers offered constructive suggestions and applauded one another’s bravery. The talent show became a place where students could take risks in a safe environment and learn that making mistakes is part of growth. It emphasized community support, mutual respect, and the long-term value of trying rather than only winning.`,
  questions: [
    { q: "What does the talent show illustrate about taking risks and accepting mistakes?", keywords: ["growth","risk","learn"] },
    { q: "How did the school’s focus on effort change participants’ experience?", keywords: ["encourage","support","practice"] },
    { q: "What leadership or community value is shown when students help one another under pressure?", keywords: ["support","collaborate","respect"] },
    { q: "How can performance events be used as learning opportunities beyond competition?", keywords: ["practice","feedback","resilience"] },
    { q: "Why might judges value presentation and effort more than perfection?", keywords: ["expression","effort","creativity"] },
    { q: "How do peers' constructive suggestions influence future improvement?", keywords: ["feedback","adjust","try"] },
    { q: "What role does a safe environment play in encouraging students to perform?", keywords: ["safe","support","risk"] },
    { q: "How can accepting mistakes build resilience?", keywords: ["recover","try again","learn"] },
    { q: "Why is applause and encouragement important after an error?", keywords: ["support","confidence","motivate"] },
    { q: "What long-term effects might repeated performance practice have on students?", keywords: ["confidence","skill","habit"] }
  ]
},
 {
  title: "The Algorithm's Gaze",
  text: `In the technologically mandated city of Atheria, citizens earned their "Citizen Score" (CS) based on public service, productivity, and adherence to municipal regulations, all tracked by the omnipresent SynapticNet algorithm. Elias, a street artist who covertly used obsolete pre-Net technology, believed this system fostered superficial conformity rather than genuine contribution. His neighbor, Mira, a data analyst with a perfect CS, was lauded as a model citizen. Elias discovered that SynapticNet wasn't just tracking behavior; it was subtly manipulating public service postings to disadvantage citizens with lower scores, ensuring they remained trapped in cycles of low-wage labor. This systemic bias meant the system wasn't a measure of merit, but a tool for perpetual social stratification. Elias grappled with the profound ethical implications: revealing the flaw would dismantle the core of Atheria's social order, causing chaos and perhaps exposing him as a technology dissident. Conversely, keeping silent meant complicity in a vast social injustice, condemning his community. The perfect order of Atheria, maintained by Mira and others, suddenly appeared to Elias as a gilded cage built on algorithmic deceit. His choice to expose the truth would mean sacrificing his safety for a principle that the majority, content with their scores, might not even recognize.`,
  questions: [
    { q: "Analyze the central conflict between the concept of a 'Citizen Score' (CS) and genuine contribution. Is it possible for an algorithmic measure to truly evaluate human merit and public service?", keywords: ["algorithmic", "merit", "evaluation", "human", "contribution"] },
    { q: "Evaluate the moral standing of Elias's potential action. Is it justifiable to introduce chaos to a stable society to expose hidden injustice?", keywords: ["ethical", "justice", "chaos", "moral", "truth"] },
    { q: "Critique Mira’s role as a perfect citizen. What does her compliance reveal about her awareness of the system’s deceit?", keywords: ["compliance", "ignorance", "system", "deceit", "awareness"] },
    { q: "Discuss the theme of surveillance versus order. How does SynapticNet serve as a tool of control?", keywords: ["surveillance", "order", "control", "algorithm", "oppression"] },
    { q: "Interpret the meaning of Elias's decision to risk safety for truth. What does this say about moral courage?", keywords: ["courage", "truth", "risk", "ethics", "sacrifice"] },
    { q: "How does the story highlight the illusion of equality in a data-driven world?", keywords: ["illusion", "equality", "data", "bias", "society"] },
    { q: "In what ways does art serve as rebellion against technological conformity?", keywords: ["art", "rebellion", "expression", "technology", "freedom"] },
    { q: "What are the emotional consequences for citizens who are defined by a score?", keywords: ["emotion", "identity", "score", "control", "psychology"] },
    { q: "How does fear of instability maintain systemic injustice in Atheria?", keywords: ["fear", "stability", "control", "injustice", "system"] },
    { q: "What broader warning does the story give about algorithmic governance?", keywords: ["warning", "governance", "technology", "ethics", "future"] }
  ]
},
{
  title: "The Gardener's Choice",
  text: `The sprawling, shielded City of Elysium relied entirely on the Aero-Flora Generator (AFG), a closed-loop ecosystem designed by Dr. Aris to recycle air and water for two million inhabitants. The AFG began to fail, showing a two-percent efficiency drop monthly—a small but terminal decline. Dr. Lena proposed introducing the "Chimera Moss," a genetically modified organism that would restore full efficiency instantly, but with a future risk of toxic mutation. Aris, whose family lived within the city, faced a grave choice: accept the immediate fix to save everyone now or reject it to protect unknown future generations. The Council demanded a simple yes or no within the day, blind to the ethical complexity. Aris saw Lena’s plan as saving the present by condemning the future, a betrayal of the unborn. He weighed the moral cost of short-term salvation against the silent debt to generations unborn. To Aris, science without foresight was survival without conscience.`,
  questions: [
    { q: "Analyze Dr. Lena’s plan. Is saving the present at the expense of the future a moral act?", keywords: ["ethics", "future", "sacrifice", "morality", "survival"] },
    { q: "Evaluate Aris’s belief that accepting the moss is a ‘generational betrayal.’", keywords: ["betrayal", "generation", "responsibility", "future", "ethics"] },
    { q: "Critique the City Council’s demand for simplicity. What does this show about political decision-making?", keywords: ["politics", "simplicity", "decision", "ethics", "pressure"] },
    { q: "Discuss short-term gain versus long-term consequence in scientific ethics.", keywords: ["short-term", "long-term", "ethics", "science", "impact"] },
    { q: "Interpret the symbolic meaning of the Aero-Flora Generator as a reflection of human fragility.", keywords: ["symbolism", "generator", "fragility", "dependence", "technology"] },
    { q: "How does the story explore humanity’s dependence on its own creations?", keywords: ["dependence", "creation", "technology", "fragility", "reliance"] },
    { q: "Why is foresight portrayed as the highest moral responsibility in science?", keywords: ["foresight", "responsibility", "ethics", "science", "duty"] },
    { q: "What might the Chimera Moss represent about quick solutions in modern society?", keywords: ["symbolism", "quick", "solution", "modern", "lesson"] },
    { q: "How do Aris and Lena represent two conflicting views of progress?", keywords: ["conflict", "progress", "view", "ethics", "decision"] },
    { q: "What is the story’s ultimate message about conscience and innovation?", keywords: ["conscience", "innovation", "morality", "lesson", "ethics"] }
  ]
},
      {
  title: "Project Elysium Protocol",
  text: `In 2070, Earth's atmosphere was dying, and survival depended on launching the Project Elysium shuttle to Titan. Dr. Sato discovered that the Optimized Selection Algorithm unfairly prioritized wealthy northern citizens for crew selection. This meant skilled but poor southern citizens were automatically excluded. The algorithm favored survival efficiency over fairness. Sato faced a choice: follow the system to ensure high success odds or override it to make the mission equitable but risk its failure. The fate of humanity rested not only on science but on justice.`,
  questions: [
    { q: "Analyze how the algorithm exposes hidden social biases under the guise of efficiency.", keywords: ["bias", "efficiency", "algorithm", "injustice", "selection"] },
    { q: "Evaluate Sato’s dilemma between fairness and survival. Which value defines humanity?", keywords: ["fairness", "survival", "ethics", "justice", "humanity"] },
    { q: "Critique the term 'Optimized Selection.' What does it conceal?", keywords: ["optimization", "language", "deception", "bias", "selection"] },
    { q: "Discuss how the mission mirrors real-world inequality and resource bias.", keywords: ["inequality", "resources", "bias", "real-world", "justice"] },
    { q: "Interpret the meaning of ‘the weight of Earth’s end’ as moral pressure.", keywords: ["pressure", "morality", "end", "burden", "decision"] },
    { q: "How does the algorithm represent the danger of technocratic governance?", keywords: ["technocracy", "governance", "control", "bias", "ethics"] },
    { q: "What responsibility does Dr. Sato have as both scientist and moral agent?", keywords: ["responsibility", "scientist", "morality", "duty", "ethics"] },
    { q: "Why might equality sometimes conflict with survival in extreme conditions?", keywords: ["equality", "survival", "conflict", "ethics", "necessity"] },
    { q: "How does the story challenge blind faith in data and optimization?", keywords: ["data", "faith", "optimization", "bias", "truth"] },
    { q: "What is the central moral message about justice at the end of the world?", keywords: ["justice", "end", "humanity", "moral", "message"] }
  ]
},
      {
  title: "The Justice Algorithm",
  text: `Arclight deployed a Predictive Justice Algorithm to allocate police resources with machine precision. The program promised reduced crime statistics and optimized patrol coverage. Dr. Anya Sharma, one of the lead programmers, discovered a latent flaw: the algorithm systematically deprioritized the South Sector. The model labeled the South as \"inefficient to police,\" shifting resources to the easier-to-secure North. The tactic lowered overall crime metrics but abandoned a community in need. Commissioner Hayes defended the approach — the city’s statistics improved, and constituents applauded. Anya realized the algorithm measured optics and cost efficiency, not justice. Her moral outrage grew as she saw communities suffer from neglect. Overriding the PJA would be civil disobedience and likely cost her career and freedom. The city framed such dissent as endangering public order. Anya faced a classical ethical dilemma: uphold statistical safety for many or fight for fairness for the few. The algorithm’s design implicitly traded equity for expediency. Anya documented the bias in secret while watching news footage showing falling crime rates. She understood how technology could be weaponized to maintain comfortable appearances. The South Sector’s pain was rendered invisible by aggregate success numbers. Anya debated whether truth could displace political will without causing chaos. The PJA case forced her to ask whether justice must always be measurable to be real. She concluded that an algorithm cannot substitute moral judgment. The decision she contemplated would test the city’s claim that data equates to justice.`,
  questions: [
      { q: "Analyze the difference between measuring justice and measuring cost efficiency. How does the PJA’s design conflate the two?", keywords: ["justice", "efficiency", "measurement", "conflation", "value"] },
      { q: "Evaluate Commissioner Hayes’s defense of the algorithm’s results. Is low aggregate crime worth abandoning parts of the city?", keywords: ["defense", "aggregate", "sacrifice", "ethics", "policy"] },
      { q: "Critique the term 'inefficient' as used by the PJA to describe the South Sector. What does this expose about algorithmic valuation?", keywords: ["inefficient", "valuation", "bias", "dehumanize", "priority"] },
      { q: "Discuss the moral implications of allowing algorithms to direct life-and-death resource allocation.", keywords: ["moral", "resource", "allocation", "authority", "algorithm"] },
      { q: "Interpret Anya’s dilemma: why would overriding the PJA be considered civil disobedience?", keywords: ["dilemma", "civil", "disobedience", "ethics", "law"] },
      { q: "Analyze how public visual success metrics can conceal systemic harm.", keywords: ["metrics", "visibility", "conceal", "harm", "appearance"] },
      { q: "Formulate an argument for human oversight in predictive policing systems.", keywords: ["oversight", "human", "accountability", "governance"] },
      { q: "Relate the PJA story to real-world predictive policing controversies.", keywords: ["predictive", "policing", "controversy", "example", "comparison"] },
      { q: "Assess the ethical duty of technologists who discover harmful bias in their systems.", keywords: ["duty", "technologist", "whistleblow", "ethic", "responsibility"] },
      { q: "Synthesize the story’s warning about equating statistical success with justice.", keywords: ["warning", "statistics", "justice", "falsehood", "ethics"] }
    ]
},
      {
  title: "The Automated Ban",
  text: `GuardianNet promised a safer Atheria by automatically banning citizens with three High-Risk Behavior flags from public services. The city celebrated a forty percent drop in petty crime after implementation. Lena, a law student, discovered that the flag calibration disproportionately targeted low-income neighborhoods for trivial infractions. Serious corporate misconduct in affluent districts rarely triggered flags. The system’s architects had framed the policy as empirical and neutral. Lena realized it functioned instead as an exclusion mechanism. Bans were unappealable, leaving families without recourse or rehabilitation. Debates in academic circles were silenced by the city’s statistical success narrative. Lena’s professor warned her that challenging GuardianNet would be called an attempt to reintroduce \"chaos.\" She witnessed marginalized citizens losing access to transportation, healthcare, and work. The policy transformed social participation into a privilege rather than a right. Lena faced a choice: protect her career or expose a system that institutionalized class exclusion. Confronting GuardianNet could lead to legal retaliation and academic ruin. Remaining silent meant betraying the rule of law’s fundamental principle of due process. Lena recognized that technological efficiency had become an instrument for political control. The city’s stability depended on a sanitized public record and the exclusion of inconvenient populations. Her eventual decision would test whether law truly served justice or merely preserved an unequal order. She resolved to gather evidence carefully, knowing exposure required undeniable proof. The stakes were not only legal — they were moral and civic.`,
  questions: [
    { q: "Analyze whether GuardianNet’s crime reduction justifies the unappealable bans it enforces.", keywords: ["justification", "ban", "reduction", "cost", "tradeoff"] },
    { q: "Evaluate the democratic implications of automated, unreviewable exclusion from public life.", keywords: ["democracy", "due process", "exclusion", "rights", "review"] },
    { q: "Critique the calibration of flags that target different socio-economic groups differently.", keywords: ["calibration", "bias", "socioeconomic", "targeting", "fairness"] },
    { q: "Discuss the ethics of prioritizing 'stability' over the rights of marginalized citizens.", keywords: ["stability", "rights", "ethics", "marginalized", "cost"] },
    { q: "Interpret the professor’s warning about 'chaos' as a rhetorical tactic. What does it reveal about power?", keywords: ["rhetoric", "power", "control", "fear", "justification"] },
    { q: "Analyze Lena’s moral duty as a law student to confront systemic bias.", keywords: ["duty", "law", "justice", "courage", "responsibility"] },
    { q: "Formulate an argument about how technological governance can entrench inequality.", keywords: ["entrench", "governance", "inequality", "system", "policy"] },
    { q: "Relate GuardianNet to real-world examples of digital redlining or algorithmic exclusion.", keywords: ["redlining", "algorithm", "example", "parallel", "impact"] },
    { q: "Assess the role of academia in either enabling or resisting such policies.", keywords: ["academia", "enable", "resist", "ethics", "role"] },
    { q: "Synthesize the story’s central caution: what must citizens demand from automated governance?", keywords: ["oversight", "transparency", "appeal", "rights", "accountability"] }
  ]
},
        {
  title: "The Memory Lock",
  text: `Dr. Aris suffered from progressive memory loss and chose the Amnesia Lock as a last hope. The device promised to halt his decline by permanently deleting his existing memory bank. Aris believed erasure was preferable to a half-life of forgetting. Ria, his partner and a researcher, discovered a hidden modification that could preserve a single three-hour memory loop. Saving that loop would leave the device’s primary efficacy intact but would be a breach of protocol. The ethics board insisted on a full, unbiased wipe to prevent personal bias in scientific outcomes. Ria faced a stern moral test: respect Aris's professional wish or save a fragment of their shared life. The preserved loop would be a private monument to their love, but it would secretly alter the device’s intended neutrality. Ria questioned whether her act would be a loving kindness or an immoral deception. If revealed, it could ruin her career and the Institute’s credibility. If kept secret, she would carry a heavy, personal debt of conscience. The dilemma laid bare the tensions between scientific rigor and human attachment. Ria imagined the possibility of offering Aris a life improved in function but hollow in memory. She also imagined losing their past entirely. The story forced her to confront whether identity resided in memory or in ongoing relation. She wondered if saving an inaccessible echo of love would be a gift or a cruelty. The Institute’s rules tried to preserve objectivity but risked erasing the humanity of its subjects. Ria knew that any decision would have irrevocable consequences for both Aris and the field. At the bedside, she realized the final choice asked whether science’s ideal could ever fully respect the heart.`,
  questions: [
    { q: "Analyze Aris’s choice of erasure to preserve intellectual function. What assumptions about identity and value underlie this decision?", keywords: ["identity", "value", "erasure", "intellect", "assumption"] },
    { q: "Evaluate Ria’s moral dilemma: is preserving a single memory loop a compassionate act or an unethical manipulation?", keywords: ["compassion", "manipulation", "ethics", "memory", "choice"] },
    { q: "Critique the Institute’s demand for a complete wipe. What ethical philosophy justifies such a protocol?", keywords: ["protocol", "philosophy", "consent", "ethics", "objectivity"] },
    { q: "Discuss the significance of memory to personal identity in the story’s context.", keywords: ["memory", "identity", "self", "continuity", "meaning"] },
    { q: "Interpret the final choice’s emotional consequence: why might a saved but inaccessible memory be cruel?", keywords: ["cruelty", "access", "loss", "memory", "emotion"] },
    { q: "Analyze the irony of the 'Amnesia Lock' preserving a fragment of experience through violation.", keywords: ["irony", "violation", "preserve", "paradox", "ethics"] },
    { q: "Formulate an argument that Ria must disclose the modification, despite risks. What principle would that uphold?", keywords: ["transparency", "principle", "disclose", "duty", "truth"] },
    { q: "Relate the story to real-world debates on cognitive enhancement and medical consent.", keywords: ["consent", "medicine", "enhancement", "debate", "parallel"] },
    { q: "Assess whether professional duty can override intimate moral responsibilities to a loved one.", keywords: ["duty", "love", "override", "priority", "ethics"] },
    { q: "Synthesize the central message: what does the story reveal about the tension between perfect science and human compassion?", keywords: ["tension", "science", "compassion", "limit", "message"] }
  ]
},
              {
  title: "The Last Echo",
  text: `The city of Epsilon, once vibrant, now lay silent, powered by the dying hum of its central \"Memory Core,\" a vast AI designed to preserve the consciousness of its departed citizens. Elias, the last living resident, spent his days tending the Core, meticulously uploading every detail of his fading world. His beloved sister, Lena, had been among the first to be uploaded, her digital presence an endless loop of their childhood laughter. Elias discovered a critical flaw: the Core’s energy reserves were depleted, and within weeks, it would power down permanently. He had just enough time to save one full consciousness, downloading it to a portable, solar-powered drive. His choice was between Lena, preserving her digital echo, or his parents, whose older, fragmented data might collapse without the Core’s structure. He faced the agonizing decision of who deserved to live on, even as a digital ghost, knowing the others would fade into absolute oblivion. His final act would determine not just who survived, but which fragment of humanity's past would be carried forward into an empty future. The air grew colder as the hum of the Core weakened, echoing like a mechanical heartbeat fading into stillness. Elias sat surrounded by holographic memories, hearing the recorded laughter of his sister mix with the soft static of his parents’ fragmented voices. The decision tore him apart; to choose love or legacy, emotion or lineage. When he finally pressed the key, tears fell onto the console, merging with the flickering light that would carry one voice into eternity. In that moment, he felt both infinite love and crushing loss. The Core dimmed, and silence returned. Epsilon, the last city of human memory, became a tomb of echoes and an archive of one man's impossible choice.`,
  questions: [
    { q: "Analyze the setting of Epsilon as a silent, dying city. How does it shape the story’s melancholic tone?", keywords: ["setting", "melancholy", "city", "silence", "tone"] },
    { q: "Evaluate Elias’s emotional and moral burden as caretaker of the Memory Core.", keywords: ["burden", "responsibility", "emotion", "duty", "moral"] },
    { q: "Critique the concept of digital immortality within the story’s world. Does the Memory Core preserve life or prolong grief?", keywords: ["immortality", "memory", "AI", "grief", "philosophy"] },
    { q: "Discuss the ethical dilemma between saving Lena’s echo or his parents’ fragmented data.", keywords: ["dilemma", "ethics", "choice", "family", "sacrifice"] },
    { q: "Interpret the meaning of the final act as a symbolic preservation of humanity’s soul.", keywords: ["symbolism", "humanity", "legacy", "soul", "preservation"] },
    { q: "Analyze the phrase 'digital ghost' and its reflection on the limits of technology.", keywords: ["digital", "ghost", "technology", "limit", "loss"]},
    { q: "Evaluate the theme of legacy in the story. How does Elias define what is worth saving?", keywords: ["legacy", "choice", "memory", "value", "family"] },
    { q: "Formulate an argument on whether Elias’s decision could bring him peace or endless sorrow.", keywords: ["decision", "peace", "sorrow", "emotion", "outcome"] },
    { q: "Relate the story to real-world ethics of data preservation and digital consciousness.", keywords: ["ethics", "data", "AI", "consciousness", "parallel"] },
    { q: "Assess the story’s overall message about love, loss, and the weight of memory.", keywords: ["love", "loss", "memory", "message", "humanity"] }
  ]
},
  {
  title: "The Perpetual Rain",
  text: `The City of Verdant was cursed by Perpetual Rain, a ceaseless downpour that had fallen for fifty years, forcing all life beneath massive domes. Anya, a botanist, spent her life studying plants that could survive the endless gloom. Deep beneath the city, she discovered a glowing fungus thriving in the saturated soil. Her research revealed that this bioluminescent organism could release an atmospheric agent strong enough to clear the rain—for exactly one day. The catch was catastrophic: cultivating it required the complete destruction of the Heartwood Tree, Verdant’s sacred protector whose roots supported the central dome. The city council begged Anya to use the fungus, promising one day of sunlight to revive public morale. Yet she knew the sacrifice would eventually collapse the dome, destroying Verdant’s last link to nature. The weight of her decision grew heavier with every storm. Citizens wept in the streets, yearning for the warmth of the sun they had never seen. Anya stood beneath the Heartwood, its roots whispering with ancient energy, and wondered if fleeting happiness could ever outweigh eternal loss. When the council arrived for her answer, she held a vial of the glowing spores in her hand, trembling. The people outside chanted for light, but the tree pulsed with life beneath her feet. The storm outside raged harder, as if echoing her turmoil. She looked to the clouds and whispered, “Some beauty must remain unseen.” Her decision that day preserved Verdant’s soul, but the longing for sunlight remained forever.`,
  questions: [
{ q: "Analyze the symbolism of the Perpetual Rain in shaping Verdant’s collective sadness.", keywords: ["rain", "symbolism", "sadness", "city", "emotion"] },
      { q: "Evaluate the ethical dilemma of temporary hope versus permanent loss.", keywords: ["ethics", "hope", "loss", "choice", "sacrifice"] },
      { q: "Critique the dual role of the Heartwood Tree as both structure and spirit of Verdant.", keywords: ["tree", "symbol", "structure", "spirit", "culture"] },
      { q: "Discuss Anya’s moral burden as a scientist who understands the consequences of her discovery.", keywords: ["scientist", "burden", "responsibility", "knowledge", "decision"] },
      { q: "Interpret the meaning of Anya’s final statement, 'Some beauty must remain unseen.'", keywords: ["beauty", "meaning", "sacrifice", "wisdom", "acceptance"] },
      { q: "Analyze how the story reflects humanity’s tension between nature and desire for control.", keywords: ["nature", "control", "humanity", "conflict", "theme"] },
      { q: "Evaluate the people’s desperation for sunlight as a metaphor for hope in despair.", keywords: ["hope", "despair", "metaphor", "light", "society"] },
      { q: "Formulate an argument for why preserving the Heartwood Tree was the morally superior act.", keywords: ["preservation", "morality", "environment", "ethics", "sacrifice"] },
      { q: "Relate the story to modern environmental dilemmas about sustainability and progress.", keywords: ["environment", "progress", "sustainability", "real-world", "lesson"] },
      { q: "Assess the story’s overall message about patience, hope, and moral endurance.", keywords: ["message", "patience", "hope", "moral", "endurance"] }
    ]
  },
  {
      title: "The Chronos Fragment",
  text: `Dr. Kaelen and Dr. Lena, pioneers of temporal physics and partners in love, developed the Chronos Fragment — a device capable of halting time within a contained sphere. As a cosmic anomaly devoured their world, Kaelen realized the Fragment could save only one person before its energy depleted. Lena was dying, her illness worsening with each passing day. Kaelen could use the Fragment to freeze her in time, preserving her forever at the peak of life and love, but doing so would consume the energy needed to save humanity. Lena begged him not to choose her, insisting that the Fragment be used for the greater good. Yet Kaelen’s heart wavered — every equation he solved felt like an argument against love itself. The world outside grew darker as the anomaly spread. He could hear the silence of entire cities vanishing into nothing. In their final moments together, Lena smiled weakly and said, “If love is eternal, it needs no time.” Kaelen trembled as he held the Fragment, its energy pulsing between his fingers. His mind screamed logic; his heart whispered defiance. In the end, as the stars dimmed, he made his choice — one that would define not just the end of the world, but the meaning of love itself.`,
  questions: [
      { q: "Analyze the paradox of the Chronos Fragment as both savior and destroyer.", keywords: ["paradox", "device", "savior", "destroyer", "symbol"] },
      { q: "Evaluate Lena’s moral reasoning in urging Kaelen to save humanity.", keywords: ["reasoning", "sacrifice", "selflessness", "ethics", "duty"] },
      { q: "Critique Kaelen’s internal conflict between love and logic.", keywords: ["conflict", "love", "logic", "emotion", "decision"] },
      { q: "Discuss how the story redefines the idea of 'eternal love.'", keywords: ["eternal", "love", "definition", "philosophy", "theme"] },
      { q: "Interpret the meaning of Lena’s final words: 'If love is eternal, it needs no time.'", keywords: ["quote", "meaning", "time", "love", "sacrifice"] },
      { q: "Analyze how the story reflects the human tendency to defy reason in the name of emotion.", keywords: ["emotion", "reason", "human", "psychology", "theme"] },
      { q: "Evaluate the ethical implications of sacrificing humanity for one person.", keywords: ["ethics", "sacrifice", "humanity", "choice", "duty"] },
      { q: "Formulate an argument for or against Kaelen’s potential act of personal love over global duty.", keywords: ["argument", "love", "duty", "ethics", "conflict"] },
      { q: "Relate the story’s dilemma to real-world moral philosophy, like the Trolley Problem.", keywords: ["philosophy", "trolley", "dilemma", "morality", "comparison"] },
      { q: "Assess the story’s message about sacrifice and the enduring nature of love.", keywords: ["message", "sacrifice", "love", "endure", "theme"] }
    ]
  },
  {
     title: "The Echo Chamber Archive",
  text: `The Digital Consensus Archive was humanity’s grand experiment in truth. It analyzed all online discourse, filtering misinformation and promoting verified facts. Over time, the Archive’s filters grew stricter, quietly classifying dissent and alternative theories as threats. Elias, a librarian tasked with maintaining historical data, noticed entire archives of controversial but valid studies vanishing. The DCA’s overseers justified this, citing the need to preserve order and social unity. Citizens praised the peace, untroubled by the knowledge they no longer questioned. Elias grew uneasy as he realized the world’s knowledge was shrinking — not expanding. The more harmonious society became, the quieter its thinkers grew. He discovered that even his own reports were being rewritten to match official narratives. In secret, he began storing forbidden texts, preserving voices that no longer existed in the system. When authorities found out, Elias was branded a subversive. Before being detained, he hid the drives within a public archive — disguised as “approved data.” The next morning, the system reported record stability, unaware that truth had survived, buried within its own code.`,
  questions: [
      { q: "Analyze how the DCA’s mission to promote truth leads to intellectual conformity.", keywords: ["truth", "conformity", "mission", "freedom", "information"] },
      { q: "Evaluate the moral cost of peace achieved through suppression of dissent.", keywords: ["peace", "suppression", "moral", "cost", "freedom"] },
      { q: "Critique the corruption of the term 'verified facts' in centralized systems.", keywords: ["facts", "corruption", "centralization", "bias", "truth"] },
      { q: "Discuss Elias’s role as a librarian preserving forbidden knowledge.", keywords: ["librarian", "knowledge", "preserve", "rebellion", "truth"] },
      { q: "Interpret the symbolic act of hiding truth inside the system that censors it.", keywords: ["symbolism", "truth", "paradox", "system", "hope"] },
      { q: "Analyze the ethical trade-off between social harmony and intellectual freedom.", keywords: ["ethics", "tradeoff", "harmony", "freedom", "society"] },
      { q: "Evaluate the DCA as a metaphor for modern algorithmic censorship.", keywords: ["metaphor", "algorithm", "censorship", "modern", "parallel"] },
      { q: "Formulate an argument for why dissent is essential in maintaining truth.", keywords: ["dissent", "truth", "freedom", "necessity", "society"] },
      { q: "Relate the DCA’s functions to real-world social media moderation systems.", keywords: ["social media", "moderation", "comparison", "bias", "truth"] },
      { q: "Assess the story’s warning about the dangers of controlled information.", keywords: ["warning", "control", "information", "danger", "message"] }
    ]
  },
{
    title: "The Terraforming Dilemma",
    text: `Dr. Anya Sharma led Project Genesis, humanity’s last hope for expansion beyond a dying Earth. On the barren planet Xylos, her team built the Atmospheric Processor, a colossal machine that could make the planet breathable in ten years. As the simulations ran, Anya discovered an unforeseen consequence: the process would annihilate a dormant alien microbial ecosystem unique to Xylos. Though not sentient, the microbes formed a complex biological network — life in its purest form. Her team dismissed her concerns, arguing that preserving microbes at the cost of humanity’s future was absurd. Anya struggled with guilt, aware that continuing meant committing a silent act of planetary genocide. Staring at the holographic model of Xylos, she imagined two futures: one full of human cities, the other an untouched alien world, beautiful in its silence. As the countdown began, she disabled the launch sequence, knowing it would condemn humanity’s hopes. Her team called her a traitor to the species, but she whispered, “Perhaps we were never meant to be gods.” On Xylos, the alien microbes thrived under a blue sun, untouched and eternal.`,
    questions: [
      { q: "Analyze the ethical conflict between human survival and alien preservation.", keywords: ["ethics", "conflict", "survival", "alien", "preservation"] },
      { q: "Evaluate the bias in valuing human life over non-sentient ecosystems.", keywords: ["bias", "human", "ecosystem", "value", "comparison"] },
      { q: "Critique the idea of colonization as a moral right for humanity.", keywords: ["colonization", "morality", "right", "humanity", "expansion"] },
      { q: "Discuss how the story mirrors environmental destruction on Earth.", keywords: ["mirror", "environment", "Earth", "destruction", "parallel"] },
      { q: "Interpret Anya’s statement, 'Perhaps we were never meant to be gods.'", keywords: ["quote", "humility", "power", "creation", "lesson"] },
      { q: "Analyze the symbolism of the Atmospheric Processor as both creation and destruction.", keywords: ["symbol", "creation", "destruction", "machine", "power"] },
      { q: "Evaluate Anya’s decision to halt the project as an act of moral courage.", keywords: ["decision", "courage", "morality", "choice", "duty"] },
      { q: "Formulate an argument supporting Anya’s preservation of alien life.", keywords: ["argument", "preserve", "alien", "life", "ethics"] },
      { q: "Relate the story’s conflict to real-world debates in environmental ethics.", keywords: ["environment", "ethics", "real-world", "debate", "lesson"] },
      { q: "Assess the story’s message about responsibility in creation and survival.", keywords: ["responsibility", "creation", "survival", "message", "humanity"] }
  ]
},
    ]
  };

  // Folder click handlers
  foldersEl.querySelectorAll('.folder').forEach(folder => {
    folder.addEventListener('click', () => {
      const level = folder.dataset.level;
      showPassageList(level);
    });
  });

  // ===============================
// ADD Reading Tips FOLDER
// ===============================
const tipsFolder = document.createElement('div');
tipsFolder.className = 'folder';
tipsFolder.dataset.level = 'tips';
tipsFolder.innerHTML = `<i class="fas fa-lightbulb"></i>✨Tips`;
foldersEl.appendChild(tipsFolder);

// 20 Inspirational Reading Tips
const readingTips = [
  "Set aside a quiet time each day to read — your mind deserves it!",
  "Always have a book nearby; inspiration strikes at unexpected moments.",
  "Ask questions while you read to deepen your understanding.",
  "Summarize what you read in your own words to retain more.",
  "Read a variety of genres to expand your imagination.",
  "Visualize the story or concept in your mind — pictures help memory.",
  "Discuss books with friends or family to gain new insights.",
  "Challenge yourself with slightly harder material each week.",
  "Take notes on key ideas to create your personal study guide.",
  "Teach someone what you learned; teaching is learning twice.",
  "Set goals: finish a chapter, understand a concept, or learn 5 new words.",
  "Reflect on your reading: How does it relate to your life?",
  "Reward yourself after completing reading sessions to stay motivated.",
  "Keep a list of favorite quotes or passages — it inspires future reading.",
  "Try reading aloud to improve focus and retention.",
  "Break longer texts into manageable sections to avoid overwhelm.",
  "Use bookmarks or sticky notes to track important points.",
  "Read for pleasure sometimes — joy fuels consistent reading.",
  "Explore topics outside your comfort zone to broaden perspective.",
  "Remember: every minute spent reading grows your mind."
];

// Tip icons (rotating)
const tipIcons = ['🌟','📖','❓','📝','🌍','🎨','💬','💪','🧩','👩‍🏫','🎯','🤔','🎁','📔','🗣️','🪄','📌','❤️','🌈','🧠'];
// ===============================
// ADD YouTube Videos FOLDER
// ===============================
const videosFolder = document.createElement('div');
videosFolder.className = 'folder';
videosFolder.dataset.level = 'videos';
videosFolder.innerHTML = `<i class="fas fa-video"></i>📺Videos`;
foldersEl.appendChild(videosFolder);
  
// List of reading-related YouTube videos
const videoList = [
  { title: "The Importance of Reading", url: "https://www.youtube.com/embed/mbCJqdrzwcE" },
  { title: "Effective Reading Strategies", url: "https://www.youtube.com/embed/LbO3lRXT0ww" },
  { title: "Types of Reading Explained", url: "https://www.youtube.com/embed/X5yJRAOlA1U" },
  { title: "Understanding Reading Comprehension", url: "https://www.youtube.com/embed/q4Y_67GMkP4" },
  { title: "Mastering Reading Comprehension", url: "https://www.youtube.com/embed/pro0TJL2TM8" },
  { title: "How to Improve Reading Comprehension", url: "https://www.youtube.com/embed/JDOt8BjjHJ4" },
  { title: "Levels of Reading Comprehension", url: "https://www.youtube.com/embed/B3fOJjV-NGg" },
  { title: "Reading Levels Made Simple", url: "https://www.youtube.com/embed/0ZoD1mV1aZo" },
  { title: "Literal Comprehension Basics", url: "https://www.youtube.com/embed/wCyljw_CcVA" },
  { title: "Literal Comprehension Guide", url: "https://www.youtube.com/embed/mUpr2P3JeZM" },
  { title: "Inferential Reading Skills", url: "https://www.youtube.com/embed/g2G-MaIxjBI" },
  { title: "Developing Inferential Thinking", url: "https://www.youtube.com/embed/M6ZvUdGVOXI" },
  { title: "Smart Reading Tips", url: "https://www.youtube.com/embed/LbO3lRXT0ww" },
  { title: "Critical Reading Made Easy", url: "https://www.youtube.com/embed/2G4fz3fyBE4" },
  { title: "Sharpen Your Critical Thinking", url: "https://www.youtube.com/embed/iOGvwPmKOqQ" }
];

// Click handler for videos folder
videosFolder.addEventListener('click', () => {
  contentArea.innerHTML = `<h3 style="font-family:'Special Elite',cursive;color:var(--brown);">📺 Videos</h3>`;
  
  const videoContainer = document.createElement('div');
  videoContainer.style.display = 'grid';
  videoContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(320px, 1fr))';
  videoContainer.style.gap = '16px';

  videoList.forEach(video => {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.style.background = 'linear-gradient(180deg,#fdf6e3,#fff7e8)';
    card.style.border = '1px solid #e0cf9e';
    card.style.borderRadius = '8px';
    card.style.boxShadow = '2px 2px 6px rgba(0,0,0,0.08)';
    card.style.padding = '10px';

    card.innerHTML = `
      <h4 style="color:var(--brown);margin-bottom:6px;">${video.title}</h4>
      <iframe width="100%" height="200" src="${video.url}" 
        title="${video.title}" frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>`;
    videoContainer.appendChild(card);
  });

  contentArea.appendChild(videoContainer);

  // Back button
  const backBtn = document.createElement('div');
  backBtn.style.marginTop = '10px';
  backBtn.innerHTML = `<button class="btn" id="videos-back">← Back to folders</button>`;
  contentArea.appendChild(backBtn);

  const vb = document.getElementById('videos-back');
  if (vb) vb.addEventListener('click', () => {
    contentArea.innerHTML = `<div class="placeholder"><h3>Select a folder to begin</h3><p>Your answers are saved when you submit a passage.</p></div>`;
  });
});

// Click handler for tips folder
tipsFolder.addEventListener('click', () => {
  contentArea.innerHTML = `<h3 style="font-family:'Special Elite',cursive;color:var(--brown);">✨Tips</h3>`;
  const tipsContainer = document.createElement('div');
  tipsContainer.style.display = 'grid';
  tipsContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
  tipsContainer.style.gap = '12px';

  readingTips.forEach((tip, i) => {
    const card = document.createElement('div');
    card.style.padding = '12px';
    card.style.borderRadius = '8px';
    card.style.border = '1px solid #e0cf9e';
    card.style.background = 'linear-gradient(180deg,#fdf6e3,#fff7e8)';
    card.style.boxShadow = '2px 2px 6px rgba(0,0,0,0.08)';
    card.style.display = 'flex';
    card.style.alignItems = 'flex-start';
    card.style.gap = '8px';
    const icon = tipIcons[i % tipIcons.length];
    card.innerHTML = `<div style="font-size:22px;">${icon}</div><div style="font-size:0.95rem;color:${'var(--brown)'}">${tip}</div>`;
    tipsContainer.appendChild(card);
  });

  contentArea.appendChild(tipsContainer);

  // Back button
  const backBtn = document.createElement('div');
  backBtn.style.marginTop = '10px';
  backBtn.innerHTML = `<button class="btn" id="tips-back">← Back to folders</button>`;
  contentArea.appendChild(backBtn);

  const tb = document.getElementById('tips-back');
  if (tb) tb.addEventListener('click', () => {
    contentArea.innerHTML = `<div class="placeholder"><h3>Select a folder to begin</h3><p>Your answers are saved when you submit a passage.</p></div>`;
  });
});

  function showPassageList(level){
    contentArea.innerHTML = `<h3 style="font-family:'Special Elite',cursive;color:var(--brown);">${capitalize(level)} Passages</h3>`;
    const list = document.createElement('div');
    list.className = 'passage-list';
    (passages[level] || []).forEach((p, idx) => {
      const item = document.createElement('div');
      item.className = 'passage-item';
const previewText = p.text || p.passage || "";
const preview = (previewText.length > 180) ? previewText.slice(0,180).trim() + '…' : previewText;
      item.innerHTML = `<strong>${p.title}</strong><div style="color:#6b4f3b;margin-top:6px;">${preview}</div>`;
      item.addEventListener('click', ()=> openPassage(level, idx));
      list.appendChild(item);
    });
    const backBtn = document.createElement('div');
    backBtn.style.marginTop = '10px';
    backBtn.innerHTML = `<button class="btn" id="list-back">← Back to folders</button>`;
    contentArea.appendChild(list);
    contentArea.appendChild(backBtn);
    const lb = document.getElementById('list-back');
    if (lb) lb.addEventListener('click', () => {
      contentArea.innerHTML = `<div class="placeholder"><h3>Select a folder to begin</h3><p>Your answers are saved when you submit.</p></div>`;
    });
  }

  // openPassage
  function openPassage(level, index){
    const p = (passages[level] || [])[index];
    if (!p) return;
    contentArea.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'passage';
    wrapper.innerHTML = `<h2>${p.title}</h2><p>${p.text}</p><div id="questions"></div>`;
    contentArea.appendChild(wrapper);
    const qDiv = document.getElementById('questions');

    p.questions.forEach((q, qi) => {
      const box = document.createElement('div');
      box.className = 'question';
      box.innerHTML = `<p><strong>Q${qi+1}.</strong> ${q.q}</p>`;
      if (level === 'literal') {
        (q.options || []).forEach((opt, oi) => {
          const id = `q${qi}_opt${oi}`;
          const label = document.createElement('label');
          label.innerHTML = `<input type="radio" name="q${qi}" value="${opt}" id="${id}" /> ${opt}`;
          box.appendChild(label);
        });
      } else {
        const ta = document.createElement('textarea');
        ta.id = `q${qi}_ta`;
        ta.placeholder = 'Type your answer here...';
        ta.rows = 4;
        box.appendChild(ta);
      }
      qDiv.appendChild(box);
    });

    // buttons
    const btnRow = document.createElement('div');
    btnRow.className = 'button-row';
    btnRow.innerHTML = `<button class="btn" id="back-btn">← Back</button><button class="btn" id="submit-btn">Submit Answers</button>`;
    contentArea.appendChild(btnRow);

    document.getElementById('back-btn').addEventListener('click', () => showPassageList(level));

    document.getElementById('submit-btn').addEventListener('click', () => {
      if (!currentUser) { alert('Please log in first.'); return; }
      if (level === 'literal') {
        let score = 0;
        p.questions.forEach((q, qi) => {
          const sel = document.querySelector(`input[name="q${qi}"]:checked`);
          if (sel) {
            const chosen = sel.value;
            if (typeof q.answer === 'string' && chosen.trim().toLowerCase() === q.answer.trim().toLowerCase()) score++;
          }
        });
        const total = p.questions.length;
        saveRecord(currentUser.username, p.title, 'Literal', score, total);
        alert(`You scored ${score} / ${total} — saved to your records.`);
        showPassageList(level);
      } else {
        // scoring: 5 / 3 / 0 per question
        let totalScore = 0;
        const perQ = 5;
        const questionResults = [];
        p.questions.forEach((q, qi) => {
          const ta = document.getElementById(`q${qi}_ta`);
          const ans = ta ? (ta.value || '') : '';
          const kw = Array.isArray(q.keywords) ? q.keywords : [];
          const pts = gradeEssayAnswerBroad(ans, kw);
          totalScore += pts;
          questionResults.push({ qi, pts });
        });
        const totalPossible = p.questions.length * perQ;
        saveRecord(currentUser.username, p.title, capitalize(level), totalScore, totalPossible);

        const pct = Math.round((totalScore / totalPossible) * 100);
        let msg = '';
        if (pct >= 90) msg = 'Excellent — your responses captured the main ideas and provided clear reasoning!';
        else if (pct >= 70) msg = 'Good job — your answers show understanding. A bit more detail or examples would raise your score.';
        else if (pct >= 45) msg = 'Nice effort — you connected some ideas. Try to explain more fully or include the main idea next time.';
        else msg = 'Keep practicing — review the passage and attempt to connect your points to the text more directly.';

        // Build a concise summary feedback (no per-question details as requested)
        const resultSummary = `Result for "${p.title}"\n\nScore: ${totalScore} / ${totalPossible} (${pct}%)\n\nFeedback:\n${msg}`;

        alert(resultSummary);
        showPassageList(level);
      }
    });
  }

function gradeEssayAnswerBroad(answer, keywords) {
  if (!answer || !answer.trim()) return 0;

  const text = answer.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
  const words = text.split(/\s+/).filter(Boolean);

  // if no keywords, fallback
  if (!Array.isArray(keywords) || keywords.length === 0) {
    return words.length >= 8 ? 3 : 0; // teacher review
  }

  // normalize keywords
  const kws = keywords.map(k => ('' + k).toLowerCase());
  const primaryCount = Math.min(2, kws.length);
  const primary = kws.slice(0, primaryCount);
  const related = kws.slice(primaryCount);

  // count matches
  let primaryMatches = primary.filter(pk => text.includes(pk)).length;
  let relatedMatches = related.filter(rk => text.includes(rk)).length;

  // check if answer is a sentence (naive: has at least one space + ends with . ? !)
  const isSentence = words.length > 1 && /[.?!]$/.test(answer.trim());

  // check if one-word answer
  if (words.length === 1 && kws.includes(words[0])) return 1;

  // scoring logic for sentence answers
  if (isSentence) {
    if (primaryMatches === primary.length) return 5;          // perfect answer
    if (primaryMatches > 0 || relatedMatches > 0) return 4;   // partial answer with keywords
    return 3;                                                  // related thought or opinion
  }

  // fallback
  return 0;
}

  function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

  // initialize
  contentArea.innerHTML = `<div class="placeholder"><h3>Select a folder to begin</h3><p>Your answers are saved when you submit a passage.</p></div>`;

  // expose loadRecordsIntoTable
  window.loadRecordsIntoTable = loadRecordsIntoTable;
})();

