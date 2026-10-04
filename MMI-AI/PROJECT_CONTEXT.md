# MatchMyInterview — Project Context

## Product and positioning

MatchMyInterview (MMI) is a human-to-human peer interview platform evolving into a peer-validated professional portfolio and talent network.

Core positioning: **Don't Just List Your Skills. Prove Them.**

Intended product loop:
Create profile → find peer → interview each other → give and receive structured feedback → build skill evidence → professional portfolio.

Candidates receive feedback and build evidence. Interviewers give feedback and build a separate interviewer reputation. Both roles can be performed by the same person.

## Product principles

- Real people conduct interviews; AI interviewers are not the core product.
- Users must never manually set their validation score.
- Self-declared skills and peer-validated skills must be visually distinct.
- Validation provides evidence, not formal certification.
- XP, skill scores, candidate reputation, and interviewer reputation are separate concepts.
- Prevent fake evaluations and score manipulation. Legitimate role switching is part of the product; anti-gaming rules must distinguish it from collusive scoring.
- Do not invent usage metrics, testimonials, scores, or evidence.
- Preserve working functionality and extend existing systems.

## Business model and long-term vision

The intended user offering is 100% free. Current invite APIs do not debit coffee credits, but legacy Razorpay/payment and balance code remains. Do not remove or change it without an explicit task.

Long-term direction: candidate portfolio → peer validation → professional identity → talent discovery for companies.

## Documentation contract

The repository is the source of truth for implementation. This document describes product intent; ROADMAP.md lists future work. Marketing previews do not establish that a backend feature exists. CURRENT_STATE.md records the latest inspected state and validation limits.
