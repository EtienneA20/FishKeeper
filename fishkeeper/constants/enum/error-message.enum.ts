export enum EERROR_MESSAGE {
    LOGIN = 'Erreur lors de la connection',
    CREATE_ACCOUNT = "Erreur lors de la création d'un compte",
    USER_CONTEXT = 'Erreurlors de la mise en place du context utilisateur',
    USER_NAME_REQUIRED = 'Le nom est obligatoire.',
    USER_NAME_INVALID = 'Le nom doit être une chaîne de caractères.',
    USER_NAME_TOO_SHORT = 'Le nom doit contenir au moins 2 caractères.',
    USER_EMAIL_REQUIRED = "L'adresse e-mail est obligatoire.",
    USER_EMAIL_INVALID = "L'adresse e-mail est invalide.",
    USER_VALIDATION = 'Les données utilisateur sont invalides.',
    USER_ROLE_REQUIRED = 'Le rôle est obligatoire.',
    USER_ROLE_INVALID = 'Le rôle est invalide.',
}
