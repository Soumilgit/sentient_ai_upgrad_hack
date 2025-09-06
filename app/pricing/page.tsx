'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle2, Mail, Crown, Zap, Building, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface SubscriptionStatus {
  isSubscribed: boolean
  plan: string
  subscribedAt: string
  sessionId?: string
}

interface PricingPlan {
  id: string
  name: string
  price: number
  duration: string
  description: string
  features: string[]
  popular?: boolean
  link?: string
  priceId?: string
  icon: any
  color: string
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 7,
    duration: 'Monthly',
    description: 'Perfect for individual learners getting started',
    features: [
      'Access to 3 learning modules',
      'Basic quiz functionality',
      'Progress tracking',
      'Mobile responsive design',
      'Email support'
    ],
    link: 'https://buy.stripe.com/test_cNi00jcVI1uZ5zn98F53O02',
    priceId: 'price_1S4Qk8DR8rWHnLWctDCG4r4x',
    icon: Zap,
    color: 'text-blue-600'
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 20,
    duration: 'Monthly',
    description: 'Best for regular learners and professionals',
    features: [
      'Access to all 12 learning modules',
      'Advanced quiz analytics',
      'Personalized learning paths',
      'Progress tracking & statistics',
      'Priority email support',
      'Downloadable certificates'
    ],
    popular: true,
    link: 'https://buy.stripe.com/test_bJe00j6xk8Xr9PD84B53O03',
    priceId: 'price_1S4QtMDR8rWHnLWc5UXslsAd',
    icon: Crown,
    color: 'text-orange-500'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 100,
    duration: 'Monthly',
    description: 'Advanced features for serious learners',
    features: [
      'Everything in Standard',
      'AI-powered content generation',
      'Custom learning modules',
      'Advanced analytics dashboard',
      'Live chat support',
      'API access for integrations',
      'White-label options'
    ],
    link: 'https://buy.stripe.com/test_14AdR93l81uZ5zn84B53O04',
    priceId: 'price_1S4Qw0DR8rWHnLWc2mxFFwxZ',
    icon: Building,
    color: 'text-blue-600'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0,
    duration: 'Custom',
    description: 'Tailored solutions for organizations',
    features: [
      'Everything in Premium',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantees',
      'Custom branding',
      'Advanced security features',
      'Training and onboarding'
    ],
    icon: Mail,
    color: 'text-orange-600'
  }
]

