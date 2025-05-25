export interface IBlog {
  title: string;
  content: string;
  group?: string;
  imageUrl?: string;
  link?: string;
}

export interface IBlogResponse extends IBlog {
  _id: string;
}

export interface ILessonGroup {
  name: string;
}
