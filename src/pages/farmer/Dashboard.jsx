
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const FarmerDashboard = () => {
  const [demandData, setDemandData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const fetchDemandForecast = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3000/farmer/simple_demand_forecast', {
          headers: getAuthHeaders(),
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch demand forecast');
        }
        
        const data = await response.json();
        setDemandData(data);
      } catch (error) {
        console.error('Error fetching demand forecast:', error);
        toast.error('Failed to load demand forecast');
      } finally {
        setLoading(false);
      }
    };

    fetchDemandForecast();
  }, [user, navigate, getAuthHeaders]);

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
                  Loading forecast data...
                </div>
              ) : demandData?.top_demanded_foods?.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={demandData.top_demanded_foods}>
                      <XAxis dataKey="item_name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total_requested_quantity" fill="#60a5fa" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No demand data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Market Insights</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading insights...</div>
              ) : demandData?.demand_forecast_text ? (
                <p className="text-gray-700 whitespace-pre-line">
                  {demandData.demand_forecast_text}
                </p>
              ) : (
                <p className="text-gray-500">No insights available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
