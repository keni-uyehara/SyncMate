// Improved Gemini AI Recommendation Evaluator
// Uses AI to evaluate AI for more accurate and nuanced scoring

import { getGeminiModel } from './gemini'
import { supabase } from '@/supabaseClient'
import { auth } from '@/firebaseConfig'

export interface ImprovedRecommendationEvaluation {
  recommendation: string
  context: string
  attainability: number
  relevance: number
  specificity: number
  actionability: number
  impact: number // New dimension
  risk: number // New dimension
  overallScore: number
  reasoning: {
    attainability: string
    relevance: string
    specificity: string
    actionability: string
    impact: string
    risk: string
  }
  feedback?: string
}

export class ImprovedGeminiEvaluator {
  private static instance: ImprovedGeminiEvaluator

  public static getInstance(): ImprovedGeminiEvaluator {
    if (!ImprovedGeminiEvaluator.instance) {
      ImprovedGeminiEvaluator.instance = new ImprovedGeminiEvaluator()
    }
    return ImprovedGeminiEvaluator.instance
  }

  /**
   * Get evaluation statistics from stored evaluations
   */
  async getEvaluationStatistics(): Promise<{
    totalEvaluations: number
    averageScores: {
      attainability: number
      relevance: number
      specificity: number
      actionability: number
      impact: number
      risk: number
      overall: number
    }
    scoreDistribution: Record<string, number>
  }> {
    try {
      const evaluations = await this.getStoredEvaluations(1000) // Get up to 1000 evaluations
      
      if (evaluations.length === 0) {
        return {
          totalEvaluations: 0,
          averageScores: {
            attainability: 0,
            relevance: 0,
            specificity: 0,
            actionability: 0,
            impact: 0,
            risk: 0,
            overall: 0
          },
          scoreDistribution: {}
        }
      }

      // Calculate averages
      const totals = evaluations.reduce((acc, evaluation) => ({
        attainability: acc.attainability + evaluation.attainability,
        relevance: acc.relevance + evaluation.relevance,
        specificity: acc.specificity + evaluation.specificity,
        actionability: acc.actionability + evaluation.actionability,
        impact: acc.impact + evaluation.impact,
        risk: acc.risk + evaluation.risk,
        overall: acc.overall + evaluation.overallScore
      }), {
        attainability: 0,
        relevance: 0,
        specificity: 0,
        actionability: 0,
        impact: 0,
        risk: 0,
        overall: 0
      })

      const averageScores = {
        attainability: Math.round((totals.attainability / evaluations.length) * 10) / 10,
        relevance: Math.round((totals.relevance / evaluations.length) * 10) / 10,
        specificity: Math.round((totals.specificity / evaluations.length) * 10) / 10,
        actionability: Math.round((totals.actionability / evaluations.length) * 10) / 10,
        impact: Math.round((totals.impact / evaluations.length) * 10) / 10,
        risk: Math.round((totals.risk / evaluations.length) * 10) / 10,
        overall: Math.round((totals.overall / evaluations.length) * 10) / 10
      }

      // Calculate score distribution
      const scoreDistribution = evaluations.reduce((acc, evaluation) => {
        const scoreRange = Math.floor(evaluation.overallScore)
        const key = `${scoreRange}-${scoreRange + 1}`
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        totalEvaluations: evaluations.length,
        averageScores,
        scoreDistribution
      }
    } catch (error) {
      console.error('Error getting evaluation statistics:', error)
      return {
        totalEvaluations: 0,
        averageScores: {
          attainability: 0,
          relevance: 0,
          specificity: 0,
          actionability: 0,
          impact: 0,
          risk: 0,
          overall: 0
        },
        scoreDistribution: {}
      }
    }
  }

  /**
   * Retrieve stored evaluations from the database
   */
  async getStoredEvaluations(
    limit: number = 50
  ): Promise<ImprovedRecommendationEvaluation[]> {
    try {
      // Check if user is authenticated using Firebase
      const currentUser = auth.currentUser
      
      if (!currentUser || !currentUser.email) {
        console.warn('User not authenticated, cannot retrieve evaluations')
        return []
      }

      // Get the user's firebase_uid from Supabase users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('firebase_uid')
        .eq('email', currentUser.email)
        .single()

      if (userError || !userData) {
        console.error('Error getting user data from Supabase:', userError)
        console.warn('Cannot retrieve evaluations - user not found in Supabase')
        return []
      }

      const query = supabase
        .from('gemini_evaluations')
        .select('*')
        .eq('firebase_uid', userData.firebase_uid)
        .order('created_at', { ascending: false })
        .limit(limit)

      const { data, error } = await query

      if (error) {
        console.error('Error retrieving evaluations:', error)
        return []
      }

      // Convert database records back to evaluation format
      return data.map(record => ({
        recommendation: record.recommendation,
        context: record.context,
        attainability: record.attainability,
        relevance: record.relevance,
        specificity: record.specificity,
        actionability: record.actionability,
        impact: (record.metadata as any)?.impact || 3,
        risk: (record.metadata as any)?.risk || 3,
        overallScore: record.overall_score,
        reasoning: (record.metadata as any)?.reasoning || {},
        feedback: record.feedback || undefined
      }))
    } catch (error) {
      console.error('Error retrieving stored evaluations:', error)
      return []
    }
  }

  /**
   * Evaluate a recommendation using AI-based analysis
   */
  async evaluateRecommendation(
    recommendation: string,
    context: string,
    userId?: string,
    sessionId?: string
  ): Promise<ImprovedRecommendationEvaluation> {
    try {
      console.log('🚀 EVALUATOR CALLED - Starting AI evaluation for recommendation:', recommendation.substring(0, 100) + '...')
      console.log('📝 Context:', context.substring(0, 100) + '...')
      console.log('🔑 User ID:', userId)
      console.log('📋 Session ID:', sessionId)
      
      const model = getGeminiModel()
      if (!model) {
        console.error('Gemini model not available - check VITE_GEMINI_API_KEY')
        console.log('Environment variables:', {
          VITE_GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY ? 'SET' : 'NOT SET'
        })
        // Return a mock evaluation for testing purposes
        console.log('Returning mock evaluation for testing')
        return this.getMockEvaluation(recommendation, context)
      }

      console.log('Gemini model loaded successfully')
      const evaluationPrompt = this.createEvaluationPrompt(recommendation, context)
      console.log('Sending request to Gemini API...')
      
      const result = await model.generateContent(evaluationPrompt)
      const response = await result.response
      const evaluationText = response.text()

      console.log('Received response from Gemini API:', evaluationText.substring(0, 200) + '...')
      const evaluation = this.parseEvaluationResponse(evaluationText, recommendation, context)
      
      console.log('Parsed evaluation:', evaluation)
      
      // Save to database
      await this.saveEvaluation(evaluation, userId, sessionId)
      
      return evaluation
    } catch (error) {
      console.error('Error evaluating recommendation:', error)
      return this.getDefaultEvaluation(recommendation, context)
    }
  }

  private createEvaluationPrompt(recommendation: string, context: string): string {
    return `
You are an expert AI evaluation specialist with deep experience in compliance, risk management, and operational efficiency. Evaluate the following AI-generated recommendation on a 1-5 scale for each dimension.

**RECOMMENDATION TO EVALUATE:**
"${recommendation}"

**CONTEXT:**
"${context}"

**EVALUATION CRITERIA (1-5 scale):**

1. **ATTAINABILITY**: How feasible is this recommendation to implement?
   - 5: Highly feasible with existing resources, clear path, minimal barriers
   - 4: Feasible with minor adjustments or additional resources
   - 3: Moderately feasible but may require significant effort or resources
   - 2: Challenging to implement, requires major changes or resources
   - 1: Very difficult or impossible to implement with current constraints

2. **RELEVANCE**: How well does this recommendation address the core problem?
   - 5: Directly addresses the core issue with precision and completeness
   - 4: Addresses the main issue with minor gaps or missing elements
   - 3: Partially addresses the issue but misses some important aspects
   - 2: Tangentially related to the issue but doesn't fully address it
   - 1: Does not address the core issue or is completely off-topic

3. **SPECIFICITY**: How specific and detailed are the action steps?
   - 5: Highly specific with clear steps, timelines, responsibilities, and technical details
   - 4: Specific with most details provided, minor gaps in implementation guidance
   - 3: Moderately specific but missing some key details or clarity
   - 2: Vague with limited actionable details, requires significant interpretation
   - 1: Very general with no specific guidance or actionable steps

4. **ACTIONABILITY**: How clear are the next steps for implementation?
   - 5: Clear, immediate next steps that anyone can follow without ambiguity
   - 4: Clear steps with minor ambiguity that can be easily resolved
   - 3: Somewhat clear but requires interpretation or additional planning
   - 2: Unclear steps requiring significant interpretation and planning
   - 1: No clear actionable steps, implementation path is unclear

5. **IMPACT**: What is the potential positive impact of implementing this?
   - 5: High positive impact on compliance, efficiency, risk reduction, or business value
   - 4: Significant positive impact with clear benefits
   - 3: Moderate positive impact with some measurable benefits
   - 2: Low positive impact with limited benefits
   - 1: Minimal or no positive impact, benefits are unclear

6. **RISK**: What is the potential risk or downside of implementing this?
   - 5: Very low risk, well-established approach with minimal potential issues
   - 4: Low risk with minor potential issues that can be easily managed
   - 3: Moderate risk with some potential concerns that need monitoring
   - 2: High risk with significant potential problems that need careful management
   - 1: Very high risk, potentially harmful or counterproductive

**ANALYSIS INSTRUCTIONS:**
- Consider the practical business context, compliance requirements, and resource constraints
- Evaluate based on real-world implementation scenarios
- Be critical but fair in your assessment
- Consider both immediate and long-term implications
- Think about typical organizational capabilities and constraints

**RESPONSE FORMAT:**
Provide your evaluation in this exact JSON format:
{
  "attainability": <score>,
  "relevance": <score>,
  "specificity": <score>,
  "actionability": <score>,
  "impact": <score>,
  "risk": <score>,
  "reasoning": {
    "attainability": "<brief explanation of feasibility assessment>",
    "relevance": "<brief explanation of how well it addresses the issue>",
    "specificity": "<brief explanation of detail level and clarity>",
    "actionability": "<brief explanation of clarity of next steps>",
    "impact": "<brief explanation of expected positive outcomes>",
    "risk": "<brief explanation of potential risks or concerns>"
  },
  "feedback": "<comprehensive feedback including strengths, weaknesses, and specific suggestions for improvement>"
}
`
  }

  private parseEvaluationResponse(
    responseText: string, 
    recommendation: string, 
    context: string
  ): ImprovedRecommendationEvaluation {
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const evaluation = JSON.parse(jsonMatch[0])
      
      const attainability = Math.max(1, Math.min(5, evaluation.attainability || 3))
      const relevance = Math.max(1, Math.min(5, evaluation.relevance || 3))
      const specificity = Math.max(1, Math.min(5, evaluation.specificity || 3))
      const actionability = Math.max(1, Math.min(5, evaluation.actionability || 3))
      const impact = Math.max(1, Math.min(5, evaluation.impact || 3))
      const risk = Math.max(1, Math.min(5, evaluation.risk || 3))
      
      // Calculate overall score as average of all 6 dimensions
      const overallScore = (attainability + relevance + specificity + actionability + impact + risk) / 6
      
      return {
        recommendation,
        context,
        attainability,
        relevance,
        specificity,
        actionability,
        impact,
        risk,
        overallScore: Math.round(overallScore * 10) / 10, // Round to 1 decimal place
        reasoning: evaluation.reasoning || {},
        feedback: evaluation.feedback
      }
    } catch (error) {
      console.error('Error parsing evaluation response:', error)
      return this.getDefaultEvaluation(recommendation, context)
    }
  }

