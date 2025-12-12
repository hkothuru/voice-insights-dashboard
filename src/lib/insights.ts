import { getCalls } from './db';

export interface SpecIntelligence {
  category: string;
  totalCalls: number;
  missingSpecsFrequency: Record<string, number>;
  topMissingSpecs: Array<{ spec: string; frequency: number; percentage: number }>;
  commonObjections: Array<{ objection: string; frequency: number }>;
  averageIntentScore: number;
  conversionRate: number; // Follow-up / Total calls
  actionableRecommendations: string[];
}

export interface ListingEnhancement {
  category: string;
  recommendedSpecs: Array<{
    spec: string;
    priority: 'high' | 'medium' | 'low';
    reasoning: string;
    example: string;
  }>;
  specValidationRules: Array<{
    rule: string;
    validation: string;
  }>;
  competitiveAdvantage: string[];
}

export interface CategoryInsights {
  category: string;
  totalConversations: number;
  keyFindings: string[];
  businessImpact: string[];
  automationOpportunities: string[];
}

export interface LeadIntentInsights {
  totalCalls: number;
  intentDistribution: {
    low: number; // 1-3
    medium: number; // 4-7
    high: number; // 8-10
  };
  lowIntentBuyers: Array<{
    buyerId: string;
    lowIntentCalls: number;
    categories: string[];
    avgIntentScore: number;
  }>;
  actionableRecommendations: string[];
}

export interface ObjectionInsights {
  totalCalls: number;
  objectionBreakdown: Record<string, number>;
  categoryObjections: Record<string, Record<string, number>>;
  sellerPerformance: Array<{
    sellerId: string;
    objections: Record<string, number>;
    recommendations: string[];
  }>;
  actionableRecommendations: string[];
}

export interface LanguageInsights {
  totalCalls: number;
  languageDistribution: Record<string, number>;
  languageMismatches: Array<{
    primaryLanguage: string;
    secondaryLanguage: string;
    failedCalls: number;
    categories: string[];
  }>;
  actionableRecommendations: string[];
}

export interface ResponsivenessInsights {
  totalCalls: number;
  qualityMetrics: {
    highNoiseCalls: number;
    poorToneCalls: number;
    shortDurationCalls: number;
  };
  sellerQualityScores: Array<{
    sellerId: string;
    qualityScore: number;
    issues: string[];
  }>;
  actionableRecommendations: string[];
}

export interface DemandGapInsights {
  totalCalls: number;
  unmetDemands: Array<{
    specification: string;
    category: string;
    frequency: number;
    percentage: number;
  }>;
  categoryGaps: Record<string, Array<{
    spec: string;
    demand: number;
    supply: number;
  }>>;
  actionableRecommendations: string[];
}

/**
 * Core Business Intelligence Engine
 * Analyzes buyer-seller conversations to generate actionable insights
 */
export class VoiceInsightsEngine {
  private calls = getCalls();

