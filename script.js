/**
 * Дневник тренировок и питания
 * Данные: localStorage (ключи workouts, meals)
 */
(function () {
  "use strict";

  const STORAGE_WORKOUTS = "workouts";
  const STORAGE_MEALS = "meals";

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : fallback;
    } catch {
      return fallback;
    }
  }

  let workouts = loadJson(STORAGE_WORKOUTS, []);
  let meals = loadJson(STORAGE_MEALS, []);

  function saveData() {
    localStorage.setItem(STORAGE_WORKOUTS, JSON.stringify(workouts));
    localStorage.setItem(STORAGE_MEALS, JSON.stringify(meals));
  }

  function escapeHtml(text) {
    if (text == null) return "";
    const div = document.createElement("div");
    div.textContent = String(text);
    return div.innerHTML;
  }

  function todayIso() {
    return new Date().toISOString().split("T")[0];
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr + "T12:00:00");
    if (Number.isNaN(d.getTime())) return escapeHtml(dateStr);
    return d.toLocaleDateString("ru-RU", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function setDefaultDates() {
    const t = todayIso();
    const wDate = document.getElementById("workout-date");
    const mDate = document.getElementById("meal-date");
    if (wDate) wDate.value = t;
    if (mDate) mDate.value = t;
  }

  function showNotification(message, isError) {
    document.querySelectorAll(".notification").forEach((n) => n.remove());

    const el = document.createElement("div");
    el.className = "notification " + (isError ? "notification--err" : "notification--ok");
    el.setAttribute("role", "status");
    el.textContent = message;
    document.body.appendChild(el);

    const t = setTimeout(() => {
      el.style.animation = "notifyIn 0.25s ease reverse";
      setTimeout(() => el.remove(), 250);
    }, 2800);
    el.addEventListener("click", () => {
      clearTimeout(t);
      el.remove();
    });
  }

  function switchTab(tabId) {
    const buttons = document.querySelectorAll(".tab-btn");
    const panels = document.querySelectorAll(".tab-content");

    buttons.forEach((btn) => {
      const active = btn.getAttribute("data-tab") === tabId;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });

    panels.forEach((panel) => {
      const active = panel.id === tabId;
      panel.classList.toggle("active", active);
      panel.hidden = !active;
    });

    if (tabId === "stats") updateStats();
  }

  function initTabs() {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-tab");
        if (id) switchTab(id);
      });
    });
  }

  function addWorkout(e) {
    e.preventDefault();
    const workout = {
      id: Date.now(),
      date: document.getElementById("workout-date").value,
      type: document.getElementById("workout-type").value,
      duration: parseInt(document.getElementById("workout-duration").value, 10) || 0,
      calories: parseInt(document.getElementById("workout-calories").value, 10) || 0,
      notes: document.getElementById("workout-notes").value.trim(),
    };

    workouts.unshift(workout);
    saveData();
    renderWorkouts();
    document.getElementById("workout-form").reset();
    setDefaultDates();
    showNotification("Тренировка добавлена!");
  }

  function addMeal(e) {
    e.preventDefault();
    const meal = {
      id: Date.now(),
      date: document.getElementById("meal-date").value,
      type: document.getElementById("meal-type").value,
      name: document.getElementById("meal-name").value.trim(),
      calories: parseInt(document.getElementById("meal-calories").value, 10) || 0,
      protein: parseInt(document.getElementById("meal-protein").value, 10) || 0,
      fat: parseInt(document.getElementById("meal-fat").value, 10) || 0,
      carbs: parseInt(document.getElementById("meal-carbs").value, 10) || 0,
      notes: document.getElementById("meal-notes").value.trim(),
    };

    meals.unshift(meal);
    saveData();
    renderMeals();
    document.getElementById("meal-form").reset();
    setDefaultDates();
    showNotification("Приём пищи добавлен!");
  }

  function deleteWorkout(id) {
    if (!confirm("Удалить эту тренировку?")) return;
    workouts = workouts.filter((w) => w.id !== id);
    saveData();
    renderWorkouts();
    showNotification("Тренировка удалена");
  }

  function deleteMeal(id) {
    if (!confirm("Удалить этот приём пищи?")) return;
    meals = meals.filter((m) => m.id !== id);
    saveData();
    renderMeals();
    showNotification("Приём пищи удалён");
  }

  function renderWorkouts() {
    const list = document.getElementById("workout-list");
    const filterDate = document.getElementById("workout-filter-date").value;
    const filterType = document.getElementById("workout-filter-type").value;

    let filtered = workouts.slice();
    if (filterDate) filtered = filtered.filter((w) => w.date === filterDate);
    if (filterType) filtered = filtered.filter((w) => w.type === filterType);

    if (filtered.length === 0) {
      list.innerHTML = '<div class="no-entries">Нет записей о тренировках</div>';
      return;
    }

    list.innerHTML = filtered
      .map((w) => {
        const notesHtml = w.notes
          ? `<div class="entry-details">${escapeHtml(w.notes)}</div>`
          : "";
        const calHtml = w.calories
          ? `<span class="badge badge-burned">-${escapeHtml(String(w.calories))} ккал</span>`
          : "";
        return `
        <div class="entry-item" data-id="${w.id}">
          <div class="entry-info">
            <div class="entry-date">${formatDate(w.date)}</div>
            <div class="entry-title">
              <span class="badge badge-type">${escapeHtml(w.type)}</span>
              <span>${escapeHtml(String(w.duration))} мин</span>
              ${calHtml}
            </div>
            ${notesHtml}
          </div>
          <div class="entry-actions">
            <button type="button" class="btn btn-danger btn-small" data-action="del-workout" data-id="${w.id}">Удалить</button>
          </div>
        </div>`;
      })
      .join("");
  }

  function renderMeals() {
    const list = document.getElementById("meal-list");
    const filterDate = document.getElementById("meal-filter-date").value;
    const filterType = document.getElementById("meal-filter-type").value;

    let filtered = meals.slice();
    if (filterDate) filtered = filtered.filter((m) => m.date === filterDate);
    if (filterType) filtered = filtered.filter((m) => m.type === filterType);

    if (filtered.length === 0) {
      list.innerHTML = '<div class="no-entries">Нет записей о питании</div>';
      return;
    }

    list.innerHTML = filtered
      .map((m) => {
        const notesPart = m.notes ? ` | ${escapeHtml(m.notes)}` : "";
        return `
        <div class="entry-item" data-id="${m.id}">
          <div class="entry-info">
            <div class="entry-date">${formatDate(m.date)}</div>
            <div class="entry-title">
              <span class="badge badge-type">${escapeHtml(m.type)}</span>
              <span>${escapeHtml(m.name)}</span>
              <span class="badge badge-calories">${escapeHtml(String(m.calories))} ккал</span>
            </div>
            <div class="entry-details">
              Б: ${escapeHtml(String(m.protein))}г | Ж: ${escapeHtml(String(m.fat))}г | У: ${escapeHtml(String(m.carbs))}г${notesPart}
            </div>
          </div>
          <div class="entry-actions">
            <button type="button" class="btn btn-danger btn-small" data-action="del-meal" data-id="${m.id}">Удалить</button>
          </div>
        </div>`;
      })
      .join("");
  }

  function updateStats() {
    const today = todayIso();

    const totalWorkouts = workouts.length;
    const totalWorkoutTime = workouts.reduce((s, w) => s + (w.duration || 0), 0);
    const totalBurned = workouts.reduce((s, w) => s + (w.calories || 0), 0);

    const totalMeals = meals.length;
    const uniqueDays = [...new Set(meals.map((m) => m.date).filter(Boolean))];
    const totalCalories = meals.reduce((s, m) => s + (m.calories || 0), 0);
    const totalProtein = meals.reduce((s, m) => s + (m.protein || 0), 0);

    const avgCalories = uniqueDays.length ? Math.round(totalCalories / uniqueDays.length) : 0;
    const avgProtein = uniqueDays.length ? Math.round(totalProtein / uniqueDays.length) : 0;

    const todayMeals = meals.filter((m) => m.date === today);
    const todayWorkouts = workouts.filter((w) => w.date === today);

    const todayCalories = todayMeals.reduce((s, m) => s + (m.calories || 0), 0);
    const todayProtein = todayMeals.reduce((s, m) => s + (m.protein || 0), 0);
    const todayWorkoutTime = todayWorkouts.reduce((s, w) => s + (w.duration || 0), 0);
    const todayBurned = todayWorkouts.reduce((s, w) => s + (w.calories || 0), 0);

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(val);
    };

    set("total-workouts", totalWorkouts);
    set("total-workout-time", totalWorkoutTime);
    set("total-burned", totalBurned);
    set("total-meals", totalMeals);
    set("avg-calories", avgCalories);
    set("avg-protein", avgProtein);
    set("today-calories", todayCalories);
    set("today-protein", todayProtein);
    set("today-workout", todayWorkoutTime);
    set("today-burned", todayBurned);
  }

  function exportData() {
    const data = {
      workouts,
      meals,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitness-diary-${todayIso()}.json`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showNotification("Данные экспортированы!");
  }

  function importData(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        if (data.workouts && Array.isArray(data.workouts)) workouts = data.workouts;
        if (data.meals && Array.isArray(data.meals)) meals = data.meals;
        saveData();
        renderWorkouts();
        renderMeals();
        showNotification("Данные успешно импортированы!");
      } catch (err) {
        console.error(err);
        showNotification("Ошибка при импорте данных", true);
      }
    };
    reader.readAsText(file, "UTF-8");
    event.target.value = "";
  }

  function clearAllData() {
    if (!confirm("Вы уверены? Все данные будут безвозвратно удалены!")) return;
    workouts = [];
    meals = [];
    saveData();
    renderWorkouts();
    renderMeals();
    updateStats();
    showNotification("Все данные удалены");
  }

  function initListDelegation() {
    document.getElementById("workout-list").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action='del-workout']");
      if (!btn) return;
      const id = Number(btn.getAttribute("data-id"));
      if (!Number.isNaN(id)) deleteWorkout(id);
    });

    document.getElementById("meal-list").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action='del-meal']");
      if (!btn) return;
      const id = Number(btn.getAttribute("data-id"));
      if (!Number.isNaN(id)) deleteMeal(id);
    });
  }

  function init() {
    document.querySelectorAll(".tab-content").forEach((p) => {
      p.hidden = !p.classList.contains("active");
    });

    setDefaultDates();
    initTabs();
    initListDelegation();

    document.getElementById("workout-filter-date").addEventListener("change", renderWorkouts);
    document.getElementById("workout-filter-type").addEventListener("change", renderWorkouts);
    document.getElementById("meal-filter-date").addEventListener("change", renderMeals);
    document.getElementById("meal-filter-type").addEventListener("change", renderMeals);

    document.getElementById("export-btn").addEventListener("click", exportData);
    document.getElementById("import-file").addEventListener("change", importData);
    document.getElementById("clear-btn").addEventListener("click", clearAllData);

    document.getElementById("workout-form").addEventListener("submit", addWorkout);
    document.getElementById("meal-form").addEventListener("submit", addMeal);

    renderWorkouts();
    renderMeals();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
