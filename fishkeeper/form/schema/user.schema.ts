import { EROLE } from '@/constants/enum/role.enum';
import * as yup from 'yup';

export interface UserFormValues {
    name: string;
    email: string;
    role: EROLE;
    departement: string;
    password?: string;
}

export const userSchema: yup.ObjectSchema<UserFormValues> = yup.object({
    name: yup
        .string()
        .trim()
        .required('Le nom est obligatoire.')
        .min(2, 'Le nom doit contenir au moins 2 caractères.'),
    email: yup
        .string()
        .trim()
        .required("L'adresse e-mail est obligatoire.")
        .email("L'adresse e-mail est invalide."),
    role: yup
        .mixed<EROLE>()
        .oneOf(Object.values(EROLE), "Le rôle est invalide.")
        .required("Le rôle est obligatoire."),
    departement: yup.string().trim().required('Le département est obligatoire.'),
    password: yup.string().test(
        'password-length',
        'Le mot de passe doit contenir au moins 8 caractères.',
        (value) => !value || value.length >= 8,
    ),
});
