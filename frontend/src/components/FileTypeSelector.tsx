import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  Alert
} from '@mui/material';
import { ExpandMore, InsertDriveFile } from '@mui/icons-material';

interface FileType {
  extension: string;
  name: string;
  risk: 'high' | 'medium' | 'low';
  count?: number;
}

const FILE_CATEGORIES: {
  [key: string]: {
    name: string;
    icon: string;
    types: FileType[];
  };
} = {
  documents: {
    name: 'Documents',
    icon: '📄',
    types: [
      { extension: '.pdf', name: 'PDF Files', risk: 'medium' },
      { extension: '.doc', name: 'Word Documents', risk: 'medium' },
      { extension: '.docx', name: 'Word Documents (New)', risk: 'medium' },
      { extension: '.xls', name: 'Excel Spreadsheets', risk: 'high' },
      { extension: '.xlsx', name: 'Excel Spreadsheets (New)', risk: 'high' },
      { extension: '.ppt', name: 'PowerPoint Presentations', risk: 'medium' },
      { extension: '.pptx', name: 'PowerPoint Presentations (New)', risk: 'medium' },
      { extension: '.txt', name: 'Text Files', risk: 'low' }
    ]
  },
  media: {
    name: 'Media Files',
    icon: '🎵',
    types: [
      { extension: '.jpg', name: 'JPEG Images', risk: 'high' },
      { extension: '.jpeg', name: 'JPEG Images', risk: 'high' },
      { extension: '.png', name: 'PNG Images', risk: 'high' },
      { extension: '.gif', name: 'GIF Images', risk: 'medium' },
      { extension: '.mp4', name: 'MP4 Videos', risk: 'high' },
      { extension: '.avi', name: 'AVI Videos', risk: 'high' },
      { extension: '.mp3', name: 'MP3 Audio', risk: 'medium' },
      { extension: '.wav', name: 'WAV Audio', risk: 'medium' }
    ]
  },
  system: {
    name: 'System Files',
    icon: '⚙️',
    types: [
      { extension: '.exe', name: 'Executable Files', risk: 'high' },
      { extension: '.dll', name: 'Dynamic Link Libraries', risk: 'high' },
      { extension: '.sys', name: 'System Files', risk: 'high' },
      { extension: '.ini', name: 'Configuration Files', risk: 'medium' },
      { extension: '.log', name: 'Log Files', risk: 'low' },
      { extension: '.tmp', name: 'Temporary Files', risk: 'low' }
    ]
  },
  databases: {
    name: 'Databases',
    icon: '🗄️',
    types: [
      { extension: '.db', name: 'Database Files', risk: 'high' },
      { extension: '.sqlite', name: 'SQLite Databases', risk: 'high' },
      { extension: '.mdb', name: 'Access Databases', risk: 'high' },
      { extension: '.sql', name: 'SQL Scripts', risk: 'high' }
    ]
  },
  archives: {
    name: 'Archives',
    icon: '📦',
    types: [
      { extension: '.zip', name: 'ZIP Archives', risk: 'high' },
      { extension: '.rar', name: 'RAR Archives', risk: 'high' },
      { extension: '.7z', name: '7-Zip Archives', risk: 'high' },
      { extension: '.tar', name: 'TAR Archives', risk: 'medium' }
    ]
  }
};

interface FileTypeSelectorProps {
  onSelectionChange: (selectedTypes: string[]) => void;
  detectedFiles: { [key: string]: number };
}

const FileTypeSelector: React.FC<FileTypeSelectorProps> = ({ 
  onSelectionChange, 
  detectedFiles 
}) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<{ [key: string]: boolean }>({});

  const handleTypeChange = (extension: string, checked: boolean) => {
    let newSelected: string[];
    if (checked) {
      newSelected = [...selectedTypes, extension];
    } else {
      newSelected = selectedTypes.filter(type => type !== extension);
    }
    setSelectedTypes(newSelected);
    onSelectionChange(newSelected);
  };

  const handleCategorySelectAll = (category: string, checked: boolean) => {
    const categoryTypes = FILE_CATEGORIES[category].types.map(t => t.extension);
    let newSelected: string[];
    
    if (checked) {
      newSelected = Array.from(new Set([...selectedTypes, ...categoryTypes]));
    } else {
      newSelected = selectedTypes.filter(type => !categoryTypes.includes(type));
    }
    
    setSelectedTypes(newSelected);
    setSelectAll({ ...selectAll, [category]: checked });
    onSelectionChange(newSelected);
  };

  const getRiskColor = (risk: FileType['risk']) => {
    switch (risk) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getTotalFiles = () => {
    return Object.values(detectedFiles).reduce((sum, count) => sum + count, 0);
  };

  const getSelectedFiles = () => {
    return selectedTypes.reduce((sum, type) => sum + (detectedFiles[type] || 0), 0);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        File Type Selection
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        {getTotalFiles()} files detected • {getSelectedFiles()} files selected for sanitization
      </Alert>

      {Object.entries(FILE_CATEGORIES).map(([categoryKey, category]) => {
        const categoryTypes: FileType[] = category.types;
        const categoryCount = categoryTypes.reduce(
          (sum: number, type: FileType) => sum + (detectedFiles[type.extension] || 0),
          0
        );
        
        if (categoryCount === 0) return null;

        return (
          <Accordion key={categoryKey} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box display="flex" alignItems="center" width="100%">
                <Typography sx={{ mr: 1 }}>{category.icon}</Typography>
                <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                  {category.name}
                </Typography>
                <Chip 
                  label={`${categoryCount} files`} 
                  size="small" 
                  variant="outlined"
                  sx={{ mr: 2 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectAll[categoryKey] || false}
                      onChange={(e) => handleCategorySelectAll(categoryKey, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  }
                  label="Select All"
                  onClick={(e) => e.stopPropagation()}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {categoryTypes.map((fileType) => {
                  const count = detectedFiles[fileType.extension] || 0;
                  if (count === 0) return null;

                  return (
                    <Box key={fileType.extension} display="flex" alignItems="center" mb={1}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedTypes.includes(fileType.extension)}
                            onChange={(e) => handleTypeChange(fileType.extension, e.target.checked)}
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center" gap={1}>
                            <InsertDriveFile fontSize="small" />
                            <Typography>{fileType.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              ({fileType.extension})
                            </Typography>
                            <Chip
                              label={`${count} files`}
                              size="small"
                              color={getRiskColor(fileType.risk) as any}
                              variant="outlined"
                            />
                            <Chip
                              label={fileType.risk.toUpperCase()}
                              size="small"
                              color={getRiskColor(fileType.risk) as any}
                            />
                          </Box>
                        }
                      />
                    </Box>
                  );
                })}
              </FormGroup>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default FileTypeSelector;
