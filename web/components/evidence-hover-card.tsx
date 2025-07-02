"use client"

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  ExternalLink, 
  Calendar, 
  User, 
  Star, 
  FileText, 
  Download, 
  Eye,
  Quote,
  BookOpen,
  Link
} from "lucide-react"

interface EvidenceData {
  source_info: {
    title: string
    url: string
    author: string
    date: string
    credibility_score: number
    pdf_url?: string  // R2 cached PDF URL
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

interface EvidenceHoverCardProps {
  children: React.ReactNode
  evidenceData: EvidenceData
  className?: string
}

export function EvidenceHoverCard({ children, evidenceData, className }: EvidenceHoverCardProps) {
  const { source_info, evidence_paragraphs, citation, key_points } = evidenceData

  // Determine credibility color
  const getCredibilityColor = (score: number) => {
    if (score >= 0.8) return "bg-green-100 text-green-800"
    if (score >= 0.6) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getCredibilityText = (score: number) => {
    if (score >= 0.8) return "High Credibility"
    if (score >= 0.6) return "Medium Credibility"
    return "Low Credibility"
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className={`cursor-help underline decoration-dotted decoration-blue-500 ${className}`}>
          {children}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-96 p-0" side="top">
        <div className="space-y-3">
          {/* Header */}
          <div className="border-b p-4 pb-3">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-sm leading-tight line-clamp-2">
                {source_info.title}
              </h4>
              <Badge 
                variant="secondary" 
                className={`text-xs ${getCredibilityColor(source_info.credibility_score)}`}
              >
                <Star className="w-3 h-3 mr-1" />
                {getCredibilityText(source_info.credibility_score)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{source_info.author}</span>
              </div>
              {source_info.date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{source_info.date.substring(0, 4)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Key Points */}
          {key_points.length > 0 && (
            <div className="px-4">
              <h5 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">
                Key Evidence
              </h5>
              <ul className="space-y-1">
                {key_points.slice(0, 2).map((point, index) => (
                  <li key={index} className="text-xs leading-relaxed">
                    <span className="inline-block w-1 h-1 bg-blue-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Evidence Paragraphs */}
          {evidence_paragraphs.length > 0 && (
            <div className="px-4">
              <h5 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">
                Supporting Evidence
              </h5>
              <div className="max-h-32 overflow-y-auto">
                {evidence_paragraphs.slice(0, 1).map((paragraph, index) => (
                  <div key={index} className="mb-2">
                    <p className="text-xs leading-relaxed text-muted-foreground line-clamp-4">
                      "{paragraph.text.substring(0, 200)}..."
                    </p>
                    {paragraph.key_phrases.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {paragraph.key_phrases.map((phrase, phraseIndex) => (
                          <Badge key={phraseIndex} variant="outline" className="text-xs px-1 py-0">
                            {phrase}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t p-4 pt-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <a
                  href={source_info.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  View Source
                </a>
                
                {/* PDF Open Button */}
                {source_info.pdf_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => window.open(source_info.pdf_url, '_blank')}
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    PDF
                  </Button>
                )}
                
                {/* Quick Actions */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(citation);
                    // Could show a toast notification here
                  }}
                >
                  <Quote className="w-3 h-3 mr-1" />
                  Copy Citation
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {source_info.page_number && (
                  <span>p. {source_info.page_number}</span>
                )}
                <span>
                  Relevance: {Math.round((evidence_paragraphs[0]?.relevance_score || 0) * 100)}%
                </span>
              </div>
            </div>
            
            <Separator className="mb-3" />
            
            {/* Enhanced Citation */}
            <div className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <BookOpen className="w-3 h-3" />
                  Citation
                </div>
                {source_info.document_type && (
                  <Badge variant="outline" className="text-xs">
                    {source_info.document_type}
                  </Badge>
                )}
              </div>
              <div className="font-mono text-xs leading-relaxed break-all text-slate-700 dark:text-slate-300">
                {citation}
              </div>
            </div>
            
            {/* Quick Copy Link */}
            <div className="mt-2 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  const evidenceText = evidence_paragraphs[0]?.text || '';
                  navigator.clipboard.writeText(`"${evidenceText}" (${citation})`);
                }}
              >
                <Link className="w-3 h-3 mr-1" />
                Copy Evidence
              </Button>
              
              <div className="text-xs text-muted-foreground">
                Click to interact
              </div>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}