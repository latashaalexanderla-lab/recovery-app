const STORAGE_KEY = "recovery-check-ins";
const SOBRIETY_DATE_KEY = "recovery-sobriety-date";

const encouragements = [
  "You made it to today, and that matters. Even a quiet check-in is a meaningful act of recovery.",
  "If today feels heavy, you are not failing. Staying present with yourself is real work.",
  "Recovery often looks like small steady choices. The steps you take today still count.",
  "It takes honesty to notice what is going on inside. That honesty can be part of your strength today.",
  "A hard day does not undo the care you have already given yourself. You are still in this.",
  "Beginning again is part of recovery for many people. You can meet today with compassion instead of judgment.",
  "You do not have to carry the whole journey at once. One supported day at a time is enough for today.",
];

const todayLabel = document.getElementById("todayLabel");
const sobrietyDateInput = document.getElementById("sobrietyDate");
const recoveryCounter = document.getElementById("recoveryCounter");
const counterMessage = document.getElementById("counterMessage");
const streakCounter = document.getElementById("streakCounter");
const milestoneSummary = document.getElementById("milestoneSummary");
const milestonesList = document.getElementById("milestonesList");
const moodGrid = document.getElementById("moodGrid");
const moodButtons = Array.from(document.querySelectorAll(".mood-option"));
const notesInput = document.getElementById("notesInput");
const encouragementMessage = document.getElementById("encouragementMessage");
const saveButton = document.getElementById("saveButton");
const exportButton = document.getElementById("exportButton");
const saveStatus = document.getElementById("saveStatus");
const historyList = document.getElementById("historyList");

let selectedMood = "";

const milestones = [
  { label: "30 Days", days: 30 },
  { label: "60 Days", days: 60 },
  { label: "90 Days", days: 90 },
];

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTodayLabel() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

function formatHistoryDate(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function parseDateInput(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addToDate(date, amount) {
  const nextDate = new Date(date.getTime());

  if (amount.days) {
    nextDate.setDate(nextDate.getDate() + amount.days);
  }

  if (amount.months) {
    nextDate.setMonth(nextDate.getMonth() + amount.months);
  }

  if (amount.years) {
    nextDate.setFullYear(nextDate.getFullYear() + amount.years);
  }

  return nextDate;
}

function daysBetween(startDate, endDate) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((endDate - startDate) / msPerDay);
}

function formatMilestoneDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatRecoveryCounter(dateString) {
  if (!dateString) {
    return "Choose a date to begin your recovery counter.";
  }

  const startDate = parseDateInput(dateString);
  const today = new Date();
  const currentDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  if (startDate > currentDate) {
    return "Choose today or an earlier date to start tracking recovery time.";
  }

  let years = currentDate.getFullYear() - startDate.getFullYear();
  let months = currentDate.getMonth() - startDate.getMonth();
  let days = currentDate.getDate() - startDate.getDate();

  if (days < 0) {
    const previousMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    );
    days += previousMonth.getDate();
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  return `${years} year${years === 1 ? "" : "s"}, ${months} month${
    months === 1 ? "" : "s"
  }, ${days} day${days === 1 ? "" : "s"} in recovery`;
}

function formatStreakCounter(dateString) {
  if (!dateString) {
    return "0 days";
  }

  const startDate = parseDateInput(dateString);
  const today = new Date();
  const currentDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  if (startDate > currentDate) {
    return "0 days";
  }

  const streakDays = daysBetween(startDate, currentDate) + 1;
  return `${streakDays} day${streakDays === 1 ? "" : "s"}`;
}

function getRecoveryDayCount(dateString) {
  if (!dateString) {
    return null;
  }

  const startDate = parseDateInput(dateString);
  const today = new Date();
  const currentDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  if (startDate > currentDate) {
    return null;
  }

  return daysBetween(startDate, currentDate) + 1;
}

function getCounterMessage(dateString) {
  const dayCount = getRecoveryDayCount(dateString);

  if (!dayCount) {
    return "One day at a time still counts.";
  }

  if (dayCount <= 7) {
    return "Every day matters. Showing up for yourself right now is meaningful.";
  }

  if (dayCount <= 30) {
    return "These early days ask a lot of you. Staying with your recovery today is enough.";
  }

  if (dayCount <= 90) {
    return "You are building trust with yourself one steady day at a time.";
  }

  if (dayCount <= 180) {
    return "The work you are doing is taking root. Your consistency is something to honor.";
  }

  if (dayCount <= 365) {
    return "Your consistency is powerful. The life you are building deserves to be noticed.";
  }

  return "The time you have protected matters. Your recovery is being shaped by steady care.";
}

function renderMilestones(dateString) {
  milestonesList.innerHTML = "";

  if (!dateString) {
    milestoneSummary.textContent =
      "Add your sobriety date to see milestone progress.";
    return;
  }

  const startDate = parseDateInput(dateString);
  const today = new Date();
  const currentDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  if (startDate > currentDate) {
    milestoneSummary.textContent =
      "Milestones will appear once the selected date is today or earlier.";
    return;
  }

  const milestoneEntries = milestones.map((milestone) => {
    const targetDate = addToDate(startDate, milestone);
    const complete = targetDate <= currentDate;
    const daysAway = daysBetween(currentDate, targetDate);
    return {
      ...milestone,
      targetDate,
      complete,
      daysAway,
    };
  });

  const nextMilestone = milestoneEntries.find((entry) => !entry.complete);

  if (nextMilestone) {
    milestoneSummary.textContent = `${nextMilestone.label} arrives on ${formatMilestoneDate(
      nextMilestone.targetDate
    )}. Keep going.`;
  } else {
    milestoneSummary.textContent =
      "You’ve moved beyond 90 days. Keep honoring the recovery you are building.";
  }

  milestoneEntries.forEach((entry) => {
    const card = document.createElement("article");
    const isNext = nextMilestone && nextMilestone.label === entry.label;
    card.className = `milestone-item${entry.complete ? " is-complete" : ""}${
      isNext ? " is-next" : ""
    }`;

    const name = document.createElement("p");
    name.className = "milestone-name";
    name.textContent = entry.label;

    const status = document.createElement("p");
    status.className = "milestone-status";
    if (entry.complete) {
      status.textContent = "Reached";
    } else if (entry.daysAway === 0) {
      status.textContent = "Today";
    } else if (entry.daysAway === 1) {
      status.textContent = "1 day to go";
    } else {
      status.textContent = `${entry.daysAway} days to go`;
    }

    const date = document.createElement("p");
    date.className = "milestone-date";
    date.textContent = formatMilestoneDate(entry.targetDate);

    card.append(name, status, date);
    milestonesList.append(card);
  });
}

function getMessageForDate(dateKey) {
  const dayIndex = Math.abs(
    dateKey.split("-").reduce((sum, part) => sum + Number(part), 0)
  );
  return encouragements[dayIndex % encouragements.length];
}

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Unable to load saved check-ins", error);
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function loadSobrietyDate() {
  return localStorage.getItem(SOBRIETY_DATE_KEY) || "";
}

function saveSobrietyDate(dateString) {
  if (!dateString) {
    localStorage.removeItem(SOBRIETY_DATE_KEY);
    return;
  }

  localStorage.setItem(SOBRIETY_DATE_KEY, dateString);
}

function setSelectedMood(mood) {
  selectedMood = mood;

  moodButtons.forEach((button) => {
    const isSelected = button.dataset.mood === mood;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-checked", String(isSelected));
  });
}

function renderHistory(entries) {
  historyList.innerHTML = "";

  if (!entries.length) {
    const emptyState = document.createElement("p");
    emptyState.className = "history-empty";
    emptyState.textContent =
      "Your recent check-ins will appear here once you save a day.";
    historyList.append(emptyState);
    return;
  }

  entries
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7)
    .forEach((entry) => {
      const article = document.createElement("article");
      article.className = "history-item";

      const topline = document.createElement("div");
      topline.className = "history-topline";

      const date = document.createElement("p");
      date.className = "history-date";
      date.textContent = formatHistoryDate(entry.date);

      const mood = document.createElement("p");
      mood.className = "history-mood";
      mood.textContent = entry.mood;

      const message = document.createElement("p");
      message.className = "history-message";
      message.textContent = entry.message;

      const notes = document.createElement("p");
      notes.className = "history-notes";
      notes.textContent = entry.notes
        ? entry.notes
        : "No notes saved for this day.";

      topline.append(date, mood);
      article.append(topline, message, notes);
      historyList.append(article);
    });
}

