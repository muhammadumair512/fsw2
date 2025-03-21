/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Box,
  Collapse,
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { Fragment, useEffect, useState } from 'react';
import { useSnackbar } from '@/contexts/SnackbarContext';

// User type definition
type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  additionalInfo?: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
  children: Array<{
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    specialNotes?: string;
  }>;
  services: {
    childcare: boolean;
    mealPreparation: boolean;
    lightHousekeeping: boolean;
    tutoring: boolean;
    petMinding: boolean;
  };
  paymentInfo?: {
    id: string;
    nameOnCard: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    saveCard: boolean;
  };
};

// Account status filter options
type AccountStatus = 'ALL' | 'ACTIVE' | 'PENDING' | 'INACTIVE';

// Component for displaying collapsible row details
function UserRow(props: { 
  user: User; 
  toggleApprovalStatus: (userId: string, currentStatus: boolean) => void; 
  toggleActiveStatus: (userId: string, currentStatus: boolean) => void;
  viewUserDetails: (userId: string) => void; 
  approveLoading: string | null;
  toggleStatusLoading: string | null;
}) {
  const { user, toggleApprovalStatus, toggleActiveStatus, viewUserDetails, approveLoading, toggleStatusLoading } = props;
  const [open, setOpen] = useState(false);

  return (
    <Fragment>
      <TableRow>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>{user.phone}</TableCell>
        <TableCell>
          {new Date(user.createdAt).toLocaleDateString()}
        </TableCell>
        <TableCell>
          {!user.isApproved ? (
            <Chip label="Pending" color="warning" />
          ) : user.isActive ? (
            <Chip label="Active" color="success" />
          ) : (
            <Chip label="Inactive" color="error" />
          )}
        </TableCell>
        {/* <TableCell>
          <div className="flex space-x-2">
            <Button
              variant="outlined"
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={() => viewUserDetails(user.id)}
            >
              View
            </Button>
            
            <Button
              variant={user.isApproved ? 'outlined' : 'contained'} 
              color={user.isApproved ? 'error' : 'success'}
              size="small"
              onClick={() => toggleApprovalStatus(user.id, user.isApproved)}
              disabled={approveLoading === user.id}
              startIcon={approveLoading === user.id ? <CircularProgress size={20} /> : null}
            >
              {approveLoading === user.id ? 'Processing...' : user.isApproved ? 'Block' : 'Approve'}
            </Button>
            
            {user.isApproved && (
              <Button
                variant={user.isActive ? 'outlined' : 'contained'}
                color={user.isActive ? 'error' : 'success'}
                size="small"
                onClick={() => toggleActiveStatus(user.id, user.isActive)}
                disabled={toggleStatusLoading === user.id}
                startIcon={
                  toggleStatusLoading === user.id ? (
                    <CircularProgress size={20} />
                  ) : user.isActive ? (
                    <BlockIcon />
                  ) : (
                    <CheckCircleIcon />
                  )
                }
              >
                {toggleStatusLoading === user.id ? 'Processing...' : user.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            )}
          </div>
        </TableCell> */}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="h6" gutterBottom component="div">
                Detailed Information
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Typography variant="subtitle1" fontWeight="bold">Address:</Typography>
                  <Typography>{user.address}, {user.city}, {user.postalCode}</Typography>
                </div>
                {user.additionalInfo && (
                  <div>
                    <Typography variant="subtitle1" fontWeight="bold">Additional Info:</Typography>
                    <Typography>{user.additionalInfo}</Typography>
                  </div>
                )}
              </div>
              
              <Typography variant="h6" gutterBottom component="div">
                Services
              </Typography>
              <Box component="div" className="mb-4">
                <Box component="div">
                  <Typography>
                    {user.services.childcare ? '✅ Childcare' : '❌ Childcare'}
                  </Typography>
                </Box>
                <Box component="div">
                  <Typography>
                    {user.services.mealPreparation ? '✅ Meal Preparation' : '❌ Meal Preparation'}
                  </Typography>
                </Box>
                <Box component="div">
                  <Typography>
                    {user.services.lightHousekeeping ? '✅ Light Housekeeping' : '❌ Light Housekeeping'}
                  </Typography>
                </Box>
                <Box component="div">
                  <Typography>
                    {user.services.tutoring ? '✅ Tutoring' : '❌ Tutoring'}
                  </Typography>
                </Box>
                <Box component="div">
                  <Typography>
                    {user.services.petMinding ? '✅ Pet Minding' : '❌ Pet Minding'}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="h6" gutterBottom component="div">
                Children
              </Typography>
              {!user.children || user.children.length === 0 ? (
                <Typography>No children registered</Typography>
              ) : (
                <div className="space-y-2">
                  {user.children.map((child) => (
                    <div key={child.id} className="p-2 border rounded">
                      <Box component="div">
                        <Typography>
                          <strong>Name:</strong> {child.firstName} {child.lastName}, <strong>Age:</strong> {child.age}
                        </Typography>
                      </Box>
                      {child.specialNotes && (
                        <Box component="div">
                          <Typography>
                            <strong>Special Notes:</strong> {child.specialNotes}
                          </Typography>
                        </Box>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}

export default function UsersPage() {
  const { showSnackbar } = useSnackbar();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveLoading, setApproveLoading] = useState<string | null>(null);
  const [toggleStatusLoading, setToggleStatusLoading] = useState<string | null>(null);
  const [accountStatusFilter, setAccountStatusFilter] = useState<AccountStatus>('ALL');
  
  // User detail states
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);

  // Filter change handler
  const handleFilterChange = (status: AccountStatus) => {
    setAccountStatusFilter(status);
    
    if (status === 'ALL') {
      setFilteredUsers(users);
    } else if (status === 'ACTIVE') {
      setFilteredUsers(users.filter(user => user.isApproved && user.isActive));
    } else if (status === 'PENDING') {
      setFilteredUsers(users.filter(user => !user.isApproved));
    } else if (status === 'INACTIVE') {
      setFilteredUsers(users.filter(user => user.isApproved && !user.isActive));
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/admin/users');
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        showSnackbar({
          message: 'Failed to fetch users. Please try again.',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [showSnackbar]);

  const toggleApprovalStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setApproveLoading(userId);
      console.log(`Toggling user approval: ${userId}, current status: ${currentStatus}, new status: ${!currentStatus}`);
      
      const response = await axios.post(`/api/admin/toggle-approval`, { 
        userId, 
        isApproved: !currentStatus 
      });
      
      console.log('Toggle approval response:', response.data);
      
      // Update user in state
      const updatedUsers = users.map((user) =>
        user.id === userId ? { ...user, isApproved: !currentStatus } : user
      );
      setUsers(updatedUsers);
      
      // Also update filtered users list
      setFilteredUsers(filteredUsers.map((user) =>
        user.id === userId ? { ...user, isApproved: !currentStatus } : user
      ));
      
      // If viewing user details, update the selected user too
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({
          ...selectedUser,
          isApproved: !currentStatus
        });
      }
      
      showSnackbar({
        message: `User ${!currentStatus ? 'approved' : 'blocked'} successfully!`,
        severity: 'success',
      });
      
    } catch (error: any) {
      console.error('Error toggling user approval status:', error);
      showSnackbar({
        message: error.response?.data?.message || 'Failed to update user approval status',
        severity: 'error',
      });
    } finally {
      setApproveLoading(null);
    }
  };

  const toggleActiveStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setToggleStatusLoading(userId);
      console.log(`Toggling user status: ${userId}, current status: ${currentStatus}, new status: ${!currentStatus}`);
      
      const response = await axios.post(`/api/admin/toggle-user-status`, { 
        userId, 
        isActive: !currentStatus 
      });
      
      console.log('Toggle status response:', response.data);
      
      // Update user in state
      const updatedUsers = users.map((user) =>
        user.id === userId ? { ...user, isActive: !currentStatus } : user
      );
      setUsers(updatedUsers);
      
      // Also update filtered users list
      setFilteredUsers(filteredUsers.map((user) =>
        user.id === userId ? { ...user, isActive: !currentStatus } : user
      ));
      
      // If viewing user details, update the selected user too
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({
          ...selectedUser,
          isActive: !currentStatus
        });
      }
      
      showSnackbar({
        message: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`,
        severity: 'success',
      });
      
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      showSnackbar({
        message: error.response?.data?.message || 'Failed to update user status',
        severity: 'error',
      });
    } finally {
      setToggleStatusLoading(null);
    }
  };

  const viewUserDetails = async (userId: string) => {
    try {
      setUserDetailLoading(true);
      const response = await axios.get(`/api/admin/user-details/${userId}`);
      setSelectedUser(response.data);
      setUserDetailOpen(true);
    } catch (error) {
      showSnackbar({
        message: 'Failed to fetch user details',
        severity: 'error',
      });
    } finally {
      setUserDetailLoading(false);
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

  return (
    <Paper className="p-6">
      <Typography variant="h4" component="h1" gutterBottom>
        User Management
      </Typography>
      
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h6" component="h2">
          Family Accounts
        </Typography>
        
        <FormControl variant="outlined" size="small" style={{ minWidth: 200 }}>
          <InputLabel id="account-status-filter-label">Account Status</InputLabel>
          <Select
            labelId="account-status-filter-label"
            value={accountStatusFilter}
            onChange={(e) => handleFilterChange(e.target.value as AccountStatus)}
            label="Account Status"
          >
            <MenuItem value="ALL">All Accounts</MenuItem>
            <MenuItem value="ACTIVE">Active Accounts</MenuItem>
            <MenuItem value="PENDING">Pending Approval</MenuItem>
            <MenuItem value="INACTIVE">Inactive Accounts</MenuItem>
          </Select>
        </FormControl>
      </div>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Registration Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <UserRow 
                  key={user.id}
                  user={user}
                  toggleApprovalStatus={toggleApprovalStatus}
                  toggleActiveStatus={toggleActiveStatus}
                  viewUserDetails={viewUserDetails}
                  approveLoading={approveLoading}
                  toggleStatusLoading={toggleStatusLoading}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* User Detail Dialog */}
      <Dialog 
        open={userDetailOpen} 
        onClose={() => setUserDetailOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>User Details</DialogTitle>
        <DialogContent dividers>
          {userDetailLoading ? (
            <div className="flex justify-center py-4">
              <CircularProgress />
            </div>
          ) : selectedUser && (
            <div className="space-y-6">
              <div>
                <Typography variant="h6" gutterBottom>Personal Information</Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="subtitle1" fontWeight="bold">Name:</Typography>
                    <Typography>{selectedUser.firstName} {selectedUser.lastName}</Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle1" fontWeight="bold">Email:</Typography>
                    <Typography>{selectedUser.email}</Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle1" fontWeight="bold">Phone:</Typography>
                    <Typography>{selectedUser.phone}</Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle1" fontWeight="bold">Address:</Typography>
                    <Typography>{selectedUser.address}, {selectedUser.city}, {selectedUser.postalCode}</Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle1" fontWeight="bold">Status:</Typography>
                    <Box sx={{ mt: 1 }}>
                      {!selectedUser.isApproved ? (
                        <Chip label="Pending" color="warning" size="small" />
                      ) : selectedUser.isActive ? (
                        <Chip label="Active" color="success" size="small" />
                      ) : (
                        <Chip label="Inactive" color="error" size="small" />
                      )}
                    </Box>
                  </div>
                  <div>
                    <Typography variant="subtitle1" fontWeight="bold">Registration Date:</Typography>
                    <Typography>{new Date(selectedUser.createdAt).toLocaleDateString()}</Typography>
                  </div>
                </div>
                {selectedUser.additionalInfo && (
                  <div className="mt-4">
                    <Typography variant="subtitle1" fontWeight="bold">Additional Information:</Typography>
                    <Typography>{selectedUser.additionalInfo}</Typography>
                  </div>
                )}
              </div>

              <div>
                <Typography variant="h6" gutterBottom>Children</Typography>
                {!selectedUser.children || selectedUser.children.length === 0 ? (
                  <Typography>No children registered</Typography>
                ) : (
                  <div className="space-y-4">
                    {selectedUser.children.map((child) => (
                      <Paper key={child.id} className="p-4 border rounded-md">
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
              </div>

              <div>
                <Typography variant="h6" gutterBottom>Services Selected</Typography>
                <Box component="div" className="space-y-2">
                  <Box component="div">
                    <Typography>
                      {selectedUser.services.childcare ? '✅ Childcare' : '❌ Childcare'}
                    </Typography>
                  </Box>
                  <Box component="div">
                    <Typography>
                      {selectedUser.services.mealPreparation ? '✅ Meal Preparation' : '❌ Meal Preparation'}
                    </Typography>
                  </Box>
                  <Box component="div">
                    <Typography>
                      {selectedUser.services.lightHousekeeping ? '✅ Light Housekeeping' : '❌ Light Housekeeping'}
                    </Typography>
                  </Box>
                  <Box component="div">
                    <Typography>
                      {selectedUser.services.tutoring ? '✅ Tutoring' : '❌ Tutoring'}
                    </Typography>
                  </Box>
                  <Box component="div">
                    <Typography>
                      {selectedUser.services.petMinding ? '✅ Pet Minding' : '❌ Pet Minding'}
                    </Typography>
                  </Box>
                </Box>
              </div>

              {selectedUser.paymentInfo && (
                <div>
                  <Typography variant="h6" gutterBottom>Payment Information</Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Typography variant="subtitle1" fontWeight="bold">Name on Card:</Typography>
                      <Typography>{selectedUser.paymentInfo.nameOnCard}</Typography>
                    </div>
                    <div>
                      <Typography variant="subtitle1" fontWeight="bold">Card Number:</Typography>
                      <Typography>
                        ••••••••••••{selectedUser.paymentInfo.cardNumber.slice(-4)}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="subtitle1" fontWeight="bold">Expiry Date:</Typography>
                      <Typography>{selectedUser.paymentInfo.expiryDate}</Typography>
                    </div>
                    <div>
                      <Typography variant="subtitle1" fontWeight="bold">Save for Future Bookings:</Typography>
                      <Typography>{selectedUser.paymentInfo.saveCard ? 'Yes' : 'No'}</Typography>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
        {/* <DialogActions>
          <Button onClick={() => setUserDetailOpen(false)}>Close</Button>
          {selectedUser && (
            <>
              <Button 
                variant={selectedUser.isApproved ? 'outlined' : 'contained'} 
                color={selectedUser.isApproved ? 'error' : 'success'} 
                onClick={() => {
                  toggleApprovalStatus(selectedUser.id, selectedUser.isApproved);
                  setUserDetailOpen(false);
                }}
                disabled={!!approveLoading}
                startIcon={approveLoading ? <CircularProgress size={20} /> : null}
              >
                {approveLoading ? 'Processing...' : selectedUser.isApproved ? 'Block User' : 'Approve User'}
              </Button>
              
              {selectedUser.isApproved && (
                <Button 
                  variant={selectedUser.isActive ? 'outlined' : 'contained'} 
                  color={selectedUser.isActive ? 'error' : 'success'} 
                  onClick={() => {
                    toggleActiveStatus(selectedUser.id, selectedUser.isActive);
                    setUserDetailOpen(false);
                  }}
                  disabled={!!toggleStatusLoading}
                  startIcon={
                    toggleStatusLoading ? (
                      <CircularProgress size={20} />
                    ) : selectedUser.isActive ? (
                      <BlockIcon />
                    ) : (
                      <CheckCircleIcon />
                    )
                  }
                >
                  {toggleStatusLoading ? 'Processing...' : selectedUser.isActive ? 'Deactivate User' : 'Activate User'}
                </Button>
              )}
            </>
          )}
        </DialogActions> */}
      </Dialog>
    </Paper>
  );
}