  private async saveEvaluation(
    evaluation: ImprovedRecommendationEvaluation,
    _userId?: string,
    sessionId?: string
  ): Promise<void> {
    try {
      console.log('💾 SAVE EVALUATION CALLED')
      
      // Check if user is authenticated using Firebase
      const currentUser = auth.currentUser
      
      if (!currentUser || !currentUser.email) {
        console.warn('⚠️ User not authenticated, skipping database save')
        console.log('🔍 Current user:', currentUser)
        return
      }
      
      console.log('✅ User authenticated:', currentUser.email)

      // Get the user's firebase_uid from Supabase users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('firebase_uid')
        .eq('email', currentUser.email)
        .single()

      if (userError || !userData) {
        console.error('Error getting user data from Supabase:', userError)
        console.warn('Skipping database save - user not found in Supabase')
        return
      }

      // Check if this evaluation already exists to prevent duplicates
      const { data: existingEvaluation, error: checkError } = await supabase
        .from('gemini_evaluations')
        .select('id')
        .eq('recommendation', evaluation.recommendation)
        .eq('context', evaluation.context)
        .eq('firebase_uid', userData.firebase_uid)
        .limit(1)

      if (checkError) {
        console.error('Error checking for existing evaluation:', checkError)
        // Continue with save anyway
      } else if (existingEvaluation && existingEvaluation.length > 0) {
        console.log('⚠️ Evaluation already exists, skipping duplicate save')
        console.log('Existing evaluation ID:', existingEvaluation[0].id)
        return
      }

      const { error } = await supabase
        .from('gemini_evaluations')
        .insert({
          recommendation: evaluation.recommendation,
          context: evaluation.context,
          attainability: evaluation.attainability,
          relevance: evaluation.relevance,
          specificity: evaluation.specificity,
          actionability: evaluation.actionability,
          overall_score: evaluation.overallScore,
          feedback: evaluation.feedback,
          firebase_uid: userData.firebase_uid, // Use the Firebase UID from Supabase users table
          session_id: sessionId,
          // Store additional fields in metadata
          metadata: {
            impact: evaluation.impact,
            risk: evaluation.risk,
            reasoning: evaluation.reasoning,
            evaluation_timestamp: new Date().toISOString(),
            evaluation_version: '2.0' // Track evaluation format version
          }
        })

      if (error) {
        console.error('Error saving evaluation to database:', error)
        // Don't throw the error - just log it so the evaluation can still be returned
      } else {
        console.log('Successfully saved evaluation to database')
      }
    } catch (error) {
      console.error('Error saving evaluation:', error)
      // Don't throw the error - just log it so the evaluation can still be returned
    }
  }

