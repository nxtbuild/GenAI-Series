document.addEventListener("DOMContentLoaded", function () {
  const taskInput = document.getElementById("new-task");
  const addTaskBtn = document.getElementById("add-task-btn");
  const taskList = document.getElementById("task-list");

  // Load stored tasks
  const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  storedTasks.forEach((task) => addTaskToDOM(task));

  // Add task
  addTaskBtn.addEventListener("click", function () {
    const taskText = taskInput.value.trim();
    if (taskText) {
      var task = { text: taskText, id: Date.now() };
      addTaskToDOM(task);
      storedTasks.push(task);
      localStorage.setItem("tasks", JSON.stringify(storedTasks));
      taskInput.value = "";
    }
  });

  // Remove task
  taskList.addEventListener("click", function (e) {
    if (e.target.tagName === "BUTTON") {
      const li = e.target.parentElement;
      const id = Number(li.getAttribute("data-id"));
      const index = storedTasks.findIndex((task) => task.id === id);
      if (index !== -1) {
        storedTasks.splice(index, 1);
        localStorage.setItem("tasks", JSON.stringify(storedTasks));
        taskList.removeChild(li);
      }
    }
  });

  // Add task to DOM
  function addTaskToDOM(task) {
    const li = document.createElement("li");
    li.textContent = task.text;
    li.setAttribute("data-id", task.id);
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    li.appendChild(removeBtn);
    taskList.appendChild(li);
  }
});
