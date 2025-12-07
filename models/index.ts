// Import all models to ensure they are registered with Mongoose
import './Role';
import './User';
import './Course';
import './Lesson';
import './Quiz';
import './Enrollment';

// Re-export for convenience
export { default as Role } from './Role';
export { default as User } from './User';
export { default as Course } from './Course';
export { default as Lesson } from './Lesson';
export { default as Quiz } from './Quiz';
export { default as Enrollment } from './Enrollment';

