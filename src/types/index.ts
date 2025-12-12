export interface Article {
    id: number;
    title: string;
    author: string;
    content: string;
    category: string;
    createdAt: string;
    updatedAt: string;
}

export interface ServerToClientEvents {
    new_article: (data: Article) => void;
}
