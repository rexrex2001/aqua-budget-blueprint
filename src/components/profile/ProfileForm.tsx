
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { currencies, updateUserProfile } from "@/utils/profileUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client"; // Added missing import

interface ProfileFormData {
  name: string;
  email: string;
  currency: string;
  defaultView: "daily" | "weekly" | "monthly";
}

const ProfileForm = () => {
  const { userData, updateUserProfile: updateLocalUserProfile } = useUser();
  const { user } = useAuth();
  
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: userData.name,
    email: user?.email || userData.email,
    currency: userData.preferences.currency,
    defaultView: userData.preferences.defaultView,
  });

  useEffect(() => {
    setFormData({
      name: userData.name,
      email: user?.email || userData.email,
      currency: userData.preferences.currency,
      defaultView: userData.preferences.defaultView,
    });
    
    // Fetch username from profiles if we have an authenticated user
    if (user) {
      fetchUserProfile();
    }
  }, [userData, user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user?.id)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setUsername(data.username);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error("Name and email are required");
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    // Update local storage user data
    updateLocalUserProfile(
      formData.name,
      formData.email, 
      {
        currency: formData.currency,
        defaultView: formData.defaultView as "daily" | "weekly" | "monthly",
      }
    );
    
    // If authenticated, update profile in database
    if (user) {
      try {
        setLoading(true);
        const result = await updateUserProfile(user.id, username);
        if (!result.success) {
          toast.error(result.error || "Error updating profile");
          return;
        }
      } catch (error: any) {
        toast.error(error.message || "Error updating profile");
        return;
      } finally {
        setLoading(false);
      }
    }

    toast.success("Profile updated successfully");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {user && (
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={user !== null || loading}
            />
            {user && (
              <p className="text-sm text-muted-foreground">
                Email cannot be changed when authenticated with Supabase
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Preferred Currency</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => setFormData({ ...formData, currency: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultView">Default Time Period</Label>
            <Select
              value={formData.defaultView}
              onValueChange={(value) => setFormData({ ...formData, defaultView: value as "daily" | "weekly" | "monthly" })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
