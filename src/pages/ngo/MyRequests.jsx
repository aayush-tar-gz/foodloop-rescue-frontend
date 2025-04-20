
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const NGOMyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  
  const fetchMyRequests = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3000/ngo/my_requests', {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }
      
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load your requests');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!user || !user.roles?.includes('Ngo')) {
      navigate('/login');
      return;
    }
    
    fetchMyRequests();
  }, [user, navigate]);
  
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
  
  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'ignored':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto p-4 flex-1">
        <h1 className="text-3xl font-bold mb-8">My Requests</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Food Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading your requests...</div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>You haven't made any food requests yet.</p>
                <p className="mt-2">Visit the Available Food page to request items from retailers.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <Card key={request.id} className="overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">
                          {request.inventory_item.name}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClasses(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-gray-600">
                        <p>Requested quantity: <strong>{request.inventory_item.quantity}</strong></p>
                        <p>Request date: <strong>{formatDate(request.created_at)}</strong></p>
                        
                        <div className="mt-4">
                          {request.status === 'pending' ? (
                            <p className="text-yellow-600">Your request is being reviewed by the retailer</p>
                          ) : request.status === 'approved' ? (
                            <p className="text-green-600">Your request has been approved! You can pick up the food from the retailer.</p>
                          ) : request.status === 'ignored' ? (
                            <p className="text-gray-600">Your request was declined by the retailer. Please try requesting other available items.</p>
                          ) : (
                            <p>Status: {request.status}</p>
                          )}
                        </div>
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

export default NGOMyRequests;
