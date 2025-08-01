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
  }
};