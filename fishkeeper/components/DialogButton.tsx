'use client';

import React from 'react';
import { Button, ButtonProps } from '@mui/material';

interface DialogButtonProps extends ButtonProps {
  label?: string;
  backgroundColor?: string;
  textColor?: string;
}

export default function DialogButton({
  startIcon,
  label,
  backgroundColor,
  textColor,
  onClick,
  variant="contained",
  sx,
  ...props
}: DialogButtonProps): React.JSX.Element {
  return (
    <Button
      onClick={onClick}
      startIcon={startIcon}
      variant={variant}
      sx={{
        textTransform: 'none',
        borderRadius: 2,
        fontWeight: 300,
        px: 2,
        py: 1,
        ...(backgroundColor && { backgroundColor }),
        ...(textColor && { color: textColor }),
        ...sx,
      }}
      {...props}
    >
      {label}
    </Button>
  );
}