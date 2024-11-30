import { Dialog, DialogTitle, DialogContent, Typography, Button, Box } from '@mui/material';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ShareDialog({ open, onClose }: ShareDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Share Analysis</DialogTitle>
      <DialogContent>
        <Typography>
          The current URL has been copied to your clipboard. It includes all your current filters and settings.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={onClose}>
            Close
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}