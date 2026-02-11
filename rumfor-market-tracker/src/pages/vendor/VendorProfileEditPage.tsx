import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Eye, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { VendorCard } from '@/components/VendorCard'
import { useAuthStore } from '@/features/auth/authStore'
import { useUpdateVendorProfileMutation, useUploadVendorAvatarMutation } from '@/features/vendor/hooks/useVendors'
import type { VendorCardData } from '@/types'

const PRODUCT_CATEGORY_OPTIONS = [
  'produce',
  'baked-goods',
  'crafts',
  'jewelry',
  'clothing',
  'food-prepared',
  'beverages',
  'home-goods',
  'art',
  'plants',
  'honey',
  'preserves',
  'dairy',
  'meat',
  'seafood',
  'soap',
  'candles',
  'pottery',
  'woodwork',
  'textiles',
]

const COLOR_OPTIONS = [
  { label: 'Purple Pink', value: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' },
  { label: 'Green', value: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20' },
  { label: 'Amber', value: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20' },
  { label: 'Blue', value: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20' },
  { label: 'Red', value: 'bg-gradient-to-br from-red-500/20 to-rose-500/20' },
  { label: 'Yellow', value: 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20' },
  { label: 'Indigo', value: 'bg-gradient-to-br from-indigo-500/20 to-violet-500/20' },
  { label: 'Teal', value: 'bg-gradient-to-br from-teal-500/20 to-green-500/20' },
]

const vendorProfileSchema = z.object({
  businessName: z.string().max(100, 'Max 100 characters').optional().or(z.literal('')),
  tagline: z.string().max(100, 'Max 100 characters').optional().or(z.literal('')),
  blurb: z.string().max(500, 'Max 500 characters').optional().or(z.literal('')),
  bio: z.string().max(500, 'Max 500 characters').optional().or(z.literal('')),
  website: z
    .string()
    .url('Must be a valid URL (include https://)')
    .optional()
    .or(z.literal('')),
})

type VendorProfileFormData = z.infer<typeof vendorProfileSchema>

export const VendorProfileEditPage: React.FC = () => {
  const { user, updateUser } = useAuthStore()
  const updateProfileMutation = useUpdateVendorProfileMutation()
  const uploadAvatarMutation = useUploadVendorAvatarMutation()

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<VendorProfileFormData>({
    resolver: zodResolver(vendorProfileSchema),
    defaultValues: {
      businessName: user?.businessName || '',
      tagline: user?.vendorProfile?.tagline || '',
      blurb: user?.vendorProfile?.blurb || '',
      bio: user?.bio || '',
      website: user?.vendorProfile?.website || '',
    },
  })

  // Initialize from user data
  useEffect(() => {
    if (user) {
      setSelectedCategories(user.vendorProfile?.productCategories || [])
      setSelectedColor(user.vendorProfile?.cardColor || null)
      reset({
        businessName: user.businessName || '',
        tagline: user.vendorProfile?.tagline || '',
        blurb: user.vendorProfile?.blurb || '',
        bio: user.bio || '',
        website: user.vendorProfile?.website || '',
      })
    }
  }, [user, reset])

  // Live preview data
  const watchedValues = watch()
  const previewData: VendorCardData = {
    id: user?.id || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    businessName: watchedValues.businessName || '',
    tagline: watchedValues.tagline || '',
    blurb: watchedValues.blurb || '',
    cardColor: selectedColor,
    profileImage: user?.vendorProfile?.profileImage || user?.profileImage || '',
    productCategories: selectedCategories,
  }

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  const handleAvatarUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !user) return

      try {
        await uploadAvatarMutation.mutateAsync({ id: user.id, file })
        // Refresh user data
        const { updateUser: storeUpdate } = useAuthStore.getState()
        storeUpdate({
          vendorProfile: {
            ...user.vendorProfile,
            profileImage: URL.createObjectURL(file),
          },
        })
      } catch (_err) {
        // Error handled by mutation
      }
    },
    [user, uploadAvatarMutation]
  )

  const onSubmit = async (data: VendorProfileFormData) => {
    if (!user) return

    try {
      await updateProfileMutation.mutateAsync({
        id: user.id,
        data: {
          businessName: data.businessName || undefined,
          bio: data.bio || undefined,
          tagline: data.tagline || undefined,
          blurb: data.blurb || undefined,
          website: data.website || undefined,
          productCategories: selectedCategories,
          cardColor: selectedColor,
        },
      })

      // Update local auth store
      updateUser({
        businessName: data.businessName || undefined,
        bio: data.bio || undefined,
        vendorProfile: {
          ...user.vendorProfile,
          tagline: data.tagline || undefined,
          blurb: data.blurb || undefined,
          website: data.website || undefined,
          productCategories: selectedCategories,
          cardColor: selectedColor,
        },
      })

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (_err) {
      // Error handled by mutation
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-2">Edit Vendor Profile</h1>
      <p className="text-muted-foreground mb-8">
        Customize how you appear to markets and other vendors
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Business Info */}
            <Card className="p-6">
              <h2 className="font-semibold text-foreground mb-4">Business Info</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Business Name
                  </label>
                  <Input
                    {...register('businessName')}
                    placeholder="e.g. Artisan Crafts Co."
                    maxLength={100}
                  />
                  {errors.businessName && (
                    <p className="text-sm text-red-500 mt-1">{errors.businessName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Tagline <span className="text-muted-foreground font-normal">(shown on your card)</span>
                  </label>
                  <Input
                    {...register('tagline')}
                    placeholder="e.g. Handcrafted goods made with love"
                    maxLength={100}
                  />
                  {errors.tagline && (
                    <p className="text-sm text-red-500 mt-1">{errors.tagline.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Short Description <span className="text-muted-foreground font-normal">(shown on your card)</span>
                  </label>
                  <textarea
                    {...register('blurb')}
                    placeholder="A brief description of what you sell..."
                    maxLength={500}
                    rows={3}
                    className="w-full px-3 py-2 bg-surface border border-surface-3 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                  />
                  {errors.blurb && (
                    <p className="text-sm text-red-500 mt-1">{errors.blurb.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Bio <span className="text-muted-foreground font-normal">(shown on your profile page)</span>
                  </label>
                  <textarea
                    {...register('bio')}
                    placeholder="Tell your story — how you got started, what drives you..."
                    maxLength={500}
                    rows={4}
                    className="w-full px-3 py-2 bg-surface border border-surface-3 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                  />
                  {errors.bio && (
                    <p className="text-sm text-red-500 mt-1">{errors.bio.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Website</label>
                  <Input
                    {...register('website')}
                    placeholder="https://yourwebsite.com"
                    type="url"
                  />
                  {errors.website && (
                    <p className="text-sm text-red-500 mt-1">{errors.website.message}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Product Categories */}
            <Card className="p-6">
              <h2 className="font-semibold text-foreground mb-4">Product Categories</h2>
              <p className="text-sm text-muted-foreground mb-3">
                Select the categories that describe what you sell (max 10)
              </p>
              <div className="flex flex-wrap gap-2">
                {PRODUCT_CATEGORY_OPTIONS.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryToggle(category)}
                    disabled={
                      selectedCategories.length >= 10 && !selectedCategories.includes(category)
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[36px] ${
                      selectedCategories.includes(category)
                        ? 'bg-amber-500 text-white'
                        : 'bg-surface hover:bg-surface-2 text-foreground border border-surface-3 disabled:opacity-40'
                    }`}
                  >
                    {category.replace(/-/g, ' ')}
                  </button>
                ))}
              </div>
            </Card>

            {/* Appearance */}
            <Card className="p-6">
              <h2 className="font-semibold text-foreground mb-4">Appearance</h2>

              {/* Profile Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Profile Image
                </label>
                <div className="flex items-center gap-4">
                  {previewData.profileImage ? (
                    <img
                      src={previewData.profileImage}
                      alt="Profile"
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-surface-2 flex items-center justify-center text-muted-foreground text-xl font-bold">
                      {previewData.firstName[0]}
                      {previewData.lastName[0]}
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                    <span className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-surface border border-surface-3 rounded-lg hover:bg-surface-2 transition-colors">
                      <Upload className="w-4 h-4" />
                      {uploadAvatarMutation.isPending ? 'Uploading...' : 'Upload Image'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Card Color */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Card Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setSelectedColor(selectedColor === option.value ? null : option.value)
                      }
                      className={`h-12 rounded-lg ${option.value} border-2 transition-all ${
                        selectedColor === option.value
                          ? 'border-amber-500 ring-2 ring-amber-500/30'
                          : 'border-surface-3 hover:border-surface-2'
                      }`}
                      title={option.label}
                    />
                  ))}
                </div>
                {selectedColor && (
                  <button
                    type="button"
                    onClick={() => setSelectedColor(null)}
                    className="text-xs text-muted-foreground hover:text-foreground mt-2 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Reset to default
                  </button>
                )}
              </div>
            </Card>

            {/* Submit */}
            <div className="flex items-center gap-4">
              <Button
                type="submit"
                variant="primary"
                disabled={updateProfileMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
              </Button>
              {saveSuccess && (
                <span className="text-sm text-green-500 font-medium">Profile saved successfully!</span>
              )}
              {updateProfileMutation.isError && (
                <span className="text-sm text-red-500">Failed to save. Please try again.</span>
              )}
            </div>
          </form>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
              <Eye className="w-4 h-4" /> Card Preview
            </h3>
            <VendorCard vendor={previewData} showLink={false} />

            {selectedCategories.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">Categories</p>
                <div className="flex flex-wrap gap-1">
                  {selectedCategories.map((cat) => (
                    <Badge key={cat} variant="muted" className="text-xs">
                      {cat.replace(/-/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorProfileEditPage
