export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class TestCreationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'TestCreationError';
  }
}