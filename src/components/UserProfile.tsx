
import { supabase } from "@/integrations/supabase/client";
import ProfileForm from "./profile/ProfileForm";
import DataManagement from "./profile/DataManagement";
import AccountSummary from "./profile/AccountSummary";

const UserProfile = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-finance-text">User Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <ProfileForm />
          <DataManagement />
        </div>

        <div className="space-y-6">
          <AccountSummary />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
