'use client';
/**
 * Erreur dans le layout racine lui-même : ce fichier REMPLACE app/layout.tsx.
 * Pas de thème MUI, ni de police, ni d'AppLayout ici (ils peuvent être la cause
 * de l'erreur) : styles inline volontairement simples.
 * `metadata` n'est pas supporté → balise <title> directement.
 */
export default function GlobalError({
    error,
    retry,
}: {
    error: Error & { digest?: string };
    retry: () => void;
}): React.JSX.Element {
    return (
        <html lang="fr">
            <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
                <title>Erreur – Fishkeeper</title>
                <main style={{ textAlign: 'center', padding: '64px 16px' }}>
                    <h1>Une erreur critique est survenue</h1>
                    <p style={{ color: '#666' }}>
                        L&apos;application n&apos;a pas pu se charger correctement.
                    </p>
                    {error.digest && (
                        <p style={{ color: '#999', fontSize: 12 }}>Code : {error.digest}</p>
                    )}
                    <button
                        type="button"
                        onClick={() => retry()}
                        style={{
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: 4,
                            background: '#0288d1',
                            color: '#fff',
                            cursor: 'pointer',
                        }}
                    >
                        Réessayer
                    </button>
                </main>
            </body>
        </html>
    );
}
