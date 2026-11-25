import * as yup from 'yup';

export interface CategoryFormValues {
    name: string;
    description?: string;
    incompatibleWithIds: string[];
}

export const categorySchema: yup.ObjectSchema<CategoryFormValues> = yup.object({
    name: yup
        .string()
        .trim()
        .required('Le nom de la catégorie est obligatoire.')
        .min(2, 'Le nom de la catégorie doit contenir au moins 2 caractères.'),
    description: yup.string().trim().optional(),
    incompatibleWithIds: yup.array(yup.string().required()).required().default([]),
});
