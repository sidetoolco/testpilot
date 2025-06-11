import Dexie, { Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  password: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  images?: string[];
  category: string;
  brand: string;
  rating?: number;
  reviews?: number;
  isCompetitor: boolean;
  bestSeller: boolean;
  loads?: number;
  amazonUrl?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Test {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed';
  searchTerm: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  testerName: string;
  testerAge: number;
  testerGender: string;
  testerCountry: string;
  device: string;
  duration: string;
  comments: number;
  outcome: 'selected_our_product' | 'selected_competitor';
  userId: string;
  testId: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Insight {
  id: string;
  type: string;
  content: string;
  userId: string;
  testId: string;
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  company_id: string;
  role: 'owner' | 'admin';
  company_joined_at: string;
  created_at: string;
  updated_at: string;
  email_confirmed: boolean;
}

export class TestPilotDB extends Dexie {
  users!: Table<User>;
  products!: Table<Product>;
  tests!: Table<Test>;
  sessions!: Table<Session>;
  insights!: Table<Insight>;

  constructor() {
    super('TestPilotDB');

    this.version(1).stores({
      users: 'id, email',
      products: 'id, userId, category',
      tests: 'id, userId, status',
      sessions: 'id, userId, testId, productId',
      insights: 'id, userId, testId, sessionId',
    });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.where('email').equals(email).first();
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date();
    const user: User = {
      id: uuidv4(),
      ...userData,
      createdAt: now,
      updatedAt: now,
    };
    await this.users.add(user);
    return user;
  }

  async getProductsByUser(userId: string): Promise<Product[]> {
    return this.products.where('userId').equals(userId).toArray();
  }

  async createProduct(
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Product> {
    const now = new Date();
    const product: Product = {
      id: uuidv4(),
      ...productData,
      createdAt: now,
      updatedAt: now,
    };
    await this.products.add(product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    await this.products.update(id, { ...updates, updatedAt: new Date() });
  }

  async deleteProduct(id: string): Promise<void> {
    await this.products.delete(id);
  }
}

export const db = new TestPilotDB();
