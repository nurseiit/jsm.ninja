import { BookType, UserType } from './types';

export interface HomeProps {
  users: UserType[];
  books: BookType[];
  daysFromStart: number;
}
