const tasks = [];
const blocks = [];

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const blockForm = document.getElementById("blockForm");
const timeline = document.getElementById("timeline");
const focusScore = document.getElementById("focusScore");
const focusHelp = document.getElementById("focusHelp");
const deepWork = document.getElementById("deepWork");
const recovery = document.getElementById("recovery");
const intentions = document.getElementById("intentions");
const saveReflection = document.getElementById("saveReflection");
const saveStatus = document.getElementById("saveStatus");
const sampleDay = document.getElementById("sampleDay");
const newDay = document.getElementById("newDay");

const energyWeights = {
  high: 1,
  medium: 0.7,
  low: 0.4,
};

const blockWeights = {
  focus: 1,
  meeting: 0.6,
  recovery: 0.2,
};

const formatMinutes = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins}m`;
  }
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
};

const createTag = (text, className) => {
  const tag = document.createElement("span");
  tag.className = `tag ${className || ""}`.trim();
  tag.textContent = text;
  return tag;
};

const renderTasks = () => {
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const item = document.createElement("div");
    item.className = "task-item";

    const meta = document.createElement("div");
    meta.className = "task-meta";

    const title = document.createElement("div");
    title.className = "task-title";
    title.textContent = task.title;

    const tags = document.createElement("div");
    tags.className = "tags";
    tags.append(
      createTag(formatMinutes(task.minutes)),
      createTag(`${task.energy} energy`, task.energy),
      createTag(`P${task.priority}`, `priority-${task.priority}`)
    );

    meta.append(title, tags);

    const actions = document.createElement("div");
    actions.className = "actions";

    const doneBtn = document.createElement("button");
    doneBtn.className = "ghost";
    doneBtn.textContent = task.done ? "Undo" : "Done";
    doneBtn.addEventListener("click", () => {
      task.done = !task.done;
      renderTasks();
      updateStats();
    });

    const removeBtn = document.createElement("button");
    removeBtn.className = "solid";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      tasks.splice(index, 1);
      renderTasks();
      updateStats();
    });

    actions.append(doneBtn, removeBtn);

    if (task.done) {
      item.style.opacity = 0.6;
    }

    item.append(meta, actions);
    taskList.appendChild(item);
  });
};

const renderBlocks = () => {
  timeline.innerHTML = "";
  blocks.forEach((block, index) => {
    const item = document.createElement("div");
    item.className = `block-item ${block.type}`.trim();

    const meta = document.createElement("div");
    meta.className = "block-meta";

    const title = document.createElement("div");
    title.className = "task-title";
    title.textContent = block.title;

    const tags = document.createElement("div");
    tags.className = "tags";
    tags.append(
      createTag(formatMinutes(block.minutes)),
      createTag(block.type)
    );

    meta.append(title, tags);

    const actions = document.createElement("div");
    actions.className = "actions";

    const removeBtn = document.createElement("button");
    removeBtn.className = "solid";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      blocks.splice(index, 1);
      renderBlocks();
      updateStats();
    });

    actions.append(removeBtn);

    item.append(meta, actions);
    timeline.appendChild(item);
  });
};

const updateStats = () => {
  const plannedMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0);
  const doneMinutes = tasks.reduce(
    (sum, task) => sum + (task.done ? task.minutes : 0),
    0
  );

  const deepMinutes = blocks
    .filter((block) => block.type === "focus")
    .reduce((sum, block) => sum + block.minutes, 0);
  const recoveryMinutes = blocks
    .filter((block) => block.type === "recovery")
    .reduce((sum, block) => sum + block.minutes, 0);

  const focusPotential = tasks.reduce(
    (sum, task) => sum + task.minutes * energyWeights[task.energy],
    0
  );

  const focusAchieved = tasks.reduce(
    (sum, task) =>
      sum +
      (task.done ? task.minutes * energyWeights[task.energy] : 0),
    0
  );

  const blockFocus = blocks.reduce(
    (sum, block) => sum + block.minutes * blockWeights[block.type],
    0
  );

  const score = focusPotential === 0 ? 0 : Math.round((focusAchieved / focusPotential) * 100);

  focusScore.textContent = score;
  intentions.textContent = tasks.length;
  deepWork.textContent = `${(deepMinutes / 60).toFixed(1)}h`;
  recovery.textContent = `${(recoveryMinutes / 60).toFixed(1)}h`;

  if (tasks.length === 0) {
    focusHelp.textContent = "Plan tasks to calculate.";
  } else if (doneMinutes === plannedMinutes) {
    focusHelp.textContent = "All tasks done. Nice.";
  } else {
    focusHelp.textContent = `${formatMinutes(doneMinutes)} completed today.`;
  }

  return blockFocus;
};

const addTask = (task) => {
  tasks.push(task);
  renderTasks();
  updateStats();
};

const addBlock = (block) => {
  blocks.push(block);
  renderBlocks();
  updateStats();
};

const resetDay = () => {
  tasks.splice(0, tasks.length);
  blocks.splice(0, blocks.length);
  renderTasks();
  renderBlocks();
  updateStats();
  saveStatus.textContent = "Not saved yet.";
};

const loadSample = () => {
  resetDay();
  addTask({
    title: "Client strategy deck",
    minutes: 90,
    energy: "high",
    priority: "1",
    done: true,
  });
  addTask({
    title: "Weekly metrics review",
    minutes: 45,
    energy: "medium",
    priority: "2",
    done: false,
  });
  addTask({
    title: "Inbox cleanup",
    minutes: 30,
    energy: "low",
    priority: "3",
    done: true,
  });

  addBlock({
    title: "Deep work sprint",
    minutes: 120,
    type: "focus",
  });
  addBlock({
    title: "Team sync",
    minutes: 45,
    type: "meeting",
  });
  addBlock({
    title: "Walk + reset",
    minutes: 30,
    type: "recovery",
  });

  updateStats();
};

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(taskForm);
  addTask({
    title: data.get("taskTitle").trim(),
    minutes: Number(data.get("taskDuration")),
    energy: data.get("taskEnergy"),
    priority: data.get("taskPriority"),
    done: false,
  });
  taskForm.reset();
});

blockForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(blockForm);
  addBlock({
    title: data.get("blockTitle").trim(),
    minutes: Number(data.get("blockDuration")),
    type: data.get("blockType"),
  });
  blockForm.reset();
});

saveReflection.addEventListener("click", () => {
  const wins = document.getElementById("wins").value.trim();
  const stuck = document.getElementById("stuck").value.trim();
  const next = document.getElementById("next").value.trim();
  const status = `Saved at ${new Date().toLocaleTimeString()}`;
  saveStatus.textContent = wins || stuck || next ? status : "Nothing to save yet.";
});

sampleDay.addEventListener("click", loadSample);
newDay.addEventListener("click", resetDay);

updateStats();
