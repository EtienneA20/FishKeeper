import { EROLE } from "@/constants/enum/role.enum";

export interface IUser {
    id: string;
    name: string;
    email: string;
    role: EROLE;
    departement: string | null;
    imageURL: string | null;
}

export interface UserState {
    user: IUser | null;
    setUser: (user: IUser | null) => void;
}
