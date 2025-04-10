
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";

interface CompanyDetailsFormProps {
  initialData: {
    companyName: string;
    designation: string;
    gstin: string;
    tradeLicense: string;
    companyAddress: string;
    businessDescription: string;
    operationalAreas: string;
  };
  onSubmit: (data: CompanyFormData) => Promise<void>;
  isSaving: boolean;
}

export interface CompanyFormData {
  companyName: string;
  designation: string;
  gstin: string;
  tradeLicense: string;
  companyAddress: string;
  businessDescription: string;
  operationalAreas: string;
}

const CompanyDetailsForm = ({ initialData, onSubmit, isSaving }: CompanyDetailsFormProps) => {
  const form = useForm<CompanyFormData>({
    defaultValues: initialData
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Details</CardTitle>
        <CardDescription>Information about your trading business</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input 
                id="companyName" 
                {...form.register('companyName', { required: true })} 
              />
              {form.formState.errors.companyName && <p className="text-sm text-red-500">Company name is required</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Your Designation</Label>
              <Input 
                id="designation" 
                {...form.register('designation')} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gstin">GSTIN Number</Label>
              <Input 
                id="gstin" 
                {...form.register('gstin')} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tradeLicense">Trade License Number</Label>
              <Input 
                id="tradeLicense" 
                {...form.register('tradeLicense')} 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="companyAddress">Company Address</Label>
            <Textarea 
              id="companyAddress" 
              {...form.register('companyAddress')} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="businessDescription">Business Description</Label>
            <Textarea 
              id="businessDescription" 
              {...form.register('businessDescription')} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="operationalAreas">Operational Areas</Label>
            <Input 
              id="operationalAreas" 
              {...form.register('operationalAreas')} 
              placeholder="e.g. Maharashtra, Gujarat, Punjab" 
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
                  Update Company Information
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CompanyDetailsForm;
