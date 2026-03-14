let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
let meals = JSON.parse(localStorage.getItem('meals')) || [];

// ===== DOM ЭЛЕМЕНТЫ =====
const workoutForm = document.getElementById('workout-form');
const mealForm = document.getElementById('meal-form');
const workoutList = document.getElementById('workout-list');
const mealList = document.getElementById('meal-list');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// ===== УСТАНОВКА ТЕКУЩЕЙ ДАТЫ =====
function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('workout-date').value = today;
    document.getElementById('meal-date').value = today;
}

// ===== ПЕРЕКЛЮЧЕНИЕ ТАБОВ =====
function initTabs() {
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            if (tabId === 'stats') {
                updateStats();
            }
        });
    });
}

// ===== ФОРМАТИРОВАНИЕ ДАТЫ =====
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('ru-RU', options);
}

// ===== СОХРАНЕНИЕ ДАННЫХ =====
function saveData() {
    localStorage.setItem('workouts', JSON.stringify(workouts));
    localStorage.setItem('meals', JSON.stringify(meals));
}

// ===== ДОБАВЛЕНИЕ ТРЕНИРОВКИ =====
function addWorkout(e) {
    e.preventDefault();
    
    const workout = {
        id: Date.now(),
        date: document.getElementById('workout-date').value,
        type: document.getElementById('workout-type').value,
        duration: parseInt(document.getElementById('workout-duration').value) || 0,
        calories: parseInt(document.getElementById('workout-calories').value) || 0,
        notes: document.getElementById('workout-notes').value.trim()
    };
    
    workouts.unshift(workout);
    saveData();
    renderWorkouts();
    
    workoutForm.reset();
    setDefaultDates();
    
    showNotification('Тренировка добавлена!');
}

// ===== ДОБАВЛЕНИЕ ПРИЁМА ПИЩИ =====
function addMeal(e) {
    e.preventDefault();
    
    const meal = {
        id: Date.now(),
        date: document.getElementById('meal-date').value,
        type: document.getElementById('meal-type').value,
        name: document.getElementById('meal-name').value.trim(),
        calories: parseInt(document.getElementById('meal-calories').value) || 0,
        protein: parseInt(document.getElementById('meal-protein').value) || 0,
        fat: parseInt(document.getElementById('meal-fat').value) || 0,
        carbs: parseInt(document.getElementById('meal-carbs').value) || 0,
        notes: document.getElementById('meal-notes').value.trim()
    };
    
    meals.unshift(meal);
    saveData();
    renderMeals();
    
    mealForm.reset();
    setDefaultDates();
    
    showNotification('Приём пищи добавлен!');
}

// ===== УДАЛЕНИЕ ТРЕНИРОВКИ =====
function deleteWorkout(id) {
    if (confirm('Удалить эту тренировку?')) {
        workouts = workouts.filter(w => w.id !== id);
        saveData();
        renderWorkouts();
        showNotification('Тренировка удалена');
    }
}

// ===== УДАЛЕНИЕ ПРИЁМА ПИЩИ =====
function deleteMeal(id) {
    if (confirm('Удалить этот приём пищи?')) {
        meals = meals.filter(m => m.id !== id);
        saveData();
        renderMeals();
        showNotification('Приём пищи удалён');
    }
}

// ===== РЕНДЕР ТРЕНИРОВОК =====
function renderWorkouts() {
    const filterDate = document.getElementById('workout-filter-date').value;
    const filterType = document.getElementById('workout-filter-type').value;
    
    let filtered = [...workouts];
    
    if (filterDate) {
        filtered = filtered.filter(w => w.date === filterDate);
    }
    if (filterType) {
        filtered = filtered.filter(w => w.type === filterType);
    }
    
    if (filtered.length === 0) {
        workoutList.innerHTML = '<div class="no-entries">Нет записей о тренировках</div>';
        return;
    }
    
    workoutList.innerHTML = filtered.map(w => `
        <div class="entry-item">
            <div class="entry-info">
                <div class="entry-date">${formatDate(w.date)}</div>
                <div class="entry-title">
                    <span class="badge badge-type">${w.type}</span>
                    <span>${w.duration} мин</span>
                    ${w.calories ? `<span class="badge badge-burned">-${w.calories} ккал</span>` : ''}
                </div>
                ${w.notes ? `<div class="entry-details">${w.notes}</div>` : ''}
            </div>
            <div class="entry-actions">
                <button class="btn btn-danger btn-small" onclick="deleteWorkout(${w.id})">Удалить</button>
            </div>
        </div>
    `).join('');
}

