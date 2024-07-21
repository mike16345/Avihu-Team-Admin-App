export interface IWeighIn {
  date: Date;
  weight: number;
}

export interface IWeighIns {
  id: string;
  userId: string;
  weighIns: IWeighIn[];
}
