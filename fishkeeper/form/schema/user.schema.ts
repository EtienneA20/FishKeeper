import * as yup from 'yup';

export interface UserFormValues {
    name: string;
    email: string;
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
});
