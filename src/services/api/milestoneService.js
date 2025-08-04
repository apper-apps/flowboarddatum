import milestoneData from '@/services/mockData/milestones.json';

// Create a copy of the data to avoid mutations
let milestones = [...milestoneData];

// Helper function to generate new ID
const generateId = () => {
  const maxId = milestones.length > 0 ? Math.max(...milestones.map(m => m.Id)) : 0;
  return maxId + 1;
};

// Helper function to validate milestone data
const validateMilestone = (milestone) => {
  const required = ['title', 'description', 'dueDate', 'projectId'];
  const missing = required.filter(field => !milestone[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  if (typeof milestone.projectId !== 'number') {
    throw new Error('Project ID must be a number');
  }

  return true;
};

// Get all milestones
export const getAll = () => {
  return [...milestones];
};

// Get milestone by ID
export const getById = (id) => {
  const numericId = parseInt(id);
  if (isNaN(numericId)) {
    throw new Error('ID must be a valid number');
  }
  
  const milestone = milestones.find(m => m.Id === numericId);
  return milestone ? { ...milestone } : null;
};

// Get milestones by project ID
export const getByProjectId = (projectId) => {
  const numericProjectId = parseInt(projectId);
  if (isNaN(numericProjectId)) {
    throw new Error('Project ID must be a valid number');
  }
  
  return milestones
    .filter(m => m.projectId === numericProjectId)
    .map(m => ({ ...m }))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
};

// Create new milestone
export const create = (milestoneData) => {
  validateMilestone(milestoneData);
  
  const newMilestone = {
    ...milestoneData,
    Id: generateId(),
    status: milestoneData.status || 'Pending',
    progress: milestoneData.progress || 0,
    priority: milestoneData.priority || 'Medium',
    createdAt: new Date().toISOString(),
    completedAt: null
  };
  
  milestones.push(newMilestone);
  return { ...newMilestone };
};

// Update milestone
export const update = (id, updates) => {
  const numericId = parseInt(id);
  if (isNaN(numericId)) {
    throw new Error('ID must be a valid number');
  }
  
  const index = milestones.findIndex(m => m.Id === numericId);
  if (index === -1) {
    throw new Error('Milestone not found');
  }
  
  // Don't allow ID changes
  const { Id, ...validUpdates } = updates;
  
  // Handle status completion
  if (validUpdates.status === 'Completed' && milestones[index].status !== 'Completed') {
    validUpdates.completedAt = new Date().toISOString();
    validUpdates.progress = 100;
  } else if (validUpdates.status !== 'Completed') {
    validUpdates.completedAt = null;
  }
  
  milestones[index] = {
    ...milestones[index],
    ...validUpdates
  };
  
  return { ...milestones[index] };
};

// Delete milestone
export const remove = (id) => {
  const numericId = parseInt(id);
  if (isNaN(numericId)) {
    throw new Error('ID must be a valid number');
  }
  
  const index = milestones.findIndex(m => m.Id === numericId);
  if (index === -1) {
    throw new Error('Milestone not found');
  }
  
  const deletedMilestone = { ...milestones[index] };
  milestones.splice(index, 1);
  return deletedMilestone;
};

// Get milestone statistics for a project
export const getProjectStats = (projectId) => {
  const numericProjectId = parseInt(projectId);
  if (isNaN(numericProjectId)) {
    throw new Error('Project ID must be a valid number');
  }
  
  const projectMilestones = milestones.filter(m => m.projectId === numericProjectId);
  
  return {
    total: projectMilestones.length,
    completed: projectMilestones.filter(m => m.status === 'Completed').length,
    inProgress: projectMilestones.filter(m => m.status === 'In Progress').length,
    pending: projectMilestones.filter(m => m.status === 'Pending').length,
    overdue: projectMilestones.filter(m => 
      m.status !== 'Completed' && new Date(m.dueDate) < new Date()
    ).length,
    avgProgress: projectMilestones.length > 0 
      ? Math.round(projectMilestones.reduce((sum, m) => sum + m.progress, 0) / projectMilestones.length)
      : 0
  };
};

export const milestoneService = {
  getAll,
  getById,
  getByProjectId,
  create,
  update,
  remove,
  getProjectStats
};