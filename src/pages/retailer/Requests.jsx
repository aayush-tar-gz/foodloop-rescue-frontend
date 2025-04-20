
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const RetailerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  
  const fetchRequests = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3000/retailers/requested_food', {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }
      
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load food requests');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!user || !user.roles?.includes('Retailer')) {
      navigate('/login');
      return;
    }
    
    fetchRequests();
  }, [user, navigate]);
  
  const handleApproveRequest = async (requestId) => {
    try {
      const response = await fetch(`http://127.0.0.1:3000/retailers/requests/${requestId}/approve`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve request');
      }
      
      toast.success(data.message || 'Request approved successfully');
      fetchRequests();
    } catch (error) {
      toast.error(error.message || 'Error approving request');
      console.error('Error approving request:', error);
    }
  };
  
  const handleIgnoreRequest = async (requestId) => {
    try {
      const response = await fetch(`http://127.0.0.1:3000/retailers/requests/${requestId}/ignore`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to ignore request');
      }
      
      toast.success(data.message || 'Request ignored');
      fetchRequests();
    } catch (error) {
      toast.error(error.message || 'Error ignoring request');
      console.error('Error ignoring request:', error);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto p-4 flex-1">
        <h1 className="text-3xl font-bold mb-8">Food Requests</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Incoming Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No food requests yet.</p>
                <p className="mt-2">Once NGOs request your listed items, they will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <Card key={request.id} className="overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="mb-4 md:mb-0">
                          <div className="flex items-center">
                            <h3 className="text-lg font-semibold">
                              Request #{request.id}
                            </h3>
                            <span className={`ml-3 px-2 py-1 rounded text-xs font-medium ${
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                              request.status === 'ignored' ? 'bg-gray-100 text-gray-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {request.status}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">
                            Requested quantity: <strong>{request.quantity}</strong>
                          </p>
                          <p className="text-gray-600">
                            NGO ID: <strong>{request.ngo_id}</strong>
                          </p>
                          {request.pickup_date && (
                            <p className="text-gray-600">
                              Requested pickup: <strong>{formatDate(request.pickup_date)}</strong>
                            </p>
                          )}
                          <p className="text-gray-600">
                            Request date: <strong>{formatDate(request.created_at)}</strong>
                          </p>
                        </div>
                        
                        {request.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button 
                              onClick={() => handleApproveRequest(request.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => handleIgnoreRequest(request.id)}
                            >
                              Ignore
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RetailerRequests;
