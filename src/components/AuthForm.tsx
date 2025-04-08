
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const AuthForm = () => {
  const [userRole, setUserRole] = useState<"farmer" | "trader">("farmer");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Login Successful",
      description: `Welcome back to AgriTradeConnect as a ${userRole}`,
    });
    
    if (userRole === "farmer") {
      navigate("/farmer-dashboard");
    } else {
      navigate("/trader-dashboard");
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Registration Successful",
      description: `Welcome to AgriTradeConnect as a ${userRole}`,
    });
    
    if (userRole === "farmer") {
      navigate("/farmer-dashboard");
    } else {
      navigate("/trader-dashboard");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">AgriTradeConnect</CardTitle>
          <CardDescription className="text-center">
            Connect, trade, and grow together in one platform
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="mb-4">
            <Label className="text-center block mb-2">I am a</Label>
            <div className="flex justify-center gap-4">
              <Button 
                variant={userRole === "farmer" ? "default" : "outline"} 
                className={userRole === "farmer" ? "bg-agri-farmer" : ""}
                onClick={() => setUserRole("farmer")}
              >
                Farmer
              </Button>
              <Button 
                variant={userRole === "trader" ? "default" : "outline"} 
                className={userRole === "trader" ? "bg-agri-trader" : ""} 
                onClick={() => setUserRole("trader")}
              >
                Trader
              </Button>
            </div>
          </div>

          <Tabs defaultValue="login" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required />
                  </div>
                  <Button 
                    type="submit" 
                    className={userRole === "farmer" ? "bg-agri-farmer" : "bg-agri-trader"}
                  >
                    Login
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleRegister}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" type="text" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input id="reg-email" type="email" placeholder="m@example.com" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input id="reg-password" type="password" required />
                  </div>
                  <Button 
                    type="submit" 
                    className={userRole === "farmer" ? "bg-agri-farmer" : "bg-agri-trader"}
                  >
                    Register
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthForm;
