import usersData from "@/services/mockData/users.json";

let users = [...usersData];

export const userService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 250));
    return [...users];
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const user = users.find(u => u.Id === parseInt(id));
    return user ? { ...user } : null;
  },

  async create(userData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newUser = {
      ...userData,
      Id: Math.max(...users.map(u => u.Id)) + 1
    };
    users.push(newUser);
    return { ...newUser };
  },

  async update(id, userData) {
    await new Promise(resolve => setTimeout(resolve, 350));
    const index = users.findIndex(u => u.Id === parseInt(id));
    if (index !== -1) {
      users[index] = { ...users[index], ...userData };
      return { ...users[index] };
    }
    throw new Error("User not found");
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 250));
    const index = users.findIndex(u => u.Id === parseInt(id));
    if (index !== -1) {
      const deletedUser = users.splice(index, 1)[0];
      return { ...deletedUser };
    }
throw new Error("User not found");
  },

  async getUserProjects(userId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const user = users.find(u => u.Id === parseInt(userId));
    if (!user) {
      throw new Error("User not found");
    }
    
    // Import dependencies dynamically to avoid circular imports
    const { taskService } = await import('./taskService.js');
    const { projectService } = await import('./projectService.js');
    
    const allTasks = await taskService.getAll();
    const allProjects = await projectService.getAll();
    
    const userTasks = allTasks.filter(task => 
      task.assignee?.toLowerCase() === user.name.toLowerCase()
    );
    const projectIds = [...new Set(userTasks.map(task => task.projectId))];
    
    return allProjects.filter(project => projectIds.includes(project.Id.toString()));
  },

  async getUserWorkloadStats(userId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const user = users.find(u => u.Id === parseInt(userId));
    if (!user) {
      throw new Error("User not found");
    }
    
    const { taskService } = await import('./taskService.js');
    const allTasks = await taskService.getAll();
    
    const userTasks = allTasks.filter(task => 
      task.assignee?.toLowerCase() === user.name.toLowerCase()
    );
    
    return {
      totalTasks: userTasks.length,
      completedTasks: userTasks.filter(t => t.status === "done").length,
      inProgressTasks: userTasks.filter(t => t.status === "in-progress").length,
      pendingTasks: userTasks.filter(t => t.status === "todo").length,
      reviewTasks: userTasks.filter(t => t.status === "review").length,
      activeTasks: userTasks.filter(t => t.status !== "done").length,
      completionRate: userTasks.length > 0 ? Math.round((userTasks.filter(t => t.status === "done").length / userTasks.length) * 100) : 0
    };
  }
};