import { useState, useEffect } from 'react';
import { Container, Box, Paper, AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, TextField, Button, Stack, FormControl, Select, SelectChangeEvent } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShareIcon from '@mui/icons-material/Share';
import SaveIcon from '@mui/icons-material/Save';
import { FilterPanel } from './components/FilterPanel/index';
import { DashboardGrid } from './components/DashboardGrid';
import { DataImport } from './components/DataImport';
import { HelpDialog } from './components/HelpDialog';
import { NetworkRequest, Filter, PanelConfig, DataFile } from './types';
import { filterData } from './utils/filters';
import { useUrlState } from './hooks/useUrlState';
import { createDataZip } from './utils/fileProcessor';

const defaultPanels: PanelConfig[] = [
  { i: 'time-series-requests', x: 0, y: 0, w: 12, h: 2, type: 'time-series-requests' },
  { i: 'time-series-bytes', x: 0, y: 2, w: 12, h: 2, type: 'time-series-bytes' },
  { i: 'size-by-cache', x: 0, y: 4, w: 6, h: 2, type: 'size-by-cache' },
  { i: 'requests-by-cache', x: 6, y: 4, w: 6, h: 2, type: 'requests-by-cache' },
  { i: 'size-by-pop', x: 0, y: 6, w: 6, h: 2, type: 'size-by-pop' },
  { i: 'requests-by-pop', x: 6, y: 6, w: 6, h: 2, type: 'requests-by-pop' },
  { i: 'size-by-type', x: 0, y: 8, w: 6, h: 2, type: 'size-by-type' },
  { i: 'requests-by-type', x: 6, y: 8, w: 6, h: 2, type: 'requests-by-type' },
  { i: 'domain-cache', x: 0, y: 10, w: 12, h: 3, type: 'domain-cache' },
  { i: 'domain-requests', x: 0, y: 13, w: 12, h: 3, type: 'domain-requests' },
  { i: 'data-table', x: 0, y: 16, w: 12, h: 4, type: 'data-table' }
];

export function App() {
  const [files, setFiles] = useState<DataFile[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const [filters, setFilters] = useUrlState<Filter>('filters', {});
  const [panels, setPanels] = useState<PanelConfig[]>(() => {
    const saved = localStorage.getItem('dashboardLayout');
    return saved ? JSON.parse(saved) : defaultPanels;
  });
  const [filteredData, setFilteredData] = useState<NetworkRequest[]>([]);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [showImport, setShowImport] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filename, setFilename] = useState('network-analysis');

  useEffect(() => {
    if (files.length > 0 && currentFileIndex >= 0 && currentFileIndex < files.length) {
      setFilteredData(filterData(files[currentFileIndex].data, filters));
    } else {
      setFilteredData([]);
    }
  }, [files, currentFileIndex, filters]);

  useEffect(() => {
    localStorage.setItem('dashboardLayout', JSON.stringify(panels));
  }, [panels]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Cache Analysis',
          text: 'Check out this cache analysis',
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
    handleMenuClose();
  };

  const handleNew = () => {
    setShowImport(true);
    handleMenuClose();
  };

  const handleHelp = () => {
    setShowHelp(true);
    handleMenuClose();
  };

  const handleSaveDialogOpen = () => {
    setFilename('network-analysis');
    setShowSaveDialog(true);
    handleMenuClose();
  };

  const handleSaveJson = async () => {
    if (!files.length) return;
    
    try {
      const zip = await createDataZip(files);
      const element = document.createElement('a');
      element.href = URL.createObjectURL(zip);
      element.download = `${filename}.zip`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(element.href);
    } catch (error) {
      console.error('Error saving files:', error);
      alert('Error saving files. Please try again.');
    }
    setShowSaveDialog(false);
  };

  const handleFileChange = (event: SelectChangeEvent<number>) => {
    const newIndex = Number(event.target.value);
    if (newIndex >= 0 && newIndex < files.length) {
      setCurrentFileIndex(newIndex);
    }
  };

  const handleDataImport = (newFiles: DataFile[]) => {
    setFiles(prevFiles => {
      const updatedFiles = [...prevFiles, ...newFiles];
      setCurrentFileIndex(updatedFiles.length - 1);
      return updatedFiles;
    });
    setShowImport(false);
  };

  const handleFilterChange = (newFilters: Partial<Filter>) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  const currentFile = files[currentFileIndex];

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenuClick}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Cache Analyzer 18
          </Typography>
          {files.length > 0 && (
            <FormControl sx={{ minWidth: 200, mr: 2 }} size="small">
              <Select
                value={currentFileIndex}
                onChange={handleFileChange}
                sx={{ backgroundColor: 'white', borderRadius: 1 }}
              >
                {files.map((file, index) => (
                  <MenuItem key={index} value={index}>{file.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <IconButton color="inherit" onClick={handleShare}>
            <ShareIcon />
          </IconButton>
          {files.length > 0 && (
            <IconButton color="inherit" onClick={handleSaveDialogOpen}>
              <SaveIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleNew}>New</MenuItem>
        <MenuItem onClick={handleSaveDialogOpen} disabled={!files.length}>Save as ZIP</MenuItem>
        <MenuItem onClick={handleHelp}>How to use</MenuItem>
      </Menu>

      <Container maxWidth={false}>
        <Box sx={{ my: 4 }}>
          {showImport ? (
            <Paper sx={{ p: 2, mb: 2 }}>
              <DataImport
                onDataImport={handleDataImport}
                onClose={() => setShowImport(false)}
                onFileNameUpdate={() => {}}
              />
            </Paper>
          ) : (
            <>
              <Paper sx={{ p: 2, mb: 2 }}>
                <FilterPanel
                  filters={filters}
                  onFilterChange={setFilters}
                  data={currentFile?.data || []}
                  onResetFilters={handleResetFilters}
                />
              </Paper>
              
              <Paper sx={{ p: 2, mb: 2 }}>
                <DashboardGrid 
                  data={filteredData}
                  panels={panels}
                  onLayoutChange={setPanels}
                  onFilterChange={handleFilterChange}
                />
              </Paper>
            </>
          )}
        </Box>
      </Container>

      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)}>
        <DialogTitle>Save Analysis</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1, minWidth: '300px' }}>
            <TextField
              label="Filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              fullWidth
              helperText=".zip will be automatically appended"
            />
            <Button variant="contained" onClick={handleSaveJson}>
              Save
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <HelpDialog
        open={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </>
  );
}