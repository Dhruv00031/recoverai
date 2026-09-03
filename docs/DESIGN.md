# RecoverAI --- Design Specification

**Version:** 1.0\
**Date:** August 23, 2026\
**Document Status:** Locked design source of truth\
**Design tool:** Stitch\
**Related document:** `PRD.md`

------------------------------------------------------------------------

## 1. Design Objective

RecoverAI should look and behave like a premium AI fintech operations
platform.

The design must communicate four ideas immediately:

1.  Revenue is measurable.
2.  AI decisions are explainable.
3.  AI autonomy is bounded by merchant policies.
4.  Every important action is traceable.

The interface should feel sophisticated and data-rich without becoming
visually noisy.

------------------------------------------------------------------------

## 2. Design Philosophy

### 2.1 Outcome Over Activity

Prioritize:

-   Revenue at Risk
-   Recoverable Revenue
-   Recovered Revenue
-   Recovery Rate
-   Expected Recovery

Avoid making raw action counts the primary visual focus.

### 2.2 Explainability Over Magic

Important AI decisions must show concise reasons.

Example:

``` text
AI Decision: RETRY
Confidence: 92%

Why:
✓ Temporary failure
✓ Low risk
✓ Recovery probability above threshold
✓ Retry limit not reached
```

### 2.3 Bounded Autonomy

The interface should make it obvious that merchants control the
boundaries of automation.

``` text
Merchant Policies
       │
Guardrail Evaluation
       │
AI Decision
       │
Permitted Action
```

### 2.4 Trust Through Traceability

Every autonomous action should be traceable to:

-   transaction state,
-   AI decision,
-   policy version,
-   guardrail checks,
-   system actor,
-   action result.

### 2.5 Premium Fintech Aesthetic

The visual language should feel closer to an advanced financial
intelligence product than a generic SaaS admin panel.

------------------------------------------------------------------------

# 3. Visual Identity

## 3.1 Color Direction

The UI uses a near-black foundation with restrained high-energy accents.

### Base

-   Primary background: near-black / deep charcoal
-   Secondary surfaces: slightly lighter charcoal
-   Elevated surfaces: dark neutral panels
-   Borders: subtle cool-gray / translucent white
-   Dividers: low-contrast gray

### Primary Accent

**Electric cyan / cyan-blue**

Used for:

-   primary actions,
-   active navigation,
-   recovery-positive metrics,
-   progress,
-   successful system states,
-   key data visualizations.

### AI Accent

**Violet / blue-violet**

Used for:

-   AI-generated insights,
-   AI decisions,
-   intelligence indicators,
-   prediction-related visual elements.

### Warning

**Amber / muted yellow**

Used for:

-   medium risk,
-   pending decisions,
-   manual-review states,
-   caution indicators.

### Negative

**Muted coral / red**

Used for:

-   failed payments,
-   high risk,
-   blocked actions,
-   negative changes.

### Success

**Cyan/teal**

Used for:

-   successful recovery,
-   passed guardrails,
-   active automation,
-   positive outcome.

------------------------------------------------------------------------

## 3.2 Color Usage Rules

Do not use accent colors everywhere.

Use accent colors to create hierarchy.

Recommended visual hierarchy:

``` text
Neutral
  │
Cyan
  │
Violet
  │
Amber / Coral
```

Large backgrounds should remain dark and neutral.

Glows should be subtle.

------------------------------------------------------------------------

# 4. Typography

## 4.1 General Style

Use a modern sans-serif typeface.

Characteristics:

-   strong geometric or contemporary appearance,
-   high readability,
-   bold display headings,
-   compact labels,
-   clear numerical hierarchy.

## 4.2 Heading Hierarchy

Landing page hero:

Large, bold, high contrast.

Dashboard/page titles:

Large bold heading.

Section titles:

Medium/bold.

Data labels:

Small uppercase or compact label style.

Metrics:

Large and highly legible.

Example:

``` text
RECOVERED
₹5.2L
```

The number must dominate the label.

------------------------------------------------------------------------

# 5. Layout System

## 5.1 Desktop

Primary target:

**1440px desktop viewport**

Use a centered application frame with generous but controlled spacing.

Recommended content width:

``` text
1200–1400px
```

## 5.2 Grid

Use a flexible grid rather than hardcoded positioning.

Typical dashboard structure:

``` text
┌─────────────────────────────────────────────┐
│ Header / Navigation                         │
├─────────────────────────────────────────────┤
│ Page Header                                 │
├──────────────┬──────────────────────────────┤
│ KPI / Summary │ Main visualization           │
├──────────────┼──────────────────────────────┤
│ Secondary     │ Insights / Breakdown         │
│ visualization │                              │
└──────────────┴──────────────────────────────┘
```

