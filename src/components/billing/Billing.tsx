import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Zap, 
  Shield, 
  Crown, 
  ArrowRight, 
  CreditCard, 
  Clock, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';

const STANDARD_PLANS = [
  {
    id: 'standard-basic',
    name: 'Basic',
    monthlyPrice: 35, // USD
    description: 'Perfect for small groups and local foundations.',
    features: [
      'Up to 1,000 contacts',
      'Bulk SMS campaigns',
      '2 Team members',
      'Contact grouping & tagging',
      'Standard analytics',
      'Email support'
    ],
    icon: Zap,
    color: 'bg-blue-50 text-blue-600',
    buttonColor: 'bg-blue-600 hover:bg-blue-700'
  },
  {
    id: 'standard-growth',
    name: 'Growth',
    monthlyPrice: 69, // USD
    description: 'Ideal for expanding organizations needing more reach.',
    features: [
      'Up to 5,000 contacts',
      'Bulk SMS & WhatsApp campaigns',
      '5 Team members',
      'AI message assistance',
      'Advanced analytics dashboard',
      'Priority email support'
    ],
    icon: Shield,
    color: 'bg-green-50 text-green-600',
    buttonColor: 'bg-green-600 hover:bg-green-700',
    popular: true
  },
  {
    id: 'standard-pro',
    name: 'Professional',
    monthlyPrice: 189, // USD
    description: 'Full-featured toolkit for high-impact organizations.',
    features: [
      'Up to 20,000 contacts',
      'SMS, WhatsApp & AI Voice calls',
      '20 Team members',
      'Automated follow-ups',
      'Custom reporting exports',
      '24/7 Priority support'
    ],
    icon: Crown,
    color: 'bg-purple-50 text-purple-600',
    buttonColor: 'bg-purple-600 hover:bg-purple-700'
  },
  {
    id: 'standard-elite',
    name: 'Elite',
    monthlyPrice: 399, // USD
    description: 'Enterprise-grade capacity for large scale impact.',
    features: [
      'Unlimited contacts',
      'Unlimited outreach campaigns',
      'Unlimited team members',
      'Dedicated account manager',
      'Full API & Webhook access',
      'Custom branding options',
      'Onboarding training sessions'
    ],
    icon: CreditCard,
    color: 'bg-gray-900 text-white',
    buttonColor: 'bg-gray-900 hover:bg-black'
  }
];

const POLITICAL_PLANS = [
  {
    id: 'poly-essential',
    name: 'Campaign Essential',
    monthlyPrice: 990, // USD
    description: 'Core tools for local and regional campaigns.',
    features: [
      'Up to 50,000 voter contacts',
      'High-throughput SMS & Calls',
      '10 Campaign staff members',
      'Voter data management',
      'Campaign performance tracking',
      'Next-day support response'
    ],
    icon: Zap,
    color: 'bg-blue-50 text-blue-600',
    buttonColor: 'bg-blue-600 hover:bg-blue-700'
  },
  {
    id: 'poly-pro',
    name: 'Campaign Pro',
    monthlyPrice: 1990, // USD
    description: 'Advanced capabilities for competitive races.',
    features: [
      'Up to 200,000 voter contacts',
      'Omnichannel voter outreach',
      '50 Campaign staff members',
      'Smart voter segmentation',
      'Real-time engagement analytics',
      'Dedicated campaign specialist',
      'Volunteer management portal'
    ],
    icon: Shield,
    color: 'bg-green-50 text-green-600',
    buttonColor: 'bg-green-600 hover:bg-green-700',
    popular: true
  },
  {
    id: 'poly-elite',
    name: 'Presidential',
    monthlyPrice: 2990, // USD
    description: 'Max capacity for nation-wide campaign dominance.',
    features: [
      'Unlimited voter contacts',
      'Nation-wide broadcasting capacity',
      'Unlimited campaign staff',
      'Custom AI voter interaction',
      '24/7 Dedicated War-Room support',
      'Advanced geographic heatmaps',
      'Voter sentiment analysis AI'
    ],
    icon: Crown,
    color: 'bg-purple-50 text-purple-600',
    buttonColor: 'bg-purple-600 hover:bg-purple-700'
  }
];

