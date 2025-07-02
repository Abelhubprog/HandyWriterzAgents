import { NextRequest, NextResponse } from 'next/server'

// Mock evidence data for development - in production this would come from Redis/DB
const mockEvidenceMap = {
  "source_0": {
    source_info: {
      title: "The Impact of Evidence-Based Practice on Patient Outcomes in Nursing",
      url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8234567/",
      author: "Johnson, M. et al.",
      date: "2023-03-15",
      credibility_score: 0.92,
      pdf_url: "https://example.com/cached-pdf/johnson-2023.pdf",
      document_type: "Peer-reviewed Journal",
      page_number: 15
    },
    evidence_paragraphs: [
      {
        text: "Evidence-based practice (EBP) has been shown to significantly improve patient outcomes across multiple healthcare settings. A systematic review of 847 studies found that hospitals implementing comprehensive EBP protocols saw a 23% reduction in adverse events and a 18% improvement in patient satisfaction scores.",
        position: 0,
        relevance_score: 0.89,
        key_phrases: ["evidence-based practice", "patient outcomes", "systematic review"]
      }
    ],
    citation: "Johnson, M., Smith, A., & Williams, R. (2023). The Impact of Evidence-Based Practice on Patient Outcomes in Nursing. Journal of Advanced Nursing, 79(4), 234-248.",
    key_points: [
      "EBP reduces adverse events by 23% in hospitals",
      "Patient satisfaction improved by 18% with EBP protocols",
      "Systematic review of 847 studies supports findings"
    ]
  },
  "source_1": {
    source_info: {
      title: "Clinical Decision Making in Emergency Medicine: A Systematic Approach",
      url: "https://journals.lww.com/example-article",
      author: "Davis, P.",
      date: "2023-07-22",
      credibility_score: 0.85,
      document_type: "Medical Journal"
    },
    evidence_paragraphs: [
      {
        text: "Structured clinical decision-making frameworks reduce diagnostic errors by up to 35% in emergency department settings. The implementation of standardized assessment protocols has become essential for maintaining quality care under time pressures.",
        position: 0,
        relevance_score: 0.82,
        key_phrases: ["clinical decision-making", "diagnostic errors", "emergency department"]
      }
    ],
    citation: "Davis, P. (2023). Clinical Decision Making in Emergency Medicine: A Systematic Approach. Emergency Medicine Clinics, 41(3), 445-462.",
    key_points: [
      "Structured frameworks reduce diagnostic errors by 35%",
      "Standardized protocols essential for quality care",
      "Time pressure requires systematic approaches"
    ]
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    
    // In production, fetch from Redis or database:
    // const evidenceMap = await redis.get(`evidence_map:${userId}:${timestamp}`)
    // const parsedMap = evidenceMap ? JSON.parse(evidenceMap) : {}
    
    return NextResponse.json({
      success: true,
      evidence_map: mockEvidenceMap
    })
    
  } catch (error) {
    console.error('Error fetching evidence data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch evidence data' },
      { status: 500 }
    )
  }
}