import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { MouseEvent } from 'react';
import GridViewTwoToneIcon from '@mui/icons-material/GridViewTwoTone';
import ViewListTwoToneIcon from '@mui/icons-material/ViewListTwoTone';

interface ToogleRenderModeProps {
  isTableView: boolean;
  onChange: (isTableView: boolean) => void;
}

export const ToogleRenderMode = ({ isTableView, onChange }: ToogleRenderModeProps) => {
  const handleChange = (
    _event: MouseEvent<HTMLElement>,
    newValue: string | null
  ) => {
    if (newValue !== null) {
      onChange(newValue === 'table');
    }
  };

  return (
    <ToggleButtonGroup
      value={isTableView ? 'table' : 'card'}
      exclusive
      onChange={handleChange}
      aria-label="Sélection du mode d'affichage"
      size="small"
    >
      <ToggleButton value="table" aria-label="Affichage en tableau">
        <ViewListTwoToneIcon />
      </ToggleButton>
      <ToggleButton value="card" aria-label="Affichage en cartes">
        <GridViewTwoToneIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};