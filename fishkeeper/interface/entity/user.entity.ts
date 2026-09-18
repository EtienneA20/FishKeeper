export interface IUser {
    id: string;
    name: string;
    email: string;
}

export interface UserState {
    user: IUser | null;
    setUser: (user: IUser | null) => void;
}
