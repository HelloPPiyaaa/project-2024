import { Author } from "./post";

export type ReplyComment = {
  _id: string;
  content: string;
  author: Author;
  replyTo: Author;
  created_at: Date;
};

export type Comment = {
  _id: string;
  author: Author;
  content: string;
  replies: ReplyComment[];
  created_at: Date;
  commented_by: Author;
};

export type CommentsData = {
  results: Comment[]; // ผลลัพธ์ของความคิดเห็น
};
