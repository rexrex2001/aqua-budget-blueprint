
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { exportUserData } from "@/utils/profileUtils";

const DataManagement = () => {
  const { userData } = useUser();

  const handleResetData = () => {
    if (confirm("Are you sure you want to reset all your data? This cannot be undone.")) {
      localStorage.removeItem("financeUserData");
      window.location.reload();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your financial data is stored locally on your device. You can export or reset your data if needed.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              onClick={() => exportUserData(userData)}
            >
              Export Data
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={handleResetData}
            >
              Reset All Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataManagement;
