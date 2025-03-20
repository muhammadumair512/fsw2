/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSnackbar } from '@/contexts/SnackbarContext';

// Update request type
type UpdateRequest = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  requestType: string;
  requestData: any;
  status: string;
  createdAt: string;
};

export default function UpdateRequestsPage() {
  const { showSnackbar } = useSnackbar();
  const [updateRequests, setUpdateRequests] = useState<UpdateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Request detail states
  const [requestDetailOpen, setRequestDetailOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<UpdateRequest | null>(null);
  const [processRequestLoading, setProcessRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  // Fetch update requests on component mount
  useEffect(() => {
    const fetchUpdateRequests = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/admin/update-requests');
        setUpdateRequests(response.data);
      } catch (error) {
        console.error('Failed to fetch update requests:', error);
        showSnackbar({
          message: 'Failed to fetch update requests. Please try again.',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUpdateRequests();
  }, [showSnackbar]);

  const viewRequestDetails = (request: UpdateRequest) => {
    setSelectedRequest(request);
    setRequestDetailOpen(true);
  };

  const processUpdateRequest = async (requestId: string, approved: boolean) => {
    try {
      setProcessRequestLoading(true);
      setRequestSuccess(null);
      
      await axios.post(`/api/admin/process-request`, { 
        requestId, 
        approved,
        adminComment: approved ? 'Approved by admin' : 'Rejected by admin'
      });
      
      // Update request in state
      setUpdateRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === requestId ? { ...req, status: approved ? 'APPROVED' : 'REJECTED' } : req
        )
      );
      
      setRequestSuccess(approved ? 'Request approved successfully!' : 'Request rejected successfully!');
      
      // Close dialog after a delay
      setTimeout(() => {
        setRequestDetailOpen(false);
        setRequestSuccess(null);
        
        // Refresh data after processing request
        axios.get('/api/admin/update-requests').then(response => {
          setUpdateRequests(response.data);
        });
      }, 2000);
      
      showSnackbar({
        message: `Request ${approved ? 'approved' : 'rejected'} successfully!`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to process request:', error);
      showSnackbar({
        message: 'Failed to process request',
        severity: 'error',
      });
    } finally {
      setProcessRequestLoading(false);
    }
  };

  if (loading) {
    return (
      <Paper className="p-6">
        <div className="flex justify-center items-center h-64">
          <CircularProgress />
        </div>
      </Paper>
    );
  }

  // Format the request type for display
  const formatRequestType = (type: string) => {
    return type.replace('_', ' ').split(' ').map(
      word => word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <Paper className="p-6">
      <Typography variant="h4" component="h1" gutterBottom>
        Update Requests
      </Typography>
      
      <Typography variant="h6" component="h2" className="mb-4">
        Pending and Recent Requests
      </Typography>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Request Type</TableCell>
              <TableCell>Date Requested</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {updateRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No update requests found
                </TableCell>
              </TableRow>
            ) : (
              updateRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.userName}</TableCell>
                  <TableCell>{request.userEmail}</TableCell>
                  <TableCell>
                    {formatRequestType(request.requestType)}
                  </TableCell>
                  <TableCell>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {request.status === 'PENDING' && (
                      <Chip label="Pending" color="warning" />
                    )}
                    {request.status === 'APPROVED' && (
                      <Chip label="Approved" color="success" />
                    )}
                    {request.status === 'REJECTED' && (
                      <Chip label="Rejected" color="error" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => viewRequestDetails(request)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Update Request Detail Dialog */}
      <Dialog 
        open={requestDetailOpen} 
        onClose={() => setRequestDetailOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Update Request Details</DialogTitle>
        <DialogContent dividers>
          {requestSuccess && (
            <Alert severity="success" className="mb-4">
              {requestSuccess}
            </Alert>
          )}
          
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <Typography variant="subtitle1" fontWeight="bold">Request Type:</Typography>
                <Typography>{formatRequestType(selectedRequest.requestType)}</Typography>
              </div>
              
              <div>
                <Typography variant="subtitle1" fontWeight="bold">User:</Typography>
                <Typography>{selectedRequest.userName} ({selectedRequest.userEmail})</Typography>
              </div>
              
              <div>
                <Typography variant="subtitle1" fontWeight="bold">Date Requested:</Typography>
                <Typography>{new Date(selectedRequest.createdAt).toLocaleString()}</Typography>
              </div>
              
              <div>
                <Typography variant="subtitle1" fontWeight="bold">Status:</Typography>
                <div className="mt-1">
                  {selectedRequest.status === 'PENDING' && (
                    <Chip label="Pending" color="warning" size="small" />
                  )}
                  {selectedRequest.status === 'APPROVED' && (
                    <Chip label="Approved" color="success" size="small" />
                  )}
                  {selectedRequest.status === 'REJECTED' && (
                    <Chip label="Rejected" color="error" size="small" />
                  )}
                </div>
              </div>
              
              <div>
                <Typography variant="subtitle1" fontWeight="bold">Request Data:</Typography>
                <Paper className="p-4 bg-gray-50 mt-2">
                  {selectedRequest.requestType === 'PROFILE_UPDATE' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Typography variant="body2" fontWeight="bold">Name:</Typography>
                        <Typography variant="body2">
                          {selectedRequest.requestData.firstName} {selectedRequest.requestData.lastName}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body2" fontWeight="bold">Phone:</Typography>
                        <Typography variant="body2">{selectedRequest.requestData.phone}</Typography>
                      </div>
                      <div>
                        <Typography variant="body2" fontWeight="bold">Address:</Typography>
                        <Typography variant="body2">
                          {selectedRequest.requestData.address}, {selectedRequest.requestData.city}, {selectedRequest.requestData.postalCode}
                        </Typography>
                      </div>
                      {selectedRequest.requestData.additionalInfo && (
                        <div className="md:col-span-2">
                          <Typography variant="body2" fontWeight="bold">Additional Info:</Typography>
                          <Typography variant="body2">{selectedRequest.requestData.additionalInfo}</Typography>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {selectedRequest.requestType === 'SERVICE_UPDATE' && (
                    <div className="space-y-1">
                      <div>
                        <Typography variant="body2">
                          Childcare: {selectedRequest.requestData.childcare ? '✅' : '❌'}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body2">
                          Meal Preparation: {selectedRequest.requestData.mealPreparation ? '✅' : '❌'}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body2">
                          Light Housekeeping: {selectedRequest.requestData.lightHousekeeping ? '✅' : '❌'}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body2">
                          Tutoring: {selectedRequest.requestData.tutoring ? '✅' : '❌'}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body2">
                          Pet Minding: {selectedRequest.requestData.petMinding ? '✅' : '❌'}
                        </Typography>
                      </div>
                    </div>
                  )}
                  
                  {selectedRequest.requestType === 'CHILD_UPDATE' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Typography variant="body2" fontWeight="bold">Name:</Typography>
                        <Typography variant="body2">
                          {selectedRequest.requestData.firstName} {selectedRequest.requestData.lastName}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body2" fontWeight="bold">Age:</Typography>
                        <Typography variant="body2">{selectedRequest.requestData.age}</Typography>
                      </div>
                      {selectedRequest.requestData.specialNotes && (
                        <div className="md:col-span-2">
                          <Typography variant="body2" fontWeight="bold">Special Notes:</Typography>
                          <Typography variant="body2">{selectedRequest.requestData.specialNotes}</Typography>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {selectedRequest.requestType === 'CHILD_ADD' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Typography variant="body2" fontWeight="bold">Name:</Typography>
                        <Typography variant="body2">
                          {selectedRequest.requestData.firstName} {selectedRequest.requestData.lastName}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body2" fontWeight="bold">Age:</Typography>
                        <Typography variant="body2">{selectedRequest.requestData.age}</Typography>
                      </div>
                      {selectedRequest.requestData.specialNotes && (
                        <div className="md:col-span-2">
                          <Typography variant="body2" fontWeight="bold">Special Notes:</Typography>
                          <Typography variant="body2">{selectedRequest.requestData.specialNotes}</Typography>
                        </div>
                      )}
                    </div>
                  )}
                </Paper>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDetailOpen(false)}>Close</Button>
          
          {selectedRequest && selectedRequest.status === 'PENDING' && (
            <>
              <Button 
                variant="outlined" 
                color="error"
                onClick={() => processUpdateRequest(selectedRequest.id, false)}
                disabled={processRequestLoading}
              >
                Reject
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => processUpdateRequest(selectedRequest.id, true)}
                disabled={processRequestLoading}
                startIcon={processRequestLoading ? <CircularProgress size={20} /> : null}
              >
                {processRequestLoading ? 'Processing...' : 'Approve'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Paper>
  );
}