function loadTodayEntry(entries) {
  const todayEntry = entries.find((entry) => entry.date === getTodayKey());

  if (!todayEntry) {
    setSelectedMood("");
    notesInput.value = "";
    encouragementMessage.textContent = getMessageForDate(getTodayKey());
    return;
  }

  setSelectedMood(todayEntry.mood);
  notesInput.value = todayEntry.notes;
  encouragementMessage.textContent = todayEntry.message;
}

function upsertTodayEntry(entries) {
  const todayKey = getTodayKey();
  const message = getMessageForDate(todayKey);
  const nextEntry = {
    date: todayKey,
    mood: selectedMood,
    notes: notesInput.value.trim(),
    message,
  };
  const existingIndex = entries.findIndex((entry) => entry.date === todayKey);

  if (existingIndex >= 0) {
    entries[existingIndex] = nextEntry;
  } else {
    entries.push(nextEntry);
  }

  return entries;
}

moodGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".mood-option");
  if (!button) {
    return;
  }

  setSelectedMood(button.dataset.mood);
  saveStatus.textContent = "";
});

saveButton.addEventListener("click", () => {
  if (!selectedMood) {
    saveStatus.textContent = "Choose a mood before saving today’s check-in.";
    return;
  }

  const entries = upsertTodayEntry(loadEntries());
  saveEntries(entries);
  encouragementMessage.textContent = getMessageForDate(getTodayKey());
  renderHistory(entries);
  saveStatus.textContent = "Today’s check-in has been saved.";
});

sobrietyDateInput.addEventListener("input", () => {
  const dateString = sobrietyDateInput.value;
  saveSobrietyDate(dateString);
  recoveryCounter.textContent = formatRecoveryCounter(dateString);
  counterMessage.textContent = getCounterMessage(dateString);
  streakCounter.textContent = formatStreakCounter(dateString);
  renderMilestones(dateString);
});

exportButton.addEventListener("click", () => {
  const exportData = {
    sobrietyDate: loadSobrietyDate(),
    checkIns: loadEntries(),
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dateStamp = getTodayKey();

  link.href = url;
  link.download = `recovery-check-ins-${dateStamp}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  saveStatus.textContent = "Your check-ins were downloaded as a JSON file.";
});

function init() {
  const entries = loadEntries();
  const sobrietyDate = loadSobrietyDate();
  todayLabel.textContent = formatTodayLabel();
  sobrietyDateInput.value = sobrietyDate;
  recoveryCounter.textContent = formatRecoveryCounter(sobrietyDate);
  counterMessage.textContent = getCounterMessage(sobrietyDate);
  streakCounter.textContent = formatStreakCounter(sobrietyDate);
  renderMilestones(sobrietyDate);
  encouragementMessage.textContent = getMessageForDate(getTodayKey());
  renderHistory(entries);
  loadTodayEntry(entries);
}

init();