## 5.3 Spacing

Use consistent spacing tokens.

Suggested base unit:

``` text
4px
```

Common values:

``` text
4
8
12
16
24
32
48
64
```

Avoid random spacing values.

------------------------------------------------------------------------

# 6. Surfaces and Components

## 6.1 Cards

Cards should:

-   use dark elevated surfaces,
-   have thin borders,
-   use restrained corner radii,
-   contain clear hierarchy,
-   avoid excessive shadows.

Cards should not look like disconnected widgets.

## 6.2 Borders

Use thin, subtle borders.

Active/selected elements may use:

-   cyan border,
-   violet border,
-   subtle glow.

## 6.3 Buttons

Primary button:

-   cyan/light gradient or cyan-highlighted surface,
-   dark readable text,
-   compact height,
-   clear action label.

Secondary button:

-   dark surface,
-   subtle border,
-   white/gray text.

Danger/stop:

-   restrained coral/red.

Avoid oversized pill buttons except for compact status indicators.

------------------------------------------------------------------------

# 7. Navigation

Primary application navigation:

``` text
Overview
Recovery Queue
Analytics
Policies
Audit Log
```

The active item should be indicated with:

-   cyan underline or accent,
-   brighter text,
-   subtle active glow where appropriate.

Top-right area:

``` text
AI ENGINE ONLINE
Merchant Profile
Notifications / Utility
```

The navigation must remain consistent across all application screens.

------------------------------------------------------------------------

# 8. Responsive Behavior

The primary hackathon demo is desktop-first, but the application should
remain usable on smaller screens.

## Desktop

Use:

-   multi-column layouts,
-   large data visualizations,
-   full navigation.

## Tablet

Reduce:

-   column count,
-   chart width,
-   horizontal padding.

## Mobile

Convert:

``` text
multi-column → single column
```

Navigation may become a compact menu.

Tables should become:

-   horizontally scrollable,
-   or card/list based.

Do not simply shrink desktop UI until it becomes unreadable.

------------------------------------------------------------------------

# 9. Locked Screen Specifications

------------------------------------------------------------------------

## 9.1 Landing Page

### Purpose

Introduce RecoverAI and communicate the core product promise.

### Hero

Primary headline:

> **Recover the right revenue.**

Supporting message:

> AI-powered revenue recovery that knows when to act, what to do, and
> when to stop.

### Primary actions

``` text
Explore Recovery
View Demo
```

### Visual

Show a cinematic recovery journey:

``` text
Payment Failed
      │
AI Analyzing
      │
Analysis
      │
AI Decision
      │
Recovered
```

The visual should communicate intelligence without requiring the user to
read technical details.

### Metrics

Show:

-   Revenue at Risk
-   Recovery Probability
-   Recovered

### Visual treatment

-   dark background,
-   cyan/violet accents,
-   subtle animated-looking data path,
-   restrained glow.

------------------------------------------------------------------------

## 9.2 Merchant Dashboard

### Purpose

Merchant command center.

### Header

``` text
RecoverAI
Overview
Recovery Queue
Analytics
Policies
Audit Log
```

### Main heading

> **Revenue intelligence, in motion.**

### Primary KPIs

``` text
Revenue at Risk
₹12.4L

Recoverable
₹8.7L

Recovered
₹5.2L

Recovery Rate
62%
```

### Main intelligence panel

Visual flow:

``` text
Observe
  │
Analyze
  │
Predict
  │
Decide
  │
Act
  │
Recover
```

Show:

-   transaction count,
-   at-risk count,
-   AI analysis state,
-   recommended actions,
-   recovered value,
-   AI insight.

### Recovery Queue preview

Show representative transactions with:

-   transaction ID,
-   amount,
-   risk,
-   recovery probability,
-   recommendation,
-   status.

------------------------------------------------------------------------

## 9.3 Recovery Queue

### Purpose

Operational workspace for prioritizing recovery opportunities.

### Page title

> **Recovery Queue**

Supporting text:

> Prioritize the revenue opportunities most worth recovering.

### Priority principle

Display:

> Don't recover everything. Recover what is worth recovering.

### Summary

``` text
Recoverable
₹8.7L

Opportunities
137

High Confidence
89

Recovery Rate
62%
```

### Filters

``` text
All
Ready
At Risk
High Value
Manual Review
Recovered
```

Additional controls:

