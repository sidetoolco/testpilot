import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { jwtDecode } from 'jwt-decode';
import sign from 'jwt-encode';
import { db } from './db';

const JWT_SECRET = 'your-secret-key'; // In a real app, this would be an environment variable

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

interface JWTPayload {
  userId: string;
  exp: number;
}

export async function signup(data: z.infer<typeof signupSchema>) {
  const { email, password, name } = signupSchema.parse(data);

  const exists = await db.getUserByEmail(email);
  if (exists) {
    throw new Error('User already exists');
  }

  // In a real app, you would hash the password here
  const user = await db.createUser({
    email,
    password, // In production, this would be hashed
    name,
  });

  const token = generateToken(user.id);

  return { 
    token, 
    user: { 
      id: user.id, 
      email: user.email, 
      name: user.name 
    } 
  };
}

export async function login(data: z.infer<typeof loginSchema>) {
  const { email, password } = loginSchema.parse(data);

  const user = await db.getUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // In a real app, you would compare hashed passwords
  if (user.password !== password) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user.id);

  return { 
    token, 
    user: { 
      id: user.id, 
      email: user.email, 
      name: user.name 
    } 
  };
}

export function verifyAuth(token: string) {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const now = Date.now() / 1000;
    
    if (decoded.exp < now) {
      throw new Error('Token expired');
    }
    
    return { userId: decoded.userId };
  } catch (err) {
    throw new Error('Invalid token');
  }
}

function generateToken(userId: string): string {
  const payload: JWTPayload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
  };
  
  return sign(payload, JWT_SECRET);
}