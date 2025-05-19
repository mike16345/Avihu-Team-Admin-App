export interface IBlog {
  title: string;
  content: string;
  type?: string;
  imageUrl?: string;
  link?: string;
}

export interface IBlogResponse extends IBlog {
  _id: string;
}

export interface ILessonGroup {
  group: string;
}
