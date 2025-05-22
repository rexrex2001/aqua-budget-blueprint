
import { useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

const Auth = () => {
  const [tab, setTab] = useState<"login" | "register">("login");
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-blue-50">
      <Card className="w-full max-w-md border border-blue-100 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-blue-700">Finance App</CardTitle>
          <CardDescription className="text-center">
            Manage your finances with ease
          </CardDescription>
        </CardHeader>
        
        <Tabs value={tab} onValueChange={(value) => setTab(value as "login" | "register")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          
          <TabsContent value="register">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