-   Search
-   Filter
-   Sort
-   Pagination

### Table columns

``` text
Priority
Transaction
Amount
Failure
Risk
Recovery
Expected Recovery
AI Recommendation
Attempts
Status
```

### Row behavior

Selecting a transaction opens:

**Transaction Investigation**

------------------------------------------------------------------------

## 9.4 Transaction Investigation

### Purpose

Explain a single AI recovery decision.

### Example transaction

``` text
RX-28491
₹42,500
Payment Failed
Temporary Failure
```

### Primary metrics

``` text
Risk
18/100
LOW

Recovery Probability
92%
HIGH

Expected Recovery
₹39,100

Attempts
1/2
```

### AI Analysis

Primary decision:

> **AI DECISION: RETRY**

Confidence:

``` text
92%
```

### Decision factors

``` text
✓ Temporary payment failure detected
✓ Risk score below configured threshold
✓ Recovery probability exceeds minimum
✓ Expected recovery value is high
✓ Retry limit has not been reached
```

### Recommended Action

``` text
RETRY PAYMENT
Expected: ₹39,100
Confidence: 92%
```

Actions:

``` text
Approve Recovery
Manual Review
Stop Recovery
```

### Merchant Guardrails

Display:

``` text
Max Risk
Actual: 18
Passed

Min Probability
Actual: 92%
Passed

Max Retries
Current: 1
Passed

Max Amount
Passed
```

### Audit timeline

Show:

-   Payment Failed
-   Risk Calculated
-   Probability Calculated
-   Expected Recovery Calculated
-   AI Recommendation
-   Guardrails Approved

------------------------------------------------------------------------

## 10. Analytics

## Purpose

Prove that RecoverAI creates measurable business impact.

### Page title

> **Recovery intelligence.**

Supporting text:

> Measure where RecoverAI creates recovered revenue, not just activity.

### Revenue Outcome

``` text
Revenue at Risk
₹12.4L

Eligible for Recovery
₹8.7L

Recovered
₹5.2L

Recovery Rate
62%
```

### Main chart

**Revenue Recovery Over Time**

The visualization should show a rising recovery trend.

### Recovery Funnel

``` text
1,000 Transactions
↓
137 At Risk
↓
102 Eligible
↓
89 Interventions
↓
62 Successful Recoveries
↓
₹5.2L Recovered
```

### RecoverAI vs Baseline

``` text
Fixed Retry
₹3.6L recovered
43% recovery rate
84 unnecessary attempts

RecoverAI
₹5.2L recovered
62% recovery rate
31 unnecessary attempts
```

Prominent impact:

``` text
+₹1.6L
Additional Revenue Recovered

+19 percentage points
Recovery Rate

63% fewer
Unnecessary Attempts
```

### Strategy Performance

| Strategy | Opportunities | Revenue | Success Rate |
|---|---|---|---|
| Retry | 51 opportunities | ₹2.8L | 71% |
| Re-engage | 42 opportunities | ₹1.4L | 58% |
| Alternative Payment | 18 opportunities | ₹0.7L | 49% |
| Manual Review | 15 opportunities | ₹0.3L | 33% |

### AI Insights

Example:

> Temporary payment failures are currently the highest-performing
> recovery category.

> 68% of recovered revenue came from transactions with recovery
> probability above 80%.

> RecoverAI generated 63% fewer unnecessary attempts than fixed retry.

### Recovery by Failure

Example:

``` text
Temporary Failure
74%

Network Timeout
61%

Insufficient Funds
39%

Hard Decline
12%
```

------------------------------------------------------------------------

## 11. Recovery Policies

## Purpose

Merchant control center for bounded AI autonomy.

### Page title

> **Recovery policies**

Supporting text:

> Define how much autonomy RecoverAI has when recovering revenue.

### Status

``` text
● Automatic recovery enabled
```

### AI Autonomy Boundary

Controls:

``` text
Maximum Risk
60/100

Minimum Recovery Probability
60%

Maximum Automatic Retries
2

Maximum Automatic Recovery Amount
₹10,000
```

Display the policy logic:

``` text
IF ALL RULES PASS
        │
RECOVERAI MAY ACT

OTHERWISE
        │
MANUAL REVIEW
```

### Recovery Strategy Rules

| Failure Type | Recommendation | Auto Action | Priority |
|---|---|---|---|
| Temporary Failure | Retry | Automatic | High |
| Network Failure | Retry Later | Automatic | High |
| Authentication Failure | Re-engage | Automatic | Medium |
| Insufficient Funds | Re-engage | Automatic | Medium |
| Hard Decline | Manual Review | Manual | High |
| High Risk | Stop | Blocked | Critical |

