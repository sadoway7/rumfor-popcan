import React from 'react'
import { Modal } from '@/components/ui/Modal'
import { CommentList } from './CommentList'
import { useCommentsModalStore } from '@/features/comments/commentsModalStore'

export const CommentsModal: React.FC = () => {
  const { isOpen, marketId, marketName, closeComments } = useCommentsModalStore()

  if (!isOpen || !marketId) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end justify-center sm:items-center">
      <div 
        className="w-full max-w-xl h-full sm:max-h-[85vh] sm:rounded-lg sm:border sm:shadow-lg bg-white dark:bg-zinc-900 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{marketName || 'Comments'}</h2>
          <button 
            onClick={closeComments}
            className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-800/30 dark:to-zinc-800/50">
          <CommentList marketId={marketId} />
        </div>
      </div>
      <div className="absolute inset-0 -z-10 sm:hidden" onClick={closeComments} />
    </div>
  )
}

export default CommentsModal
