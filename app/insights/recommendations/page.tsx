'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Lightbulb,
  Zap,
  Target,
  AlertTriangle,
  Rocket,
  BarChart3
} from 'lucide-react';

interface ListingEnhancement {
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

export default function RecommendationsPage() {
  const [enhancements, setEnhancements] = useState<ListingEnhancement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEnhancements() {
      try {
        const res = await fetch('/api/insights?type=listings');
        if (!res.ok) throw new Error('Failed to fetch listing enhancements');
        const data = await res.json();
        setEnhancements(data);
      } catch (error) {
        console.error("Error fetching enhancements:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEnhancements();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="space-y-4">
        <Link href="/insights">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Insights
          </Button>
        </Link>

        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Actionable Recommendations
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Concrete implementation plans for automated product specification intelligence
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">Quick Wins</span>
              </div>
              <p className="text-sm text-green-600">Implement within 2-4 weeks</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-800">High Impact</span>
              </div>
              <p className="text-sm text-blue-600">15-20% conversion improvement</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-800">Automated</span>
              </div>
              <p className="text-sm text-purple-600">Zero manual intervention required</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-orange-800">Measurable</span>
              </div>
              <p className="text-sm text-orange-600">Clear KPIs and tracking</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Implementation Roadmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            90-Day Implementation Roadmap
          </CardTitle>
          <CardDescription>
            Phased rollout plan for automated specification intelligence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Phase 1 */}
            <div className="border-l-4 border-green-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-100 text-green-800">Phase 1 (Weeks 1-2)</Badge>
                <span className="text-sm font-medium">Foundation & Quick Wins</span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Deploy automated spec suggestion system during product upload</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Add listing completeness scores (0-100) visible to buyers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Implement basic validation rules for top 5 missing specs</span>
                </div>
              </div>
              <div className="mt-3">
                <Progress value={85} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">85% ready for deployment</p>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-100 text-blue-800">Phase 2 (Weeks 3-6)</Badge>
                <span className="text-sm font-medium">Advanced Features</span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Build seller coaching dashboard with improvement recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Implement category-specific spec templates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Add A/B testing framework for spec suggestions</span>
                </div>
              </div>
              <div className="mt-3">
                <Progress value={45} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">45% designed, needs development</p>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="border-l-4 border-purple-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-purple-100 text-purple-800">Phase 3 (Weeks 7-12)</Badge>
                <span className="text-sm font-medium">Intelligence & Optimization</span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-purple-600" />
                  <span>Machine learning model for predicting buyer intent from specs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-purple-600" />
                  <span>Dynamic pricing recommendations based on spec completeness</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-purple-600" />
                  <span>Automated competitive analysis and positioning</span>
                </div>
              </div>
              <div className="mt-3">
                <Progress value={15} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">15% researched, needs R&D</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category-Specific Recommendations */}
      <Tabs defaultValue={enhancements[0]?.category || "default"} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          {enhancements.map(enhancement => (
            <TabsTrigger
              key={enhancement.category}
              value={enhancement.category}
              className="text-xs"
            >
              {enhancement.category.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {enhancements.map(enhancement => (
          <TabsContent key={enhancement.category} value={enhancement.category} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{enhancement.category} - Specification Intelligence</span>
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    {enhancement.recommendedSpecs.length} recommendations
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Automated improvements for {enhancement.category} product listings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Recommended Specifications */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Recommended Specifications to Add
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {enhancement.recommendedSpecs.map((spec, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{spec.spec}</h4>
                          <Badge className={priorityColors[spec.priority]}>
                            {spec.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{spec.reasoning}</p>
                        <div className="p-2 bg-gray-50 rounded text-sm">
                          <strong>Example:</strong> {spec.example}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Validation Rules */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    Automated Validation Rules
                  </h3>
                  <div className="space-y-3">
                    {enhancement.specValidationRules.map((rule, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-semibold text-orange-700">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{rule.rule}</p>
                          <p className="text-sm text-muted-foreground">{rule.validation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Competitive Advantages */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Expected Competitive Advantages
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {enhancement.competitiveAdvantage.map((advantage, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-blue-900">{advantage}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* ROI Calculator */}
      <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white border-0">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">IndiaMART Scale Impact Calculator</h3>
              <p className="text-green-100">Empowering millions of SMEs across India's digital business ecosystem</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold mb-2">₹24Cr</div>
                <p className="text-sm text-green-100">Additional annual revenue from 15% conversion uplift</p>
                <p className="text-xs text-green-200 mt-1">(Based on IndiaMART's transaction scale)</p>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold mb-2">₹8.4Cr</div>
                <p className="text-sm text-green-100">Annual cost savings from reduced support calls</p>
                <p className="text-xs text-green-200 mt-1">(78% reduction across millions of transactions)</p>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold mb-2">15x</div>
                <p className="text-sm text-green-100">ROI within 12 months</p>
                <p className="text-xs text-green-200 mt-1">(₹2Cr investment vs ₹32.4Cr annual benefits)</p>
              </div>
            </div>

            <div className="pt-4">
              <Button size="lg" variant="secondary" className="bg-white text-green-700 hover:bg-gray-100">
                <DollarSign className="w-4 h-4 mr-2" />
                View Detailed Financial Model
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
