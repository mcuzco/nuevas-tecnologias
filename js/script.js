const form = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const calendar = document.getElementById('calendar');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const currentMonthYear = document.getElementById('currentMonthYear');
const tooltip = document.getElementById('tooltip');

let tasks = [];

let currentYear, currentMonth;

function init() {
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth();

  renderTasks();
  renderCalendar();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const taskName = document.getElementById('taskName').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const priority = document.getElementById('priority').value;
  const dueDate = document.getElementById('dueDate').value;

  if (!taskName || !subject || !priority || !dueDate) {
    alert('Por favor completa todos los campos.');
    return;
  }

  const task = {
    id: Date.now(),
    name: taskName,
    subject,
    priority,
    dueDate,
    completed: false,
  };

  tasks.push(task);

  renderTasks();
  renderCalendar();

  form.reset();
});

function renderTasks() {
  tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  taskList.innerHTML = '';

  tasks.forEach((task) => {
    const li = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.onchange = () => {
      task.completed = checkbox.checked;
      if (task.completed) li.classList.add('completed');
      else li.classList.remove('completed');
      renderCalendar();
    };

    const infoDiv = document.createElement('div');
    infoDiv.className = 'task-info';

    const taskNameEl = document.createElement('strong');
    taskNameEl.textContent = task.name;

    const details = document.createElement('div');
    details.className = 'details';

    let priorityClass = '';
    if (task.priority === 'Alta') priorityClass = 'priority-high';
    else if (task.priority === 'Media') priorityClass = 'priority-medium';
    else priorityClass = 'priority-low';

    details.innerHTML = `
      Materia: <em>${task.subject}</em> | 
      <span class="${priorityClass}">Prioridad: ${task.priority}</span> | 
      Fecha límite: ${new Date(task.dueDate).toLocaleDateString()}
    `;

    infoDiv.appendChild(taskNameEl);
    infoDiv.appendChild(details);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.title = "Eliminar tarea";
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    deleteBtn.onclick = () => {
      tasks = tasks.filter((t) => t.id !== task.id);
      renderTasks();
      renderCalendar();
    };

    if (task.completed) {
      li.classList.add('completed');
    } else {
      li.classList.remove('completed');
    }

    li.appendChild(checkbox);
    li.appendChild(infoDiv);
    li.appendChild(deleteBtn);

    taskList.appendChild(li);
  });
}

function renderCalendar() {
  calendar.innerHTML = '';

  const monthName = new Date(currentYear, currentMonth).toLocaleString('es-ES', {
    month: 'long',
  });
  currentMonthYear.textContent = `${capitalize(monthName)} ${currentYear}`;

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  daysOfWeek.forEach((day) => {
    const dayNameDiv = document.createElement('div');
    dayNameDiv.className = 'day-name';
    dayNameDiv.textContent = day;
    calendar.appendChild(dayNameDiv);
  });

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

  const totalCells = firstDay + lastDate;
  const rows = Math.ceil(totalCells / 7);
  const totalGridCells = rows * 7;

  for (let i = 0; i < totalGridCells; i++) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';

    if (i < firstDay || i >= firstDay + lastDate) {
      dayDiv.classList.add('inactive');
      calendar.appendChild(dayDiv);
      continue;
    }

    const dateNum = i - firstDay + 1;
    const dateNumberDiv = document.createElement('div');
    dateNumberDiv.className = 'date-number';
    dateNumberDiv.textContent = dateNum;
    dayDiv.appendChild(dateNumberDiv);

    const tasksContainer = document.createElement('div');
    tasksContainer.className = 'calendar-tasks-container';

    const dateStr = new Date(currentYear, currentMonth, dateNum).toISOString().slice(0, 10);

    const tasksForDay = tasks.filter((t) => t.dueDate === dateStr && !t.completed);

    tasksForDay.forEach((task) => {
      const taskDiv = document.createElement('div');
      taskDiv.className = 'task-calendar-item';

      if (task.priority === 'Alta') taskDiv.classList.add('task-high');
      else if (task.priority === 'Media') taskDiv.classList.add('task-medium');
      else taskDiv.classList.add('task-low');

      const taskTitle = document.createElement('div');
      taskTitle.className = 'task-title';
      taskTitle.textContent = task.name;

      const taskSubject = document.createElement('div');
      taskSubject.className = 'task-subject';
      taskSubject.textContent = task.subject;

      taskDiv.appendChild(taskTitle);
      taskDiv.appendChild(taskSubject);

      // Tooltip fijo que sigue el mouse
      taskDiv.addEventListener('mousemove', (e) => {
        tooltip.style.opacity = '1';

        const tooltipWidth = tooltip.offsetWidth || 280;
        const tooltipHeight = tooltip.offsetHeight || 80;
        let left = e.clientX + 15;
        let top = e.clientY + 15;

        if (left + tooltipWidth > window.innerWidth) {
          left = e.clientX - tooltipWidth - 15;
        }
        if (top + tooltipHeight > window.innerHeight) {
          top = e.clientY - tooltipHeight - 15;
        }

        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        tooltip.textContent = `${task.name}\nMateria: ${task.subject}`;
        tooltip.setAttribute('aria-hidden', 'false');
      });

      taskDiv.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
        tooltip.setAttribute('aria-hidden', 'true');
      });

      tasksContainer.appendChild(taskDiv);
    });

    dayDiv.appendChild(tasksContainer);

    calendar.appendChild(dayDiv);
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

prevMonthBtn.addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
});

init();
