import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Camera, X, Plus, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { VendorCard } from '@/components/VendorCard'
import { CityAutocomplete } from '@/components/ui/CityAutocomplete'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
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
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()
  const updateMutation = useUpdateVendorProfileMutation()
  const [categories, setCategories] = useState<string[]>([])
  const [cardColor, setCardColor] = useState<string | null>(null)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [saved, setSaved] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false)
  const [deletingGalleryIndex, setDeletingGalleryIndex] = useState<number | null>(null)

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
    setIsUploadingAvatar(true)
    try {
      const dataUrl = await compressAndResizeImage(file, { maxWidth: 500, maxHeight: 500, quality: 0.8 })
      await updateMutation.mutateAsync({ id: user.id, data: { profileImage: dataUrl } })
      updateUser({ vendorProfile: { ...user.vendorProfile, profileImage: dataUrl } })
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setIsUploadingAvatar(false)
    }
  }, [user, updateMutation, updateUser])

  const removePhoto = useCallback(async () => {
    if (!user) return
    setIsDeletingAvatar(true)
    try {
      await updateMutation.mutateAsync({ id: user.id, data: { profileImage: '' } })
      updateUser({ vendorProfile: { ...user.vendorProfile, profileImage: undefined } })
    } catch (err) {
      console.error('Remove failed:', err)
    } finally {
      setIsDeletingAvatar(false)
    }
  }, [user, updateMutation, updateUser])

  const uploadGalleryImage = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user || galleryImages.length >= MAX_GALLERY_IMAGES) return
    setIsUploadingGallery(true)
    try {
      const dataUrl = await compressAndResizeImage(file, { maxWidth: 800, maxHeight: 600, quality: 0.8 })
      const newImages = [...galleryImages, dataUrl]
      console.log('Uploading gallery image, new array:', newImages)
      await updateMutation.mutateAsync({ id: user.id, data: { galleryImages: newImages } })
      setGalleryImages(newImages)
      updateUser({ vendorProfile: { ...user.vendorProfile, galleryImages: newImages } })
    } catch (err) {
      console.error('Gallery upload failed:', err)
    } finally {
      setIsUploadingGallery(false)
    }
  }, [user, updateMutation, updateUser, galleryImages])

  const removeGalleryImage = useCallback(async (index: number) => {
    if (!user) return
    setDeletingGalleryIndex(index)
    try {
      const newImages = galleryImages.filter((_, i) => i !== index)
      await updateMutation.mutateAsync({ id: user.id, data: { galleryImages: newImages } })
      setGalleryImages(newImages)
      updateUser({ vendorProfile: { ...user.vendorProfile, galleryImages: newImages } })
    } catch (err) {
      console.error('Remove gallery image failed:', err)
    } finally {
      setDeletingGalleryIndex(null)
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
    <div className="space-y-3 animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex items-center gap-3 py-2 px-3 sm:px-0">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="p-2 h-10 w-10 shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <span className="text-base font-bold text-foreground">Edit Profile</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:px-0">
        <div className="flex gap-3 sm:justify-center">
          <Card className="px-3 py-3 sm:px-4 sm:mx-0 -mx-3 rounded-xl sm:rounded-lg border-0 sm:border-0 shadow-none sm:bg-transparent flex-shrink-0 w-36 sm:w-[480px]">
            <div className="text-xs text-muted-foreground mb-2 text-center">Avatar/Banner</div>
            <div className="relative group w-full aspect-square sm:aspect-[2/1] mx-auto">
              <div className="w-full h-full rounded-xl overflow-hidden bg-surface-2">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-foreground">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                )}
              </div>
              {(isUploadingAvatar || isDeletingAvatar) && (
                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                  <Spinner className="w-8 h-8 text-white" />
                </div>
              )}
              {!isUploadingAvatar && !isDeletingAvatar && (
                <label className="absolute inset-0 flex items-center justify-center cursor-pointer rounded-xl group/badge">
                  <div className="absolute bottom-1 right-1 bg-black/60 text-white p-1 rounded opacity-80 group-hover/badge:opacity-100 transition-opacity">
                    <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadPhoto} />
                </label>
              )}
              {profileImage && !isUploadingAvatar && !isDeletingAvatar && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </Card>

          <Card className="px-3 py-3 sm:px-4 flex-1 sm:flex-initial sm:w-96 -mx-3 sm:mx-0 rounded-xl sm:rounded-lg border-0 sm:border-0 shadow-none sm:bg-transparent">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Product Gallery</span>
              <span className="text-xs text-muted-foreground">{galleryImages.length}/{MAX_GALLERY_IMAGES}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {galleryImages.map((img, index) => (
                <div key={index} className="relative group aspect-square">
                  <div className="w-full h-full rounded-lg overflow-hidden bg-surface-2">
                    <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                  {deletingGalleryIndex === index && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <Spinner className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {deletingGalleryIndex !== index && (
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              {isUploadingGallery && (
                <div className="aspect-square rounded-lg bg-surface-2 flex items-center justify-center">
                  <Spinner className="w-5 h-5" />
                </div>
              )}
              {galleryImages.length < MAX_GALLERY_IMAGES && !isUploadingGallery && (
                <label className="cursor-pointer aspect-square">
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadGalleryImage} />
                  <div className="w-full h-full rounded-lg border-2 border-dashed border-surface-3 flex flex-col items-center justify-center text-muted-foreground hover:border-accent hover:text-accent transition-colors">
                    <Plus className="w-5 h-5" />
                  </div>
                </label>
              )}
            </div>
          </Card>
        </div>

        <Card className="px-3 py-4 space-y-4 sm:mx-0 -mx-3 rounded-xl sm:rounded-lg border-0 sm:border shadow-none sm:shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input {...register('businessName')} placeholder="Business Name" className="text-base font-semibold placeholder:text-muted-foreground/70" />
            <Input {...register('tagline')} placeholder="Tagline" className="text-base font-semibold placeholder:text-muted-foreground/70" />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-foreground">Short Description</label>
            <Textarea {...register('blurb')} placeholder="Brief description of what you sell..." rows={2} className="text-base font-semibold placeholder:text-muted-foreground/70" />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-foreground">Full Bio</label>
            <Textarea {...register('bio')} placeholder="Tell your story..." rows={3} className="text-base font-semibold placeholder:text-muted-foreground/70" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
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
              placeholder="City"
            />
            <Select
              value={watch('state') || ''}
              onValueChange={(value) => {
                const event = { target: { name: 'state', value } }
                register('state').onChange(event)
              }}
              placeholder="Province/State"
              options={PROVINCES_AND_STATES}
            />
          </div>
        </Card>

        <Card className="px-3 py-4 space-y-4 sm:mx-0 -mx-3 rounded-xl sm:rounded-lg border-0 sm:border shadow-none sm:shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input {...register('publicPhone')} placeholder="Phone" type="tel" className="text-base font-semibold placeholder:text-muted-foreground/70" />
            <Input {...register('website')} placeholder="Website" type="url" className="text-base font-semibold placeholder:text-muted-foreground/70" />
            <Input {...register('instagram')} placeholder="Instagram" className="text-base font-semibold placeholder:text-muted-foreground/70" />
            <Input {...register('facebook')} placeholder="Facebook" className="text-base font-semibold placeholder:text-muted-foreground/70" />
            <Input {...register('tiktok')} placeholder="TikTok" className="text-base font-semibold placeholder:text-muted-foreground/70" />
            <Input {...register('etsy')} placeholder="Etsy Shop URL" type="url" className="text-base font-semibold placeholder:text-muted-foreground/70" />
            <Input {...register('shoppingLink')} placeholder="Online Store URL" type="url" className="text-base font-semibold placeholder:text-muted-foreground/70 sm:col-span-2" />
          </div>
          {(errors.website || errors.etsy || errors.shoppingLink) && (
            <p className="text-red-500 text-xs">Please enter a valid URL</p>
          )}
        </Card>

        <Card className="px-3 py-4 space-y-4 sm:mx-0 -mx-3 rounded-xl sm:rounded-lg border-0 sm:border shadow-none sm:shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground text-base">Categories</h3>
            <span className="text-xs text-muted-foreground">{categories.length}/{MAX_CATEGORIES}</span>
          </div>
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
                    : 'bg-white border border-border hover:bg-accent/10 text-foreground disabled:opacity-40'
                }`}
              >
                {cat.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </Card>

        <Card className="px-3 py-4 space-y-4 sm:mx-0 -mx-3 rounded-xl sm:rounded-lg border-0 sm:border shadow-none sm:shadow-sm">
          <h3 className="font-bold text-foreground text-base">Card Preview</h3>
          <VendorCard vendor={previewData} showLink={false} />
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
            <button type="button" onClick={() => setCardColor(null)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <X className="w-4 h-4" /> Reset
            </button>
          )}
        </Card>

        <div className="flex items-center gap-4 px-3 sm:px-0 pb-4">
          <Button type="submit" variant="primary" disabled={updateMutation.isPending} isLoading={updateMutation.isPending} className="flex-1 sm:flex-none sm:min-w-[120px]">
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
