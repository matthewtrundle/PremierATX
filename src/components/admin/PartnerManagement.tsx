// Partner Management Dashboard
// Internal admin tool for managing VR Partners (white-glove onboarding)

import React, { useState } from 'react';
import {
  useVRPartners,
  useCreateVRPartner,
  useUpdateVRPartner,
  useDeleteVRPartner,
  generateSlug,
} from '@/hooks/useVRPartners';
import { VRPartner, VRPartnerInsert, VRPartnerBrandingConfig } from '@/types/partyPlanning';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Copy,
  Loader2,
  Building2,
  Palette,
  DollarSign,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const defaultBrandingConfig: VRPartnerBrandingConfig = {
  primary_color: '#6366f1',
  secondary_color: '#ec4899',
  font_family: 'Inter',
  tagline: 'Plan Your Perfect Party',
  logo_position: 'left',
};

export function PartnerManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<VRPartner | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const { data: partners, isLoading } = useVRPartners({
    activeOnly: !showInactive,
    includeDemo: true,
  });

  const createMutation = useCreateVRPartner();
  const updateMutation = useUpdateVRPartner();
  const deleteMutation = useDeleteVRPartner();

  const handleCopyUrl = (slug: string) => {
    const url = `${window.location.origin}/partner/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const handleOpenStorefront = (slug: string) => {
    window.open(`/partner/${slug}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">VR Partner Management</h2>
          <p className="text-gray-500">Manage vacation rental partners and their storefronts</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="show-inactive"
              checked={showInactive}
              onCheckedChange={setShowInactive}
            />
            <Label htmlFor="show-inactive" className="text-sm">Show inactive</Label>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Partner
              </Button>
            </DialogTrigger>
            <PartnerDialog
              onClose={() => setIsCreateDialogOpen(false)}
              onSubmit={async (data) => {
                await createMutation.mutateAsync(data);
                setIsCreateDialogOpen(false);
              }}
              isLoading={createMutation.isPending}
            />
          </Dialog>
        </div>
      </div>

      {/* Partner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Partners',
            value: partners?.length || 0,
            icon: Building2,
            color: 'text-blue-600 bg-blue-100',
          },
          {
            label: 'Active Partners',
            value: partners?.filter(p => p.is_active && !p.is_demo).length || 0,
            icon: Globe,
            color: 'text-green-600 bg-green-100',
          },
          {
            label: 'Demo Storefronts',
            value: partners?.filter(p => p.is_demo).length || 0,
            icon: Palette,
            color: 'text-purple-600 bg-purple-100',
          },
          {
            label: 'MRR',
            value: `$${partners?.reduce((sum, p) => sum + (p.is_active && !p.is_demo ? p.subscription_amount : 0), 0) || 0}`,
            icon: DollarSign,
            color: 'text-amber-600 bg-amber-100',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Partners Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">Loading partners...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Slug / URL</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners?.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {partner.logo_url ? (
                        <img
                          src={partner.logo_url}
                          alt={partner.name}
                          className="w-10 h-10 rounded-lg object-contain bg-gray-50"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: partner.branding_config?.primary_color || '#6366f1' }}
                        >
                          {partner.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{partner.name}</div>
                        <div className="text-sm text-gray-500">{partner.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {partner.slug}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCopyUrl(partner.slug)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenStorefront(partner.slug)}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Badge variant="outline" className="capitalize">
                        {partner.subscription_tier}
                      </Badge>
                      <div className="text-sm text-gray-500 mt-1">
                        ${partner.subscription_amount}/mo
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {partner.is_demo && (
                        <Badge variant="secondary">Demo</Badge>
                      )}
                      <Badge
                        variant={partner.is_active ? 'default' : 'destructive'}
                      >
                        {partner.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Dialog
                        open={editingPartner?.id === partner.id}
                        onOpenChange={(open) => !open && setEditingPartner(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingPartner(partner)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <PartnerDialog
                          partner={partner}
                          onClose={() => setEditingPartner(null)}
                          onSubmit={async (data) => {
                            await updateMutation.mutateAsync({
                              id: partner.id,
                              updates: data,
                            });
                            setEditingPartner(null);
                          }}
                          isLoading={updateMutation.isPending}
                        />
                      </Dialog>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          if (confirm(`Are you sure you want to deactivate "${partner.name}"?`)) {
                            deleteMutation.mutate(partner.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {(!partners || partners.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No partners found. Click "Add Partner" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

// Partner Create/Edit Dialog
interface PartnerDialogProps {
  partner?: VRPartner;
  onClose: () => void;
  onSubmit: (data: VRPartnerInsert) => Promise<void>;
  isLoading: boolean;
}

function PartnerDialog({ partner, onClose, onSubmit, isLoading }: PartnerDialogProps) {
  const [formData, setFormData] = useState<VRPartnerInsert>({
    name: partner?.name || '',
    slug: partner?.slug || '',
    email: partner?.email || '',
    phone: partner?.phone || '',
    logo_url: partner?.logo_url || '',
    branding_config: partner?.branding_config || defaultBrandingConfig,
    commission_rate: partner?.commission_rate || 10,
    subscription_tier: partner?.subscription_tier || 'basic',
    subscription_amount: partner?.subscription_amount || 99,
    is_active: partner?.is_active ?? true,
    is_demo: partner?.is_demo ?? false,
  });

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: partner ? prev.slug : generateSlug(name),
    }));
  };

  const handleBrandingChange = (key: keyof VRPartnerBrandingConfig, value: string) => {
    setFormData(prev => ({
      ...prev,
      branding_config: {
        ...prev.branding_config!,
        [key]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{partner ? 'Edit Partner' : 'Add New Partner'}</DialogTitle>
        <DialogDescription>
          {partner ? 'Update partner details and branding' : 'Create a new VR partner storefront'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Basic Information</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Partner Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Austin Lux Properties"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="austin-lux-properties"
                required
              />
              <p className="text-xs text-gray-500">
                {`${window.location.origin}/partner/${formData.slug || 'your-slug'}`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contact@austinlux.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(512) 555-0100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              value={formData.logo_url || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>

        {/* Subscription */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Subscription</h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tier">Tier</Label>
              <Select
                value={formData.subscription_tier}
                onValueChange={(value: 'basic' | 'pro' | 'enterprise') =>
                  setFormData(prev => ({ ...prev, subscription_tier: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic ($99/mo)</SelectItem>
                  <SelectItem value="pro">Pro ($199/mo)</SelectItem>
                  <SelectItem value="enterprise">Enterprise ($299/mo)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Monthly Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.subscription_amount}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  subscription_amount: parseFloat(e.target.value) || 0,
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission">Commission Rate (%)</Label>
              <Input
                id="commission"
                type="number"
                value={formData.commission_rate}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  commission_rate: parseFloat(e.target.value) || 0,
                }))}
              />
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Branding</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={formData.branding_config?.primary_color || '#6366f1'}
                  onChange={(e) => handleBrandingChange('primary_color', e.target.value)}
                  className="w-14 h-10 p-1"
                />
                <Input
                  value={formData.branding_config?.primary_color || '#6366f1'}
                  onChange={(e) => handleBrandingChange('primary_color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary-color"
                  type="color"
                  value={formData.branding_config?.secondary_color || '#ec4899'}
                  onChange={(e) => handleBrandingChange('secondary_color', e.target.value)}
                  className="w-14 h-10 p-1"
                />
                <Input
                  value={formData.branding_config?.secondary_color || '#ec4899'}
                  onChange={(e) => handleBrandingChange('secondary_color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={formData.branding_config?.tagline || ''}
              onChange={(e) => handleBrandingChange('tagline', e.target.value)}
              placeholder="Plan Your Perfect Party"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="font-family">Font Family</Label>
            <Select
              value={formData.branding_config?.font_family || 'Inter'}
              onValueChange={(value) => handleBrandingChange('font_family', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter (Modern)</SelectItem>
                <SelectItem value="Playfair Display">Playfair Display (Elegant)</SelectItem>
                <SelectItem value="Poppins">Poppins (Friendly)</SelectItem>
                <SelectItem value="Montserrat">Montserrat (Clean)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Flags */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Status</h3>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="is-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is-active">Active</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is-demo"
                checked={formData.is_demo}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_demo: checked }))}
              />
              <Label htmlFor="is-demo">Demo Storefront</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              partner ? 'Update Partner' : 'Create Partner'
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default PartnerManagement;
