
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

const FarmerDashboard = () => {
  const [demandData, setDemandData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const fetchDemandForecast = async () => {
      try {
        console.log('Fetching demand forecast data...');
        setLoading(true);
        const response = await fetch('http://127.0.0.1:3000/farmer/simple_demand_forecast', {
          headers: getAuthHeaders(),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch demand forecast (${response.status})`);
        }
        
        const data = await response.json();
        console.log('Demand forecast data received:', data);
        setDemandData(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching demand forecast:', error);
        setError(error.message);
        toast.error('Failed to load demand forecast data');
      } finally {
        setLoading(false);
      }
    };

    fetchDemandForecast();
  }, [user, navigate, getAuthHeaders]);

  // Custom data formatting for chart
  const chartData = React.useMemo(() => {
    if (!demandData?.top_demanded_foods?.length) return [];
    
    return demandData.top_demanded_foods.map(item => ({
      item_name: item.item_name,
      total_requested_quantity: Number(item.total_requested_quantity)
    }));
  }, [demandData]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto p-4 flex-1">
        <h1 className="text-3xl font-bold mb-8">Farmer Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Demand Chart */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Demand Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p>Loading forecast data...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="h-[300px] flex items-center justify-center text-destructive">
                  <div className="flex flex-col items-center">
                    <AlertCircle className="w-10 h-10 mb-2" />
                    <p>Error loading data: {error}</p>
                  </div>
                </div>
              ) : chartData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="item_name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} units`, 'Quantity']} />
                      <Bar dataKey="total_requested_quantity" fill="#60a5fa" name="Quantity" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  <p>No demand data available</p>
                </div>
              )}
              <div className="mt-4 text-xs text-gray-500">
                {demandData?.data_source === 'mock' && (
                  <p className="italic">* Using sample data as insufficient historical data is available.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Market Insights</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Loading insights...</span>
                </div>
              ) : error ? (
                <div className="py-10 text-center text-destructive">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>Unable to load insights</p>
                </div>
              ) : demandData?.demand_forecast_text ? (
                <div className="text-gray-700 whitespace-pre-line">
                  {demandData.demand_forecast_text}
                </div>
              ) : (
                <p className="text-gray-500 py-10 text-center">No insights available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
