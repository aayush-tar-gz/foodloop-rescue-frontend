
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

const RetailerDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', quantity: '' });
  const [sellQuantity, setSellQuantity] = useState('');
  
  const { user, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  
  const fetchInventory = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3000/retailers/inventory', {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }
      
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3000/retailers/notifications', {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  
  useEffect(() => {
    if (!user || !user.roles?.includes('Retailer')) {
      navigate('/login');
      return;
    }
    
    fetchInventory();
    fetchNotifications();
  }, [user, navigate]);
  
  const handleAddItem = async () => {
    if (!newItem.name || !newItem.quantity) {
      toast.error('Please enter both name and quantity');
      return;
    }
    
    try {
      const response = await fetch('http://127.0.0.1:3000/retailers/add_item', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: newItem.name,
          quantity: parseFloat(newItem.quantity)
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add item');
      }
      
      toast.success(data.message || 'Item added successfully');
      setNewItem({ name: '', quantity: '' });
      setShowAddDialog(false);
      fetchInventory();
    } catch (error) {
      toast.error(error.message || 'Error adding item');
      console.error('Error adding item:', error);
    }
  };
  
  const handleSellItem = async () => {
    if (!sellQuantity || parseFloat(sellQuantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    
    try {
      const response = await fetch(`http://127.0.0.1:3000/retailers/inventory/${selectedItem.id}/sell`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          quantity: parseFloat(sellQuantity)
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sell item');
      }
      
      toast.success(data.message || 'Item sold successfully');
      setSellQuantity('');
      setShowSellDialog(false);
      fetchInventory();
    } catch (error) {
      toast.error(error.message || 'Error selling item');
      console.error('Error selling item:', error);
    }
  };
  
  const handleListItem = async (item) => {
    try {
      const response = await fetch(`http://127.0.0.1:3000/retailers/inventory/${item.id}/list`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to list item');
      }
      
      toast.success(data.message || 'Item listed for NGOs');
      fetchInventory();
    } catch (error) {
      toast.error(error.message || 'Error listing item');
      console.error('Error listing item:', error);
    }
  };
  
  const handleRemoveItem = async (itemId) => {
    if (!confirm('Are you sure you want to remove this item?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://127.0.0.1:3000/retailers/item/remove/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove item');
      }
      
      toast.success(data.message || 'Item removed successfully');
      fetchInventory();
    } catch (error) {
      toast.error(error.message || 'Error removing item');
      console.error('Error removing item:', error);
    }
  };
  
  const handleIgnoreNotification = async (itemId) => {
    try {
      const response = await fetch(`http://127.0.0.1:3000/retailers/food/${itemId}/ignore`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to ignore notification');
      }
      
      toast.success(data.message || 'Notification ignored');
      fetchNotifications();
    } catch (error) {
      toast.error(error.message || 'Error ignoring notification');
      console.error('Error ignoring notification:', error);
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
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Inventory Management</h1>
          <Button onClick={() => setShowAddDialog(true)}>Add New Item</Button>
        </div>
        
        {/* Notifications Section */}
        {notifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <div className="grid grid-cols-1 gap-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className="bg-amber-50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <p className="text-amber-800">{notification.message}</p>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Find the corresponding inventory item
                            const item = inventory.find(i => i.id === notification.id);
                            if (item) handleListItem(item);
                          }}
                        >
                          List
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleIgnoreNotification(notification.id)}
                        >
                          Ignore
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Current Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading inventory...</div>
            ) : inventory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No items in inventory yet.</p>
                <p className="mt-2">Click "Add New Item" to add your first item.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="py-3 px-4 text-left">Name</th>
                      <th className="py-3 px-4 text-left">Quantity</th>
                      <th className="py-3 px-4 text-left">Best Before</th>
                      <th className="py-3 px-4 text-left">Expires At</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3 px-4">{item.name}</td>
                        <td className="py-3 px-4">{item.quantity}</td>
                        <td className="py-3 px-4">{formatDate(item.best_before)}</td>
                        <td className="py-3 px-4">{formatDate(item.expires_at)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.status === 'Selling' ? 'bg-green-100 text-green-800' : 
                            item.status === 'Listing' ? 'bg-blue-100 text-blue-800' :
                            item.status === 'Approved' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedItem(item);
                                setShowSellDialog(true);
                              }}
                            >
                              Sell
                            </Button>
                            
                            {item.status !== 'Listing' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleListItem(item)}
                              >
                                List for NGOs
                              </Button>
                            )}
                            
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="e.g., Apples, Bread, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.1"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                placeholder="Enter quantity"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Sell Item Dialog */}
      <Dialog open={showSellDialog} onOpenChange={setShowSellDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sell Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedItem && (
              <>
                <p>Selected Item: <strong>{selectedItem.name}</strong></p>
                <p>Available Quantity: <strong>{selectedItem.quantity}</strong></p>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="sellQuantity">Quantity to Sell</Label>
              <Input
                id="sellQuantity"
                type="number"
                min="0.1"
                step="0.1"
                max={selectedItem?.quantity || 0}
                value={sellQuantity}
                onChange={(e) => setSellQuantity(e.target.value)}
                placeholder="Enter quantity to sell"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSellDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSellItem}>Sell</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RetailerDashboard;
