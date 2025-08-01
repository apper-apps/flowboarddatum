import projectsData from "@/services/mockData/projects.json";

let projects = [...projectsData];

export const projectService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...projects];
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const project = projects.find(p => p.Id === parseInt(id));
    return project ? { ...project } : null;
  },

  async create(projectData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newProject = {
      ...projectData,
      Id: Math.max(...projects.map(p => p.Id)) + 1,
      createdAt: new Date().toISOString()
    };
    projects.push(newProject);
    return { ...newProject };
  },

  async update(id, projectData) {
    await new Promise(resolve => setTimeout(resolve, 350));
    const index = projects.findIndex(p => p.Id === parseInt(id));
    if (index !== -1) {
      projects[index] = { ...projects[index], ...projectData };
      return { ...projects[index] };
    }
    throw new Error("Project not found");
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 250));
    const index = projects.findIndex(p => p.Id === parseInt(id));
    if (index !== -1) {
      const deletedProject = projects.splice(index, 1)[0];
      return { ...deletedProject };
    }
    throw new Error("Project not found");
  }
};