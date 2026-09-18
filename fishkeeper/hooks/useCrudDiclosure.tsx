import { useState, useCallback } from 'react';

export interface CrudDisclosureState<T> {
    isOpen: boolean;
    mode: 'create' | 'update' | 'search' | null;
    data: T | null;
}

export function useCrudDisclosure<T>() {
    const [state, setState] = useState<CrudDisclosureState<T>>({
        isOpen: false,
        mode: null,
        data: null,
    });

    const openCreate = useCallback(() => {
        setState({ isOpen: true, mode: 'create', data: null });
    }, []);

    const openUpdate = useCallback((item: T) => {
        setState({ isOpen: true, mode: 'update', data: item });
    }, []);

    const onClose = useCallback(() => {
        setState((prev) => ({ ...prev, isOpen: false }));
    }, []);

    return {
        isOpen: state.isOpen,
        mode: state.mode,
        data: state.data,
        openCreate,
        openUpdate,
        onClose,
    };
}
