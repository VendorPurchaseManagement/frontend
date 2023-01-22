export interface updateComponentI {
  id: number;
  onUpdate: () => void;
}

export interface componentDataI {
  [key: string]: string | number | null;
}
