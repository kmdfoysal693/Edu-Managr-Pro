import React, { useMemo, useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  getSubscriptionPlanById,
  SUBSCRIPTION_PLANS,
} from '../../data/subscriptionPlans';
import {
  SubscriptionOrder,
  SubscriptionPaymentMethod,
  SubscriptionPlan,
} from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { printElement } from '../../utils/printUtils';
import { downloadSubscriptionPdf } from '../../utils/subscriptionPdf';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  CreditCard,
  Download,
  Eye,
  FileText,
  History,
  Landmark,
  Phone,
  Printer,
  Search,
  ShieldCheck,
  Smartphone,
  User,
  Wallet,
} from 'lucide-react';

type CheckoutStep = 'catalog' | 'confirm' | 'payment' | 'receipt';
type ActiveTab = 'plans' | 'myplan' | 'history';

const PAYMENT_GATEWAYS: Array<{
  id: SubscriptionPaymentMethod;
  label: string;
  subtitle: string;
  accountTitle: string;
  accountDetails: string;
  instructions: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  icon: React.ElementType;
}> = [
  {
    id: 'bKash',
    label: 'bKash',
    subtitle: 'Mobile Wallet',
    accountTitle: 'bKash Merchant Account',
    accountDetails: '01700-000000 (Merchant Pay / Send Money)',
    instructions:
      'Open bKash App or dial *247#, complete payment to the merchant wallet above, then enter your sender number and TrxID below.',
    accentBg: 'bg-rose-50/70',
    accentBorder: 'border-rose-500',
    accentText: 'text-rose-700',
    icon: Smartphone,
  },
  {
    id: 'Rocket',
    label: 'Rocket',
    subtitle: 'DBBL Mobile Banking',
    accountTitle: 'Rocket Merchant Account',
    accountDetails: '01800-000000-0 (DBBL Rocket)',
    instructions:
      'Use the Rocket App or dial *322# to send the payable subscription amount, then enter your 12-digit Rocket number and TrxID.',
    accentBg: 'bg-violet-50/70',
    accentBorder: 'border-violet-600',
    accentText: 'text-violet-700',
    icon: Wallet,
  },
  {
    id: 'Nagad',
    label: 'Nagad',
    subtitle: 'Digital Wallet',
    accountTitle: 'Nagad Merchant Account',
    accountDetails: '01900-000000 (Nagad Merchant)',
    instructions:
      'Pay using Nagad App or *167# to the merchant account above and submit your Nagad number and transaction reference.',
    accentBg: 'bg-amber-50/70',
    accentBorder: 'border-amber-500',
    accentText: 'text-amber-700',
    icon: Smartphone,
  },
  {
    id: 'Bank Transfer',
    label: 'Bank',
    subtitle: 'EFT / Deposit',
    accountTitle: 'City Bank PLC · Motijheel Branch',
    accountDetails: 'A/C No: 1102-3344-5566-001 · Routing: 225274368',
    instructions:
      'Transfer via BEFTN, NPSB, RTGS, or branch cash deposit to the institutional account above and provide your slip or reference ID.',
    accentBg: 'bg-blue-50/70',
    accentBorder: 'border-blue-600',
    accentText: 'text-blue-700',
    icon: Landmark,
  },
];

