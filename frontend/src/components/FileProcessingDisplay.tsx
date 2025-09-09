import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Grid,
  Paper
} from '@mui/material';
import {
  Delete,
  CheckCircle,
  Error,
  Schedule,
  InsertDriveFile,
  Folder
} from '@mui/icons-material';

interface ProcessingFile {
  name: string;
  path: string;
  size: number;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
}

interface FileProcessingDisplayProps {
  files: ProcessingFile[];
  currentFile?: string;
  totalProgress: number;
  isActive: boolean;
}

const FileProcessingDisplay: React.FC<FileProcessingDisplayProps> = ({
  files,
  currentFile,
  totalProgress,
  isActive
}) => {
  const [processedCount, setProcessedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  useEffect(() => {
    setProcessedCount(files.filter(f => f.status === 'completed').length);
    setFailedCount(files.filter(f => f.status === 'failed').length);
  }, [files]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'failed':
        return <Error color="error" />;
      case 'processing':
        return <Delete color="primary" />;
      default:
        return <Schedule color="disabled" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'processing':
        return 'primary';
      default:
        return 'default';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        File Processing Status
      </Typography>

      {/* Overall Progress */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle2" gutterBottom>
                Overall Progress
              </Typography>
              <LinearProgress
                variant="determinate"
                value={totalProgress}
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {Math.round(totalProgress)}% Complete • Processing: {currentFile || 'None'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip
                  icon={<CheckCircle />}
                  label={`${processedCount} Deleted`}
                  color="success"
                  size="small"
                />
                <Chip
                  icon={<Error />}
                  label={`${failedCount} Failed`}
                  color="error"
                  size="small"
                />
                <Chip
                  icon={<InsertDriveFile />}
                  label={`${files.length} Total`}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Current Processing File */}
      {currentFile && isActive && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Currently Processing:</strong> {currentFile}
          </Typography>
        </Alert>
      )}

      {/* File List */}
      <Paper sx={{ maxHeight: 400, overflow: 'auto' }}>
        <List dense>
          {files.map((file, index) => (
            <ListItem
              key={index}
              sx={{
                backgroundColor: file.name === currentFile ? 'action.selected' : 'transparent',
                borderLeft: file.status === 'processing' ? 3 : 0,
                borderColor: 'primary.main'
              }}
            >
              <ListItemIcon>
                {getStatusIcon(file.status)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {file.name}
                    </Typography>
                    <Chip
                      label={file.status.toUpperCase()}
                      size="small"
                      color={getStatusColor(file.status) as any}
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {file.path} • {formatFileSize(file.size)} • {file.type}
                    </Typography>
                    {file.status === 'processing' && (
                      <LinearProgress
  variant="determinate"
  value={file.progress}
  sx={{ mt: 0.5, height: 4 }}
/>

                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Processing Summary */}
      {!isActive && processedCount > 0 && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Sanitization completed! {processedCount} files successfully deleted, {failedCount} failed.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default FileProcessingDisplay;