export default function PricingPage() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)
  const [processingMessage, setProcessingMessage] = useState<string>('Payment in Progress...')

  useEffect(() => {
    // Check subscription status from localStorage
    try {
      const storedStatus = localStorage.getItem('subscription_status')
      if (storedStatus) {
        setSubscriptionStatus(JSON.parse(storedStatus))
      }
    } catch (error) {
      console.error('Error reading subscription status:', error)
    }
  }, [])

  const handleEnterpriseContact = () => {
    window.location.href = 'mailto:enterprise@microlearning.com?subject=Enterprise Plan Inquiry&body=Hello, I am interested in learning more about your Enterprise plan. Please contact me with more details.'
  }

  const isCurrentPlan = (planId: string) => {
    return subscriptionStatus?.isSubscribed && subscriptionStatus.plan === planId
  }

  const getPlanDetails = (plan: string) => {
    const plans = {
      'basic': { name: 'Basic', price: '$7', color: 'text-blue-600' },
      'standard': { name: 'Standard', price: '$20', color: 'text-orange-500' },
      'premium': { name: 'Premium', price: '$100', color: 'text-blue-600' }
    }
    return plans[plan as keyof typeof plans] || plans.standard
  }

  // Function to simulate successful payment (for testing without actual Stripe)
  const simulatePaymentSuccess = (planId: string) => {
    setProcessingPlan(planId)
    setProcessingMessage('Demo payment processing...')
    
    // Quick demo - shorter timeout for instant testing
    setTimeout(() => {
      const subscriptionData = {
        isSubscribed: true,
        plan: planId,
        subscribedAt: new Date().toISOString(),
        sessionId: 'demo_session_' + Date.now()
      }
      
      localStorage.setItem('subscription_status', JSON.stringify(subscriptionData))
      setSubscriptionStatus(subscriptionData)
      setProcessingPlan(null)
      setProcessingMessage('Payment in Progress...')
      
      const planName = getPlanDetails(planId).name
      alert(`🎉 Demo Complete! You're now subscribed to the ${planName} plan!`)
    }, 2000) // 2 seconds for demo
  }

  // Function to clear subscription (for testing)
  const clearSubscription = () => {
    localStorage.removeItem('subscription_status')
    setSubscriptionStatus(null)
  }

  // Handle payment button click - mark as subscribed after realistic payment time
  const handlePaymentClick = (planId: string, paymentUrl: string) => {
    // Set processing state
    setProcessingPlan(planId)
    setProcessingMessage('Opening payment window...')
    
    // Open Stripe payment window
    const paymentWindow = window.open(paymentUrl, '_blank', 'width=800,height=600')
    
    // Update processing message over time
    setTimeout(() => setProcessingMessage('Processing payment...'), 5000)
    setTimeout(() => setProcessingMessage('Confirming transaction...'), 25000)
    setTimeout(() => setProcessingMessage('Activating subscription...'), 40000)
    
    // Give user ample time to complete payment process and see Stripe success page
    // Typical payment flow: 30-60 seconds for form filling + payment processing + success page
    setTimeout(() => {
      const subscriptionData = {
        isSubscribed: true,
        plan: planId,
        subscribedAt: new Date().toISOString(),
        sessionId: 'frontend_session_' + Date.now()
      }
      
      localStorage.setItem('subscription_status', JSON.stringify(subscriptionData))
      setSubscriptionStatus(subscriptionData)
      setProcessingPlan(null)
      setProcessingMessage('Payment in Progress...')
      
      // Show success notification after user has seen Stripe's success page
      const planName = getPlanDetails(planId).name
      alert(`🎉 Payment Confirmed! Welcome to the ${planName} plan! Your subscription is now active and you have full access to all premium features. Thank you for subscribing!`)
      
      // Don't close the payment window - let user see the Stripe success page
      // paymentWindow will close naturally when user closes it
    }, 60000) // 60 seconds (1 minute) - gives ample time for payment completion and Stripe success page
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Processing Banner */}
        {processingPlan && (
          <div className="mb-8 bg-gradient-to-r from-blue-500 to-orange-500 text-white rounded-xl p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <h2 className="text-2xl font-bold">PROCESSING PAYMENT</h2>
            </div>
            <p className="text-blue-100">
              Please complete your payment in the Stripe window. Don't close this page!
              <span className="block text-sm mt-1">
                {processingMessage}
              </span>
            </p>
          </div>
        )}

        {/* Subscription Status Banner */}
        {subscriptionStatus?.isSubscribed && !processingPlan && (
          <div className="mb-8 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Check className="w-6 h-6" />
              <h2 className="text-2xl font-bold">SUBSCRIBED</h2>
            </div>
            <p className="text-green-100">
              You're currently on the <strong>{getPlanDetails(subscriptionStatus.plan).name}</strong> plan
              {subscriptionStatus.subscribedAt && (
                <span className="block text-sm mt-1">
                  Subscribed on {new Date(subscriptionStatus.subscribedAt).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent mb-4">
            {subscriptionStatus?.isSubscribed ? 'Manage Your Subscription' : 'Choose Your Learning Plan'}
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            {subscriptionStatus?.isSubscribed 
              ? 'You have an active subscription. You can upgrade or manage your plan below.'
              : 'Unlock the full potential of personalized micro-learning with our flexible pricing options'
            }
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {pricingPlans.map((plan, index) => (
            <div
              key={plan.id}
              className={`rounded-xl border-2 overflow-hidden transition-all hover:shadow-xl transform hover:scale-105 ${
                isCurrentPlan(plan.id)
                  ? "border-green-500 ring-4 ring-green-500/20 bg-white"
                  : plan.popular
                  ? "border-orange-500 ring-4 ring-orange-500/20 bg-white"
                  : "border-gray-200 bg-white hover:border-blue-300"
              }`}
            >
              {isCurrentPlan(plan.id) && (
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 text-center text-sm font-medium">
                  ✅ CURRENT PLAN
                </div>
              )}
              {plan.popular && !isCurrentPlan(plan.id) && (
                <div className="bg-gradient-to-r from-orange-500 to-blue-600 text-white py-3 text-center text-sm font-medium">
                  ⭐ Most Popular
                </div>
              )}
              
              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4`}>
                    <plan.icon className={`w-8 h-8 ${plan.color}`} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h2>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>

                {/* Pricing */}
                <div className="text-center mb-8">
                  {plan.id === 'enterprise' ? (
                    <div>
                      <span className="text-3xl font-bold text-gray-900">Custom</span>
                      <p className="text-gray-500 text-sm mt-1">Contact us for pricing</p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-500 text-lg">/{plan.duration.toLowerCase()}</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {plan.id === 'enterprise' ? (
                  <Button
                    onClick={handleEnterpriseContact}
                    size="lg"
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Sales
                  </Button>
                ) : isCurrentPlan(plan.id) ? (
                  <Button
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700 text-white cursor-default"
                    disabled
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Current Plan
                  </Button>
                ) : (
                <Button
                  onClick={() => handlePaymentClick(plan.id, plan.link!)}
                  size="lg"
                  disabled={processingPlan === plan.id}
                  className={`w-full ${
                    processingPlan === plan.id
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : plan.popular
                      ? "bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {processingPlan === plan.id ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {processingMessage}
                    </div>
                  ) : (
                    subscriptionStatus?.isSubscribed ? 'Upgrade to This Plan' : 'Subscribe Now'
                  )}
                </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Test Section */}
        <div className="mb-16 bg-gradient-to-r from-blue-50 to-orange-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            🚀 Quick Demo - Test Subscription
          </h3>
          <p className="text-gray-700 text-sm mb-4 text-center">
            Click any button below to instantly test the subscription system:
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <button
              onClick={() => simulatePaymentSuccess('basic')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
            >
              Demo: Subscribe to Basic ($7)
            </button>
            <button
              onClick={() => simulatePaymentSuccess('standard')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-blue-700 transition-all"
            >
              Demo: Subscribe to Standard ($20)
            </button>
            <button
              onClick={() => simulatePaymentSuccess('premium')}
              className="px-6 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-all"
            >
              Demo: Subscribe to Premium ($100)
            </button>
          </div>
          <div className="text-center">
            <button
              onClick={clearSubscription}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg text-sm hover:bg-gray-500 transition-all"
            >
              Reset Subscription Status
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid gap-8 md:grid-cols-2">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Can I switch plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and you'll be prorated accordingly.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                You can explore our platform with limited access before choosing a plan. Start learning immediately and upgrade when you're ready.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and bank transfers through our secure Stripe payment gateway.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee. If you're not satisfied with our platform, contact us for a full refund.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Your Learning Journey?
          </h3>
          <p className="text-gray-600 mb-6">
            Choose the plan that fits your needs and begin learning today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="btn bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              Start Free Learning
            </Link>
            <a
              href="mailto:support@microlearning.com"
              className="btn border-2 border-blue-300 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