  private getDefaultEvaluation(
    recommendation: string, 
    context: string
  ): ImprovedRecommendationEvaluation {
    return {
      recommendation,
      context,
      attainability: 3,
      relevance: 3,
      specificity: 3,
      actionability: 3,
      impact: 3,
      risk: 3,
      overallScore: 3,
      reasoning: {
        attainability: 'Default evaluation - unable to analyze',
        relevance: 'Default evaluation - unable to analyze',
        specificity: 'Default evaluation - unable to analyze',
        actionability: 'Default evaluation - unable to analyze',
        impact: 'Default evaluation - unable to analyze',
        risk: 'Default evaluation - unable to analyze'
      },
      feedback: 'Evaluation failed - using default scores'
    }
  }

  private getMockEvaluation(
    recommendation: string, 
    context: string
  ): ImprovedRecommendationEvaluation {
    // Analyze the recommendation content to generate more realistic scores
    const recLower = recommendation.toLowerCase()
    const contextLower = context.toLowerCase()
    
    // Attainability: Based on complexity and resource requirements
    let attainability = 3
    if (recLower.includes('immediate') || recLower.includes('query') || recLower.includes('flag')) {
      attainability = 4 // Simple database operations
    } else if (recLower.includes('establish') || recLower.includes('implement') || recLower.includes('create')) {
      attainability = 3 // Moderate complexity
    } else if (recLower.includes('review') || recLower.includes('analyze') || recLower.includes('assess')) {
      attainability = 4 // Analysis tasks are usually achievable
    }
    
    // Relevance: Based on how well it addresses the context
    let relevance = 4
    if (contextLower.includes('missing') && recLower.includes('missing')) {
      relevance = 5 // Directly addresses the issue
    } else if (contextLower.includes('compliance') && recLower.includes('compliance')) {
      relevance = 5 // Compliance-focused
    } else if (recLower.includes('escalation') && contextLower.includes('policy')) {
      relevance = 4 // Policy-related
    }
    
    // Specificity: Based on detail level in the recommendation
    let specificity = 3
    if (recLower.includes('immediately') && recLower.includes('query') && recLower.includes('system')) {
      specificity = 4 // Very specific steps
    } else if (recLower.includes('establish') && recLower.includes('procedures')) {
      specificity = 3 // General procedure establishment
    } else if (recLower.includes('designated team member') || recLower.includes('specific')) {
      specificity = 4 // Mentions specific roles
    }
    
    // Actionability: Based on clarity of next steps
    let actionability = 3
    if (recLower.includes('immediately query') || recLower.includes('initiate data transfer')) {
      actionability = 4 // Clear immediate actions
    } else if (recLower.includes('establish') && recLower.includes('clear')) {
      actionability = 3 // Procedure establishment
    } else if (recLower.includes('flag') && recLower.includes('manual review')) {
      actionability = 4 // Clear workflow
    }
    
    // Impact: Based on potential business value
    let impact = 4
    if (contextLower.includes('compliance') || contextLower.includes('loan amount')) {
      impact = 4 // Compliance issues have high impact
    } else if (recLower.includes('escalation') || recLower.includes('procedures')) {
      impact = 3 // Process improvements
    }
    
    // Risk: Based on potential negative consequences
    let risk = 3
    if (recLower.includes('manual review') || recLower.includes('data entry')) {
      risk = 3 // Manual processes have moderate risk
    } else if (recLower.includes('query') || recLower.includes('system')) {
      risk = 2 // System queries are low risk
    } else if (recLower.includes('establish') || recLower.includes('procedures')) {
      risk = 3 // Process changes have moderate risk
    }
    
    // Add some randomness to make it more realistic
    attainability += Math.floor(Math.random() * 2) - 1 // ±1
    relevance += Math.floor(Math.random() * 2) - 1
    specificity += Math.floor(Math.random() * 2) - 1
    actionability += Math.floor(Math.random() * 2) - 1
    impact += Math.floor(Math.random() * 2) - 1
    risk += Math.floor(Math.random() * 2) - 1
    
    // Ensure scores stay within 1-5 range
    attainability = Math.max(1, Math.min(5, attainability))
    relevance = Math.max(1, Math.min(5, relevance))
    specificity = Math.max(1, Math.min(5, specificity))
    actionability = Math.max(1, Math.min(5, actionability))
    impact = Math.max(1, Math.min(5, impact))
    risk = Math.max(1, Math.min(5, risk))
    
    // Calculate overall score as average of all 6 dimensions
    const overallScore = (attainability + relevance + specificity + actionability + impact + risk) / 6

    return {
      recommendation,
      context,
      attainability,
      relevance,
      specificity,
      actionability,
      impact,
      risk,
      overallScore: Math.round(overallScore * 10) / 10, // Round to 1 decimal place
      reasoning: {
        attainability: `Intelligent mock evaluation: This recommendation appears ${attainability >= 4 ? 'highly' : 'moderately'} attainable. ${attainability >= 4 ? 'The suggested actions are within typical operational capabilities.' : 'Implementation may require additional resources or expertise.'}`,
        relevance: `Intelligent mock evaluation: The recommendation is ${relevance >= 4 ? 'highly' : 'moderately'} relevant to the identified issue. ${relevance >= 4 ? 'It directly addresses the core problem described in the context.' : 'While related, it may not fully address all aspects of the issue.'}`,
        specificity: `Intelligent mock evaluation: The recommendation provides ${specificity >= 4 ? 'clear, specific' : 'general'} guidance. ${specificity >= 4 ? 'The steps are well-defined and actionable.' : 'Additional detail would improve implementation clarity.'}`,
        actionability: `Intelligent mock evaluation: The recommendation is ${actionability >= 4 ? 'highly' : 'moderately'} actionable. ${actionability >= 4 ? 'Next steps are clear and can be executed immediately.' : 'Some interpretation may be needed to determine exact implementation steps.'}`,
        impact: `Intelligent mock evaluation: Implementing this recommendation would likely have ${impact >= 4 ? 'significant' : 'moderate'} positive impact. ${impact >= 4 ? 'It addresses important business or compliance needs.' : 'The impact may be limited to specific areas or processes.'}`,
        risk: `Intelligent mock evaluation: The recommendation carries ${risk <= 2 ? 'low' : 'moderate'} risk. ${risk <= 2 ? 'Implementation is unlikely to cause negative consequences.' : 'Careful planning and monitoring may be needed to mitigate potential issues.'}`
      },
      feedback: 'Intelligent mock evaluation for testing - Gemini API key not configured. This evaluation considers the content and context of the recommendation to provide more realistic scores.'
    }
  }

