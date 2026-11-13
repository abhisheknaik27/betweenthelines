'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  Store,
  RefreshCcw,
  Gamepad2,
  Home,
} from 'lucide-react';
import {
  MisoGameState,
  MisoBudgetAllocation,
  applyJunction1,
  applyJunction2,
  applyJunction3,
  applyJunction4,
  applyJunction5,
  applyJunction6,
  applyJunction7,
  recordInfoCardOpened,
  getShareCurrentValue,
  getCommodityCurrentValue,
  getAccessibleResources,
  evaluateMisoEnding,
} from '@/lib/miso-engine';
import { MisoIllustrationPanel } from './GraphicIllustrations';
import { StopMotionVideoFrame } from './StopMotionVideoFrame';
import { InteractiveDecisionMotionStage, DecisionCutscene } from './InteractiveDecisionMotionStage';
import { LiveSimulationStage, SimulationOption } from './LiveSimulationStage';
import { soundFX } from '@/lib/sound';
import { VictoryCard } from './VictoryCard';

interface MisoGameViewProps {
  playerName: string;
  state: MisoGameState;
  setState: React.Dispatch<React.SetStateAction<MisoGameState>>;
  onOpenMarketplace: () => void;
  onRestart: () => void;
  onSwitchToFunfair: () => void;
  onGoHome: () => void;
}

