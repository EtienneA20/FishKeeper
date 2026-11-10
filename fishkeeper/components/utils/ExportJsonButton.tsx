'use client';

import { useState } from 'react';
import { Alert, Button, CircularProgress, Stack } from '@mui/material';
import { DownloadIcon } from 'lucide-react';
import { exportAllData } from '@/actions/data.controller';

function downloadJson(content: unknown, filename: string): void {
	const file = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
	const url = URL.createObjectURL(file);
	const link = document.createElement('a');

	link.href = url;
	link.download = filename;
	link.click();
	// Différé pour laisser le navigateur démarrer le téléchargement.
	setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function ExportJsonButton(): React.JSX.Element {
	const [isExporting, setIsExporting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleExport = async (): Promise<void> => {
		setIsExporting(true);
		setError(null);

		try {
			const data = await exportAllData();
			const date = new Date().toISOString().slice(0, 10);
			downloadJson(data, `fishkeeper-export-${date}.json`);
		} catch (exportError) {
			setError(exportError instanceof Error ? exportError.message : "L'export a échoué.");
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<Stack spacing={1} sx={{ alignItems: 'flex-end' }}>
			<Button
				variant="outlined"
				startIcon={isExporting ? <CircularProgress size={18} /> : <DownloadIcon size={18} />}
				onClick={handleExport}
				disabled={isExporting}
			>
				{isExporting ? 'Export en cours…' : 'Exporter en JSON'}
			</Button>
			{error && <Alert severity="error">{error}</Alert>}
		</Stack>
	);
}
