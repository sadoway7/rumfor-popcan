import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera, X, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { VendorCard } from '@/components/VendorCard'
import { CityAutocomplete } from '@/components/ui/CityAutocomplete'
import { Select } from '@/components/ui/Select'
import { useAuthStore } from '@/features/auth/authStore'
import { useUpdateVendorProfileMutation } from '@/features/vendor/hooks/useVendors'
import { compressAndResizeImage } from '@/utils/imageUtils'
import type { VendorCardData } from '@/types'

const PRODUCT_CATEGORIES = [
  'produce', 'baked-goods', 'crafts', 'jewelry', 'clothing', 'food-prepared',
  'beverages', 'home-goods', 'art', 'plants', 'honey', 'preserves',
  'dairy', 'meat', 'seafood', 'soap', 'candles', 'pottery', 'woodwork', 'textiles',
  'flowers', 'coffee', 'wine', 'spirits', 'pet-supplies', 'books', 'music',
  'photography', 'leather-goods', 'glassware', 'metalwork', 'paper-goods', 'toys',
  'vintage', 'antiques',
]

const MAX_CATEGORIES = 5
const MAX_GALLERY_IMAGES = 3

const CARD_COLORS = [
  'bg-surface border border-surface-3',
  'bg-surface-2',
  'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
  'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
  'bg-gradient-to-br from-amber-500/20 to-orange-500/20',
  'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
  'bg-gradient-to-br from-red-500/20 to-rose-500/20',
  'bg-gradient-to-br from-yellow-500/20 to-amber-500/20',
  'bg-gradient-to-br from-indigo-500/20 to-violet-500/20',
  'bg-gradient-to-br from-teal-500/20 to-green-500/20',
  'bg-gradient-to-br from-slate-400/20 to-zinc-500/20',
  'bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20',
]

const PROVINCES_AND_STATES = [
  { label: 'Alberta', value: 'AB' },
  { label: 'British Columbia', value: 'BC' },
  { label: 'Manitoba', value: 'MB' },
  { label: 'New Brunswick', value: 'NB' },
  { label: 'Newfoundland and Labrador', value: 'NL' },
  { label: 'Northwest Territories', value: 'NT' },
  { label: 'Nova Scotia', value: 'NS' },
  { label: 'Nunavut', value: 'NU' },
  { label: 'Ontario', value: 'ON' },
  { label: 'Prince Edward Island', value: 'PE' },
  { label: 'Quebec', value: 'QC' },
  { label: 'Saskatchewan', value: 'SK' },
  { label: 'Yukon', value: 'YT' },
  { label: 'Alabama', value: 'AL' },
  { label: 'Alaska', value: 'AK' },
  { label: 'Arizona', value: 'AZ' },
  { label: 'Arkansas', value: 'AR' },
  { label: 'California', value: 'CA' },
  { label: 'Colorado', value: 'CO' },
  { label: 'Connecticut', value: 'CT' },
  { label: 'Delaware', value: 'DE' },
  { label: 'Florida', value: 'FL' },
  { label: 'Georgia', value: 'GA' },
  { label: 'Hawaii', value: 'HI' },
  { label: 'Idaho', value: 'ID' },
  { label: 'Illinois', value: 'IL' },
  { label: 'Indiana', value: 'IN' },
  { label: 'Iowa', value: 'IA' },
  { label: 'Kansas', value: 'KS' },
  { label: 'Kentucky', value: 'KY' },
  { label: 'Louisiana', value: 'LA' },
  { label: 'Maine', value: 'ME' },
  { label: 'Maryland', value: 'MD' },
  { label: 'Massachusetts', value: 'MA' },
  { label: 'Michigan', value: 'MI' },
  { label: 'Minnesota', value: 'MN' },
  { label: 'Mississippi', value: 'MS' },
  { label: 'Missouri', value: 'MO' },
  { label: 'Montana', value: 'MT' },
  { label: 'Nebraska', value: 'NE' },
  { label: 'Nevada', value: 'NV' },
  { label: 'New Hampshire', value: 'NH' },
  { label: 'New Jersey', value: 'NJ' },
  { label: 'New Mexico', value: 'NM' },
  { label: 'New York', value: 'NY' },
  { label: 'North Carolina', value: 'NC' },
  { label: 'North Dakota', value: 'ND' },
  { label: 'Ohio', value: 'OH' },
  { label: 'Oklahoma', value: 'OK' },
  { label: 'Oregon', value: 'OR' },
  { label: 'Pennsylvania', value: 'PA' },
  { label: 'Rhode Island', value: 'RI' },
  { label: 'South Carolina', value: 'SC' },
  { label: 'South Dakota', value: 'SD' },
  { label: 'Tennessee', value: 'TN' },
  { label: 'Texas', value: 'TX' },
  { label: 'Utah', value: 'UT' },
  { label: 'Vermont', value: 'VT' },
  { label: 'Virginia', value: 'VA' },
  { label: 'Washington', value: 'WA' },
  { label: 'West Virginia', value: 'WV' },
  { label: 'Wisconsin', value: 'WI' },
  { label: 'Wyoming', value: 'WY' },
]

