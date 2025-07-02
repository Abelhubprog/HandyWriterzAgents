"use client"

import React from 'react'
import { EvidenceHoverCard } from './evidence-hover-card'

interface EvidenceMap {
  [sourceId: string]: {
    source_info: {
      title: string
      url: string
      author: string
      date: string
      credibility_score: number
      pdf_url?: string
      document_type?: string
      page_number?: number
    }
    evidence_paragraphs: Array<{
      text: string
      position: number
      relevance_score: number
      key_phrases: string[]
    }>
    citation: string
    key_points: string[]
  }
}

interface EvidenceRendererProps {
  content: string
  evidenceMap: EvidenceMap
  className?: string
}

export function EvidenceRenderer({ content, evidenceMap, className }: EvidenceRendererProps) {
  // Parse content and inject hover cards for citations
  const renderContentWithEvidence = (text: string) => {
    // Pattern to match citations in various formats
    const citationPatterns = [
      // Harvard: (Author, Year)
      /\(([^,]+,\s*\d{4}[a-z]?)\)/g,
      // APA: (Author Year)
      /\(([^,)]+\s+\d{4}[a-z]?)\)/g,
      // Numbered citations: [1], [2], etc.
      /\[(\d+)\]/g,
      // Evidence markers: {source_0}, {source_1}, etc.
      /\{(source_\d+)\}/g
    ]

    let processedText = text
    let matches: { start: number; end: number; sourceId: string; text: string }[] = []

    // Find all citation matches
    citationPatterns.forEach((pattern, patternIndex) => {
      let match
      while ((match = pattern.exec(text)) !== null) {
        const fullMatch = match[0]
        const citationContent = match[1]
        
        // Try to map citation to evidence source
        let sourceId: string | null = null
        
        if (patternIndex === 3) {
          // Direct source reference {source_0}
          sourceId = citationContent
        } else if (patternIndex === 2) {
          // Numbered citation [1] -> source_0
          const sourceIndex = parseInt(citationContent) - 1
          sourceId = `source_${sourceIndex}`
        } else {
          // Author-date citations - match by author name
          sourceId = findSourceByAuthor(citationContent, evidenceMap)
        }

        if (sourceId && evidenceMap[sourceId]) {
          matches.push({
            start: match.index,
            end: match.index + fullMatch.length,
            sourceId,
            text: fullMatch
          })
        }
      }
    })

    // Sort matches by position (descending) to process from end to start
    matches.sort((a, b) => b.start - a.start)

    // Split text into parts and inject hover cards
    const parts: React.ReactNode[] = []
    let lastIndex = processedText.length

    matches.forEach((match, index) => {
      // Add text after this match
      if (lastIndex > match.end) {
        parts.unshift(processedText.substring(match.end, lastIndex))
      }

      // Add hover card for the citation
      parts.unshift(
        <EvidenceHoverCard
          key={`evidence-${match.sourceId}-${index}`}
          evidenceData={evidenceMap[match.sourceId]}
        >
          {match.text}
        </EvidenceHoverCard>
      )

      lastIndex = match.start
    })

    // Add remaining text at the beginning
    if (lastIndex > 0) {
      parts.unshift(processedText.substring(0, lastIndex))
    }

    return parts.length > 0 ? parts : [text]
  }

  return (
    <div className={className}>
      {renderContentWithEvidence(content)}
    </div>
  )
}

// Helper function to find source by author name in citation
function findSourceByAuthor(citationText: string, evidenceMap: EvidenceMap): string | null {
  const authorName = citationText.split(',')[0]?.split(' ')[0]?.trim().toLowerCase()
  
  if (!authorName) return null

  for (const [sourceId, evidence] of Object.entries(evidenceMap)) {
    const sourceAuthor = evidence.source_info.author.toLowerCase()
    if (sourceAuthor.includes(authorName) || authorName.includes(sourceAuthor.split(' ')[0])) {
      return sourceId
    }
  }

  return null
}

// Alternative component for inline evidence highlighting
interface InlineEvidenceProps {
  children: React.ReactNode
  sourceId: string
  evidenceMap: EvidenceMap
  variant?: 'subtle' | 'highlighted' | 'academic'
}

export function InlineEvidence({ 
  children, 
  sourceId, 
  evidenceMap, 
  variant = 'subtle' 
}: InlineEvidenceProps) {
  const evidenceData = evidenceMap[sourceId]
  
  if (!evidenceData) {
    return <>{children}</>
  }

  const variantStyles = {
    subtle: "bg-blue-50 dark:bg-blue-950/20 border-b border-blue-200 dark:border-blue-800",
    highlighted: "bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded px-1",
    academic: "border-b-2 border-dotted border-blue-400 dark:border-blue-500"
  }

  return (
    <EvidenceHoverCard evidenceData={evidenceData}>
      <span className={`${variantStyles[variant]} cursor-help transition-colors hover:bg-opacity-80`}>
        {children}
      </span>
    </EvidenceHoverCard>
  )
}