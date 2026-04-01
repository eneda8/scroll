export interface Passage {
  id: number;
  chapter: number;
  text: string;
  reference?: string;
}

export interface BookData {
  title: string;
  author: string;
  slug: string;
  passages: Passage[];
}

export interface BibleBookEntry {
  name: string;
  slug: string;
  file: string;
  chapters: number;
  passages: number;
}
