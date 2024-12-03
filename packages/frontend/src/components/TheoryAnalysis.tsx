import React from 'react'

interface TheoryAnalysisProps {
  theory: {
    key: string
    chordProgression: string[]
    scale: string[]
    rhythmicPatterns: string[]
    harmonicAnalysis: string
  }
  feedback: {
    explanation: string
    suggestions: string[]
    nextConcepts: string[]
  }
}

export const TheoryAnalysis: React.FC<TheoryAnalysisProps> = ({ theory, feedback }) => {
  return (
    <div className='space-y-6'>
      {/* Theory Analysis Section */}
      <div className='theory-analysis'>
        <div className='theory-item'>
          <h4>Key</h4>
          <p>{theory.key}</p>
        </div>
        <div className='theory-item'>
          <h4>Chord Progression</h4>
          <p>{theory.chordProgression.join(' → ')}</p>
        </div>
        <div className='theory-item'>
          <h4>Scale</h4>
          <p>{theory.scale.join(', ')}</p>
        </div>
        <div className='theory-item'>
          <h4>Rhythm Patterns</h4>
          <p>{theory.rhythmicPatterns.join(', ')}</p>
        </div>
        <div className='theory-item'>
          <h4>Harmonic Analysis</h4>
          <p>{theory.harmonicAnalysis}</p>
        </div>
      </div>

      {/* Feedback Section */}
      <div className='feedback-section'>
        <h3>Teacher&apos;s Feedback</h3>
        <div className='prose prose-sm max-w-none'>
          <p className='whitespace-pre-line text-gray-700'>{feedback.explanation}</p>

          {feedback.suggestions.length > 0 && (
            <div className='mt-4'>
              <h4 className='font-semibold text-gray-800'>Suggestions for Improvement</h4>
              <ul className='suggestions-list'>
                {feedback.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {feedback.nextConcepts.length > 0 && (
            <div className='mt-4'>
              <h4 className='font-semibold text-gray-800'>Next Concepts to Explore</h4>
              <div className='next-concepts'>
                {feedback.nextConcepts.map((concept, index) => (
                  <span key={index} className='concept-tag'>
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
