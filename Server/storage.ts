import { users, type User, type InsertUser, sermons, type Sermon, type SermonAnalysis } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseId(firebaseId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Sermon operations
  getSermon(id: number): Promise<Sermon | undefined>;
  getSermonsByUserId(userId: string): Promise<Sermon[]>;
  createSermon(sermon: Omit<Sermon, "id" | "createdAt">): Promise<Sermon>;
  updateSermonAnalysis(id: number, analysis: SermonAnalysis): Promise<Sermon>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sermons: Map<number, Sermon>;
  private currentUserId: number;
  private currentSermonId: number;

  constructor() {
    this.users = new Map();
    this.sermons = new Map();
    this.currentUserId = 1;
    this.currentSermonId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseId(firebaseId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseId === firebaseId
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      id,
      firebaseId: insertUser.firebaseId,
      email: insertUser.email,
      displayName: insertUser.displayName || null,
    };
    this.users.set(id, user);
    return user;
  }

  // Sermon methods
  async getSermon(id: number): Promise<Sermon | undefined> {
    return this.sermons.get(id);
  }

  async getSermonsByUserId(userId: string): Promise<Sermon[]> {
    return Array.from(this.sermons.values()).filter(
      (sermon) => sermon.userId === userId
    );
  }

  async createSermon(sermon: Omit<Sermon, "id" | "createdAt">): Promise<Sermon> {
    const id = this.currentSermonId++;
    const createdAt = new Date();

    const newSermon: Sermon = {
      ...sermon,
      id,
      createdAt,
    };

    this.sermons.set(id, newSermon);
    return newSermon;
  }

  async updateSermonAnalysis(id: number, analysis: SermonAnalysis): Promise<Sermon> {
    const sermon = await this.getSermon(id);
    if (!sermon) {
      throw new Error("Sermon not found");
    }

    const updatedSermon = {
      ...sermon,
      analysis,
    };

    this.sermons.set(id, updatedSermon);
    return updatedSermon;
  }
}

export const storage = new MemStorage();