export const SubscriptionPlans: React.FC = () => {
  const {
    activeSubscription,
    activePlan,
    subscriptionOrders,
    trialRegistrations,
    subscriptionUsage,
    purchaseSubscription,
    schoolSettings,
    userProfile,
    showToast,
  } = useSchool();

  const [activeTab, setActiveTab] = useState<ActiveTab>('plans');
  const [step, setStep] = useState<CheckoutStep>('catalog');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isDetailsConfirmed, setIsDetailsConfirmed] = useState<boolean>(false);

  // Payment & Subscriber Form States
  const [paymentMethod, setPaymentMethod] = useState<SubscriptionPaymentMethod>('bKash');
  const [payerName, setPayerName] = useState<string>(userProfile.name || '');
  const [payerPhone, setPayerPhone] = useState<string>(schoolSettings.phone || '');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [bankName, setBankName] = useState<string>('City Bank PLC');

  // Completed / Preview Receipt State
  const [completedOrder, setCompletedOrder] = useState<SubscriptionOrder | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<SubscriptionOrder | null>(null);

  // My Plan & History View States
  const [selectedMyPlanOrderId, setSelectedMyPlanOrderId] = useState<string>('latest');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState<boolean>(false);
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyPlanFilter, setHistoryPlanFilter] = useState<string>('all');

  const fmtBDT = (val: number) =>
    val === 0 ? 'BDT 0.00' : `BDT ${val.toLocaleString('en-BD')}`;

  const formatDate = (isoString: string | null) => {
    if (!isoString) return 'Lifetime (No Expiry)';
    try {
      return new Date(isoString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const selectedGateway = useMemo(
    () => PAYMENT_GATEWAYS.find((g) => g.id === paymentMethod) || PAYMENT_GATEWAYS[0],
    [paymentMethod]
  );

  const handleShopNow = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsDetailsConfirmed(false);
    setPayerName(plan.price === 0 ? '' : userProfile.name || schoolSettings.schoolName || '');
    setPayerPhone('');
    setAccountNumber('');
    setTransactionId('');
    setStep('confirm');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmPlan = () => {
    if (!selectedPlan) return;
    if (!isDetailsConfirmed) {
      showToast(
        'warning',
        'Confirmation Required',
        selectedPlan.price === 0
          ? 'Please confirm the Free Trial plan details before entering your contact information.'
          : 'Please confirm that you have reviewed the subscription plan details before proceeding to payment.'
      );
      return;
    }
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompletePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    const isFree = selectedPlan.price === 0;
    const cleanName = payerName.trim();
    const cleanPhone = payerPhone.trim();
    const cleanAccount = accountNumber.trim();
    const cleanTrx = transactionId.trim();

    if (isFree) {
      if (!cleanName) {
        showToast(
          'error',
          'Full Name Required',
          'Please enter the subscriber full name to activate the Free Trial.'
        );
        return;
      }
      if (!cleanPhone || cleanPhone.replace(/[^0-9+]/g, '').length < 6) {
        showToast(
          'error',
          'Valid Number Required',
          'Please enter a valid mobile or phone number to save in the trial database.'
        );
        return;
      }

      const order = purchaseSubscription({
        planId: selectedPlan.id,
        paymentMethod: 'Free Trial',
        accountNumber: cleanPhone,
        transactionId: `TRIAL-${Date.now().toString().slice(-6)}`,
        payerName: cleanName,
        payerPhone: cleanPhone,
      });

      setCompletedOrder(order);
      setStep('receipt');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const effectiveName = cleanName || userProfile.name || schoolSettings.schoolName;
    if (!cleanAccount) {
      showToast(
        'error',
        paymentMethod === 'Bank Transfer' ? 'Account Reference Required' : 'Wallet Number Required',
        paymentMethod === 'Bank Transfer'
          ? 'Please enter the sender bank account number or deposit reference.'
          : `Please enter your ${paymentMethod} sender mobile number.`
      );
      return;
    }
    if (!cleanTrx) {
      showToast(
        'error',
        'Transaction ID Required',
        `Please enter the ${paymentMethod} Transaction ID (TrxID) to verify payment.`
      );
      return;
    }

    const order = purchaseSubscription({
      planId: selectedPlan.id,
      paymentMethod,
      accountNumber: cleanAccount,
      transactionId: cleanTrx,
      payerName: effectiveName,
      payerPhone: cleanPhone || cleanAccount,
      bankName: paymentMethod === 'Bank Transfer' ? bankName.trim() || 'Local Bank' : undefined,
    });

    setCompletedOrder(order);
    setStep('receipt');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCatalog = () => {
    setStep('catalog');
    setSelectedPlan(null);
    setIsDetailsConfirmed(false);
  };

  const currentUsageItems = [
    {
      label: 'Students',
      used: subscriptionUsage.students,
      limit: activePlan.limits.students,
    },
    {
      label: 'Teachers',
      used: subscriptionUsage.staff,
      limit: activePlan.limits.staff,
    },
    {
      label: 'Classes',
      used: subscriptionUsage.classes,
      limit: activePlan.limits.classes,
    },
    {
      label: 'Subjects',
      used: subscriptionUsage.subjects,
      limit: activePlan.limits.subjects,
    },
    {
      label: 'Exams',
      used: subscriptionUsage.exams,
      limit: activePlan.limits.examsAndRoutines,
    },
    {
      label: 'Routines',
      used: subscriptionUsage.routines,
      limit: activePlan.limits.examsAndRoutines,
    },
    {
      label: 'Notices',
      used: subscriptionUsage.notices,
      limit: activePlan.limits.notices,
    },
  ];

  const getCurrentUsageForHighlight = (label: string): string => {
    const l = label.toLowerCase();
    if (l.includes('student')) return `${subscriptionUsage.students} registered`;
    if (l.includes('teacher')) return `${subscriptionUsage.staff} registered`;
    if (l.includes('class')) return `${subscriptionUsage.classes} created`;
    if (l.includes('subject')) return `${subscriptionUsage.subjects} created`;
    if (l.includes('exam')) {
      return `${subscriptionUsage.exams} exams, ${subscriptionUsage.routines} routines`;
    }
    if (l.includes('fee')) {
      const totalFees = Object.values(subscriptionUsage.feeByType).reduce((a, b) => a + b, 0);
      return `${totalFees} collections recorded`;
    }
    if (l.includes('notice')) return `${subscriptionUsage.notices} published`;
    return 'Active';
  };

  const renderPrintableReceiptBody = (order: SubscriptionOrder) => (
    <div className="bg-white p-5 sm:p-8 rounded-xl border border-slate-200 text-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-6">
        <div className="flex items-center gap-3.5">
          <img
            src={schoolSettings.logo}
            alt={schoolSettings.schoolName}
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-xl object-contain border border-slate-200 p-1 shrink-0"
          />
          <div>
            <h2 className="text-lg font-bold text-[#172554] leading-tight">
              {schoolSettings.schoolName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {schoolSettings.address} · {schoolSettings.phone}
            </p>
          </div>
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-semibold text-slate-500">Subscription Receipt</p>
          <p className="text-base font-mono font-bold text-[#172554] tabular-nums">
            {order.invoiceNumber}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{formatDate(order.paidAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-slate-100 text-xs sm:text-sm">
        <div>
          <p className="text-xs text-slate-400">Subscriber / Institution</p>
          <p className="font-semibold text-slate-900 mt-0.5">{schoolSettings.institutionName}</p>
          <p className="text-xs text-slate-600 mt-0.5">Authorized by: {order.payerName}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs text-slate-400">Payment Channel</p>
          <p className="font-semibold text-slate-900 mt-0.5">
            {order.paymentMethod}
            {order.bankName ? ` (${order.bankName})` : ''}
          </p>
          <p className="text-xs font-mono text-slate-600 mt-0.5">
            TrxID: {order.transactionId} · A/C: {order.accountNumber}
          </p>
        </div>
      </div>

      <div className="py-5 space-y-3 text-sm">
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div>
            <p className="font-semibold text-slate-900">{order.planName}</p>
            <p className="text-xs text-slate-500">Billing Cycle · {order.durationLabel}</p>
          </div>
          <p className="font-mono font-bold text-slate-900 tabular-nums">
            {fmtBDT(order.amount)}
          </p>
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="font-bold text-[#172554]">Total Paid</span>
          <span className="text-xl font-mono font-extrabold text-[#172554] tabular-nums">
            {fmtBDT(order.amount)}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <span>Status: {order.status} & Verified</span>
        <span>EduManage Subscription Billing Ledger</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header & Clean Segmented Tab Control */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Institutional Licensing · Billing & Quotas
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#172554] tracking-tight mt-1 text-balance">
            Subscription & Access Plans
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Select a plan tailored to your campus capacity, review full entitlements, and complete payment via bKash, Rocket, Nagad, or Bank Transfer.
          </p>
        </div>

        <div className="inline-flex items-center p-1 bg-slate-100 border border-slate-200/80 rounded-xl self-start sm:self-auto shrink-0 overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab('plans')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'plans'
                ? 'bg-white text-[#172554] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Plans & Upgrade
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('myplan')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'myplan'
                ? 'bg-white text-[#172554] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Plan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'history'
                ? 'bg-white text-[#172554] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            History ({subscriptionOrders.length})
          </button>
        </div>
      </div>

      {/* TAB 1: PLANS & CHECKOUT FLOW */}
      {activeTab === 'plans' && (
        <>
          {/* Compact Active Subscription & Live Usage Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#172554] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>Current Active Plan</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-emerald-700">
                      {activeSubscription.status}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Valid until {formatDate(activeSubscription.expiresAt)}</span>
                  </div>
                  <h2 className="text-lg font-bold text-[#172554] mt-0.5">
                    {activePlan.name}
                  </h2>
                  {(activeSubscription.subscriberName || activeSubscription.subscriberPhone) && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Registered to {activeSubscription.subscriberName}
                      {activeSubscription.subscriberPhone ? ` · ${activeSubscription.subscriberPhone}` : ''}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 block text-xs">Fee Collections Quota</span>
                  <span className="font-semibold text-slate-800 font-mono tabular-nums">
                    {activePlan.limits.feeCollectionPerType === null
                      ? 'Unlimited'
                      : `Max ${activePlan.limits.feeCollectionPerType} / Fee Type`}
                  </span>
                </div>
                <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                <div>
                  <span className="text-slate-400 block text-xs">Billing Rate</span>
                  <span className="font-bold text-[#172554] font-mono tabular-nums">
                    {fmtBDT(activePlan.price)} / {activePlan.durationLabel}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('myplan')}
                  className="min-h-[38px] whitespace-nowrap shrink-0"
                >
                  <FileText className="w-3.5 h-3.5" />
                  My Plan PDF
                </Button>
              </div>
            </div>

            {/* 7-Metric Live Usage Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-4">
              {currentUsageItems.map((metric) => {
                const isNearLimit =
                  metric.limit !== null && metric.used >= metric.limit;
                return (
                  <div key={metric.label} className="py-1">
                    <p className="text-xs text-slate-500">{metric.label}</p>
                    <p
                      className={`text-sm font-mono font-bold tabular-nums mt-0.5 ${
                        isNearLimit ? 'text-amber-600' : 'text-slate-900'
                      }`}
                    >
                      {metric.used}
                      <span className="text-slate-400 font-normal">
                        {' / '}
                        {metric.limit === null ? 'Unlimited' : metric.limit}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP INDICATOR WHEN IN CHECKOUT */}
          {step !== 'catalog' && selectedPlan && (
            <div className="flex flex-wrap items-center justify-between gap-3 py-2 border-b border-slate-200/80">
              <div className="flex items-center gap-3 text-xs sm:text-sm">
                <button
                  type="button"
                  onClick={handleBackToCatalog}
                  className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-[#172554] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                  All Plans
                </button>
                <span className="text-slate-300">/</span>
                <span
                  className={
                    step === 'confirm'
                      ? 'font-bold text-[#172554]'
                      : 'text-slate-500'
                  }
                >
                  01. Confirm Details
                </span>
                <span className="text-slate-300">/</span>
                <span
                  className={
                    step === 'payment'
                      ? 'font-bold text-[#172554]'
                      : 'text-slate-500'
                  }
                >
                  {selectedPlan.price === 0 ? '02. Subscriber Details' : '02. Payment'}
                </span>
                {step === 'receipt' && (
                  <>
                    <span className="text-slate-300">/</span>
                    <span className="font-bold text-emerald-700">03. Activated</span>
                  </>
                )}
              </div>

              <span className="text-xs font-mono text-slate-500 tabular-nums">
                Selected: {selectedPlan.name} ({fmtBDT(selectedPlan.price)})
              </span>
            </div>
          )}

          {/* STEP 1: CATALOG (5 SUBSCRIPTION PLANS) */}
          {step === 'catalog' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-5">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const isCurrent = activeSubscription.planId === plan.id;
                const isWideCard =
                  plan.id === 'plan-enterprise' || plan.id === 'plan-lifetime';
                const colSpanClass = isWideCard ? 'xl:col-span-3' : 'xl:col-span-2';
                const isDark = Boolean(plan.isDarkTheme);

                return (
                  <div
                    key={plan.id}
                    className={`${colSpanClass} rounded-2xl p-6 flex flex-col justify-between transition-colors ${
                      isDark
                        ? 'bg-[#0F172A] text-white border border-slate-800'
                        : plan.recommended
                        ? 'bg-white text-slate-900 border-2 border-[#2563EB]'
                        : 'bg-white text-slate-900 border border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Quiet unboxed kicker */}
                      <div
                        className={`flex items-center justify-between gap-2 text-xs ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        <span>
                          {plan.tierIndex}. {plan.durationLabel}
                        </span>
                        {isCurrent ? (
                          <span
                            className={`font-semibold ${
                              isDark ? 'text-emerald-400' : 'text-emerald-700'
                            }`}
                          >
                            Current Plan
                          </span>
                        ) : plan.recommended ? (
                          <span className="font-semibold text-[#2563EB]">
                            Recommended
                          </span>
                        ) : null}
                      </div>

                      {/* Plan Title & Tagline */}
                      <h3
                        className={`text-xl font-bold tracking-tight mt-2 ${
                          isDark ? 'text-white' : 'text-[#172554]'
                        }`}
                      >
                        {plan.name}
                      </h3>
                      <p
                        className={`text-xs mt-1 leading-relaxed ${
                          isDark ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {plan.tagline}
                      </p>

                      {/* Price Display */}
                      <div
                        className={`mt-5 pb-5 border-b ${
                          isDark ? 'border-slate-800' : 'border-slate-100'
                        } flex items-baseline justify-between gap-2`}
                      >
                        <div>
                          <span
                            className={`text-3xl font-extrabold font-mono tabular-nums tracking-tight ${
                              isDark ? 'text-white' : 'text-[#172554]'
                            }`}
                          >
                            {fmtBDT(plan.price)}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          / {plan.durationLabel}
                        </span>
                      </div>

                      {/* Concrete 7-Point Specification Matrix */}
                      <ul className="mt-5 space-y-2.5">
                        {plan.highlights.map((item) => (
                          <li
                            key={item.label}
                            className="flex items-center justify-between gap-3 text-xs sm:text-[13px]"
                          >
                            <span
                              className={`flex items-center gap-2 ${
                                isDark ? 'text-slate-300' : 'text-slate-600'
                              }`}
                            >
                              <Check
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isDark ? 'text-emerald-400' : 'text-[#2563EB]'
                                }`}
                              />
                              <span>{item.label}</span>
                            </span>
                            <span
                              className={`font-semibold font-mono tabular-nums shrink-0 ${
                                item.value === 'Unlimited'
                                  ? isDark
                                    ? 'text-emerald-400'
                                    : 'text-emerald-700'
                                  : isDark
                                  ? 'text-white'
                                  : 'text-slate-900'
                              }`}
                            >
                              {item.value}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Shop Now CTA */}
                    <div className="mt-6 pt-4">
                      <button
                        type="button"
                        onClick={() => handleShopNow(plan)}
                        className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                          isDark
                            ? 'bg-white text-slate-900 hover:bg-slate-100'
                            : plan.recommended
                            ? 'bg-[#2563EB] text-white hover:bg-blue-700'
                            : 'bg-[#172554] text-white hover:bg-slate-900'
                        }`}
                      >
                        <span>Shop Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 2: PLAN DETAILS RE-CONFIRMATION */}
          {step === 'confirm' && selectedPlan && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-8 max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Plan {selectedPlan.tierIndex} · Review Before Payment
                  </p>
                  <h2 className="text-2xl font-bold text-[#172554] mt-1">
                    {selectedPlan.name}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedPlan.tagline}
                  </p>
                </div>

                <div className="sm:text-right shrink-0">
                  <p className="text-xs text-slate-500">Subscription Total</p>
                  <p className="text-3xl font-extrabold font-mono text-[#172554] tabular-nums mt-0.5">
                    {fmtBDT(selectedPlan.price)}
                  </p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    Duration · {selectedPlan.durationLabel}
                  </p>
                </div>
              </div>

              {/* Subscriber Institution Summary */}
              <div className="py-5 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                <div>
                  <p className="text-xs text-slate-400">Institution</p>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {schoolSettings.schoolName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Billing Contact</p>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {userProfile.name} ({schoolSettings.phone})
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Access Period</p>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {selectedPlan.durationDays
                      ? `${selectedPlan.durationDays} Days from Activation`
                      : 'Permanent Lifetime Access'}
                  </p>
                </div>
              </div>

              {/* Full Specification Table */}
              <div className="py-6">
                <h3 className="text-sm font-bold text-[#172554] mb-3">
                  Included Limits & Module Access
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {selectedPlan.highlights.map((row) => (
                    <div
                      key={row.label}
                      className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs sm:text-sm"
                    >
                      <span className="font-medium text-slate-700 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                        {row.label}
                      </span>
                      <div className="flex items-center justify-between sm:justify-end gap-4 pl-6 sm:pl-0">
                        <span className="text-xs text-slate-400">
                          Current: {getCurrentUsageForHighlight(row.label)}
                        </span>
                        <span className="font-mono font-bold text-[#172554] tabular-nums">
                          {row.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explicit Confirmation Agreement */}
              <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isDetailsConfirmed}
                  onChange={(e) => setIsDetailsConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] shrink-0"
                />
                <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {selectedPlan.price === 0 ? (
                    <>
                      I confirm the selected <strong className="text-[#172554]">{selectedPlan.name}</strong> plan details, module quotas, and 10-day validity period (BDT 0.00 — no payment required), and want to proceed to subscriber registration.
                    </>
                  ) : (
                    <>
                      I confirm the selected <strong className="text-[#172554]">{selectedPlan.name}</strong> plan details, module quotas, validity duration ({selectedPlan.durationLabel}), and total payable amount of <strong className="font-mono text-[#172554]">{fmtBDT(selectedPlan.price)}</strong>, and want to proceed to payment options.
                    </>
                  )}
                </span>
              </label>

              {/* Confirmation Actions */}
              <div className="pt-6 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToCatalog}
                  className="min-h-[44px] whitespace-nowrap"
                >
                  Choose Another Plan
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleConfirmPlan}
                  className="min-h-[44px] bg-[#172554] hover:bg-slate-900 whitespace-nowrap"
                >
                  {selectedPlan.price === 0
                    ? 'Confirm & Enter Subscriber Info'
                    : 'Confirm & Proceed to Payment'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: FREE TRIAL SUBSCRIBER REGISTRATION OR PAID PAYMENT GATEWAYS */}
          {step === 'payment' && selectedPlan && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {selectedPlan.price === 0 ? (
                <form
                  noValidate
                  onSubmit={handleCompletePayment}
                  className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 space-y-6"
                >
                  <div>
                    <p className="text-xs font-medium text-emerald-700">
                      No Payment Required · 10-Day Trial Activation
                    </p>
                    <h2 className="text-lg sm:text-xl font-bold text-[#172554] mt-1">
                      Subscriber Registration Details
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Enter the name and mobile number of the person activating the Free Trial. This record will be saved directly to the database.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Subscriber Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          required
                          autoFocus
                          value={payerName}
                          onChange={(e) => setPayerName(e.target.value)}
                          placeholder="Enter full name (e.g. Md. Karim Uddin)"
                          className="w-full min-h-[44px] pl-10 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Mobile / Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="tel"
                          required
                          value={payerPhone}
                          onChange={(e) => setPayerPhone(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full min-h-[44px] pl-10 pr-3.5 py-2 text-sm font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep('confirm')}
                      className="min-h-[44px] whitespace-nowrap"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Details
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="min-h-[44px] bg-[#172554] hover:bg-slate-900 whitespace-nowrap"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Activate Free Trial (BDT 0.00)
                    </Button>
                  </div>
                </form>
              ) : (
                <form
                  noValidate
                  onSubmit={handleCompletePayment}
                  className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 space-y-6"
                >
                  <div>
                    <h2 className="text-lg font-bold text-[#172554]">
                      Select Payment Method
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Choose bKash, Rocket, Nagad, or Bank Transfer to complete your subscription.
                    </p>
                  </div>

                  {/* 4 Gateway Selector Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {PAYMENT_GATEWAYS.map((gw) => {
                      const Icon = gw.icon;
                      const isSelected = paymentMethod === gw.id;
                      return (
                        <button
                          key={gw.id}
                          type="button"
                          onClick={() => setPaymentMethod(gw.id)}
                          className={`min-h-[76px] p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? `${gw.accentBg} ${gw.accentBorder} border-2`
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <Icon
                              className={`w-4 h-4 ${
                                isSelected ? gw.accentText : 'text-slate-500'
                              }`}
                            />
                            {isSelected && (
                              <CheckCircle2 className={`w-4 h-4 ${gw.accentText}`} />
                            )}
                          </div>
                          <div className="mt-2">
                            <p
                              className={`text-sm font-bold leading-tight ${
                                isSelected ? gw.accentText : 'text-slate-900'
                              }`}
                            >
                              {gw.label}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                              {gw.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Receiving Account Instructions */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#172554]">
                        {selectedGateway.accountTitle}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-800">
                        {selectedGateway.accountDetails}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {selectedGateway.instructions}
                    </p>
                  </div>

                  {/* Dynamic Payment Inputs */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Authorized Payer Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={payerName}
                          onChange={(e) => setPayerName(e.target.value)}
                          placeholder="Full name of payer / admin"
                          className="w-full min-h-[42px] px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        />
                      </div>

                      {paymentMethod === 'Bank Transfer' ? (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Sender Bank Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            placeholder="e.g. City Bank, Dutch-Bangla, BRAC Bank"
                            className="w-full min-h-[42px] px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            {paymentMethod} Account Number *
                          </label>
                          <input
                            type="tel"
                            required
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            placeholder={
                              paymentMethod === 'Rocket' ? '018XXXXXXXXX' : '01XXXXXXXXX'
                            }
                            className="w-full min-h-[42px] px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {paymentMethod === 'Bank Transfer' && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Sender Account / Deposit Slip No. *
                          </label>
                          <input
                            type="text"
                            required
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            placeholder="e.g. 1204-8899-0011"
                            className="w-full min-h-[42px] px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                          />
                        </div>
                      )}

                      <div className={paymentMethod === 'Bank Transfer' ? '' : 'sm:col-span-2'}>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          {paymentMethod === 'Bank Transfer'
                            ? 'Bank EFT / Reference Number'
                            : `${paymentMethod} Transaction ID (TrxID)`}{' '}
                          *
                        </label>
                        <input
                          type="text"
                          required
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                          placeholder={
                            paymentMethod === 'Bank Transfer'
                              ? 'e.g. EFT-8892410'
                              : 'e.g. 9K7A2B4C1D'
                          }
                          className="w-full min-h-[42px] px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Action Buttons */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep('confirm')}
                      className="min-h-[44px] whitespace-nowrap"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Details
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="min-h-[44px] bg-[#172554] hover:bg-slate-900 whitespace-nowrap"
                    >
                      <CreditCard className="w-4 h-4" />
                      Complete Payment ({fmtBDT(selectedPlan.price)})
                    </Button>
                  </div>
                </form>
              )}

              {/* Right Column: Clean Order Summary */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 space-y-5">
                <div className="pb-4 border-b border-slate-100">
                  <p className="text-xs text-slate-500">
                    {selectedPlan.price === 0 ? 'Trial Summary' : 'Order Summary'}
                  </p>
                  <h3 className="text-lg font-bold text-[#172554] mt-0.5">
                    {selectedPlan.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedPlan.tagline}
                  </p>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Billing Cycle</span>
                    <span className="font-semibold text-slate-900">
                      {selectedPlan.durationLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>{selectedPlan.price === 0 ? 'Activation Type' : 'Selected Payment'}</span>
                    <span className="font-semibold text-slate-900">
                      {selectedPlan.price === 0 ? 'No Payment Required' : paymentMethod}
                    </span>
                  </div>
                  {selectedPlan.price === 0 && (
                    <>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Subscriber Name</span>
                        <span className="font-semibold text-slate-900 truncate max-w-[180px]">
                          {payerName.trim() || '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Contact Number</span>
                        <span className="font-mono font-semibold text-slate-900">
                          {payerPhone.trim() || '—'}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Plan Subtotal</span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {fmtBDT(selectedPlan.price)}
                    </span>
                  </div>
                  {selectedPlan.price > 0 && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Gateway Charge</span>
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">
                        BDT 0.00
                      </span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-[#172554]">Total Payable</span>
                    <span className="text-2xl font-mono font-extrabold text-[#172554] tabular-nums">
                      {fmtBDT(selectedPlan.price)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Key Plan Entitlements
                  </p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-slate-600">
                    {selectedPlan.highlights.slice(0, 6).map((h) => (
                      <div key={h.label} className="truncate">
                        <span className="text-slate-400">{h.label}: </span>
                        <span className="font-semibold text-slate-800">{h.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ACTIVATION SUCCESS & RECEIPT */}
          {step === 'receipt' && completedOrder && (
            <div className="max-w-3xl mx-auto space-y-5">
              <div className="bg-white rounded-2xl border border-emerald-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#172554]">
                      Subscription Activated Successfully
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                      {completedOrder.planName} is now active via {completedOrder.paymentMethod}. All plan quotas are updated immediately.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      printElement('printable-subscription-receipt', {
                        title: `Subscription-Invoice-${completedOrder.invoiceNumber}`,
                        pageSize: 'A4',
                        orientation: 'portrait',
                      })
                    }
                    className="min-h-[40px] whitespace-nowrap"
                  >
                    <Printer className="w-4 h-4" />
                    Print Receipt
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedMyPlanOrderId(completedOrder.id);
                      setStep('catalog');
                      setSelectedPlan(null);
                      setActiveTab('myplan');
                    }}
                    className="min-h-[40px] whitespace-nowrap"
                  >
                    <FileText className="w-4 h-4" />
                    Open in My Plan
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleBackToCatalog}
                    className="min-h-[40px] bg-[#172554] hover:bg-slate-900 whitespace-nowrap"
                  >
                    Done
                  </Button>
                </div>
              </div>

              <div id="printable-subscription-receipt">
                {renderPrintableReceiptBody(completedOrder)}
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: MY PLAN (A4 PDF CERTIFICATE VIEW, PDF DOWNLOAD & PRINT) */}
      {activeTab === 'myplan' && (() => {
        const inspectedOrder: SubscriptionOrder | null =
          selectedMyPlanOrderId === 'latest'
            ? subscriptionOrders[0] || null
            : subscriptionOrders.find((o) => o.id === selectedMyPlanOrderId) ||
              subscriptionOrders[0] ||
              null;

        const inspectedPlan = inspectedOrder
          ? getSubscriptionPlanById(inspectedOrder.planId)
          : activePlan;

        const docReference =
          inspectedOrder?.invoiceNumber ||
          activeSubscription.transactionId ||
          `PILOT-${inspectedPlan.tierIndex}`;

        const docIssuedAt =
          inspectedOrder?.paidAt || activeSubscription.startedAt;

        const docExpiresAt = inspectedOrder
          ? inspectedPlan.durationDays !== null
            ? new Date(
                new Date(inspectedOrder.paidAt).getTime() +
                  inspectedPlan.durationDays * 24 * 60 * 60 * 1000
              ).toISOString()
            : null
          : activeSubscription.expiresAt;

        const docSubscriberName =
          inspectedOrder?.payerName ||
          activeSubscription.subscriberName ||
          userProfile.name ||
          schoolSettings.institutionName;

        const docSubscriberPhone =
          inspectedOrder?.payerPhone ||
          inspectedOrder?.accountNumber ||
          activeSubscription.subscriberPhone ||
          schoolSettings.phone;

        const docPaymentMethod =
          inspectedOrder?.paymentMethod ||
          activeSubscription.paymentMethod ||
          'Free Trial';

        const docTransactionId =
          inspectedOrder?.transactionId ||
          activeSubscription.transactionId ||
          'DEFAULT-TRIAL';

        const docAmount = inspectedOrder
          ? inspectedOrder.amount
          : activeSubscription.amountPaid;

        const docStatus = inspectedOrder
          ? inspectedOrder.status
          : activeSubscription.status;

        const handleDownloadMyPlanPdf = async (targetOrder?: SubscriptionOrder | null) => {
          const orderToExport = targetOrder !== undefined ? targetOrder : inspectedOrder;
          const planToExport = orderToExport
            ? getSubscriptionPlanById(orderToExport.planId)
            : activePlan;
          try {
            setIsGeneratingPdf(true);
            const filename = await downloadSubscriptionPdf({
              schoolName: schoolSettings.schoolName,
              institutionName: schoolSettings.institutionName,
              address: schoolSettings.address,
              phone: schoolSettings.phone,
              email: schoolSettings.email,
              plan: planToExport,
              activeSubscription,
              order: orderToExport,
              totalPurchases: subscriptionOrders.length,
            });
            showToast(
              'success',
              'PDF Downloaded',
              `Saved ${filename} for ${planToExport.name}.`
            );
          } catch {
            showToast(
              'error',
              'PDF Generation Failed',
              'Could not generate the PDF file. Please try using Print -> Save as PDF.'
            );
          } finally {
            setIsGeneratingPdf(false);
          }
        };

        const renderA4MyPlanDocument = () => (
          <div className="bg-white border border-slate-300 rounded-xl shadow-xs p-5 sm:p-10 text-slate-900 max-w-[820px] mx-auto">
            {/* Institutional Letterhead */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-[#172554]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl border border-slate-200 p-1.5 flex items-center justify-center shrink-0 bg-white">
                  <img
                    src={schoolSettings.logo}
                    alt={schoolSettings.schoolName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#172554] leading-tight">
                    {schoolSettings.schoolName}
                  </h3>
                  <p className="text-xs font-medium text-slate-600 mt-0.5">
                    {schoolSettings.institutionName}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {schoolSettings.address} · {schoolSettings.phone}
                  </p>
                </div>
              </div>

              <div className="sm:text-right shrink-0">
                <p className="text-xs font-semibold text-slate-500">
                  Subscription Plan Document (PDF)
                </p>
                <p className="text-lg font-mono font-extrabold text-[#172554] tabular-nums mt-0.5">
                  {docReference}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
                  Issued: {formatDate(docIssuedAt)}
                </p>
              </div>
            </div>

            {/* Active / Purchased Plan Headline Block */}
            <div className="my-6 p-5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>Plan Tier {inspectedPlan.tierIndex}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-emerald-700">{docStatus}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Purchased {subscriptionOrders.length}{' '}
                    {subscriptionOrders.length === 1 ? 'Time' : 'Times'} Total
                  </span>
                </div>
                <h4 className="text-2xl font-extrabold text-[#172554] mt-1">
                  {inspectedPlan.name}
                </h4>
                <p className="text-xs text-slate-600 mt-1">{inspectedPlan.tagline}</p>
              </div>

              <div className="sm:text-right shrink-0">
                <p className="text-xs text-slate-500">Total Amount Paid</p>
                <p className="text-2xl sm:text-3xl font-mono font-extrabold text-[#172554] tabular-nums">
                  {fmtBDT(docAmount)}
                </p>
                <p className="text-xs font-medium text-slate-600 mt-0.5">
                  Validity · {inspectedPlan.durationLabel}
                </p>
              </div>
            </div>

            {/* Subscriber, Payment & QR Verification Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-4 border-b border-slate-200">
              <div className="md:col-span-5 space-y-2.5 text-xs sm:text-sm">
                <h5 className="text-xs font-bold text-[#172554] pb-1.5 border-b border-slate-200">
                  Subscriber Information
                </h5>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Subscriber Name</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {docSubscriberName}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Mobile / Phone</span>
                  <span className="font-mono font-semibold text-slate-900 text-right">
                    {docSubscriberPhone}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Activated Date</span>
                  <span className="font-mono text-slate-800 tabular-nums text-right">
                    {formatDate(docIssuedAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Valid Until</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums text-right">
                    {formatDate(docExpiresAt)}
                  </span>
                </div>
              </div>

              <div className="md:col-span-5 space-y-2.5 text-xs sm:text-sm">
                <h5 className="text-xs font-bold text-[#172554] pb-1.5 border-b border-slate-200">
                  Payment & Channel Record
                </h5>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Payment Channel</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {docPaymentMethod}
                    {inspectedOrder?.bankName ? ` (${inspectedOrder.bankName})` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Account / Number</span>
                  <span className="font-mono text-slate-800 text-right">
                    {inspectedOrder?.accountNumber || docSubscriberPhone}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Transaction / Ref ID</span>
                  <span className="font-mono font-semibold text-slate-900 text-right">
                    {docTransactionId}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">License Status</span>
                  <span className="font-semibold text-emerald-700 text-right">
                    {docStatus} & Verified
                  </span>
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col items-center justify-center p-2 border border-slate-200 rounded-xl bg-white">
                <QRCodeSVG
                  value={JSON.stringify({
                    ref: docReference,
                    plan: inspectedPlan.name,
                    subscriber: docSubscriberName,
                    phone: docSubscriberPhone,
                    amount: docAmount,
                  })}
                  size={74}
                  level="M"
                />
                <span className="text-[10px] font-mono text-slate-500 mt-1.5">
                  Verify Plan
                </span>
              </div>
            </div>

            {/* Included Module Quotas Table */}
            <div className="py-6">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-bold text-[#172554]">
                  Purchased Plan Entitlements & Capacity Breakdown
                </h5>
                <span className="text-xs font-mono text-slate-500">
                  {inspectedPlan.highlights.length} Modules Covered
                </span>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Module / Resource</th>
                      <th className="py-2.5 px-4">Current Usage</th>
                      <th className="py-2.5 px-4 text-right">Purchased Quota</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inspectedPlan.highlights.map((row) => (
                      <tr key={row.label}>
                        <td className="py-2.5 px-4 font-medium text-slate-800">
                          {row.label}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 font-mono text-xs tabular-nums">
                          {getCurrentUsageForHighlight(row.label)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-[#172554] tabular-nums">
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Official Signature & Document Footer */}
            <div className="pt-8 mt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-6 text-xs text-slate-500">
              <div>
                <div className="w-44 border-t border-slate-300 pt-1.5">
                  <p className="font-semibold text-slate-700">{docSubscriberName}</p>
                  <p>Authorized Subscriber</p>
                </div>
              </div>
              <div className="sm:text-right">
                <p className="font-semibold text-[#172554]">
                  EduManage Subscription Licensing Registry
                </p>
                <p className="font-mono tabular-nums mt-0.5">
                  Ref: {docReference} · {schoolSettings.schoolName}
                </p>
              </div>
            </div>
          </div>
        );

        return (
          <div className="space-y-5">
            {/* My Plan Action Toolbar */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>My Plan</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-emerald-700">{docStatus}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Total Times Purchased:{' '}
                    <strong className="font-mono text-[#172554] tabular-nums">
                      {subscriptionOrders.length}
                    </strong>
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#172554]">
                  {inspectedPlan.name} — A4 PDF Certificate & Receipt
                </h2>
                {subscriptionOrders.length === 0 && (
                  <p className="text-xs text-slate-500">
                    Currently running on default 10-Day Free Trial. Purchase or activate a plan from Plans & Upgrade to record billing invoices.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {subscriptionOrders.length > 1 && (
                  <select
                    value={selectedMyPlanOrderId}
                    onChange={(e) => setSelectedMyPlanOrderId(e.target.value)}
                    aria-label="Select purchased subscription invoice"
                    className="min-h-[42px] px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    <option value="latest">
                      Latest: {subscriptionOrders[0].planName} ({subscriptionOrders[0].invoiceNumber})
                    </option>
                    {subscriptionOrders.map((ord) => (
                      <option key={ord.id} value={ord.id}>
                        {ord.invoiceNumber} · {ord.planName} ({fmtBDT(ord.amount)})
                      </option>
                    ))}
                  </select>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPdfPreviewOpen(true)}
                  className="min-h-[42px] whitespace-nowrap"
                >
                  <Eye className="w-4 h-4" />
                  PDF View
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isGeneratingPdf}
                  onClick={() => handleDownloadMyPlanPdf(inspectedOrder)}
                  className="min-h-[42px] whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  {isGeneratingPdf ? 'Preparing PDF...' : 'Download PDF'}
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    printElement('printable-my-plan-document', {
                      title: `My-Plan-${docReference}`,
                      pageSize: 'A4',
                      orientation: 'portrait',
                    })
                  }
                  className="min-h-[42px] bg-[#172554] hover:bg-slate-900 whitespace-nowrap"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
              </div>
            </div>

            {/* Embedded A4 PDF Document Preview Sheet */}
            <div className="bg-slate-100/80 border border-slate-200/80 rounded-2xl p-3 sm:p-6">
              <div id="printable-my-plan-document">{renderA4MyPlanDocument()}</div>
            </div>

            {/* Dedicated PDF View Modal */}
            <Modal
              isOpen={isPdfPreviewOpen}
              onClose={() => setIsPdfPreviewOpen(false)}
              title={`PDF Preview — ${inspectedPlan.name} (${docReference})`}
              maxWidth="4xl"
              footer={
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPdfPreviewOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isGeneratingPdf}
                    onClick={() => handleDownloadMyPlanPdf(inspectedOrder)}
                  >
                    <Download className="w-4 h-4" />
                    {isGeneratingPdf ? 'Preparing PDF...' : 'Download PDF'}
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      printElement('printable-my-plan-modal-document', {
                        title: `My-Plan-${docReference}`,
                        pageSize: 'A4',
                        orientation: 'portrait',
                      })
                    }
                    className="bg-[#172554] hover:bg-slate-900"
                  >
                    <Printer className="w-4 h-4" />
                    Print PDF
                  </Button>
                </>
              }
            >
              <div className="bg-slate-100 p-3 sm:p-5 rounded-xl">
                <div id="printable-my-plan-modal-document">
                  {renderA4MyPlanDocument()}
                </div>
              </div>
            </Modal>
          </div>
        );
      })()}

      {/* TAB 3: PURCHASE HISTORY, COUNTS & TRIAL REGISTRY */}
      {activeTab === 'history' && (() => {
        const totalPurchasedCount = subscriptionOrders.length;
        const totalSpentAmount = subscriptionOrders.reduce(
          (sum, ord) => sum + ord.amount,
          0
        );

        const planBreakdown = SUBSCRIPTION_PLANS.map((plan) => {
          const matchingOrders = subscriptionOrders.filter(
            (ord) => ord.planId === plan.id
          );
          const totalPaidForPlan = matchingOrders.reduce(
            (sum, ord) => sum + ord.amount,
            0
          );
          return {
            plan,
            count: matchingOrders.length,
            lastPurchasedAt: matchingOrders[0]?.paidAt || null,
            totalPaid: totalPaidForPlan,
            isActive: activeSubscription.planId === plan.id,
          };
        });

        const uniquePlansPurchased = planBreakdown.filter((b) => b.count > 0).length;

        const filteredOrders = subscriptionOrders.filter((ord) => {
          const matchesPlan =
            historyPlanFilter === 'all' || ord.planId === historyPlanFilter;
          const q = historySearch.trim().toLowerCase();
          const matchesSearch =
            !q ||
            ord.invoiceNumber.toLowerCase().includes(q) ||
            ord.planName.toLowerCase().includes(q) ||
            ord.payerName.toLowerCase().includes(q) ||
            (ord.payerPhone || ord.accountNumber).toLowerCase().includes(q) ||
            ord.transactionId.toLowerCase().includes(q);
          return matchesPlan && matchesSearch;
        });

        return (
          <div className="space-y-6">
            {/* 4-Metric Purchase Summary Strip */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div>
                <p className="text-xs text-slate-500">Total Times Purchased</p>
                <p className="text-2xl font-extrabold font-mono text-[#172554] tabular-nums mt-1">
                  {totalPurchasedCount}{' '}
                  <span className="text-sm font-semibold text-slate-500 font-sans">
                    {totalPurchasedCount === 1 ? 'Time' : 'Times'}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Last Purchased Plan</p>
                <p className="text-lg font-bold text-[#172554] mt-1 truncate">
                  {subscriptionOrders[0]?.planName || activePlan.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Distinct Plans Used</p>
                <p className="text-2xl font-extrabold font-mono text-[#172554] tabular-nums mt-1">
                  {uniquePlansPurchased}{' '}
                  <span className="text-sm font-semibold text-slate-500 font-sans">
                    / {SUBSCRIPTION_PLANS.length} Plans
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Amount Spent</p>
                <p className="text-2xl font-extrabold font-mono text-[#172554] tabular-nums mt-1">
                  {fmtBDT(totalSpentAmount)}
                </p>
              </div>
            </div>

            {/* Plan-Wise Purchase Frequency Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-[#172554]">
                    Subscription Purchase Frequency by Plan
                  </h2>
                  <p className="text-xs text-slate-500">
                    Overview showing which subscriptions were purchased and how many times each plan was activated.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {totalPurchasedCount} Total Purchases
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm min-w-[640px]">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Subscription Plan</th>
                      <th className="py-3 px-4">Cycle & Rate</th>
                      <th className="py-3 px-4 text-right">Times Purchased</th>
                      <th className="py-3 px-4">Last Purchased</th>
                      <th className="py-3 px-4 text-right">Total Paid</th>
                      <th className="py-3 px-4 text-right">Current Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {planBreakdown.map((row) => (
                      <tr key={row.plan.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {row.plan.tierIndex}. {row.plan.name}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-xs tabular-nums">
                          {fmtBDT(row.plan.price)} · {row.plan.durationLabel}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#172554] tabular-nums">
                          {row.count} {row.count === 1 ? 'Time' : 'Times'}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-xs tabular-nums">
                          {row.lastPurchasedAt ? formatDate(row.lastPurchasedAt) : '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                          {fmtBDT(row.totalPaid)}
                        </td>
                        <td className="py-3 px-4 text-right text-xs font-semibold">
                          {row.isActive ? (
                            <span className="text-emerald-700">Currently Active</span>
                          ) : row.count > 0 ? (
                            <span className="text-slate-600">Purchased Before</span>
                          ) : (
                            <span className="text-slate-400">Not Purchased</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chronological Purchase History Ledger */}
            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-[#172554]">
                    Subscription Purchase History Ledger
                  </h2>
                  <p className="text-xs text-slate-500">
                    Complete chronological history of all purchased subscriptions, subscriber contact info, and printable PDF receipts.
                  </p>
                </div>

                {subscriptionOrders.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                        placeholder="Search plan, invoice, name..."
                        className="w-full sm:w-56 min-h-[38px] pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                    <select
                      value={historyPlanFilter}
                      onChange={(e) => setHistoryPlanFilter(e.target.value)}
                      className="min-h-[38px] px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    >
                      <option value="all">All Plans ({subscriptionOrders.length})</option>
                      {SUBSCRIPTION_PLANS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {subscriptionOrders.length === 0 ? (
                <div className="p-10 text-center space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                    <History className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#172554]">
                    No Subscription Purchases Recorded Yet
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Activate a Free Trial with your Name and Number or purchase a plan to track purchase counts and PDF receipts here.
                  </p>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveTab('plans')}
                    className="bg-[#172554] hover:bg-slate-900"
                  >
                    Browse Plans
                  </Button>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <p className="text-sm font-semibold text-slate-700">
                    No matching purchases found
                  </p>
                  <p className="text-xs text-slate-500">
                    Clear your search or plan filter to view all {subscriptionOrders.length} recorded purchases.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm min-w-[780px]">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">#</th>
                        <th className="py-3 px-4">Ref / Invoice</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Purchased Subscription</th>
                        <th className="py-3 px-4">Subscriber Name & Number</th>
                        <th className="py-3 px-4">Method & TrxID</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4 text-right">PDF & Print</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.map((ord, idx) => {
                        const purchaseSeq = subscriptionOrders.length - subscriptionOrders.indexOf(ord);
                        return (
                          <tr
                            key={ord.id}
                            className="hover:bg-slate-50/70 transition-colors"
                          >
                            <td className="py-3.5 px-4 font-mono text-xs text-slate-500 tabular-nums">
                              #{purchaseSeq || idx + 1}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-[#172554] tabular-nums">
                              {ord.invoiceNumber}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 font-mono text-xs tabular-nums">
                              {formatDate(ord.paidAt)}
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-semibold text-slate-900">{ord.planName}</p>
                              <p className="text-xs text-slate-500">{ord.durationLabel}</p>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-semibold text-slate-900">{ord.payerName}</p>
                              <p className="text-xs font-mono text-slate-500">
                                {ord.payerPhone || ord.accountNumber}
                              </p>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-semibold text-slate-800">{ord.paymentMethod}</p>
                              <p className="text-xs font-mono text-slate-500">
                                {ord.transactionId}
                              </p>
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                              {fmtBDT(ord.amount)}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedMyPlanOrderId(ord.id);
                                    setActiveTab('myplan');
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#172554] bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  My Plan PDF
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPreviewInvoice(ord)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  Print
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {trialRegistrations.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-[#172554]">
                      Free Trial Subscriber Database
                    </h3>
                    <p className="text-xs text-slate-500">
                      Saved Free Trial users with registered full name, contact number, and validity window.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-500 tabular-nums">
                    {trialRegistrations.length} Trial Users
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm min-w-[600px]">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Reference</th>
                        <th className="py-3 px-4">Subscriber Name</th>
                        <th className="py-3 px-4">Mobile / Phone Number</th>
                        <th className="py-3 px-4">Activated On</th>
                        <th className="py-3 px-4">Expires On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {trialRegistrations.map((trl) => (
                        <tr key={trl.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#172554] tabular-nums">
                            {trl.referenceCode}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {trl.subscriberName}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-700">
                            {trl.subscriberPhone}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-slate-600 tabular-nums">
                            {formatDate(trl.startedAt)}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-slate-600 tabular-nums">
                            {formatDate(trl.expiresAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Printable Invoice Modal from History */}
      <Modal
        isOpen={Boolean(previewInvoice)}
        onClose={() => setPreviewInvoice(null)}
        title="Subscription Payment Receipt"
        maxWidth="2xl"
        footer={
          previewInvoice && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPreviewInvoice(null)}
              >
                Close
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isGeneratingPdf}
                onClick={async () => {
                  if (!previewInvoice) return;
                  const targetPlan = getSubscriptionPlanById(previewInvoice.planId);
                  try {
                    setIsGeneratingPdf(true);
                    const filename = await downloadSubscriptionPdf({
                      schoolName: schoolSettings.schoolName,
                      institutionName: schoolSettings.institutionName,
                      address: schoolSettings.address,
                      phone: schoolSettings.phone,
                      email: schoolSettings.email,
                      plan: targetPlan,
                      activeSubscription,
                      order: previewInvoice,
                      totalPurchases: subscriptionOrders.length,
                    });
                    showToast(
                      'success',
                      'PDF Downloaded',
                      `Saved ${filename}.`
                    );
                  } finally {
                    setIsGeneratingPdf(false);
                  }
                }}
              >
                <Download className="w-4 h-4" />
                {isGeneratingPdf ? 'Preparing PDF...' : 'Download PDF'}
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() =>
                  printElement('printable-history-subscription-receipt', {
                    title: `Subscription-Invoice-${previewInvoice.invoiceNumber}`,
                    pageSize: 'A4',
                    orientation: 'portrait',
                  })
                }
                className="bg-[#172554] hover:bg-slate-900"
              >
                <Printer className="w-4 h-4" />
                Print Invoice
              </Button>
            </>
          )
        }
      >
        {previewInvoice && (
          <div id="printable-history-subscription-receipt">
            {renderPrintableReceiptBody(previewInvoice)}
          </div>
        )}
      </Modal>
    </div>
  );
};