// ===== РЕНДЕР ПИТАНИЯ =====
function renderMeals() {
    const filterDate = document.getElementById('meal-filter-date').value;
    const filterType = document.getElementById('meal-filter-type').value;
    
    let filtered = [...meals];
    
    if (filterDate) {
        filtered = filtered.filter(m => m.date === filterDate);
    }
    if (filterType) {
        filtered = filtered.filter(m => m.type === filterType);
    }
    
    if (filtered.length === 0) {
        mealList.innerHTML = '<div class="no-entries">Нет записей о питании</div>';
        return;
    }
    
    mealList.innerHTML = filtered.map(m => `
        <div class="entry-item">
            <div class="entry-info">
                <div class="entry-date">${formatDate(m.date)}</div>
                <div class="entry-title">
                    <span class="badge badge-type">${m.type}</span>
                    <span>${m.name}</span>
                    <span class="badge badge-calories">${m.calories} ккал</span>
                </div>
                <div class="entry-details">
                    Б: ${m.protein}г | Ж: ${m.fat}г | У: ${m.carbs}г
                    ${m.notes ? ` | ${m.notes}` : ''}
                </div>
            </div>
            <div class="entry-actions">
                <button class="btn btn-danger btn-small" onclick="deleteMeal(${m.id})">Удалить</button>
            </div>
        </div>
    `).join('');
}

// ===== ОБНОВЛЕНИЕ СТАТИСТИКИ =====
function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    
    const totalWorkouts = workouts.length;
    const totalWorkoutTime = workouts.reduce((sum, w) => sum + w.duration, 0);
    const totalBurned = workouts.reduce((sum, w) => sum + w.calories, 0);
    
    const totalMeals = meals.length;
    const uniqueDays = [...new Set(meals.map(m => m.date))];
    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
    const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
    
    const avgCalories = uniqueDays.length ? Math.round(totalCalories / uniqueDays.length) : 0;
    const avgProtein = uniqueDays.length ? Math.round(totalProtein / uniqueDays.length) : 0;
    
    const todayMeals = meals.filter(m => m.date === today);
    const todayWorkouts = workouts.filter(w => w.date === today);
    
    const todayCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
    const todayProtein = todayMeals.reduce((sum, m) => sum + m.protein, 0);
    const todayWorkoutTime = todayWorkouts.reduce((sum, w) => sum + w.duration, 0);
    const todayBurned = todayWorkouts.reduce((sum, w) => sum + w.calories, 0);
    
    document.getElementById('total-workouts').textContent = totalWorkouts;
    document.getElementById('total-workout-time').textContent = totalWorkoutTime;
    document.getElementById('total-burned').textContent = totalBurned;
    document.getElementById('total-meals').textContent = totalMeals;
    document.getElementById('avg-calories').textContent = avgCalories;
    document.getElementById('avg-protein').textContent = avgProtein;
    
    document.getElementById('today-calories').textContent = todayCalories;
    document.getElementById('today-protein').textContent = todayProtein;
    document.getElementById('today-workout').textContent = todayWorkoutTime;
    document.getElementById('today-burned').textContent = todayBurned;
}

// ===== ЭКСПОРТ ДАННЫХ =====
function exportData() {
    const data = {
        workouts: workouts,
        meals: meals,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitness-diary-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Данные экспортированы!');
}

// ===== ИМПОРТ ДАННЫХ =====
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.workouts && Array.isArray(data.workouts)) {
                workouts = data.workouts;
            }
            if (data.meals && Array.isArray(data.meals)) {
                meals = data.meals;
            }
            
            saveData();
            renderWorkouts();
            renderMeals();
            
            showNotification('Данные успешно импортированы!');
        } catch (err) {
            showNotification('Ошибка при импорте данных', true);
            console.error(err);
        }
    };
    
    reader.readAsText(file);
    event.target.value = '';
}

// ===== ОЧИСТКА ДАННЫХ =====
function clearAllData() {
    if (confirm('Вы уверены? Все данные будут безвозвратно удалены!')) {
        workouts = [];
        meals = [];
        saveData();
        renderWorkouts();
        renderMeals();
        updateStats();
        showNotification('Все данные удалены');
    }
}

// ===== УВЕДОМЛЕНИЯ =====
function showNotification(message, isError = false) {
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) {
        oldNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${isError ? '#ff6b6b' : '#00d4aa'};
        color: ${isError ? 'white' : '#0f0f0f'};
        border-radius: 10px;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
    `;
    notification.textContent = message;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== ИНИЦИАЛИЗАЦИЯ ФИЛЬТРОВ =====
function initFilters() {
    document.getElementById('workout-filter-date').addEventListener('change', renderWorkouts);
    document.getElementById('workout-filter-type').addEventListener('change', renderWorkouts);
    document.getElementById('meal-filter-date').addEventListener('change', renderMeals);
    document.getElementById('meal-filter-type').addEventListener('change', renderMeals);
}

// ===== ИНИЦИАЛИЗАЦИЯ КНОПОК ДАННЫХ =====
function initDataButtons() {
    document.getElementById('export-btn').addEventListener('click', exportData);
    document.getElementById('import-file').addEventListener('change', importData);
    document.getElementById('clear-btn').addEventListener('click', clearAllData);
}

// ===== ЗАПУСК ПРИЛОЖЕНИЯ =====
function init() {
    setDefaultDates();
    initTabs();
    initFilters();
    initDataButtons();
    
    workoutForm.addEventListener('submit', addWorkout);
    mealForm.addEventListener('submit', addMeal);
    
    renderWorkouts();
    renderMeals();
    
    console.log('Дневник тренировок и питания загружен!');
}

document.addEventListener('DOMContentLoaded', init);