
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { User, Save, Loader2 } from "lucide-react";

interface PersonalInfoFormProps {
  initialData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    bio: string;
  };
  onSubmit: (data: ProfileFormData) => Promise<void>;
  isSaving: boolean;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
}

const PersonalInfoForm = ({ initialData, onSubmit, isSaving }: PersonalInfoFormProps) => {
  const form = useForm<ProfileFormData>({
    defaultValues: initialData
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Personal Information
        </CardTitle>
        <CardDescription>Update your personal details</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                {...form.register('firstName', { required: true })} 
              />
              {form.formState.errors.firstName && <p className="text-sm text-red-500">First name is required</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                {...form.register('lastName')} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                disabled
                {...form.register('email')} 
              />
              <p className="text-xs text-muted-foreground">Contact support to change email</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                {...form.register('phone')} 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Residential Address</Label>
            <Textarea 
              id="address" 
              {...form.register('address')} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea 
              id="bio" 
              {...form.register('bio')} 
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-agri-trader"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoForm;
