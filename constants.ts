import { Book } from './types';

export const BOOKS: Book[] = [
  { id: 1, title: 'גמ\' בבא קמא', author: 'עוז והדר', price: 130 },
  { id: 2, title: 'כוזרי - כריכה קשה', author: 'רבי יהודה הלוי (הוצאת דביר)', price: 92, groupId: 'kozari' },
  { id: 3, title: 'כוזרי - כריכה רכה', author: 'רבי יהודה הלוי (הוצאת דביר)', price: 82, groupId: 'kozari' },
  { id: 4, title: 'מסילת ישרים', author: 'הרמח"ל', price: 28 },
  { id: 5, title: 'חפץ חיים', author: 'רבי ישראל מאיר הכהן מראדין', price: 50 },
  { id: 6, title: 'ילקוט יוסף (לפוסקים כרב עובדיה)', author: 'הרב יצחק יוסף', price: 125 },
];
