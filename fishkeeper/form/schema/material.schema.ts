import * as yup from 'yup';

export interface MaterialFormValues {
    name: string;
    number: number;
}

export const materialSchema: yup.ObjectSchema<MaterialFormValues> = yup.object({
    name: yup
        .string()
        .trim()
        .required('Le nom est obligatoire.')
        .min(2, 'Le nom doit contenir au moins 2 caractères.'),
    number: yup
        .number()
        .required("Le nombre est obligatoire.")
});
