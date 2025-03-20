/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { Button, TextField, Dialog, DialogTitle, DialogContent, 
  DialogActions, Typography, Paper, IconButton, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useSnackbar } from '@/contexts/SnackbarContext';
import { useChildren } from '@/hooks/useChildren';
import { childUpdateSchema, childAddSchema, ChildData } from '@/types/child/ChildTypes';

interface ChildrenTabProps {
  profile: any;
  refreshProfile: () => Promise<any>;
}

export default function ChildrenTab({ profile, refreshProfile }: ChildrenTabProps) {
  const { showSnackbar } = useSnackbar();
  const { addChild, updateChild, isLoading } = useChildren();
  const [showChildDialog, setShowChildDialog] = useState(false);
  const [showAddChildDialog, setShowAddChildDialog] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any>(null);

  // Form for updating existing child
  const {
    register: registerChild,
    handleSubmit: handleSubmitChild,
    setValue: setChildValue,
    formState: { errors: childErrors },
  } = useForm<ChildData>({
    resolver: zodResolver(childUpdateSchema),
  });

  // Form for adding new child
  const {
    register: registerAddChild,
    handleSubmit: handleSubmitAddChild,
    reset: resetAddChild,
    formState: { errors: addChildErrors },
  } = useForm({
    resolver: zodResolver(childAddSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      age: 0,
      specialNotes: '',
    },
  });

  const openChildDialog = (child: any) => {
    setSelectedChild(child);
    
    // Set form values
    setChildValue('id', child.id);
    setChildValue('firstName', child.firstName || '');
    setChildValue('lastName', child.lastName || '');
    setChildValue('age', child.age || 0);
    setChildValue('specialNotes', child.specialNotes || '');
    
    setShowChildDialog(true);
  };

  const onSubmitChildUpdate = async (data: ChildData) => {
    try {
      const result = await updateChild(data);
      
      if (result.success) {
        showSnackbar({
          message: 'Child information updated successfully',
          severity: 'success',
        });
        
        setShowChildDialog(false);
        await refreshProfile();
      }
    } catch (error) {
      showSnackbar({
        message: 'Failed to update child information',
        severity: 'error',
      });
    }
  };

  const onSubmitAddChild = async (data: any) => {
    try {
      const result = await addChild(data);
      
      if (result.success) {
        showSnackbar({
          message: 'Child added successfully',
          severity: 'success',
        });
        
        setShowAddChildDialog(false);
        resetAddChild();
        await refreshProfile();
      }
    } catch (error) {
      showSnackbar({
        message: 'Failed to add child',
        severity: 'error',
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h6" component="h2">
          Children
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowAddChildDialog(true)}
        >
          Add Child
        </Button>
      </div>
      
      {!profile?.children || profile.children.length === 0 ? (
        <Typography>No children found.</Typography>
      ) : (
        <div className="space-y-4">
          {profile.children.map((child: any) => (
            <Paper key={child.id} className="p-4 border rounded-md relative">
              <IconButton 
                className="absolute top-2 right-2"
                color="primary"
                onClick={() => openChildDialog(child)}
              >
                <EditIcon />
              </IconButton>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <Typography variant="subtitle1" fontWeight="bold">Name:</Typography>
                  <Typography>{child.firstName} {child.lastName}</Typography>
                </div>
                <div>
                  <Typography variant="subtitle1" fontWeight="bold">Age:</Typography>
                  <Typography>{child.age}</Typography>
                </div>
                {child.specialNotes && (
                  <div className="md:col-span-2">
                    <Typography variant="subtitle1" fontWeight="bold">Special Notes:</Typography>
                    <Typography>{child.specialNotes}</Typography>
                  </div>
                )}
              </div>
            </Paper>
          ))}
        </div>
      )}

      {/* Edit Child Dialog */}
      <Dialog open={showChildDialog} onClose={() => setShowChildDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Child Information</DialogTitle>
        <form onSubmit={handleSubmitChild(onSubmitChildUpdate)}>
          <DialogContent>
            <input type="hidden" {...registerChild('id')} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <TextField
                label="First Name"
                {...registerChild('firstName')}
                error={!!childErrors.firstName}
                helperText={childErrors.firstName?.message}
                fullWidth
              />
              
              <TextField
                label="Last Name"
                {...registerChild('lastName')}
                error={!!childErrors.lastName}
                helperText={childErrors.lastName?.message}
                fullWidth
              />
            </div>
            
            <TextField
  label="Age"
  type="number"
  inputProps={{ min: 0 }}
  {...registerAddChild("age", {
    valueAsNumber: true,
  })}
  error={!!addChildErrors.age}
  helperText={addChildErrors.age?.message}
  fullWidth
  className="mb-4"
/>
            <TextField
              label="Special Notes"
              {...registerChild('specialNotes')}
              error={!!childErrors.specialNotes}
              helperText={childErrors.specialNotes?.message}
              multiline
              rows={4}
              placeholder="Allergies, medical conditions, special needs, or any other important information"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowChildDialog(false)}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Updating...' : 'Update Child'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add Child Dialog */}
      <Dialog open={showAddChildDialog} onClose={() => setShowAddChildDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Child</DialogTitle>
        <form onSubmit={handleSubmitAddChild(onSubmitAddChild)}>
          <DialogContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <TextField
                label="First Name"
                {...registerAddChild('firstName')}
                error={!!addChildErrors.firstName}
                helperText={addChildErrors.firstName?.message}
                fullWidth
              />
              
              <TextField
                label="Last Name"
                {...registerAddChild('lastName')}
                error={!!addChildErrors.lastName}
                helperText={addChildErrors.lastName?.message}
                fullWidth
              />
            </div>
            
            <TextField
              label="Age"
              type="number"
              {...registerAddChild('age')}
              error={!!addChildErrors.age}
              helperText={addChildErrors.age?.message}
              fullWidth
              className="mb-4"
            />
            
            <TextField
              label="Special Notes"
              {...registerAddChild('specialNotes')}
              error={!!addChildErrors.specialNotes}
              helperText={addChildErrors.specialNotes?.message}
              multiline
              rows={4}
              placeholder="Allergies, medical conditions, special needs, or any other important information"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddChildDialog(false)}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Adding...' : 'Add Child'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}