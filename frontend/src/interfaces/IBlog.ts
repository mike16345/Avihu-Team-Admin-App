export interface IBlog {
  title: string;
  content: string;
  imageUrl?: string;
}

export interface IBlogResponse extends IBlog {
  _id: string;
}
