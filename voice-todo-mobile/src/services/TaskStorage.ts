/**
 * Task Storage Service
 * Handles local storage of tasks using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id: number;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'completed';
  created_at: string;
  due_date: string | null;
  completed_at: string | null;
}

const TASKS_KEY = 'tasks';
const NEXT_ID_KEY = 'next_task_id';

export class TaskStorage {
  /**
   * Get all tasks
   */
  static async getTasks(): Promise<Task[]> {
    try {
      const tasksJson = await AsyncStorage.getItem(TASKS_KEY);
      if (!tasksJson) {
        return [];
      }
      return JSON.parse(tasksJson);
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  }

  /**
   * Save tasks
   */
  static async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  }

  /**
   * Add a new task
   */
  static async addTask(task: Omit<Task, 'id'>): Promise<Task> {
    try {
      const tasks = await this.getTasks();
      const nextId = await this.getNextId();

      const newTask: Task = {
        ...task,
        id: nextId,
      };

      tasks.push(newTask);
      await this.saveTasks(tasks);
      await this.incrementNextId();

      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }

  /**
   * Update a task
   */
  static async updateTask(updatedTask: Task): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const index = tasks.findIndex(t => t.id === updatedTask.id);

      if (index !== -1) {
        tasks[index] = updatedTask;
        await this.saveTasks(tasks);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Delete a task
   */
  static async deleteTask(taskId: number): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const filteredTasks = tasks.filter(t => t.id !== taskId);
      await this.saveTasks(filteredTasks);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  /**
   * Clear all completed tasks
   */
  static async clearCompleted(): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const pendingTasks = tasks.filter(t => t.status === 'pending');
      await this.saveTasks(pendingTasks);
    } catch (error) {
      console.error('Error clearing completed tasks:', error);
      throw error;
    }
  }

  /**
   * Get next task ID
   */
  private static async getNextId(): Promise<number> {
    try {
      const nextIdStr = await AsyncStorage.getItem(NEXT_ID_KEY);
      return nextIdStr ? parseInt(nextIdStr, 10) : 1;
    } catch (error) {
      console.error('Error getting next ID:', error);
      return 1;
    }
  }

  /**
   * Increment next task ID
   */
  private static async incrementNextId(): Promise<void> {
    try {
      const nextId = await this.getNextId();
      await AsyncStorage.setItem(NEXT_ID_KEY, (nextId + 1).toString());
    } catch (error) {
      console.error('Error incrementing next ID:', error);
    }
  }

  /**
   * Clear all tasks (for testing/reset)
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TASKS_KEY);
      await AsyncStorage.removeItem(NEXT_ID_KEY);
    } catch (error) {
      console.error('Error clearing all tasks:', error);
      throw error;
    }
  }
}

