export type BookType = {
  id: number;
  name: string;
  pages: number;
};

export type HistoryType = {
  date: Date;
  pages: number;
};

export type UserType = {
  isAdmin: boolean;
  isHidden: boolean;
  totalReadPages: number;
  finishedBookIds: number[];
  name: string;
  history: HistoryType[];
};
