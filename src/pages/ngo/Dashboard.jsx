
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

const NGODashboard = () => {
  const [availableFood, setAvailableFood] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [requestDetails, setRequestDetails] = useState({
    quantity: '',
    pickup_date: '',
    notes: ''
  });
  
  const { user, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  
  const fetchAvailableFood = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3000/ngo/filtered_food', {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch available food');
      }
      
      const data = await response.json();
      setAvailableFood(data);
    } catch (error) {
      console.error('Error fetching available food:', error);
      toast.error('Failed to load available food items');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!user || !user.roles?.includes('Ngo')) {
      navigate('/login');
      return;
    }
    
    fetchAvailableFood();
  }, [user, navigate]);
  
  const handleOpenRequestDialog = (item) => {
    setSelectedItem(item);
    // Reset request details
    setRequestDetails({
      quantity: '',
      pickup_date: getTomorrowDate(),
      notes: ''
    });
    setShowRequestDialog(true);
  };
  
  // Helper to get tomorrow's date in YYYY-MM-DDThh:mm format for the date input
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  };
  
  const handleRequestFood = async () => {
    if (!requestDetails.quantity || parseFloat(requestDetails.quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    
    if (parseFloat(requestDetails.quantity) > selectedItem.quantity) {
      toast.error(`Requested quantity cannot exceed available quantity (${selectedItem.quantity})`);
      return;
    }
    
    try {
      const response = await fetch('http://127.0.0.1:3000/ngo/request', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          inventory_item_id: selectedItem.id,
          quantity: parseFloat(requestDetails.quantity),
          pickup_date: requestDetails.pickup_date || undefined,
          notes: requestDetails.notes || undefined
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create request');
      }
      
      toast.success(data.message || 'Food request created successfully');
      setShowRequestDialog(false);
      fetchAvailableFood();
    } catch (error) {
      toast.error(error.message || 'Error creating request');
      console.error('Error creating request:', error);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto p-4 flex-1">
        <h1 className="text-3xl font-bold mb-8">Available Food</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Food Items Available in Your Area</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading available food...</div>
            ) : availableFood.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No food items are currently available in your area.</p>
                <p className="mt-2">Please check back later or contact local retailers.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableFood.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                      <div className="space-y-2 mb-4">
                        <p className="text-gray-600">
                          <span className="font-medium">Quantity:</span> {item.quantity}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Best Before:</span> {formatDate(item.best_before)}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Expires:</span> {formatDate(item.expires_at)}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Location:</span> {item.location.city}, {item.location.pincode}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Contact:</span> {item.retailer_contact}
                        </p>
                      </div>
                      <Button 
                        onClick={() => handleOpenRequestDialog(item)}
                        className="w-full"
                      >
                        Request Food
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Request Food Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Food Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedItem && (
              <>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-semibold">{selectedItem.name}</p>
                  <p className="text-sm">Available Quantity: {selectedItem.quantity}</p>
                  <p className="text-sm">Best Before: {formatDate(selectedItem.best_before)}</p>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity to Request</Label>
              <Input
                id="quantity"
                type="number"
                min="0.1"
                step="0.1"
                max={selectedItem?.quantity || 0}
                value={requestDetails.quantity}
                onChange={(e) => setRequestDetails({ ...requestDetails, quantity: e.target.value })}
                placeholder="Enter quantity to request"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickupDate">Preferred Pickup Date & Time</Label>
              <Input
                id="pickupDate"
                type="datetime-local"
                value={requestDetails.pickup_date}
                onChange={(e) => setRequestDetails({ ...requestDetails, pickup_date: e.target.value })}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={requestDetails.notes}
                onChange={(e) => setRequestDetails({ ...requestDetails, notes: e.target.value })}
                placeholder="Any special instructions or notes for the retailer"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestFood}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NGODashboard;
