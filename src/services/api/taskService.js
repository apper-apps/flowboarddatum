import tasksData from "@/services/mockData/tasks.json";

let tasks = [...tasksData];

export const taskService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...tasks];
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const task = tasks.find(t => t.Id === parseInt(id));
    return task ? { ...task } : null;
  },

  async getByProjectId(projectId) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return tasks.filter(t => t.projectId === projectId.toString()).map(t => ({ ...t }));
  },

  async create(taskData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newTask = {
      ...taskData,
      Id: Math.max(...tasks.map(t => t.Id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    tasks.push(newTask);
    return { ...newTask };
  },

  async update(id, taskData) {
    await new Promise(resolve => setTimeout(resolve, 350));
    const index = tasks.findIndex(t => t.Id === parseInt(id));
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...taskData, updatedAt: new Date().toISOString() };
      return { ...tasks[index] };
    }
    throw new Error("Task not found");
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 250));
    const index = tasks.findIndex(t => t.Id === parseInt(id));
    if (index !== -1) {
      const deletedTask = tasks.splice(index, 1)[0];
      return { ...deletedTask };
    }
    throw new Error("Task not found");
  },

  async updateStatus(id, status) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = tasks.findIndex(t => t.Id === parseInt(id));
    if (index !== -1) {
      tasks[index] = { 
        ...tasks[index], 
        status, 
        updatedAt: new Date().toISOString() 
      };
      return { ...tasks[index] };
    }
    throw new Error("Task not found");
  }
};