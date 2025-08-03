'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motherService } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface AddMotherFormProps {
  onSuccess?: () => void;
}

export function AddMotherForm({ onSuccess }: AddMotherFormProps) {

  const { t } = useLanguage();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    mobile: '',
    address: '',
    riskLevel: 'low' as 'high' | 'medium' | 'low',
    pregnancyWeek: '',
    lastVisit: new Date().toISOString().split('T')[0],
    childrenCount: '0'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const motherData = {
        name: formData.name,
        age: parseInt(formData.age),
        mobile: formData.mobile,
        address: formData.address,
        risk_level: formData.riskLevel,
        pregnancy_week: formData.pregnancyWeek ? parseInt(formData.pregnancyWeek) : undefined,
        last_visit: formData.lastVisit,
        children_count: parseInt(formData.childrenCount)
      };

      const newMother = await motherService.create(motherData);
      
      if (newMother) {
        toast({
          title: "Success",
          description: "Mother added successfully",
        });
        setOpen(false);
        setFormData({
          name: '',
          age: '',
          mobile: '',
          address: '',
          riskLevel: 'low',
          pregnancyWeek: '',
          lastVisit: new Date().toISOString().split('T')[0],
          childrenCount: '0'
        });
        onSuccess?.();
      } else {
        toast({
          title: "Error",
          description: "Failed to add mother",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding mother:', error);
      toast({
        title: "Error",
        description: "An error occurred while adding mother",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Mother
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Mother</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min="12"
                max="60"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="riskLevel">Risk Level</Label>
              <Select
                value={formData.riskLevel}
                onValueChange={(value: 'high' | 'medium' | 'low') => 
                  setFormData({ ...formData, riskLevel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pregnancyWeek">Pregnancy Week</Label>
              <Input
                id="pregnancyWeek"
                type="number"
                min="1"
                max="42"
                value={formData.pregnancyWeek}
                onChange={(e) => setFormData({ ...formData, pregnancyWeek: e.target.value })}
                placeholder="Optional"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastVisit">Last Visit</Label>
              <Input
                id="lastVisit"
                type="date"
                value={formData.lastVisit}
                onChange={(e) => setFormData({ ...formData, lastVisit: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="childrenCount">Children Count</Label>
              <Input
                id="childrenCount"
                type="number"
                min="0"
                value={formData.childrenCount}
                onChange={(e) => setFormData({ ...formData, childrenCount: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Mother'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 