const profileSchema = z.object({
  businessName: z.string().max(100).optional().or(z.literal('')),
  tagline: z.string().max(100).optional().or(z.literal('')),
  blurb: z.string().max(500).optional().or(z.literal('')),
  bio: z.string().max(500).optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  instagram: z.string().optional().or(z.literal('')),
  facebook: z.string().optional().or(z.literal('')),
  tiktok: z.string().optional().or(z.literal('')),
  publicPhone: z.string().optional().or(z.literal('')),
  etsy: z.string().url('Invalid URL').optional().or(z.literal('')),
  shoppingLink: z.string().url('Invalid URL').optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
})

type FormData = z.infer<typeof profileSchema>

export const VendorProfileEditPage: React.FC = () => {
  const { user, updateUser } = useAuthStore()
  const updateMutation = useUpdateVendorProfileMutation()
  const [categories, setCategories] = useState<string[]>([])
  const [cardColor, setCardColor] = useState<string | null>(null)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      businessName: user?.businessName || '',
      tagline: user?.vendorProfile?.tagline || '',
      blurb: user?.vendorProfile?.blurb || '',
      bio: user?.bio || '',
      website: user?.vendorProfile?.website || '',
      instagram: user?.vendorProfile?.instagram || '',
      facebook: user?.vendorProfile?.facebook || '',
      tiktok: user?.vendorProfile?.tiktok || '',
      publicPhone: user?.vendorProfile?.publicPhone || '',
      etsy: user?.vendorProfile?.etsy || '',
      shoppingLink: user?.vendorProfile?.shoppingLink || '',
      city: user?.vendorProfile?.city || '',
      state: user?.vendorProfile?.state || '',
    },
  })

  useEffect(() => {
    if (user) {
      setCategories(user.vendorProfile?.productCategories || [])
      setCardColor(user.vendorProfile?.cardColor || null)
      setGalleryImages(user.vendorProfile?.galleryImages || [])
      reset({
        businessName: user.businessName || '',
        tagline: user.vendorProfile?.tagline || '',
        blurb: user.vendorProfile?.blurb || '',
        bio: user.bio || '',
        website: user.vendorProfile?.website || '',
        instagram: user.vendorProfile?.instagram || '',
        facebook: user.vendorProfile?.facebook || '',
        tiktok: user.vendorProfile?.tiktok || '',
        publicPhone: user.vendorProfile?.publicPhone || '',
        etsy: user.vendorProfile?.etsy || '',
        shoppingLink: user.vendorProfile?.shoppingLink || '',
        city: user.vendorProfile?.city || '',
        state: user.vendorProfile?.state || '',
      })
    }
  }, [user, reset])

  const watched = watch()
  const profileImage = user?.vendorProfile?.profileImage || user?.profileImage || ''

  const previewData: VendorCardData = {
    id: user?.id || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    businessName: watched.businessName || '',
    tagline: watched.tagline || '',
    blurb: watched.blurb || '',
    cardColor: cardColor,
    profileImage: profileImage,
    productCategories: categories,
  }

  const uploadPhoto = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    try {
      const dataUrl = await compressAndResizeImage(file, { maxWidth: 500, maxHeight: 500, quality: 0.8 })
      await updateMutation.mutateAsync({ id: user.id, data: { profileImage: dataUrl } })
      updateUser({ vendorProfile: { ...user.vendorProfile, profileImage: dataUrl } })
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }, [user, updateMutation, updateUser])

  const removePhoto = useCallback(async () => {
    if (!user) return
    try {
      await updateMutation.mutateAsync({ id: user.id, data: { profileImage: '' } })
      updateUser({ vendorProfile: { ...user.vendorProfile, profileImage: undefined } })
    } catch (err) {
      console.error('Remove failed:', err)
    }
  }, [user, updateMutation, updateUser])

  const uploadGalleryImage = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user || galleryImages.length >= MAX_GALLERY_IMAGES) return
    try {
      const dataUrl = await compressAndResizeImage(file, { maxWidth: 800, maxHeight: 600, quality: 0.8 })
      const newImages = [...galleryImages, dataUrl]
      console.log('Uploading gallery image, new array:', newImages)
      await updateMutation.mutateAsync({ id: user.id, data: { galleryImages: newImages } })
      setGalleryImages(newImages)
      updateUser({ vendorProfile: { ...user.vendorProfile, galleryImages: newImages } })
    } catch (err) {
      console.error('Gallery upload failed:', err)
    }
  }, [user, updateMutation, updateUser, galleryImages])

  const removeGalleryImage = useCallback(async (index: number) => {
    if (!user) return
    try {
      const newImages = galleryImages.filter((_, i) => i !== index)
      await updateMutation.mutateAsync({ id: user.id, data: { galleryImages: newImages } })
      setGalleryImages(newImages)
      updateUser({ vendorProfile: { ...user.vendorProfile, galleryImages: newImages } })
    } catch (err) {
      console.error('Remove gallery image failed:', err)
    }
  }, [user, updateMutation, updateUser, galleryImages])

  const toggleCategory = (cat: string) => {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }

  const onSubmit = async (data: FormData) => {
    if (!user) return
    try {
      await updateMutation.mutateAsync({
        id: user.id,
        data: {
          businessName: data.businessName || undefined,
          bio: data.bio || undefined,
          tagline: data.tagline || undefined,
          blurb: data.blurb || undefined,
          website: data.website || undefined,
          productCategories: categories,
          cardColor: cardColor,
          instagram: data.instagram || undefined,
          facebook: data.facebook || undefined,
          tiktok: data.tiktok || undefined,
          publicPhone: data.publicPhone || undefined,
          galleryImages: galleryImages,
          etsy: data.etsy || undefined,
          shoppingLink: data.shoppingLink || undefined,
          city: data.city || undefined,
          state: data.state || undefined,
        },
      })
      updateUser({
        businessName: data.businessName || undefined,
        bio: data.bio || undefined,
        vendorProfile: {
          ...user.vendorProfile,
          tagline: data.tagline || undefined,
          blurb: data.blurb || undefined,
          website: data.website || undefined,
          productCategories: categories,
          cardColor: cardColor,
          instagram: data.instagram || undefined,
          facebook: data.facebook || undefined,
          tiktok: data.tiktok || undefined,
          publicPhone: data.publicPhone || undefined,
          galleryImages: galleryImages,
          etsy: data.etsy || undefined,
          shoppingLink: data.shoppingLink || undefined,
          city: data.city || undefined,
          state: data.state || undefined,
        },
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {}
  }

  if (!user) {
    return <div className="flex items-center justify-center py-20"><Spinner className="h-8 w-8" /></div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
      {/* Card Preview */}
      <section className="mb-6">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Vendor Card Preview</h2>
        <VendorCard vendor={previewData} showLink={false} />
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Photo & Card Color */}
        <section>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Photo & Card</h2>
          <Card padding="none">
            <CardContent className="divide-y divide-surface-3 px-4">
              <div className="py-4">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="relative group flex-shrink-0 mx-auto sm:mx-0">
                    <div className="w-64 h-40 rounded-xl overflow-hidden bg-surface-2">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center cursor-pointer rounded-xl group/badge">
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1 opacity-80 group-hover/badge:opacity-100 transition-opacity">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Change photo</span>
                      </div>
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadPhoto} />
                    </label>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-base font-medium text-foreground">
                      {watched.businessName || `${user.firstName} ${user.lastName}`}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
                    <div className="flex flex-wrap gap-2">
                      <label className="cursor-pointer">
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadPhoto} />
                        <Button type="button" variant="outline" size="sm" disabled={updateMutation.isPending}>
                          {updateMutation.isPending ? 'Uploading...' : 'Upload new'}
                        </Button>
                      </label>
                      {profileImage && (
                        <Button type="button" variant="ghost" size="sm" onClick={removePhoto} className="text-destructive hover:text-destructive">
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="py-3">
                <p className="text-sm font-medium text-foreground mb-2">Card color</p>
                <div className="flex flex-wrap gap-2">
                  {CARD_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCardColor(cardColor === color ? null : color)}
                      className={`w-8 h-8 rounded-lg ${color} transition-all ${
                        cardColor === color ? 'ring-2 ring-accent ring-offset-2' : 'hover:opacity-80'
                      }`}
                    />
                  ))}
                </div>
                {cardColor && (
                  <button type="button" onClick={() => setCardColor(null)} className="text-xs text-muted-foreground hover:text-foreground mt-2 flex items-center gap-1">
                    <X className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Product Gallery */}
        <section>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Product Gallery</h2>
          <Card padding="none">
            <CardContent className="px-4 py-3">
              <p className="text-xs text-muted-foreground mb-3">Add up to {MAX_GALLERY_IMAGES} photos of your products or setup</p>
              <div className="flex flex-wrap gap-3">
                {galleryImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-surface-2">
                      <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {galleryImages.length < MAX_GALLERY_IMAGES && (
                  <label className="cursor-pointer">
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadGalleryImage} />
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-surface-3 flex flex-col items-center justify-center text-muted-foreground hover:border-accent hover:text-accent transition-colors">
                      <Plus className="w-6 h-6" />
                      <span className="text-xs mt-1">Add</span>
                    </div>
                  </label>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Info */}
        <section>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Info</h2>
          <Card padding="none">
            <CardContent className="divide-y divide-surface-3 px-4">
              <div className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">Business name</p>
                  <span className="text-xs text-muted-foreground">Vendor Card, Profile</span>
                </div>
                <Input {...register('businessName')} placeholder="Artisan Crafts Co." className="text-sm" />
                {errors.businessName && <p className="text-xs text-destructive mt-1">{errors.businessName.message}</p>}
              </div>
              <div className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">Tagline</p>
                  <span className="text-xs text-muted-foreground">Vendor Card, Profile</span>
                </div>
                <Input {...register('tagline')} placeholder="Handcrafted goods made with love" className="text-sm" />
              </div>
              <div className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">Short description</p>
                  <span className="text-xs text-muted-foreground">Vendor Card</span>
                </div>
                <textarea
                  {...register('blurb')}
                  placeholder="Brief description of what you sell..."
                  rows={2}
                  className="w-full px-3 py-2 bg-surface border border-gray-300 rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                />
              </div>
              <div className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">Bio</p>
                  <span className="text-xs text-muted-foreground">Profile</span>
                </div>
                <textarea
                  {...register('bio')}
                  placeholder="Tell your story..."
                  rows={3}
                  className="w-full px-3 py-2 bg-surface border border-gray-300 rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Location */}
        <section>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Location</h2>
          <Card padding="none">
            <CardContent className="divide-y divide-surface-3 px-4">
              <div className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">City</p>
                  <span className="text-xs text-muted-foreground">Profile</span>
                </div>
                <CityAutocomplete
                  value={watch('city') || ''}
                  onChange={(value) => {
                    const event = { target: { name: 'city', value } }
                    register('city').onChange(event)
                  }}
                  onStateChange={(state) => {
                    const event = { target: { name: 'state', value: state } }
                    register('state').onChange(event)
                  }}
                  placeholder="Enter your city"
                />
              </div>
              <div className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">Province/State</p>
                  <span className="text-xs text-muted-foreground">Profile</span>
                </div>
                <Select
                  value={watch('state') || ''}
                  onValueChange={(value) => {
                    const event = { target: { name: 'state', value } }
                    register('state').onChange(event)
                  }}
                  placeholder="Select province/state"
                  options={PROVINCES_AND_STATES}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact & Links */}
        <section>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Contact & Links</h2>
          <Card padding="none">
            <CardContent className="divide-y divide-surface-3 px-4">
              <div className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">Phone</p>
                  <span className="text-xs text-muted-foreground">Profile</span>
                </div>
                <Input {...register('publicPhone')} placeholder="(555) 123-4567" type="tel" className="text-sm" />
              </div>
              <div className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">Website</p>
                  <span className="text-xs text-muted-foreground">Profile</span>
                </div>
                <Input {...register('website')} placeholder="https://yoursite.com" type="url" className="text-sm" />
                {errors.website && <p className="text-xs text-destructive mt-1">{errors.website.message}</p>}
              </div>
              <div className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">Instagram</p>
                  <span className="text-xs text-muted-foreground">Profile</span>
                </div>
                <Input {...register('instagram')} placeholder="username" className="text-sm" />
              </div>
              <div className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">Facebook</p>
                  <span className="text-xs text-muted-foreground">Profile</span>
                </div>
                <Input {...register('facebook')} placeholder="username or page name" className="text-sm" />
              </div>
              <div className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">TikTok</p>
                  <span className="text-xs text-muted-foreground">Profile</span>
                </div>
                <Input {...register('tiktok')} placeholder="@username" className="text-sm" />
              </div>
              <div className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">Etsy Shop</p>
                  <span className="text-xs text-muted-foreground">Profile</span>
                </div>
                <Input {...register('etsy')} placeholder="https://etsy.com/shop/yourshop" type="url" className="text-sm" />
                {errors.etsy && <p className="text-xs text-destructive mt-1">{errors.etsy.message}</p>}
              </div>
              <div className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">Online Store</p>
                  <span className="text-xs text-muted-foreground">Profile</span>
                </div>
                <Input {...register('shoppingLink')} placeholder="https://shop.yoursite.com" type="url" className="text-sm" />
                {errors.shoppingLink && <p className="text-xs text-destructive mt-1">{errors.shoppingLink.message}</p>}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Categories */}
        <section>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Categories</h2>
          <Card padding="none">
            <CardContent className="px-4 py-3">
              <p className="text-xs text-muted-foreground mb-3">Select up to {MAX_CATEGORIES} categories</p>
              <div className="flex flex-wrap gap-2">
                {PRODUCT_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    disabled={categories.length >= MAX_CATEGORIES && !categories.includes(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      categories.includes(cat)
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-surface border border-surface-3 hover:bg-surface-2 text-foreground disabled:opacity-40'
                    }`}
                  >
                    {cat.replace(/-/g, ' ')}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-2">
          <Button type="submit" variant="primary" disabled={updateMutation.isPending} isLoading={updateMutation.isPending}>
            Save
          </Button>
          {saved && <span className="text-sm text-success font-medium">Saved!</span>}
          {updateMutation.isError && <span className="text-sm text-destructive">Failed</span>}
        </div>
      </form>
    </div>
  )
}

export default VendorProfileEditPage