  /**
   * Analyze specification intelligence across categories
   */
  generateSpecIntelligence(): SpecIntelligence[] {
    const categoryGroups = this.groupCallsByCategory();

    return Object.entries(categoryGroups).map(([category, calls]) => {
      const missingSpecsFreq: Record<string, number> = {};
      const objections: Record<string, number> = {};
      let totalIntent = 0;
      let followUpCount = 0;

      calls.forEach(call => {
        const analysis = call.analysis;

        // Count missing specs
        analysis?.missing_specs?.forEach(spec => {
          missingSpecsFreq[spec] = (missingSpecsFreq[spec] || 0) + 1;
        });

        // Count objections
        const objection = analysis?.objection_type;
        if (objection && objection !== 'None') {
          objections[objection] = (objections[objection] || 0) + 1;
        }

        // Sum intent scores
        totalIntent += analysis?.buyer_intent_score || 0;

        // Count follow-ups
        if (analysis?.deal_status?.toLowerCase().includes('follow-up')) {
          followUpCount++;
        }
      });

      const topMissingSpecs = Object.entries(missingSpecsFreq)
        .map(([spec, freq]) => ({
          spec,
          frequency: freq,
          percentage: Math.round((freq / calls.length) * 100)
        }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5);

      const commonObjections = Object.entries(objections)
        .map(([objection, freq]) => ({ objection, frequency: freq }))
        .sort((a, b) => b.frequency - a.frequency);

      return {
        category,
        totalCalls: calls.length,
        missingSpecsFrequency: missingSpecsFreq,
        topMissingSpecs,
        commonObjections,
        averageIntentScore: Math.round((totalIntent / calls.length) * 10) / 10,
        conversionRate: Math.round((followUpCount / calls.length) * 100),
        actionableRecommendations: this.generateRecommendations(category, topMissingSpecs, commonObjections)
      };
    });
  }

  /**
   * Generate listing enhancement recommendations
   */
  generateListingEnhancements(): ListingEnhancement[] {
    const specIntelligence = this.generateSpecIntelligence();

    return specIntelligence.map(intel => ({
      category: intel.category,
      recommendedSpecs: this.generateSpecRecommendations(intel),
      specValidationRules: this.generateValidationRules(intel),
      competitiveAdvantage: this.generateCompetitiveAdvantages(intel)
    }));
  }

  /**
   * Generate category-level insights and automation opportunities
   */
  generateCategoryInsights(): CategoryInsights[] {
    const specIntelligence = this.generateSpecIntelligence();

    return specIntelligence.map(intel => ({
      category: intel.category,
      totalConversations: intel.totalCalls,
      keyFindings: this.extractKeyFindings(intel),
      businessImpact: this.calculateBusinessImpact(intel),
      automationOpportunities: this.identifyAutomationOpportunities(intel)
    }));
  }

  /**
   * Calculate overall platform insights
   */
  generatePlatformInsights() {
    const allCalls = this.calls;
    const specIntel = this.generateSpecIntelligence();

    // Overall statistics
    const totalConversations = allCalls.length;
    const followUpRate = Math.round((allCalls.filter(c =>
      c.analysis?.deal_status?.toLowerCase().includes('follow-up')
    ).length / totalConversations) * 100);

    const avgIntentScore = Math.round(
      allCalls.reduce((sum, c) => sum + (c.analysis?.buyer_intent_score || 0), 0) / totalConversations * 10
    ) / 10;

    // Top missing specs across all categories
    const globalMissingSpecs: Record<string, number> = {};
    allCalls.forEach(call => {
      call.analysis?.missing_specs?.forEach(spec => {
        globalMissingSpecs[spec] = (globalMissingSpecs[spec] || 0) + 1;
      });
    });

    const topGlobalSpecs = Object.entries(globalMissingSpecs)
      .map(([spec, freq]) => ({ spec, frequency: freq, percentage: Math.round((freq / totalConversations) * 100) }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    return {
      platformStats: {
        totalConversations,
        followUpRate,
        avgIntentScore,
        categoriesCovered: specIntel.length
      },
      globalSpecIntelligence: {
        topMissingSpecs: topGlobalSpecs,
        specClarificationRate: Math.round((allCalls.filter(c =>
          c.analysis?.missing_specs && c.analysis.missing_specs.length > 0
        ).length / totalConversations) * 100)
      },
      keyInsights: [
        `${followUpRate}% of conversations result in follow-up opportunities`,
        `${topGlobalSpecs[0]?.percentage || 0}% of calls lack ${topGlobalSpecs[0]?.spec || 'key specifications'}`,
        `Average buyer intent score: ${avgIntentScore}/10`,
        `Specification clarification needed in ${Math.round((allCalls.filter(c =>
          c.analysis?.missing_specs && c.analysis.missing_specs.length > 0
        ).length / totalConversations) * 100)}% of conversations`
      ]
    };
  }

  // Private helper methods

  private groupCallsByCategory() {
    const groups: Record<string, any[]> = {};
    this.calls.forEach(call => {
      const category = call.analysis?.category || 'Uncategorized';
      if (!groups[category]) groups[category] = [];
      groups[category].push(call);
    });
    return groups;
  }

  private generateRecommendations(
    category: string,
    topMissingSpecs: Array<{ spec: string; frequency: number; percentage: number }>,
    commonObjections: Array<{ objection: string; frequency: number }>
  ): string[] {
    const recommendations = [];

    if (topMissingSpecs.length > 0) {
      recommendations.push(
        `Add ${topMissingSpecs[0].spec} to ${Math.round(topMissingSpecs[0].percentage/100 * this.calls.length)} listings in ${category}`
      );
    }

    if (commonObjections.length > 0) {
      recommendations.push(
        `Address ${commonObjections[0].objection} objections through proactive spec disclosure`
      );
    }

    recommendations.push(`Implement automated spec validation for ${category} listings`);
    recommendations.push(`Create category-specific spec templates based on buyer conversation patterns`);

    return recommendations;
  }

  private generateSpecRecommendations(intel: SpecIntelligence) {
    return intel.topMissingSpecs.map(spec => ({
      spec: spec.spec,
      priority: spec.percentage > 30 ? 'high' : spec.percentage > 15 ? 'medium' : 'low' as 'high' | 'medium' | 'low',
      reasoning: `${spec.percentage}% of conversations in this category require clarification on ${spec.spec}`,
      example: this.generateSpecExample(spec.spec)
    }));
  }

  private generateValidationRules(intel: SpecIntelligence) {
    return [
      {
        rule: "Required specifications must be present",
        validation: `Validate that listings include top ${intel.topMissingSpecs.slice(0, 3).map(s => s.spec).join(', ')}`
      },
      {
        rule: "Specification format standardization",
        validation: "Ensure consistent units and terminology across category listings"
      },
      {
        rule: "Completeness score calculation",
        validation: `Calculate spec completeness based on ${intel.topMissingSpecs.length} most requested specs`
      }
    ];
  }

  private generateCompetitiveAdvantages(intel: SpecIntelligence) {
    return [
      `Reduce clarification calls by ${intel.topMissingSpecs[0]?.percentage || 0}% through proactive spec disclosure`,
      `Improve buyer intent scores by addressing ${intel.commonObjections[0]?.objection || 'common objections'}`,
      `Increase conversion rates from ${intel.conversionRate}% to ${Math.min(100, intel.conversionRate + 15)}%`
    ];
  }

  private extractKeyFindings(intel: SpecIntelligence): string[] {
    return [
      `${intel.conversionRate}% of ${intel.category} conversations result in follow-up`,
      `Average buyer intent: ${intel.averageIntentScore}/10`,
      `Top missing spec: ${intel.topMissingSpecs[0]?.spec || 'None'} (${intel.topMissingSpecs[0]?.percentage || 0}% of calls)`,
      `${intel.commonObjections[0]?.objection || 'Various'} is the most common objection type`
    ];
  }

  private calculateBusinessImpact(intel: SpecIntelligence): string[] {
    const potentialConversionImprovement = Math.round(intel.conversionRate * 0.2); // 20% improvement estimate

    return [
      `Potential ${potentialConversionImprovement}% improvement in conversion rates`,
      `Reduce ${intel.topMissingSpecs[0]?.percentage || 0}% of clarification calls`,
      `Improve seller efficiency by automating spec recommendations`,
      `Enhance buyer experience through better product discovery`
    ];
  }

  private identifyAutomationOpportunities(intel: SpecIntelligence): string[] {
    return [
      "Automated listing enhancement suggestions based on category conversation patterns",
      "Real-time spec validation during product upload",
      "Buyer intent scoring for listing optimization",
      "Automated follow-up triggers for high-intent conversations",
      "Category-specific spec templates generation"
    ];
  }

  private generateSpecExample(spec: string): string {
    const examples: Record<string, string> = {
      "Price": "₹1,250/kg (inclusive of GST, minimum order 50kg)",
      "Size": "20x15x10 cm (LxWxH), weight: 2.5kg",
      "Color": "Navy Blue (Pantone 2925C) - exact shade matching available",
      "Quantity": "Minimum order: 100 pieces, bulk discounts available",
      "Material": "100% Cotton (GSM: 180), machine washable",
      "Brand": "Equivalent to XYZ brand, ISO certified manufacturing"
    };

    return examples[spec] || `${spec}: Please specify exact requirements`;
  }

  /**
   * Generate Lead Intent Scoring Insights (Time-Waster Filter)
   */
  generateLeadIntentInsights(): LeadIntentInsights {
    const intentBuckets = { low: 0, medium: 0, high: 0 };
    const buyerIntentMap = new Map<string, {
      scores: number[];
      categories: Set<string>;
    }>();

    this.calls.forEach(call => {
      const analysis = call.analysis;
      if (!analysis?.buyer_intent_score) return;

      const score = analysis.buyer_intent_score;
      const buyerId = analysis.buyer_id || call.metadata?.buyer_id || 'Unknown';

      // Bucket intent scores
      if (score <= 3) intentBuckets.low++;
      else if (score <= 7) intentBuckets.medium++;
      else intentBuckets.high++;

      // Track buyer intent patterns
      if (!buyerIntentMap.has(buyerId)) {
        buyerIntentMap.set(buyerId, { scores: [], categories: new Set() });
      }
      const buyerData = buyerIntentMap.get(buyerId)!;
      buyerData.scores.push(score);
      buyerData.categories.add(analysis.category || 'Unknown');
    });

    // Find low-intent buyers (average score < 4)
    const lowIntentBuyers = Array.from(buyerIntentMap.entries())
      .map(([buyerId, data]) => ({
        buyerId,
        lowIntentCalls: data.scores.filter(score => score <= 3).length,
        categories: Array.from(data.categories),
        avgIntentScore: Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10) / 10
      }))
      .filter(buyer => buyer.avgIntentScore < 4 && buyer.lowIntentCalls >= 3)
      .sort((a, b) => b.lowIntentCalls - a.lowIntentCalls)
      .slice(0, 10);

    const actionableRecommendations = [
      `Flag ${lowIntentBuyers.length} buyers as low-priority to save seller outreach costs`,
      'Implement automated lead scoring before selling premium leads',
      'Create separate handling process for consistently low-intent buyers',
      'Reduce call costs by 20-30% through intelligent lead filtering'
    ];

    return {
      totalCalls: this.calls.length,
      intentDistribution: intentBuckets,
      lowIntentBuyers,
      actionableRecommendations
    };
  }

  /**
   * Generate Objection Mining Insights (Why Did I Lose?)
   */
  generateObjectionInsights(): ObjectionInsights {
    const objectionMap = new Map<string, number>();
    const categoryObjections = new Map<string, Map<string, number>>();
    const sellerObjections = new Map<string, Map<string, number>>();

    this.calls.forEach(call => {
      const analysis = call.analysis;
      const negotiationData = analysis?.negotiation_dynamics;

      // Use objection_type from basic analysis
      if (analysis?.objection_type && analysis.objection_type !== 'None') {
        const objection = analysis.objection_type;
        const category = analysis.category || 'Unknown';
        const sellerId = analysis.seller_id || call.metadata?.seller_id || 'Unknown';

        objectionMap.set(objection, (objectionMap.get(objection) || 0) + 1);

        // Category-specific objections
        if (!categoryObjections.has(category)) {
          categoryObjections.set(category, new Map());
        }
        const catObjections = categoryObjections.get(category)!;
        catObjections.set(objection, (catObjections.get(objection) || 0) + 1);

        // Seller-specific objections
        if (!sellerObjections.has(sellerId)) {
          sellerObjections.set(sellerId, new Map());
        }
        const sellObjections = sellerObjections.get(sellerId)!;
        sellObjections.set(objection, (sellObjections.get(objection) || 0) + 1);
      }

      // Also use negotiation dynamics for additional objection insights
      if (negotiationData && negotiationData.negotiation_present) {
        const category = analysis?.category || 'Unknown';
        const sellerId = analysis?.seller_id || call.metadata?.seller_id || 'Unknown';

        // Infer objections from negotiation outcomes
        if (negotiationData.negotiation_outcome === 'failed' || negotiationData.negotiation_outcome === 'stalemate') {
          const inferredObjection = 'Negotiation_Failure';
          objectionMap.set(inferredObjection, (objectionMap.get(inferredObjection) || 0) + 1);

          // Category-specific
          if (!categoryObjections.has(category)) {
            categoryObjections.set(category, new Map());
          }
          const catObjections = categoryObjections.get(category)!;
          catObjections.set(inferredObjection, (catObjections.get(inferredObjection) || 0) + 1);

          // Seller-specific
          if (!sellerObjections.has(sellerId)) {
            sellerObjections.set(sellerId, new Map());
          }
          const sellObjections = sellerObjections.get(sellerId)!;
          sellObjections.set(inferredObjection, (sellObjections.get(inferredObjection) || 0) + 1);
        }

        // Check for price-based objections from negotiation data
        if (negotiationData.discount_requested_percent && negotiationData.discount_requested_percent > 20) {
          const priceObjection = 'High_Discount_Request';
          objectionMap.set(priceObjection, (objectionMap.get(priceObjection) || 0) + 1);

          if (!categoryObjections.has(category)) {
            categoryObjections.set(category, new Map());
          }
          const catObjections = categoryObjections.get(category)!;
          catObjections.set(priceObjection, (catObjections.get(priceObjection) || 0) + 1);
        }
      }
    });

    // Convert Maps to plain objects
    const categoryObj: Record<string, Record<string, number>> = {};
    categoryObjections.forEach((objections, category) => {
      categoryObj[category] = Object.fromEntries(objections);
    });

    const sellerPerformance = Array.from(sellerObjections.entries())
      .map(([sellerId, objections]) => {
        const totalCalls = Array.from(objections.values()).reduce((a, b) => a + b, 0);
        const objectionBreakdown = Object.fromEntries(objections);

        // Generate recommendations based on objections
        const recommendations: string[] = [];
        if (objectionBreakdown['Price']) {
          recommendations.push('Consider competitive pricing strategy');
        }
        if (objectionBreakdown['MOQ'] || objectionBreakdown['Specs']) {
          recommendations.push('Review minimum order quantities and specifications');
        }
        if (objectionBreakdown['Location']) {
          recommendations.push('Improve delivery coverage or partner with local distributors');
        }

        return {
          sellerId,
          objections: objectionBreakdown,
          recommendations
        };
      })
      .filter(seller => Object.keys(seller.objections).length > 0)
      .sort((a, b) => Object.values(b.objections).reduce((x, y) => x + y, 0) - Object.values(a.objections).reduce((x, y) => x + y, 0))
      .slice(0, 10);

    const actionableRecommendations = [
      `Address top objection "${Array.from(objectionMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0]}" affecting ${Math.round((Array.from(objectionMap.values()).reduce((a, b) => a + b, 0) / this.calls.length) * 100)}% of deals`,
      'Implement objection-specific training for sellers',
      'Create category-specific objection response guides',
      'Track objection resolution success rates'
    ];

    return {
      totalCalls: this.calls.length,
      objectionBreakdown: Object.fromEntries(objectionMap),
      categoryObjections: categoryObj,
      sellerPerformance,
      actionableRecommendations
    };
  }

  /**
   * Generate Language Compatibility Insights (Vernacular Matchmaker)
   */
  generateLanguageInsights(): LanguageInsights {
    // Mock language detection based on transcript patterns
    // In a real implementation, this would use language detection APIs
    const languagePatterns = {
      Hindi: ['hai', 'hai ji', 'nahi', 'kya', 'please', 'thank you', 'sir', 'bhaiya'],
      English: ['hello', 'yes', 'no', 'please', 'thank you', 'okay', 'price', 'quantity'],
      Gujarati: ['che', 'chu', 'thay', 'nathi', 'karvanu', 'banavu'],
      Tamil: ['iruku', 'illai', 'ungal', 'epdi', 'solunga'],
      Telugu: ['undi', 'ledhu', 'meeru', 'emiti', 'cheppandi'],
      Marathi: ['aahe', 'nahi', 'kiti', 'kasa', 'kriye'],
      Bengali: ['ache', 'nei', 'kemon', 'bhalo', 'dada']
    };

    const languageMap = new Map<string, number>();
    const mismatchPatterns: Array<{
      primary: string;
      secondary: string;
      failed: number;
      categories: Set<string>;
    }> = [];

    this.calls.forEach(call => {
      const langAnalysis = call.analysis?.language_analysis;
      const category = call.analysis?.category || 'Unknown';

      if (langAnalysis) {
        // Use real language analysis from enhanced API
        const primaryLang = langAnalysis.primary_language || 'Unknown';
        languageMap.set(primaryLang, (languageMap.get(primaryLang) || 0) + 1);

        // Check for language barriers from API response
        if (langAnalysis.language_barriers && langAnalysis.language_barriers !== 'None' && langAnalysis.language_barriers !== '') {
          // Try to infer secondary language from barriers description
          let secondaryLang = 'Unknown';
          Object.keys(languagePatterns).forEach(lang => {
            if (langAnalysis.language_barriers.toLowerCase().includes(lang.toLowerCase())) {
              secondaryLang = lang;
            }
          });

          let existing = mismatchPatterns.find(m =>
            (m.primary === primaryLang && m.secondary === secondaryLang) ||
            (m.primary === secondaryLang && m.secondary === primaryLang)
          );

          if (!existing) {
            existing = {
              primary: primaryLang,
              secondary: secondaryLang,
              failed: 0,
              categories: new Set()
            };
            mismatchPatterns.push(existing);
          }

          existing.failed++;
          existing.categories.add(category);
        }
      } else {
        // Fallback to basic pattern detection for older data
        const transcript = call.transcript || '';

        // Detect languages in transcript
        const detectedLanguages: string[] = [];
        Object.entries(languagePatterns).forEach(([lang, patterns]) => {
          const matches = patterns.filter(pattern =>
            transcript.toLowerCase().includes(pattern.toLowerCase())
          ).length;
          if (matches >= 2) { // At least 2 pattern matches
            detectedLanguages.push(lang);
            languageMap.set(lang, (languageMap.get(lang) || 0) + 1);
          }
        });

        // Check for language mismatch indicators
        const mismatchIndicators = [
          'samajh nahi aaya', 'english please', 'dheere bolo',
          'repeat please', 'slowly', 'understand'
        ];

        const hasMismatch = mismatchIndicators.some(indicator =>
          transcript.toLowerCase().includes(indicator)
        ) && detectedLanguages.length > 1;

        if (hasMismatch && detectedLanguages.length >= 2) {
          const primary = detectedLanguages[0];
          const secondary = detectedLanguages[1];

          let existing = mismatchPatterns.find(m =>
            (m.primary === primary && m.secondary === secondary) ||
            (m.primary === secondary && m.secondary === primary)
          );

          if (!existing) {
            existing = {
              primary,
              secondary,
              failed: 0,
              categories: new Set()
            };
            mismatchPatterns.push(existing);
          }

          existing.failed++;
          existing.categories.add(category);
        }
      }
    });

    const languageMismatches = mismatchPatterns
      .filter(m => m.failed >= 3)
      .map(m => ({
        primaryLanguage: m.primary,
        secondaryLanguage: m.secondary,
        failedCalls: m.failed,
        categories: Array.from(m.categories)
      }))
      .sort((a, b) => b.failedCalls - a.failedCalls);

    const actionableRecommendations = [
      `Implement language preference matching to reduce ${languageMismatches.reduce((sum, m) => sum + m.failedCalls, 0)} failed calls`,
      'Add language proficiency indicators to seller profiles',
      'Create multilingual support resources for sellers',
      'Prioritize language-matched leads in search results'
    ];

    return {
      totalCalls: this.calls.length,
      languageDistribution: Object.fromEntries(languageMap),
      languageMismatches,
      actionableRecommendations
    };
  }

  /**
   * Generate Responsiveness Audit Insights (Ghost Seller Detector)
   */
  generateResponsivenessInsights(): ResponsivenessInsights {
    const qualityMetrics = {
      highNoiseCalls: 0,
      poorToneCalls: 0,
      shortDurationCalls: 0
    };

    const sellerQualityMap = new Map<string, {
      totalCalls: number;
      qualityIssues: string[];
      shortCalls: number;
    }>();

    this.calls.forEach(call => {
      const analysis = call.analysis;
      const sellerId = analysis?.seller_id || call.metadata?.seller_id || 'Unknown';
      const duration = call.duration_seconds || 0;
      const responsivenessData = analysis?.responsiveness_analysis;

      let hasQualityIssues = false;
      const issues: string[] = [];

      // Use real responsiveness analysis if available
      if (responsivenessData) {
        // Check background noise
        if (responsivenessData.background_noise_level === 'medium' || responsivenessData.background_noise_level === 'high') {
          qualityMetrics.highNoiseCalls++;
          issues.push('noise');
          hasQualityIssues = true;
        }

        // Check call quality issues
        if (responsivenessData.call_quality_issues && responsivenessData.call_quality_issues.length > 0) {
          responsivenessData.call_quality_issues.forEach(issue => {
            if (issue.includes('noise')) {
              qualityMetrics.highNoiseCalls++;
              issues.push('noise');
            }
            if (issue.includes('tone') || responsivenessData.seller_tone === 'rude' || responsivenessData.seller_tone === 'sleepy') {
              qualityMetrics.poorToneCalls++;
              issues.push('tone');
            }
            hasQualityIssues = true;
          });
        }

        // Check call engagement
        if (responsivenessData.call_engagement === 'low_engagement') {
          qualityMetrics.shortDurationCalls++;
          issues.push('low_engagement');
          hasQualityIssues = true;
        }
      } else {
        // Fallback to basic pattern detection for older data
        // Short call detection (< 30 seconds often indicates poor quality)
        if (duration < 30) {
          qualityMetrics.shortDurationCalls++;
          issues.push('short_call');
          hasQualityIssues = true;
        }

        // Mock noise/tone detection based on transcript patterns
        const transcript = call.transcript || '';
        if (transcript.includes('hello?') || transcript.includes('can you hear me')) {
          qualityMetrics.highNoiseCalls++;
          issues.push('noise');
          hasQualityIssues = true;
        }

        // Mock tone analysis based on transcript patterns
        const negativePatterns = ['irritated', 'angry', 'wait', 'hold on'];
        if (negativePatterns.some(pattern => transcript.toLowerCase().includes(pattern))) {
          qualityMetrics.poorToneCalls++;
          issues.push('tone');
          hasQualityIssues = true;
        }
      }

      if (!sellerQualityMap.has(sellerId)) {
        sellerQualityMap.set(sellerId, {
          totalCalls: 0,
          qualityIssues: [],
          shortCalls: 0
        });
      }

      const sellerData = sellerQualityMap.get(sellerId)!;
      sellerData.totalCalls++;

      if (issues.includes('short_call') || issues.includes('low_engagement')) {
        sellerData.shortCalls++;
      }

      if (hasQualityIssues) {
        sellerData.qualityIssues.push(...issues);
      }
    });

    const sellerQualityScores = Array.from(sellerQualityMap.entries())
      .map(([sellerId, data]) => {
        const qualityScore = Math.max(0, 100 - (
          (data.qualityIssues.length / data.totalCalls) * 50 +
          (data.shortCalls / data.totalCalls) * 50
        ));

        const uniqueIssues = [...new Set(data.qualityIssues)];
        const issues: string[] = [];
        if (uniqueIssues.includes('noise')) issues.push('Background noise affecting calls');
        if (uniqueIssues.includes('tone')) issues.push('Poor call etiquette detected');
        if (uniqueIssues.includes('short_call')) issues.push('Calls ending prematurely');

        return {
          sellerId,
          qualityScore: Math.round(qualityScore),
          issues
        };
      })
      .filter(seller => seller.qualityScore < 80 && seller.issues.length > 0)
      .sort((a, b) => a.qualityScore - b.qualityScore)
      .slice(0, 10);

    const actionableRecommendations = [
      `Improve call quality for ${sellerQualityScores.length} sellers with scores below 80`,
      'Implement call quality monitoring and feedback system',
      'Provide training on call etiquette and environment setup',
      'Create quality-based seller ranking system'
    ];

    return {
      totalCalls: this.calls.length,
      qualityMetrics,
      sellerQualityScores,
      actionableRecommendations
    };
  }

  /**
   * Generate Product Gap Analysis Insights (Unmet Demand Spotter)
   */
  generateDemandGapInsights(): DemandGapInsights {
    const demandPatterns = new Map<string, {
      frequency: number;
      categories: Set<string>;
    }>();

    // Common specification requests found in transcripts
    const specPatterns = [
      // Colors
      'pink', 'orange', 'purple', 'maroon', 'cream', 'beige', 'navy', 'royal blue', 'sky blue',
      // Materials
      'eco-friendly', 'biodegradable', 'recycled', 'organic', 'stainless steel', 'brass', 'copper',
      // Features
      'waterproof', 'weatherproof', 'fire-resistant', 'anti-slip', 'non-slip', 'adjustable', 'foldable',
      'portable', 'compact', 'mini', 'heavy-duty', 'lightweight', 'durable', 'premium quality',
      // Technologies
      'solar', 'battery-operated', 'rechargeable', 'usb', 'wireless', 'bluetooth', 'smart', 'automatic',
      'voice-controlled', 'app-controlled', 'remote-controlled', 'sensor-based',
      // Sizes
      'extra small', 'extra large', 'king size', 'queen size', 'jumbo', 'bulk', 'wholesale',
      // Certifications
      'iso certified', 'fssai', 'bis', 'ce certified', 'rohs compliant', 'organic certified'
    ];

    this.calls.forEach(call => {
      const demandAnalysis = call.analysis?.demand_gap_analysis;
      const category = call.analysis?.category || 'Unknown';

      if (demandAnalysis) {
        // Use real demand gap analysis from enhanced API
        const allRequirements = [
          ...(demandAnalysis.unmet_requirements || []),
          ...(demandAnalysis.market_gaps_identified || []),
          ...(demandAnalysis.buyer_suggestions || []),
          ...(demandAnalysis.competitive_advantages_needed || [])
        ];

        allRequirements.forEach(requirement => {
          if (requirement && requirement.trim()) {
            if (!demandPatterns.has(requirement)) {
              demandPatterns.set(requirement, { frequency: 0, categories: new Set() });
            }
            const pattern = demandPatterns.get(requirement)!;
            pattern.frequency++;
            pattern.categories.add(category);
          }
        });
      } else {
        // Fallback to pattern matching for older data
        const transcript = call.transcript || '';

        specPatterns.forEach(spec => {
          if (transcript.toLowerCase().includes(spec.toLowerCase())) {
            if (!demandPatterns.has(spec)) {
              demandPatterns.set(spec, { frequency: 0, categories: new Set() });
            }
            const pattern = demandPatterns.get(spec)!;
            pattern.frequency++;
            pattern.categories.add(category);
          }
        });
      }
    });

    const unmetDemands = Array.from(demandPatterns.entries())
      .map(([spec, data]) => ({
        specification: spec,
        category: Array.from(data.categories)[0] || 'Multiple',
        frequency: data.frequency,
        percentage: Math.round((data.frequency / this.calls.length) * 100 * 10) / 10
      }))
      .filter(demand => demand.frequency >= 5) // At least 5 mentions
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20);

    // Group by category
    const categoryGaps: Record<string, Array<{
      spec: string;
      demand: number;
      supply: number;
    }>> = {};

    unmetDemands.forEach(demand => {
      if (!categoryGaps[demand.category]) {
        categoryGaps[demand.category] = [];
      }
      categoryGaps[demand.category].push({
        spec: demand.specification,
        demand: demand.frequency,
        supply: 0 // Mock - in real implementation, this would come from catalog analysis
      });
    });

    const actionableRecommendations = [
      `Create ${unmetDemands.length} new product filters based on buyer demand patterns`,
      'Launch targeted marketing campaigns for high-demand specifications',
      'Encourage sellers to add popular specifications to their listings',
      'Monitor demand trends to predict future product category needs'
    ];

    return {
      totalCalls: this.calls.length,
      unmetDemands,
      categoryGaps,
      actionableRecommendations
    };
  }
}

// Singleton instance for easy access
export const insightsEngine = new VoiceInsightsEngine();
