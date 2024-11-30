import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
}

export function HelpDialog({ open, onClose }: HelpDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, pr: 6 }}>
        How to Use Cache Analyzer
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <List>
          <ListItem>
            <ListItemText
              primary="Data Import"
              secondary="Import network traffic data from HAR files or JSON. To create a HAR file, open your browser's Developer Tools (F12), go to the Network tab, perform your actions, then right-click and select 'Save all as HAR'. Once analyzed, you can save the data as JSON for faster re-importing later."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Filtering"
              secondary="Use the filter panel to analyze requests by method, URL pattern, cache headers, and more. Multiple values can be selected for most filters. Filters are automatically saved in the URL for sharing."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Dashboard"
              secondary="View interactive charts showing cache performance metrics. Charts can be resized and rearranged to customize your view."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Sharing"
              secondary="Share your analysis directly using the Share button, which will use your browser's native sharing capabilities."
            />
          </ListItem>
        </List>
      </DialogContent>
    </Dialog>
  );
}