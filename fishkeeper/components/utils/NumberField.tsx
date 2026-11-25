'use client';

import { TextField, type TextFieldProps } from '@mui/material';
import { useState } from 'react';

import type { NumberLimit } from '@/constants/form-limits';
import { formatDecimalInput, parseDecimalInput, sanitizeDecimalInput } from '@/lib/decimal-input';

type NumberFieldProps = Omit<TextFieldProps, 'value' | 'onChange' | 'type' | 'defaultValue'> & {
    value: number | null | undefined;
    onChange: (value: number | undefined) => void;
    limit: NumberLimit;
};

/**
 * Champ numérique contrôlé : impossible d'y taper autre chose qu'un nombre positif.
 * (Un `type="number"` laisse passer des lettres sous Firefox et renvoie alors une valeur vide.)
 */
export default function NumberField({
    value,
    onChange,
    limit,
    helperText,
    slotProps,
    ...props
}: NumberFieldProps): React.JSX.Element {
    // Le texte saisi est conservé tel quel (ex. « 7, » en cours de frappe).
    const [text, setText] = useState(() => formatDecimalInput(value));

    return (
        <TextField
            {...props}
            type="text"
            value={text}
            onChange={(event) => {
                const next = sanitizeDecimalInput(event.target.value, limit.decimals);
                setText(next);
                onChange(parseDecimalInput(next));
            }}
            helperText={helperText ?? `De ${limit.min} à ${limit.max.toLocaleString('fr-FR')}`}
            slotProps={{
                ...slotProps,
                htmlInput: {
                    inputMode: limit.decimals > 0 ? 'decimal' : 'numeric',
                    maxLength: String(limit.max).length + limit.decimals + 1,
                    autoComplete: 'off',
                },
                inputLabel: { shrink: true },
            }}
        />
    );
}
