'use client';

import { Button } from '@mui/material';
import { DownloadIcon } from 'lucide-react';

export default function ExportJsonButton(): React.JSX.Element {
	const handleExport = (): void => {
		const file = new Blob(['[]'], { type: 'application/json' });
		const url = URL.createObjectURL(file);
		const link = document.createElement('a');

		link.href = url;
		link.download = 'models.json';
		link.click();
		URL.revokeObjectURL(url);
	};

	return (
		<Button
			variant="outlined"
			startIcon={<DownloadIcon size={18} />}
			onClick={handleExport}
		>
			Exporter en JSON
		</Button>
	);
}
