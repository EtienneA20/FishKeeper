import { EROLE } from "@/constants/enum/role.enum";

export interface IUser {
    id: string;
    name: string;
    email: string;
    role: EROLE;
    departement: string;
}

export interface UserState {
    user: IUser | null;
    setUser: (user: IUser | null) => void;
    isDarkTheme: boolean;
    setIsDarkTheme: (isDarkTheme: boolean) => void;
}
