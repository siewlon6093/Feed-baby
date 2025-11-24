
import { User } from '../types';

// Simulating a database in localStorage for demonstration
const USERS_KEY = 'feedbaby_users_db';
const SESSION_KEY = 'feedbaby_session';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  async signup(name: string, email: string, password: string): Promise<User> {
    await delay(800); // Fake loading

    const usersStr = localStorage.getItem(USERS_KEY);
    const users: Record<string, any> = usersStr ? JSON.parse(usersStr) : {};

    // Simple check if email exists
    const userExists = Object.values(users).some((u: any) => u.email === email);
    if (userExists) {
      throw new Error('Email already in use');
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      createdAt: Date.now(),
      role: 'MAMA', // Default
      colorTheme: 'rose'
    };

    // Store password (INSECURE - DEMO ONLY)
    // In a real app, never store raw passwords or do this client-side
    users[newUser.id] = { ...newUser, password }; 
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Set session
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));

    return newUser;
  },

  async login(email: string, password: string): Promise<User> {
    await delay(800);

    const usersStr = localStorage.getItem(USERS_KEY);
    const users: Record<string, any> = usersStr ? JSON.parse(usersStr) : {};

    const user = Object.values(users).find((u: any) => u.email === email && u.password === password) as User | undefined;

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Update session
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
      await delay(600);
      
      const usersStr = localStorage.getItem(USERS_KEY);
      const users: Record<string, any> = usersStr ? JSON.parse(usersStr) : {};
      
      if (!users[userId]) throw new Error("User not found");

      const updatedUser = { ...users[userId], ...updates };
      users[userId] = updatedUser;
      
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      // Update current session if it matches
      const currentSession = this.getCurrentUser();
      if (currentSession && currentSession.id === userId) {
          localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
      }

      return updatedUser;
  },

  async logout(): Promise<void> {
    await delay(300);
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser(): User | null {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  }
};
