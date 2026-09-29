import * as yup from 'yup';

export interface AuthFormValues {
    name: string;
    departement: string;
    email: string;
    password: string;
}

const emailField = yup
    .string()
    .trim()
    .required("L'adresse e-mail est obligatoire.")
    .email("L'adresse e-mail est invalide.");

const passwordField = yup
    .string()
    .required('Le mot de passe est obligatoire.')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères.');

export const loginSchema: yup.ObjectSchema<AuthFormValues> = yup.object({
    name: yup.string().defined(),
    departement: yup.string().defined(),
    email: emailField,
    password: passwordField,
});

export const registerSchema: yup.ObjectSchema<AuthFormValues> = yup.object({
    name: yup
        .string()
        .trim()
        .required('Le nom est obligatoire.')
        .min(2, 'Le nom doit contenir au moins 2 caractères.'),
    departement: yup
        .string()
        .trim()
        .required('Le département est obligatoire.')
        .min(2, 'Le département doit contenir au moins 2 caractères.'),
    email: emailField,
    password: passwordField,
});