### Recovery Limits

Example:

``` text
Daily Automatic Limit
₹2,00,000

Maximum Customer Interventions
1

Maximum Retry Attempts
2

Minimum Transaction Value
₹500
```

### Safety Behavior

``` text
High Risk → Manual Review
Repeated Failures → Stop
Conflicting Signals → Manual Review
Low-Confidence Prediction → Manual Review
Merchant Policy Violation → Stop
```

### Policy Simulator

Input:

``` text
Amount: ₹8,500
Risk: 18/100
Recovery Probability: 92%
Attempts: 1/2
```

Guardrail result:

``` text
✓ Risk threshold passed
✓ Recovery probability passed
✓ Retry limit passed
✓ Amount limit passed
```

Decision:

``` text
AUTOMATIC RECOVERY PERMITTED

Action: RETRY
Expected Recovery: ₹7,820
```

------------------------------------------------------------------------

## 12. Audit Log

## Purpose

Trust, accountability and complete traceability.

### Page title

> **Audit trail**

Supporting text:

> Every AI decision, policy check and recovery action is recorded.

### Summary

``` text
Events Today
1,247

Transactions Analyzed
137

Recoveries
89

Unauthorized Actions
0
```

### Filters

``` text
All Events
AI Decisions
Policy Checks
Recovery Actions
Merchant Actions
Errors
```

### Audit timeline

Example:

``` text
14:32:05
PAYMENT FAILED
Source: Payment System
₹42,500

↓

14:32:06
TRANSACTION OBSERVED
Source: RecoverAI Engine

↓

14:32:06
RISK CALCULATED
18/100
LOW

↓

14:32:06
RECOVERY PROBABILITY CALCULATED
92%
Expected Recovery ₹39,100

↓

14:32:07
POLICY CHECK
All guardrails passed

↓

14:32:07
AI RECOMMENDATION
RETRY
Confidence 92%

↓

14:32:07
RECOVERY ACTION
Retry initiated
Approved

↓

14:32:31
PAYMENT RECOVERED
₹42,500
SUCCESS
```

### Event Details

Selected event should expose:

``` text
Decision
RETRY

Confidence
92%

Reason
Temporary failure / low risk

Policy
v1.4

Guardrails
Passed

Actor
RecoverAI AI Engine

Status
Approved
```

### System Actors

``` text
AI Engine
Makes recovery recommendations

Policy Engine
Validates merchant guardrails

Payment System
Executes payment operations

Merchant
Can approve, override or stop recovery
```

### Audit Summary

``` text
AI Decisions
137

Policy Checks
137

Recovery Actions
89

Manual Overrides
6

Blocked Actions
42

Failed Actions
11
```

### Trust statement

> Every autonomous action is traceable to the decision, policy and
> system state that authorized it.

------------------------------------------------------------------------

## 13. Interaction Design

## 13.1 Navigation

All application pages share the same navigation.

Clicking:

-   Overview → Dashboard
-   Recovery Queue → Queue
-   Analytics → Analytics
-   Policies → Policies
-   Audit Log → Audit Log

## 13.2 Queue → Investigation

Selecting a transaction opens its investigation page.

## 13.3 Investigation → Recovery

Actions:

``` text
Approve Recovery
Manual Review
Stop Recovery
```

should update transaction state.

## 13.4 Investigation → Audit

Every decision/action should appear in the audit trail.

## 13.5 Policies → Simulator

Changing policy values should affect the simulated guardrail result.

## 13.6 Dashboard → Queue

Clicking recovery metrics or queue previews should lead to the relevant
operational workspace.

------------------------------------------------------------------------

## 14. Status System

Use consistent semantic states.

### Success

``` text
Recovered
Approved
Passed
Ready
Online
```

### Warning

``` text
Pending
Medium Risk
Manual Review
Analyzing
```

### Error

``` text
Failed
High Risk
Blocked
Escalated
```

### AI

``` text
Analyzing
AI Recommendation
AI Insight
Prediction
```

------------------------------------------------------------------------

## 15. Data Visualization Rules

Charts must answer a business question.

Good:

-   Recovery trend
-   Recovery funnel
-   Strategy success
-   Failure-type recovery
-   Baseline comparison

Avoid:

-   decorative charts,
-   random pie charts,
-   excessive gauges,
-   meaningless percentages.

Charts should have:

-   clear labels,
-   readable values,
-   minimal grid lines,
-   strong contrast,
-   restrained accent usage.

