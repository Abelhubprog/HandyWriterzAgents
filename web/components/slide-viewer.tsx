"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Presentation, 
  Image,
  FileText,
  BarChart3,
  ArrowRight,
  Eye,
  Share2
} from "lucide-react"

interface SlideData {
  slide_number: number
  type: string
  title: string
  subtitle?: string
  content?: string
  bullet_points?: string[]
  layout: string
  author?: string
}

interface InfographicData {
  title: string
  field: string
  statistics: Array<{
    value: string
    context: string
    section: string
  }>
  processes: Array<{
    title: string
    steps: string[]
  }>
  key_takeaways: string[][]
  visual_theme: string
  color_scheme: {
    primary: string
    secondary: string
    accent: string
  }
}

interface SlideViewerProps {
  slideData: SlideData[]
  infographicData: InfographicData
  onDownload?: (format: string, type: 'slides' | 'infographic') => void
  onShare?: () => void
}

export function SlideViewer({ 
  slideData, 
  infographicData, 
  onDownload,
  onShare 
}: SlideViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [viewMode, setViewMode] = useState<'slides' | 'infographic'>('slides')
  
  const nextSlide = () => {
    if (currentSlide < slideData.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }
  
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }
  
  const handleDownload = (format: string) => {
    if (onDownload) {
      onDownload(format, viewMode)
    }
  }

  const getSlideLayoutClass = (layout: string) => {
    const layouts = {
      title_slide: "text-center",
      content_with_bullets: "text-left",
      bullet_summary: "text-left",
      simple_content: "text-center"
    }
    return layouts[layout as keyof typeof layouts] || "text-left"
  }

  const renderSlideContent = (slide: SlideData) => {
    switch (slide.type) {
      case 'title':
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {slide.title}
            </h1>
            {slide.subtitle && (
              <h2 className="text-2xl text-gray-600 dark:text-gray-300">
                {slide.subtitle}
              </h2>
            )}
            {slide.author && (
              <p className="text-lg text-gray-500 dark:text-gray-400 mt-8">
                {slide.author}
              </p>
            )}
          </div>
        )
      
      case 'content':
        return (
          <div className="h-full p-8 flex flex-col">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              {slide.title}
            </h2>
            {slide.content && (
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                {slide.content}
              </p>
            )}
            {slide.bullet_points && slide.bullet_points.length > 0 && (
              <ul className="space-y-3 flex-1">
                {slide.bullet_points.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <ArrowRight className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      
      case 'summary':
      case 'conclusion':
        return (
          <div className="h-full p-8 flex flex-col">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white text-center">
              {slide.title}
            </h2>
            {slide.bullet_points && slide.bullet_points.length > 0 && (
              <ul className="space-y-4 flex-1">
                {slide.bullet_points.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-4 flex-shrink-0 text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {slide.content && (
              <p className="text-xl text-gray-700 dark:text-gray-300 text-center mt-8">
                {slide.content}
              </p>
            )}
          </div>
        )
      
      default:
        return (
          <div className="h-full p-8 flex items-center justify-center">
            <p className="text-xl text-gray-500">Unknown slide type</p>
          </div>
        )
    }
  }

  const renderInfographic = () => {
    return (
      <div className="h-full overflow-y-auto">
        <div 
          className="min-h-full p-8 space-y-8"
          style={{ 
            background: `linear-gradient(135deg, ${infographicData.color_scheme.primary}15, ${infographicData.color_scheme.secondary}15)` 
          }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4" style={{ color: infographicData.color_scheme.primary }}>
              {infographicData.title}
            </h1>
            <Badge 
              variant="secondary" 
              className="text-lg px-4 py-2"
              style={{ 
                backgroundColor: infographicData.color_scheme.accent + '20',
                color: infographicData.color_scheme.primary 
              }}
            >
              {infographicData.field.toUpperCase()} RESEARCH
            </Badge>
          </div>

          {/* Statistics Section */}
          {infographicData.statistics.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2" style={{ color: infographicData.color_scheme.primary }} />
                Key Statistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {infographicData.statistics.map((stat, index) => (
                  <Card 
                    key={index} 
                    className="p-6 text-center border-2"
                    style={{ borderColor: infographicData.color_scheme.accent }}
                  >
                    <div 
                      className="text-3xl font-bold mb-2"
                      style={{ color: infographicData.color_scheme.primary }}
                    >
                      {stat.value}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.context}
                    </p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {stat.section}
                    </Badge>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Processes Section */}
          {infographicData.processes.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <ArrowRight className="w-6 h-6 mr-2" style={{ color: infographicData.color_scheme.primary }} />
                Key Processes
              </h2>
              {infographicData.processes.map((process, pIndex) => (
                <div key={pIndex} className="mb-8">
                  <h3 className="text-xl font-semibold mb-4" style={{ color: infographicData.color_scheme.primary }}>
                    {process.title}
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {process.steps.map((step, sIndex) => (
                      <React.Fragment key={sIndex}>
                        <div 
                          className="flex-1 min-w-[200px] p-4 rounded-lg border-2"
                          style={{ 
                            borderColor: infographicData.color_scheme.secondary,
                            backgroundColor: infographicData.color_scheme.secondary + '10'
                          }}
                        >
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mb-2"
                            style={{ backgroundColor: infographicData.color_scheme.primary }}
                          >
                            {sIndex + 1}
                          </div>
                          <p className="text-sm leading-relaxed">{step}</p>
                        </div>
                        {sIndex < process.steps.length - 1 && (
                          <div className="flex items-center">
                            <ArrowRight className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Separator />

          {/* Key Takeaways */}
          {infographicData.key_takeaways.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-2" style={{ color: infographicData.color_scheme.primary }} />
                Key Takeaways
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {infographicData.key_takeaways.map((takeaway, index) => (
                  takeaway[0] && (
                    <Card 
                      key={index} 
                      className="p-4 border-l-4"
                      style={{ borderLeftColor: infographicData.color_scheme.accent }}
                    >
                      <p className="text-sm leading-relaxed">{takeaway[0]}</p>
                    </Card>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-[600px] flex flex-col bg-white dark:bg-gray-900 rounded-lg border shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant={viewMode === 'slides' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('slides')}
              className="flex items-center space-x-2"
            >
              <Presentation className="w-4 h-4" />
              <span>Slides</span>
            </Button>
            <Button
              variant={viewMode === 'infographic' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('infographic')}
              className="flex items-center space-x-2"
            >
              <Image className="w-4 h-4" />
              <span>Infographic</span>
            </Button>
          </div>
          
          {viewMode === 'slides' && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{currentSlide + 1} / {slideData.length}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {onShare && (
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          )}
          
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload('pdf')}
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(viewMode === 'slides' ? 'pptx' : 'png')}
            >
              <Download className="w-4 h-4 mr-2" />
              {viewMode === 'slides' ? 'PPTX' : 'PNG'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative">
        {viewMode === 'slides' ? (
          <>
            <div className="h-full bg-white dark:bg-gray-800 border rounded-lg mx-2 my-2 shadow-inner">
              {slideData[currentSlide] && renderSlideContent(slideData[currentSlide])}
            </div>

            {/* Navigation */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevSlide}
                disabled={currentSlide === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              {/* Slide indicators */}
              <div className="flex space-x-1">
                {slideData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentSlide 
                        ? 'bg-blue-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={nextSlide}
                disabled={currentSlide === slideData.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          renderInfographic()
        )}
      </div>
    </div>
  )
}