import React from 'react'
import { Comment } from '@/types'

interface CommentTreeLinesProps {
  comments: Comment[]
  containerRef: React.RefObject<HTMLElement | null>
}

export const CommentTreeLines: React.FC<CommentTreeLinesProps> = ({ comments, containerRef }) => {
  // Simplified: We don't need SVG lines anymore
  // The vertical guide lines are handled via CSS in CommentItem
  return null
}

export default CommentTreeLines
