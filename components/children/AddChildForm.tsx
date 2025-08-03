'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { childService, motherService } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import type { Database } from '@/lib/supabase';

type Mother = Database['public']['Tables']['mothers']['Row'];

interface AddChildFormProps {
  onSuccess?: () => void;
}

export function AddChildForm({ onSuccess }: AddChildFormProps) {

  const { t } = useLanguage();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mothers, setMothers] = useState<Mother[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    ageInMonths: '',
    motherId: '',
    healthStatus: 'healthy' as 'healthy' | 'needs_attention' | 'critical',
    lastScreening: new Date().toISOString().split('T')[0],
    vaccinationsCompleted: '0',
    vaccinationsTotal: '18',
    hasPhoto: false
  });

  useEffect(() => {
    const loadMothers = async () => {
      try {
        const data = await motherService.getAll();
        setMothers(data);
      } catch (error) {
        console.error('Error loading mothers:', error);
      }
    };

    if (open) {
      loadMothers();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.motherId) return;

    setLoading(true);
    try {
      const childData = {
        name: formData.name,
        age_in_months: parseInt(formData.ageInMonths),
        mother_id: formData.motherId,
        health_status: formData.healthStatus as 'healthy' | 'needs_attention' | 'critical',
        last_screening: formData.lastScreening,
        vaccinations_completed: parseInt(formData.vaccinationsCompleted),
        vaccinations_total: parseInt(formData.vaccinationsTotal),
        has_photo: formData.hasPhoto
      };

      const newChild = await childService.create(childData);
      
      if (newChild) {
        toast({
          title: "Success",
          description: "Child added successfully",
        });
        setOpen(false);
        setFormData({
          name: '',
          ageInMonths: '',
          motherId: '',
          healthStatus: 'healthy',
          lastScreening: new Date().toISOString().split('T')[0],
          vaccinationsCompleted: '0',
          vaccinationsTotal: '18',
          hasPhoto: false
        });
        onSuccess?.();
      } else {
        toast({
          title: "Error",
          description: "Failed to add child",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding child:', error);
      toast({
        title: "Error",
        description: "An error occurred while adding child",
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
          Add Child
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Child</DialogTitle>
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
              <Label htmlFor="ageInMonths">Age (Months)</Label>
              <Input
                id="ageInMonths"
                type="number"
                min="0"
                max="60"
                value={formData.ageInMonths}
                onChange={(e) => setFormData({ ...formData, ageInMonths: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="motherId">Mother</Label>
            <Select
              value={formData.motherId}
              onValueChange={(value) => setFormData({ ...formData, motherId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mother" />
              </SelectTrigger>
              <SelectContent>
                {mothers.map((mother) => (
                  <SelectItem key={mother.id} value={mother.id}>
                    {mother.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="healthStatus">Health Status</Label>
              <Select
                value={formData.healthStatus}
                onValueChange={(value: 'healthy' | 'needs_attention' | 'critical') => 
                  setFormData({ ...formData, healthStatus: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="needs_attention">Needs Attention</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastScreening">Last Screening</Label>
              <Input
                id="lastScreening"
                type="date"
                value={formData.lastScreening}
                onChange={(e) => setFormData({ ...formData, lastScreening: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vaccinationsCompleted">Vaccinations Completed</Label>
              <Input
                id="vaccinationsCompleted"
                type="number"
                min="0"
                value={formData.vaccinationsCompleted}
                onChange={(e) => setFormData({ ...formData, vaccinationsCompleted: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vaccinationsTotal">Total Vaccinations</Label>
              <Input
                id="vaccinationsTotal"
                type="number"
                min="0"
                value={formData.vaccinationsTotal}
                onChange={(e) => setFormData({ ...formData, vaccinationsTotal: e.target.value })}
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
              {loading ? 'Adding...' : 'Add Child'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 