export function MisoGameView({
  playerName,
  state,
  setState,
  onOpenMarketplace,
  onRestart,
  onSwitchToFunfair,
  onGoHome,
}: MisoGameViewProps) {
  // Local UI state for multi-step or configurable junction controls
  const [j2Option, setJ2Option] = useState<'J2_A' | 'J2_B' | 'J2_C' | 'J2_D'>('J2_A');
  const [j2Reasons, setJ2Reasons] = useState<string[]>([
    'Lower cost',
    'Keeping money for treatment',
  ]);

  // Junction 3 state
  const [activeVetInfoCard, setActiveVetInfoCard] = useState<string | null>('Consultation');
  const [j3Preset, setJ3Preset] = useState<'BALANCED' | 'TREATMENT_FIRST' | 'RESERVE_SAFE'>(
    'BALANCED'
  );
  const [j3Alloc, setJ3Alloc] = useState<MisoBudgetAllocation>({
    immediateCare: 800,
    transport: state.transport_expense || 250,
    food: state.food_expense || 100,
    treatmentAndMedicines: 2700,
    emergencyReserve: 500,
  });

  // Junction 4 state
  const [j4Option, setJ4Option] = useState<'J4_A' | 'J4_B' | 'J4_C' | 'J4_D' | 'J4_E'>('J4_C');
  const [j4LoanAmount, setJ4LoanAmount] = useState<500 | 1000 | 1500>(1000);
  const [j4CombineWelfare, setJ4CombineWelfare] = useState<boolean>(true);
  const [j4CombineTrusted, setJ4CombineTrusted] = useState<number>(500);
  const [j4CombineBank, setJ4CombineBank] = useState<number>(0);

  // Junction 5 state
  const [j5Option, setJ5Option] = useState<'J5_A' | 'J5_B' | 'J5_C' | 'J5_D' | 'J5_E'>('J5_B');
  const [j5Amount, setJ5Amount] = useState<number>(500);
  const [j5AssetKey, setJ5AssetKey] = useState<string>('companyA');

  // Junction 6 warning modal if user tries to skip urgent care
  const [showDelayWarning, setShowDelayWarning] = useState<boolean>(false);

  // Junction 7 final allocation sliders
  const totalLiquidAtJ7 = state.wallet_balance + state.savings_balance;
  const [j7Repay, setJ7Repay] = useState<number>(Math.min(state.repayment_due, totalLiquidAtJ7));
  const [j7Savings, setJ7Savings] = useState<number>(
    Math.max(0, Math.round((totalLiquidAtJ7 - Math.min(state.repayment_due, totalLiquidAtJ7)) * 0.4))
  );

  // Blueprint reflection state & compact tab selector
  const [blueprintTab, setBlueprintTab] = useState<'summary' | 'trail' | 'reflect'>('summary');
  const [selectedReflectionCard, setSelectedReflectionCard] = useState<string>(
    'Keep a dedicated emergency buffer liquid before locking funds in an FD or shares.'
  );

  const lastDecision = state.decisions[state.decisions.length - 1];

  // Interactive Visual Motion Cutscene State
  const [activeCutscene, setActiveCutscene] = useState<DecisionCutscene | null>(null);

  const toggleJ2Reason = (tag: string) => {
    soundFX.playClick();
    setJ2Reasons((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  // ============================================================================
  // STAGE RENDERER (WRAPPED BY CONTINUOUS STOP-MOTION VIDEO REEL FRAME)
  // ============================================================================
  const renderCurrentStage = () => {
    // ============================================================================
    // STAGE 1 & 2: JUNCTION 1 – DISCOVERING AND FEEDING MISO (STARTS IMMEDIATELY)
    // ============================================================================
    if (state.stage <= 2) {
      const options: SimulationOption[] = [
        {
          id: 'J1_A',
          title: 'Buy cat food nearby',
          badge: '₹100 · General Store',
          badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
          description: 'Wet recovery pouch from the highway general store.',
          icon: '🛒',
          previewDialogue: 'Dukandar: Premium recovery pouch ready on store shelf!',
          actionDialogue: 'Dukandar: Here is a fresh cat food nutrition pouch! Miso is eating eagerly. That will be ₹100 from your wallet.',
          actionImpactText: 'Miso fed & energized! (-₹100 from Wallet)',
          costBadge: '-₹100',
          costAmount: 100,
        },
        {
          id: 'J1_B',
          title: 'Ask Ramesh Kaka for food',
          badge: 'Free · Chai Tapri',
          badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
          description: 'Share safe, unseasoned food bits from the stall.',
          icon: '👨🏽‍🍳',
          previewDialogue: 'Ramesh Kaka: Take warm boiled egg & broth, no charge!',
          actionDialogue: 'Arey beta! Don\'t worry at all. Take this warm boiled egg and food scraps. Cat needs strength, no charge!',
          actionImpactText: 'Miso purring warmly! Cash saved for vet. (₹0)',
          costBadge: '₹0 Free',
          costAmount: 0,
        },
        {
          id: 'J1_C',
          title: 'Call animal rescuer',
          badge: 'Free · Helpline',
          badgeColor: 'bg-indigo-100 text-indigo-900 border border-indigo-300',
          description: 'Get feeding advice and local rescuer dispatch.',
          icon: '📞',
          previewDialogue: 'Maya: Keep Miso warm away from the highway road!',
          actionDialogue: 'Helpline connected! Keep Miso calm, warm, and away from the highway. We are coordinating clinic care right away!',
          actionImpactText: 'Expert guidance received! (₹0)',
          costBadge: '₹0 Free',
          costAmount: 0,
        },
        {
          id: 'J1_D',
          title: 'Coordinate with bystanders',
          badge: 'Free · Shared',
          badgeColor: 'bg-purple-100 text-purple-900 border border-purple-300',
          description: 'Ask travellers to help feed Miso while you plan.',
          icon: '🤝',
          previewDialogue: 'Priya: We have clean bottled water & towel!',
          actionDialogue: 'Here, let me give you a clean towel to wrap her in, and fresh bottled water!',
          actionImpactText: 'Community rallied around Miso! (₹0)',
          costBadge: '₹0 Free',
          costAmount: 0,
        },
      ];

      return (
        <LiveSimulationStage
          story="miso"
          stage={state.stage}
          totalStages={7}
          levelNumber={1}
          sceneTitle="Ramesh Chai Tapri · NH-48"
          sceneSubtitle="Near Ramesh Kaka's chai stall, Miso is limping & hungry."
          walletBalance={state.wallet_balance}
          promptQuestion="What would you do first to feed Miso?"
          promptDescription="Watch the scene react in real-time as you explore choices. Tap any option to take action in the live diorama."
          actor={{
            name: 'Ramesh Kaka',
            role: 'Chai Tapri Owner',
            avatar: '👨🏽‍🍳',
          }}
          options={options}
          onSelectOption={(optionId) => {
            setState((prev) => applyJunction1(prev, optionId as 'J1_A' | 'J1_B' | 'J1_C' | 'J1_D'));
          }}
        />
      );
    }

  // ============================================================================
  // STAGE 3: JUNCTION 2 – CHOOSING TRANSPORT
  // ============================================================================
  if (state.stage === 3) {
    const options: SimulationOption[] = [
      {
        id: 'J2_A',
        title: 'Rescuer transport',
        badge: '₹250 · Subsidized',
        badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
        description: 'Safe trauma carrier van with emergency care.',
        icon: '🚐',
        previewDialogue: 'Maya: Van equipped with trauma carrier and oxygen ready!',
        actionDialogue: 'Rescue carrier van arrived! Miso is nestled safely in the carrier. Sirens on, direct line to Dr. Kavita\'s clinic!',
        actionImpactText: 'Safe carrier ride! Subsidized fare. (-₹250)',
        costBadge: '-₹250',
        costAmount: 250,
      },
      {
        id: 'J2_B',
        title: 'Auto rickshaw',
        badge: '₹500 · Direct',
        badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
        description: 'Immediate direct ride via highway flyover.',
        icon: '🛺',
        previewDialogue: 'Raju Bhaiya: Flyover route reaches clinic in 8 mins flat!',
        actionDialogue: 'Meter down, hold on tight! Flyover route reaches Dr. Kavita\'s clinic in 8 minutes flat!',
        actionImpactText: 'Direct fast transit! Balanced cost. (-₹500)',
        costBadge: '-₹500',
        costAmount: 500,
      },
      {
        id: 'J2_C',
        title: 'Private AC Cab',
        badge: '₹800 · Premium',
        badgeColor: 'bg-indigo-100 text-indigo-900 border border-indigo-300',
        description: 'Quiet AC cabin, highway toll included.',
        icon: '🚕',
        previewDialogue: 'Cab Driver: AC on, peaceful ride away from road noise.',
        actionDialogue: 'AC on and trunk loaded. Quiet private ride, but toll and fare total ₹800.',
        actionImpactText: 'Quiet private ride, premium fare. (-₹800)',
        costBadge: '-₹800',
        costAmount: 800,
      },
      {
        id: 'J2_D',
        title: 'Volunteer / Bus',
        badge: '₹50 · Economy',
        badgeColor: 'bg-purple-100 text-purple-900 border border-purple-300',
        description: 'Pedestrian walk to city hospital bus stop.',
        icon: '🚏',
        previewDialogue: 'Aarav: Walking carefully with cushioned basket.',
        actionDialogue: 'Cushioned basket in hand, walking carefully along the roadside to catch the hospital bus.',
        actionImpactText: 'Preserved cash for treatment! (-₹50)',
        costBadge: '-₹50',
        costAmount: 50,
      },
    ];

    return (
      <LiveSimulationStage
        story="miso"
        stage={state.stage}
        totalStages={7}
        levelNumber={2}
        sceneTitle="Highway Auto Stand · 4km to Clinic"
        sceneSubtitle="Compare cost vs transit speed to preserve care funds."
        walletBalance={state.wallet_balance}
        promptQuestion="Which transport will you choose to reach the vet?"
        promptDescription="Watch the vehicles in the diorama react. Choose the best balance of speed & cost."
        actor={{
          name: 'Raju Bhaiya',
          role: 'Highway Transit Guide',
          avatar: '🛺',
        }}
        options={options}
        onSelectOption={(optionId) => {
          setState((prev) => applyJunction2(prev, optionId as 'J2_A' | 'J2_B' | 'J2_C' | 'J2_D', ['Speed', 'Cost']));
        }}
      />
    );
  }

  // ============================================================================
  // STAGE 4: JUNCTION 3 – VET ESTIMATE AND BUDGET
  // ============================================================================
  if (state.stage === 4) {
    const options: SimulationOption[] = [
      {
        id: 'BALANCED',
        title: 'Balanced Care Plan',
        badge: '₹3,500 · Recommended',
        badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
        description: 'Immediate pain relief, IV fluids & wound care while keeping reserve buffer.',
        icon: '🩺',
        previewDialogue: 'Dr. Kavita: Stabilizes trauma immediately, leaves cash reserve for later.',
        actionDialogue: 'Initial triage complete! Starting pain relief, wound cleaning, and IV hydration now.',
        actionImpactText: 'Miso stabilized and out of acute pain! (-₹3,500)',
        costBadge: '-₹3,500',
        costAmount: 3500,
      },
      {
        id: 'TREATMENT_FIRST',
        title: 'Max Treatment Priority',
        badge: '₹4,000 · Intensive',
        badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
        description: 'Maximum initial care including immediate broad-spectrum antibiotics.',
        icon: '💊',
        previewDialogue: 'Dr. Kavita: Intensive medication administered upfront.',
        actionDialogue: 'Intensive medication administered upfront. Miso is resting peacefully.',
        actionImpactText: 'High treatment focus applied! (-₹4,000)',
        costBadge: '-₹4,000',
        costAmount: 4000,
      },
      {
        id: 'RESERVE_SAFE',
        title: 'High Reserve Safety',
        badge: '₹3,000 · Conservative',
        badgeColor: 'bg-indigo-100 text-indigo-900 border border-indigo-300',
        description: 'Core emergency triage, keeping larger cash reserve liquid.',
        icon: '🛡️',
        previewDialogue: 'Dr. Kavita: Core pain relief given, keeping cash buffer liquid.',
        actionDialogue: 'Core wounds dressed and safe hydration provided. Reserve cash kept safe.',
        actionImpactText: 'Core stabilization done; liquidity preserved! (-₹3,000)',
        costBadge: '-₹3,000',
        costAmount: 3000,
      },
    ];

    return (
      <LiveSimulationStage
        story="miso"
        stage={state.stage}
        totalStages={7}
        levelNumber={3}
        sceneTitle="Dr. Kavita's Animal Clinic"
        sceneSubtitle="Emergency triage & initial bill stabilization."
        walletBalance={state.wallet_balance}
        promptQuestion="Select your budget allocation plan for emergency care:"
        promptDescription="Dr. Kavita examines Miso. Choose how to allocate between urgent care & reserves."
        actor={{
          name: 'Dr. Kavita',
          role: 'Chief Veterinarian',
          avatar: '🩺',
        }}
        options={options}
        onSelectOption={(optionId) => {
          const preset = optionId as 'BALANCED' | 'TREATMENT_FIRST' | 'RESERVE_SAFE';
          const cap = state.wallet_balance;
          const alloc = {
            immediateCare: 800,
            transport: state.transport_expense,
            food: state.food_expense,
            treatmentAndMedicines: preset === 'TREATMENT_FIRST' ? 3200 : preset === 'BALANCED' ? 2700 : 2200,
            emergencyReserve: Math.max(0, cap - 3500),
          };
          setState((prev) => applyJunction3(prev, alloc, preset));
        }}
      />
    );
  }

  // ============================================================================
  // STAGE 5: JUNCTION 4 – MANAGING THE FINANCIAL GAP
  // ============================================================================
  if (state.stage === 5) {
    const options: SimulationOption[] = [
      {
        id: 'J4_A',
        title: 'Borrow from trusted friend',
        badge: '0% Interest · Personal',
        badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
        description: 'Friendly support to cover medicines with no interest fee.',
        icon: '🤝',
        previewDialogue: 'Friend: Take ₹1,000 to cover medicines, repay when settled.',
        actionDialogue: 'Friendly loan received with zero interest! Medicines funded without financial panic.',
        actionImpactText: 'Friendly support secured at 0% interest!',
        costBadge: '+₹1,000 Support',
      },
      {
        id: 'J4_B',
        title: 'Co-Op Bank Credit',
        badge: '10% Interest · Formal',
        badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
        description: 'Structured short-term loan through the town cooperative bank.',
        icon: '🏦',
        previewDialogue: 'Manager: ₹1,000 short-term credit approved with standard terms.',
        actionDialogue: 'Bank credit approved! Funds cleared immediately for clinic prescription.',
        actionImpactText: 'Formal credit established with clear repayment terms.',
        costBadge: '+₹1,000 Loan',
      },
      {
        id: 'J4_C',
        title: 'Animal Welfare Grant',
        badge: 'Free Grant · Community',
        badgeColor: 'bg-indigo-100 text-indigo-900 border border-indigo-300',
        description: 'Community stray animal relief subsidy, no repayment needed.',
        icon: '🐾',
        previewDialogue: 'Welfare Rep: ₹500 stray relief subsidy available for verified rescues.',
        actionDialogue: 'Welfare grant approved! ₹500 direct aid applied to medical bill.',
        actionImpactText: 'Free community grant secured! (₹0 debt)',
        costBadge: '+₹500 Grant',
      },
      {
        id: 'J4_D',
        title: 'Self-Funded from Cash',
        badge: 'No Debt · Self-Reliant',
        badgeColor: 'bg-purple-100 text-purple-900 border border-purple-300',
        description: 'Use existing cash wallet without taking any loans.',
        icon: '💵',
        previewDialogue: 'Aarav: Zero debt, keeping financial profile 100% clean.',
        actionDialogue: 'Paid directly from wallet! Zero liabilities created.',
        actionImpactText: 'Clean balance sheet maintained, zero interest due!',
        costBadge: 'No Debt ✅',
      },
    ];

    return (
      <LiveSimulationStage
        story="miso"
        stage={state.stage}
        totalStages={7}
        levelNumber={4}
        sceneTitle="Town Bazaar & Co-Op Bank"
        sceneSubtitle="Arrange funds for medicines without draining your safety net."
        walletBalance={state.wallet_balance}
        promptQuestion="How will you arrange ₹1,500 for medicines & follow-up care?"
        promptDescription="Watch the bank and welfare desk react in the diorama as you review credit options."
        actor={{
          name: 'Welfare & Credit Desk',
          role: 'Town Bazaar Services',
          avatar: '🏛️',
        }}
        options={options}
        onSelectOption={(optionId) => {
          setState((prev) =>
            applyJunction4(prev, {
              optionId: optionId as 'J4_A' | 'J4_B' | 'J4_C' | 'J4_D' | 'J4_E',
              trustedBorrowAmount: optionId === 'J4_A' ? 1000 : 0,
              bankLoanAmount: optionId === 'J4_B' ? 1000 : 0,
              requestWelfareSupport: optionId === 'J4_C',
            })
          );
        }}
      />
    );
  }

  // ============================================================================
  // STAGE 6: JUNCTION 5 – THE STATIONARY FINANCIAL MARKETPLACE
  // ============================================================================
  if (state.stage === 6) {
    const options: SimulationOption[] = [
      {
        id: 'J5_A',
        title: 'Keep 100% in Wallet Cash',
        badge: '0% · Instant Access',
        badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
        description: 'Keep all cash in wallet for immediate emergency readiness.',
        icon: '💵',
        previewDialogue: 'Aarav: Maximum liquidity, ready for any unexpected clinic bill.',
        actionDialogue: 'Cash kept safe in wallet! 100% liquid and ready for any surprise expense.',
        actionImpactText: 'Immediate liquidity preserved!',
        costBadge: '100% Liquid',
      },
      {
        id: 'J5_B',
        title: 'Deposit in Savings Account',
        badge: '+3% APY · Flexible',
        badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
        description: 'Earn 3% interest while preserving easy same-day withdrawal.',
        icon: '🐷',
        previewDialogue: 'Bank: 3% daily interest with unrestricted withdrawal.',
        actionDialogue: 'Savings account funded! Earning 3% interest with easy emergency access.',
        actionImpactText: 'Growth + flexible liquidity balanced!',
        costBadge: '+3% Interest',
      },
      {
        id: 'J5_C',
        title: 'Lock in Fixed Deposit (FD)',
        badge: '+5% APY · Term Lock',
        badgeColor: 'bg-indigo-100 text-indigo-900 border border-indigo-300',
        description: 'Earn guaranteed 5% return, but early break incurs a penalty.',
        icon: '🔒',
        previewDialogue: 'Bank: High 5% return locked for the full term.',
        actionDialogue: 'Fixed deposit certificate issued! 5% interest locked in.',
        actionImpactText: 'Higher guaranteed yield secured!',
        costBadge: '+5% Guaranteed',
      },
      {
        id: 'J5_D',
        title: 'Diversify in Equity Shares',
        badge: 'Market Growth · Moderate Risk',
        badgeColor: 'bg-purple-100 text-purple-900 border border-purple-300',
        description: 'Invest in reputable company shares for market upside.',
        icon: '📈',
        previewDialogue: 'Broker: Company A & B trading active at the exchange.',
        actionDialogue: 'Shares purchased! Portfolio diversified into productive assets.',
        actionImpactText: 'Market growth potential added to portfolio!',
        costBadge: 'Equity Growth',
      },
    ];

    return (
      <LiveSimulationStage
        story="miso"
        stage={state.stage}
        totalStages={7}
        levelNumber={5}
        sceneTitle="Financial Marketplace · Town Bazaar"
        sceneSubtitle="Balance immediate liquidity against asset growth."
        walletBalance={state.wallet_balance}
        promptQuestion={`You have ₹${state.wallet_balance.toLocaleString('en-IN')} cash. How will you store it?`}
        promptDescription="Watch the bank vault and market scales react in the diorama as you choose your holding."
        actor={{
          name: 'Market Broker',
          role: 'Town Financial Desk',
          avatar: '⚖️',
        }}
        options={options}
        onSelectOption={(optionId) => {
          setState((prev) =>
            applyJunction5(
              prev,
              optionId as 'J5_A' | 'J5_B' | 'J5_C' | 'J5_D' | 'J5_E',
              optionId === 'J5_D' ? 2 : 500,
              'companyA'
            )
          );
        }}
      />
    );
  }

  // ============================================================================
  // STAGE 7: JUNCTION 6 – UNEXPECTED EXPENSE AND MARKET UPDATE
  // ============================================================================
  if (state.stage === 7) {
    const options: SimulationOption[] = [
      {
        id: 'J6_A',
        title: 'Pay from Liquid Savings/Wallet',
        badge: '₹1,000 · Self-Funded',
        badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
        description: 'Pay ₹1,000 directly from accessible liquid cash.',
        icon: '🔬',
        previewDialogue: 'Dr. Kavita: Liquid payment clears lab testing instantly.',
        actionDialogue: 'Lab test done! X-ray and ultrasound show clean bones with zero hairline fractures.',
        actionImpactText: 'Diagnostic scan complete! Zero fractures confirmed. (-₹1,000)',
        costBadge: '-₹1,000',
        costAmount: 1000,
      },
      {
        id: 'J6_D',
        title: 'Clinic Welfare Grant Share',
        badge: '₹500 Grant + ₹500 Cash',
        badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
        description: 'Split the cost with the clinic emergency welfare fund.',
        icon: '💡',
        previewDialogue: 'Dr. Kavita: Clinic welfare covers half the lab cost.',
        actionDialogue: 'Welfare grant matched! Paw radiograph confirmed clean soft-tissue recovery.',
        actionImpactText: 'Cost halved via welfare support! (-₹500)',
        costBadge: '-₹500',
        costAmount: 500,
      },
      {
        id: 'J6_C',
        title: 'Liquidate Market Investments',
        badge: 'Asset Sale',
        badgeColor: 'bg-indigo-100 text-indigo-900 border border-indigo-300',
        description: 'Sell shares/commodities to cover the unexpected diagnostic bill.',
        icon: '🩻',
        previewDialogue: 'Broker: Liquidating investments to pay medical fee.',
        actionDialogue: 'Investments sold at current market value to fund diagnostic report!',
        actionImpactText: 'Investments converted to emergency health care.',
        costBadge: 'Liquidated',
      },
      {
        id: 'J6_E',
        title: 'Consult Vet on Urgency First',
        badge: 'Guidance First',
        badgeColor: 'bg-purple-100 text-purple-900 border border-purple-300',
        description: 'Ask Dr. Kavita to assess risks and tiered alternatives before paying.',
        icon: '📋',
        previewDialogue: 'Dr. Kavita: Let me explain the test options and charity match.',
        actionDialogue: 'Dr. Kavita: The paw is swollen but vitals are strong. A targeted focal ultrasound is safe and affordable.',
        actionImpactText: 'Medical clarity gained before spending!',
        costBadge: 'Informed Care',
      },
    ];

    return (
      <LiveSimulationStage
        story="miso"
        stage={state.stage}
        totalStages={7}
        levelNumber={6}
        sceneTitle="Diagnostic Lab · Urgent Ultrasound"
        sceneSubtitle="Dr. Kavita recommends an urgent diagnostic test to rule out bone fractures."
        walletBalance={state.wallet_balance}
        promptQuestion="How will you respond to the urgent ₹1,000 diagnostic test?"
        promptDescription="Watch the X-ray illuminator and lab technician react in the diorama as you decide."
        actor={{
          name: 'Dr. Kavita',
          role: 'Chief Veterinarian',
          avatar: '🔬',
        }}
        options={options}
        onSelectOption={(optionId) => {
          setState((prev) => applyJunction6(prev, optionId as 'J6_A' | 'J6_B' | 'J6_C' | 'J6_D' | 'J6_E', false));
        }}
      />
    );
  }

  // ============================================================================
  // STAGE 8: JUNCTION 7 – FINAL ALLOCATION AND REFLECTION
  // ============================================================================
  if (state.stage === 8) {
    const totalLiquid = state.wallet_balance + state.savings_balance;
    const safeRepay = Math.min(state.repayment_due, totalLiquid);
    const afterRepay = Math.max(0, totalLiquid - safeRepay);

    const options: SimulationOption[] = [
      {
        id: 'CLOSE_DEBT',
        title: 'Full Debt Closure + Safety Buffer',
        badge: 'Clean Slate · Recommended',
        badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
        description: `Pay all ₹${state.repayment_due} debt and keep remainder in savings & wallet.`,
        icon: '💖',
        previewDialogue: 'Aarav: Zero debt remaining, clean credit profile restored.',
        actionDialogue: 'All liabilities settled in full! Miso is healthy, purring, and ready for adoption!',
        actionImpactText: 'Debt 100% cleared! Financial health score maximized.',
        costBadge: 'Debt Free 🌟',
      },
      {
        id: 'SPLIT_BALANCED',
        title: 'Balanced Repayment & Savings',
        badge: '50-50 Balanced',
        badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
        description: 'Pay 50% of debt now, keep larger emergency savings buffer.',
        icon: '⚖️',
        previewDialogue: 'Aarav: Balanced split between debt reduction and rainy-day cash.',
        actionDialogue: 'Half debt cleared, remaining funds allocated to emergency reserves!',
        actionImpactText: 'Balanced liquidity maintained for future emergencies.',
        costBadge: 'Balanced Plan',
      },
      {
        id: 'HOLD_LIQUID',
        title: 'Maximum Liquid Cushion',
        badge: 'High Liquidity',
        badgeColor: 'bg-indigo-100 text-indigo-900 border border-indigo-300',
        description: 'Pay minimum required on debt, keep maximum cash in wallet.',
        icon: '🛡️',
        previewDialogue: 'Aarav: High liquidity kept in wallet for unexpected expenses.',
        actionDialogue: 'High liquidity preserved in savings! Ongoing repayment scheduled.',
        actionImpactText: 'Maximum cash buffer retained.',
        costBadge: 'Liquid Cushion',
      },
    ];

    return (
      <LiveSimulationStage
        story="miso"
        stage={state.stage}
        totalStages={7}
        levelNumber={7}
        sceneTitle="Miso's Recovery Room · Settlement"
        sceneSubtitle="Settle debts, allocate reserves, and finalize Miso's rescue."
        walletBalance={state.wallet_balance}
        promptQuestion={`Total Liquid Funds: ₹${totalLiquid.toLocaleString('en-IN')}. Choose your settlement strategy:`}
        promptDescription="Miso is resting safely in her warm blanket. Finalize your financial allocation to complete the story."
        actor={{
          name: 'Care Team',
          role: 'Recovery & Settlement',
          avatar: '💖',
        }}
        options={options}
        onSelectOption={(optionId) => {
          let repayAmt = safeRepay;
          let savingsAmt = Math.round(afterRepay * 0.5);
          if (optionId === 'SPLIT_BALANCED') {
            repayAmt = Math.round(safeRepay * 0.5);
            savingsAmt = Math.round((totalLiquid - repayAmt) * 0.6);
          } else if (optionId === 'HOLD_LIQUID') {
            repayAmt = Math.round(safeRepay * 0.25);
            savingsAmt = Math.round((totalLiquid - repayAmt) * 0.3);
          }
          const walletRem = Math.max(0, totalLiquid - repayAmt - savingsAmt);
          setState((prev) =>
            applyJunction7(prev, {
              repaymentAmount: repayAmt,
              savingsAmount: savingsAmt,
              accessibleWalletAmount: walletRem,
              investmentAmount: 0,
            })
          );
        }}
      />
    );
  }

  // ============================================================================
  // STAGE 9: ENDING & COMPACT TABBED PERSONAL DECISION BLUEPRINT
  // ============================================================================
  const ending = evaluateMisoEnding(state);
  const reflectionCards = [
    'Keep a dedicated emergency buffer liquid before locking funds in an FD or shares.',
    'Ask about community support or animal welfare grants early to reduce high-interest borrowing.',
    'Compare transport and itemised costs carefully so more money stays available for medical treatment.',
  ];

  return (
    <div className="game-results-scroll flex flex-col gap-2 overflow-y-auto pr-1">
      <VictoryCard
        story="miso"
        playerName={playerName}
        title={ending.title}
        subtitle={`${ending.careOutcomeLabel} · ${ending.financialCategory}`}
        score={ending.finalNetPosition}
        totalSeconds={285}
        remainingSeconds={state.timerSeconds}
        onGoHome={onGoHome}
      />
      <MisoIllustrationPanel
        scene="recovery"
        mood={ending.endingId === 'ENDING_D' ? 'uncertain' : 'recovered'}
        caption={`${ending.title} — ${ending.careOutcomeLabel}`}
      />

      <div className="rounded-xl border border-slate-300 bg-white p-3 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between gap-1">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-[#C85A3A]">
              DECISION BLUEPRINT · {ending.financialCategory}
            </span>
            <h1 className="text-base font-extrabold text-[#1E1B18] leading-tight">
              {ending.title}
            </h1>
          </div>
          <span className="rounded-md bg-emerald-100 border border-emerald-400 px-2 py-0.5 font-mono text-xs font-extrabold text-emerald-900">
            Net: ₹{ending.finalNetPosition.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Sub-tabs so the Blueprint fits on a single screen without scrolling */}
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
          {[
            { id: 'summary' as const, label: '1. Summary' },
            { id: 'trail' as const, label: '2. Money Trail' },
            { id: 'reflect' as const, label: '3. Reflection' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setBlueprintTab(t.id)}
              className={`rounded-md py-1 text-[11px] font-chunky font-bold cursor-pointer ${
                blueprintTab === t.id
                  ? 'bg-white text-slate-950 shadow-2xs border border-slate-300'
                  : 'text-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {blueprintTab === 'summary' && (
          <div className="space-y-2">
            <p className="text-xs text-[#1E1B18] leading-snug bg-[#F9F6F0] p-2.5 rounded-lg border border-slate-200">
              {ending.narrative}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="rounded-lg border border-slate-200 bg-[#FFFBEB] p-2">
                <span className="text-[10px] font-bold text-[#78716C]">Wallet Cash</span>
                <p className="font-mono text-sm font-extrabold text-[#1E1B18]">
                  ₹{state.wallet_balance.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-[#F0FDF4] p-2">
                <span className="text-[10px] font-bold text-[#065F46]">Savings + Invest</span>
                <p className="font-mono text-sm font-extrabold text-[#065F46]">
                  ₹
                  {(
                    state.savings_balance +
                    state.fd_current_value +
                    getShareCurrentValue(state) +
                    getCommodityCurrentValue(state)
                  ).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-[#FEF2F2] p-2">
                <span className="text-[10px] font-bold text-[#991B1B]">Care Expenses</span>
                <p className="font-mono text-sm font-extrabold text-[#DC2626]">
                  ₹{state.total_expenses.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-[#EFF6FF] p-2">
                <span className="text-[10px] font-bold text-[#1E40AF]">Final Net Worth</span>
                <p className="font-mono text-sm font-extrabold text-[#1E40AF]">
                  ₹{ending.finalNetPosition.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        )}

        {blueprintTab === 'trail' && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
              <div className="rounded-lg bg-[#F9F6F0] p-2 border border-slate-200">
                <span className="block text-[9px] text-[#78716C]">START → SPENT</span>
                <strong>₹5,000 → -₹{state.total_expenses}</strong>
              </div>
              <div className="rounded-lg bg-[#F9F6F0] p-2 border border-slate-200">
                <span className="block text-[9px] text-[#059669]">GRANTS / DEBT</span>
                <strong>
                  +₹{state.support_received} / -₹{state.repayment_due}
                </strong>
              </div>
            </div>
            <div className="space-y-1.5">
              {ending.observations.slice(0, 2).map((obs, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-slate-200 bg-[#F9F6F0] p-2 flex items-start gap-2"
                >
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#C85A3A] mt-0.5" />
                  <p className="text-[11px] font-medium text-[#1E1B18] leading-snug">
                    &ldquo;{obs}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {blueprintTab === 'reflect' && (
          <div className="space-y-2">
            <div className="rounded-xl bg-slate-950 text-white p-3 shadow-md">
              <h3 className="font-title text-sm">
                What would you consider differently next time?
              </h3>
              <p className="font-chunky text-xs text-slate-300 mt-0.5">
                Select your key financial takeaway from Miso’s journey.
              </p>
            </div>
            <div className="space-y-2">
              {reflectionCards.map((card, idx) => {
                const emojis = ['📋', '✅', '💰'];
                const gradients = [
                  'bg-gradient-to-br from-amber-50 to-orange-100 border-amber-300',
                  'bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-300',
                  'bg-gradient-to-br from-indigo-50 to-blue-100 border-indigo-300',
                ];
                const selected = selectedReflectionCard === card;
                return (
                  <button
                    key={card}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setSelectedReflectionCard(card);
                      setState((prev) => ({ ...prev, reflection_note: card }));
                    }}
                    className={`w-full text-left rounded-xl border p-3 text-xs font-bold transition-all duration-150 cursor-pointer flex items-center gap-3 shadow-sm hover:scale-[1.01] hover:shadow-md active:scale-[0.99] ${
                      selected
                        ? `${gradients[idx % gradients.length]} ring-2 ring-slate-900 shadow-md`
                        : gradients[idx % gradients.length]
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-white/80 border-2 border-current shadow-sm shrink-0">
                      {emojis[idx % emojis.length]}
                    </div>
                    <span className="flex-1 text-[#1E1B18] leading-snug">
                      {selected ? `✓ ${card}` : card}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={onGoHome}
            className="btn-tactile-yellow w-full flex items-center justify-center gap-2 rounded-xl bg-brand-yellow hover:bg-yellow-300 text-slate-950 py-2.5 px-4 text-xs sm:text-sm font-chunky font-black shadow-md active:scale-[0.98] transition-all cursor-pointer"
          >
            <Home className="h-4 w-4 stroke-[2.5]" />
            <span>Go Back to Home</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onRestart}
              data-start="true"
              className="btn-tactile-white flex items-center justify-center gap-1.5 rounded-lg bg-white py-2 text-xs font-chunky font-bold text-slate-900 cursor-pointer"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              <span>Replay Miso</span>
            </button>

            <button
              type="button"
              onClick={onSwitchToFunfair}
              className="btn-tactile-white flex items-center justify-center gap-1.5 rounded-lg bg-white hover:bg-slate-50 py-2 text-xs font-chunky font-bold text-slate-900 cursor-pointer"
            >
              <Gamepad2 className="h-3.5 w-3.5" />
              <span>Play Funfair 4×</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    );
  };

  const levelNum = Math.max(1, Math.min(7, state.stage - 1));
  const sceneTitle =
    state.stage <= 2
      ? 'First Aid & Roadside Food'
      : state.stage === 3
      ? 'Safe Transport to Clinic'
      : state.stage === 4
      ? 'Vet Triage & Budget Allocation'
      : state.stage === 5
      ? 'Funding Emergency Care'
      : state.stage === 6
      ? 'Bazaar Liquidity vs Reserves'
      : state.stage === 7
      ? 'Unexpected Diagnostic Care'
      : state.stage === 8
      ? 'Follow-Up Care & Repayment'
      : "Miso's Story Blueprint";

  return (
    <>
      <InteractiveDecisionMotionStage
        cutscene={activeCutscene}
        onDismiss={() => setActiveCutscene(null)}
      />
      <StopMotionVideoFrame
        story="miso"
        stage={state.stage}
        totalStages={7}
        levelNumber={levelNum}
        sceneTitle={sceneTitle}
      >
        {renderCurrentStage()}
      </StopMotionVideoFrame>
    </>
  );
}