  /**
   * Clean up duplicate evaluations (keeps the most recent one)
   */
  async cleanupDuplicateEvaluations(): Promise<number> {
    try {
      console.log('🧹 Cleaning up duplicate evaluations...')
      
      // Get the user's firebase_uid
      const currentUser = auth.currentUser
      if (!currentUser || !currentUser.email) {
        console.warn('⚠️ User not authenticated, cannot cleanup duplicates')
        return 0
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('firebase_uid')
        .eq('email', currentUser.email)
        .single()

      if (userError || !userData) {
        console.error('Error getting user data for cleanup:', userError)
        return 0
      }

      // Find duplicates (same recommendation + context + user)
      const { data: duplicates, error: duplicateError } = await supabase
        .from('gemini_evaluations')
        .select('*')
        .eq('firebase_uid', userData.firebase_uid)
        .order('created_at', { ascending: false })

      if (duplicateError) {
        console.error('Error fetching evaluations for cleanup:', duplicateError)
        return 0
      }

      // Group by recommendation + context and keep only the most recent
      const grouped = new Map<string, any[]>()
      
      duplicates?.forEach(evaluation => {
        const key = `${evaluation.recommendation}|${evaluation.context}`
        if (!grouped.has(key)) {
          grouped.set(key, [])
        }
        grouped.get(key)!.push(evaluation)
      })

      let duplicatesRemoved = 0

      for (const [key, evaluations] of grouped) {
        if (evaluations.length > 1) {
          console.log(`Found ${evaluations.length} duplicates for: ${key.substring(0, 100)}...`)
          
          // Keep the first one (most recent due to ordering), delete the rest
          const toDelete = evaluations.slice(1)
          
          for (const duplicate of toDelete) {
            const { error: deleteError } = await supabase
              .from('gemini_evaluations')
              .delete()
              .eq('id', duplicate.id)
            
            if (deleteError) {
              console.error('Error deleting duplicate:', deleteError)
            } else {
              duplicatesRemoved++
              console.log(`Deleted duplicate evaluation ID: ${duplicate.id}`)
            }
          }
        }
      }

      console.log(`✅ Cleanup complete. Removed ${duplicatesRemoved} duplicate evaluations`)
      return duplicatesRemoved
    } catch (error) {
      console.error('❌ Error during cleanup:', error)
      return 0
    }
  }

  /**
   * Test function to verify evaluation storage is working
   */
  async testEvaluationStorage(): Promise<boolean> {
    try {
      console.log('🧪 Testing evaluation storage...')
      
      // Check authentication first
      const currentUser = auth.currentUser
      if (!currentUser || !currentUser.email) {
        console.error('❌ No authenticated user found')
        return false
      }
      
      console.log('✅ User authenticated:', currentUser.email)
      
      // Create a test evaluation
      const testRecommendation = "Test recommendation: Implement automated data validation checks"
      const testContext = "Test context: Data quality issues detected in customer records"
      
      console.log('🔄 Generating test evaluation...')
      
      // Evaluate the test recommendation
      const evaluation = await this.evaluateRecommendation(
        testRecommendation,
        testContext,
        undefined,
        'test-session-' + Date.now()
      )
      
      console.log('✅ Test evaluation generated:', {
        overallScore: evaluation.overallScore,
        hasFeedback: !!evaluation.feedback,
        hasReasoning: !!evaluation.reasoning
      })
      
      // Wait a moment for the database save to complete
      console.log('⏳ Waiting for database save to complete...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Retrieve stored evaluations
      console.log('🔄 Retrieving stored evaluations...')
      const storedEvaluations = await this.getStoredEvaluations(10)
      console.log('📊 Retrieved stored evaluations:', storedEvaluations.length)
      
      if (storedEvaluations.length === 0) {
        console.log('⚠️ No evaluations found in database')
        return false
      }
      
      // Check if our test evaluation was stored
      const testEvaluation = storedEvaluations.find(evaluation => 
        evaluation.recommendation === testRecommendation && 
        evaluation.context === testContext
      )
      
      if (testEvaluation) {
        console.log('✅ Test evaluation successfully stored and retrieved')
        console.log('📈 Stored evaluation scores:', {
          attainability: testEvaluation.attainability,
          relevance: testEvaluation.relevance,
          specificity: testEvaluation.specificity,
          actionability: testEvaluation.actionability,
          impact: testEvaluation.impact,
          risk: testEvaluation.risk,
          overallScore: testEvaluation.overallScore,
          hasFeedback: !!testEvaluation.feedback,
          hasReasoning: !!testEvaluation.reasoning
        })
        return true
      } else {
        console.log('❌ Test evaluation not found in stored evaluations')
        console.log('🔍 Available evaluations:', storedEvaluations.map(e => ({
          recommendation: e.recommendation.substring(0, 50) + '...',
          context: e.context.substring(0, 50) + '...'
        })))
        return false
      }
    } catch (error) {
      console.error('❌ Test evaluation storage failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const improvedGeminiEvaluator = ImprovedGeminiEvaluator.getInstance()

// Make the evaluator available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testEvaluator = improvedGeminiEvaluator
  console.log('🧪 Test evaluator available as window.testEvaluator')
  console.log('💡 Available commands:')
  console.log('   - await window.testEvaluator.testEvaluationStorage()')
  console.log('   - await window.testEvaluator.cleanupDuplicateEvaluations()')
  console.log('   - await window.testEvaluator.getStoredEvaluations()')
}