------------------------------------------------------------------------

## 16. Accessibility

Maintain:

-   readable text contrast,
-   clear focus states,
-   meaningful button labels,
-   non-color-only status indicators,
-   accessible form labels,
-   keyboard-friendly navigation where practical.

Do not communicate critical status through color alone.

Example:

Bad:

``` text
green = recovered
```

Better:

``` text
✓ Recovered
```

------------------------------------------------------------------------

## 17. Loading / Empty / Error States

## Loading

Use compact skeletons or subtle progress states.

Example:

``` text
AI ENGINE ONLINE
Analyzing transactions...
```

## Empty Queue

``` text
No recovery opportunities

All eligible recovery opportunities have been processed.
```

## Error

Example:

``` text
Recovery action unavailable

The payment system did not confirm the action.
No duplicate action was attempted.
```

## AI Processing

Use:

``` text
AI ANALYZING
Evaluating transaction context...
```

Avoid fake long-running animations.

------------------------------------------------------------------------

## 18. Responsive Component Rules

### KPI blocks

Desktop:

horizontal.

Mobile:

stack vertically.

### Tables

Desktop:

full table.

Mobile:

horizontal scrolling or compact cards.

### Timeline

Desktop:

two-column timeline + event details.

Mobile:

single-column timeline.

### Policies

Desktop:

controls + strategy table + simulator.

Mobile:

stack sections vertically.

------------------------------------------------------------------------

## 19. Motion Guidelines

Motion should communicate state, not decoration.

Allowed:

-   subtle chart transitions,
-   progress animations,
-   active AI state,
-   recovery state transition,
-   hover/focus transitions.

Avoid:

-   excessive parallax,
-   constant background animation,
-   distracting particle effects,
-   long loading animations.

------------------------------------------------------------------------

## 20. Content Tone

Copy should be:

-   concise,
-   confident,
-   professional,
-   operational,
-   understandable to a merchant.

Prefer:

> Recover the right revenue.

Over:

> Harness next-generation AI-powered payment optimization capabilities.

Prefer:

> Why RecoverAI chose Retry

Over:

> Advanced AI decision intelligence explanation.

------------------------------------------------------------------------

## 21. Demo Data Consistency

The implementation must eventually use one canonical demo dataset.

The locked designs currently use representative values:

``` text
Revenue at Risk: ₹12.4L
Recoverable: ₹8.7L
Recovered: ₹5.2L
Recovery Rate: 62%

Transaction:
RX-28491
₹42,500
Risk: 18/100
Recovery Probability: 92%
Expected Recovery: ₹39,100
Attempts: 1/2
Decision: RETRY
```

These are design/demo values.

They must be centralized rather than hardcoded independently in each
component.

------------------------------------------------------------------------

## 22. Component Architecture Guidance

The implementation should favor reusable components.

Suggested UI components:

``` text
AppShell
TopNavigation
MetricCard
StatusBadge
RiskBadge
RecoveryProbability
AIInsight
RecoveryFlow
RecoveryQueueTable
TransactionSummary
DecisionFactors
GuardrailPanel
AuditTimeline
PolicyControl
PolicyRuleTable
PolicySimulator
AnalyticsChart
FilterBar
SearchInput
Modal
Toast
```

Do not duplicate identical UI logic across pages.

------------------------------------------------------------------------

## 23. Design Tokens

The implementation should centralize:

-   colors,
-   typography,
-   spacing,
-   border radius,
-   shadows/glows,
-   breakpoints,
-   component heights.

Do not scatter visual constants throughout the codebase.

------------------------------------------------------------------------

## 24. Design Quality Checklist

Before considering a screen complete:

### Visual

-   [ ] Correct RecoverAI branding
-   [ ] Dark premium fintech aesthetic
-   [ ] Consistent typography
-   [ ] Consistent spacing
-   [ ] Controlled cyan/violet accents
-   [ ] No unnecessary visual noise

### Product

-   [ ] Screen has one clear purpose
-   [ ] Primary action is obvious
-   [ ] Important metrics are easy to find
-   [ ] AI decisions are explainable
-   [ ] Policy boundaries are visible where relevant
-   [ ] States are understandable

### Technical UX

-   [ ] Loading state
-   [ ] Empty state
-   [ ] Error state
-   [ ] Responsive layout
-   [ ] Accessible labels
-   [ ] No fake interactions

------------------------------------------------------------------------

## 25. Final Design System Statement

RecoverAI should feel like:

> **A premium AI financial operations system that turns failed payments
> into explainable, policy-controlled recovery opportunities.**
