import { create } from 'zustand'

interface CommentsModalState {
  isOpen: boolean
  marketId: string | null
  marketName: string | null
  openComments: (marketId: string, marketName: string) => void
  closeComments: () => void
}

export const useCommentsModalStore = create<CommentsModalState>((set) => ({
  isOpen: false,
  marketId: null,
  marketName: null,
  openComments: (marketId, marketName) => set({ isOpen: true, marketId, marketName }),
  closeComments: () => set({ isOpen: false, marketId: null, marketName: null }),
}))