export function Billing() {
  const { user, profile, organization, refreshAuth } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [contactCount, setContactCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (profile?.orgId) {
        try {
          const [contactsRes] = await Promise.all([
            api.get('/contacts'),
          ]);
          setContactCount(contactsRes.data.length);
        } catch (err) {
          console.error('Billing fetch error:', err);
        }
      }
    };
    fetchData();
  }, [profile]);

  const isPolitical = organization?.type === 'Political Organization';
  const plans = isPolitical ? POLITICAL_PLANS : STANDARD_PLANS;

  const getPrice = (monthlyPrice: number) => {
    if (billingCycle === 'yearly') {
      return monthlyPrice * 12 * 0.85; // 15% discount
    }
    return monthlyPrice;
  };

  const getMonthlyEquivalent = (monthlyPrice: number) => {
    if (billingCycle === 'yearly') {
      return monthlyPrice * 0.85; // 15% off
    }
    return monthlyPrice;
  };

  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const config = {
    reference: (new Date()).getTime().toString(),
    email: user?.email || "",
    amount: selectedPlan ? Math.floor(getPrice(selectedPlan.monthlyPrice) * 100) : 0,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
    currency: "USD",
    metadata: {
      custom_fields: [
        {
          display_name: "Org ID",
          variable_name: "orgId",
          value: profile?.orgId
        },
        {
          display_name: "Plan ID",
          variable_name: "planId",
          value: selectedPlan?.id
        },
        {
          display_name: "Billing Cycle",
          variable_name: "billingCycle",
          value: billingCycle
        }
      ]
    }
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (reference: any) => {
    if (!profile?.orgId || !selectedPlan) return;
    
    try {
      await api.patch(`/organizations/${profile.orgId}`, {
        subscription: {
          planId: selectedPlan.id,
          status: 'active',
          billingCycle: billingCycle,
          lastPaymentReference: reference.reference,
          updatedAt: Date.now()
        }
      });
      await refreshAuth?.();
      window.location.href = window.location.pathname + '?success=true';
    } catch (err: any) {
      setError("Payment successful but failed to update status. Please contact support.");
    }
    setLoadingPlan(null);
  };

  const onClose = () => {
    setLoadingPlan(null);
    setSelectedPlan(null);
  };

  useEffect(() => {
    if (selectedPlan && loadingPlan === selectedPlan.id) {
      initializePayment({ onSuccess, onClose });
    }
  }, [selectedPlan, loadingPlan]);

  const handleSubscribe = (plan: any) => {
    if (!user || !profile?.orgId) return;
    
    if (!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) {
      setError("Payment system is not configured. Please contact the administrator.");
      return;
    }

    setLoadingPlan(plan.id);
    setSelectedPlan(plan);
    setError(null);
  };

  const isSuccess = new URLSearchParams(window.location.search).get('success') === 'true';
  const isCanceled = new URLSearchParams(window.location.search).get('canceled') === 'true';
  const isSubscriptionActive = organization?.subscription?.status === 'active';
  const hasReachedLimit = !isSubscriptionActive && contactCount >= 10;

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {!isSubscriptionActive && (
        <div className={cn(
          "max-w-4xl mx-auto p-6 rounded-3xl flex flex-col md:flex-row items-center gap-6",
          hasReachedLimit 
            ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 animate-pulse" 
            : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50"
        )}>
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0",
            hasReachedLimit ? "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400" : "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
          )}>
            {hasReachedLimit ? <AlertCircle className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
          </div>
          <div className="flex-1 text-center md:text-left space-y-1">
            <h3 className={cn(
              "text-xl font-black uppercase tracking-tight",
              hasReachedLimit ? "text-red-950 dark:text-red-200" : "text-blue-950 dark:text-blue-200"
            )}>
              {hasReachedLimit ? "Trial Limit Reached" : "Free Trial Active"}
            </h3>
            <p className={cn(
              "text-sm font-bold uppercase tracking-widest opacity-80",
              hasReachedLimit ? "text-red-800 dark:text-red-300" : "text-blue-800 dark:text-blue-300"
            )}>
              {hasReachedLimit 
                ? "You've used all 10 trial slots. Upgrade to a plan to continue your outreach." 
                : `You are currently using the free trial. You have used ${contactCount} of 10 available slots.`}
            </p>
          </div>
        </div>
      )}

      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-blue-100 dark:border-blue-800">
          {organization?.type || 'Standard'} Pricing
        </div>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Choose your plan</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg">
          {isPolitical 
            ? "Strategic outreach solutions tailored for political campaigns and voter engagement."
            : "Scale your outreach with our flexible pricing plans. No hidden fees, cancel anytime."}
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <span className={cn("text-sm font-bold transition-colors", billingCycle === 'monthly' ? "text-gray-900 dark:text-white" : "text-gray-400")}>Monthly</span>
          <button 
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="w-16 h-8 bg-gray-200 dark:bg-gray-800 rounded-full p-1 relative transition-colors"
          >
            <div className={cn(
              "w-6 h-6 bg-white dark:bg-blue-600 rounded-full shadow-md transition-all duration-300",
              billingCycle === 'yearly' ? "translate-x-8" : "translate-x-0"
            )} />
          </button>
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-bold transition-colors", billingCycle === 'yearly' ? "text-gray-900 dark:text-white" : "text-gray-400")}>Yearly</span>
            <span className="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Save 15%</span>
          </div>
        </div>
      </div>

      {(isSuccess || isCanceled || error) && (
        <div className={cn(
          "max-w-2xl mx-auto p-4 rounded-2xl flex items-center gap-3",
          isSuccess ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800" : 
          isCanceled ? "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800" :
          "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
        )}>
          {isSuccess ? <Zap className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="font-medium">
            {isSuccess ? "Subscription successful! Your account is being updated." : 
             isCanceled ? "Checkout was canceled. No charges were made." :
             error}
          </p>
        </div>
      )}

      <div className={cn(
        "grid grid-cols-1 gap-8",
        plans.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
      )}>
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={cn(
              "relative bg-white dark:bg-gray-800 rounded-3xl p-8 border-2 transition-all flex flex-col",
              plan.popular ? "border-blue-600 shadow-2xl dark:shadow-none lg:scale-105 z-10" : "border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-900"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
            )}

            <div className="flex flex-col mb-6">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", plan.color)}>
                <plan.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{plan.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{plan.description}</p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-gray-900 dark:text-white">${getMonthlyEquivalent(plan.monthlyPrice).toLocaleString()}</span>
                <span className="text-gray-500 dark:text-gray-400 font-bold text-sm">/mo</span>
              </div>
              {billingCycle === 'yearly' && (
                <div className="space-y-1 mt-1">
                  <p className="text-xs text-green-600 dark:text-green-400 font-bold">
                    Billed annually (${getPrice(plan.monthlyPrice).toLocaleString()}/yr)
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium italic">
                    Save ${Math.floor(plan.monthlyPrice * 12 * 0.15).toLocaleString()} per year
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4 flex-1 mb-8">
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">What's included</div>
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border border-green-100 dark:border-green-800">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-tight">{feature}</span>
                </div>
              ))}
            </div>

            <button 
              disabled={loadingPlan !== null}
              onClick={() => handleSubscribe(plan)}
              className={cn(
                "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 group shadow-lg disabled:opacity-50 disabled:cursor-not-allowed",
                plan.buttonColor
              )}
            >
              {loadingPlan === plan.id ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Select Plan</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
