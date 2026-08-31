# Corrective Action Plan — NovaTech Industries Pvt. Ltd.

## Audit Reference: IA-2026-001 | Date: August 25, 2026

---

## Phase 1: Emergency Response (0-7 Days)

| # | Action Item | Finding | Owner | Due Date | Priority |
|---|------------|---------|-------|----------|----------|
| CAP-001 | Deactivate all 7 terminated employee accounts immediately (EMP-025, EMP-031, EMP-037, EMP-041, EMP-045, EMP-049, EMP-056) | AF-002 | CTO | Aug 30, 2026 | CRITICAL |
| CAP-002 | Block vendor V-046 (Prasad Enterprise) — freeze all pending payments | AF-001 | CFO | Aug 30, 2026 | CRITICAL |
| CAP-003 | Block vendor V-047 (Shree Trading Co) — freeze account | AF-027 | CFO | Aug 30, 2026 | CRITICAL |
| CAP-004 | Suspend EMP-035 expense submission pending forensic review | AF-007 | VP-HR | Aug 30, 2026 | CRITICAL |

---

## Phase 2: Critical Remediation (7-30 Days)

| # | Action Item | Finding | Owner | Due Date | Priority |
|---|------------|---------|-------|----------|----------|
| CAP-005 | Investigate ghost employee EMP-105 — trace bank account and recover ₹42,300 | AF-016 | VP-HR + CFO | Sep 15, 2026 | CRITICAL |
| CAP-006 | Enable MFA for all 19 non-compliant users | AF-026 | CTO | Sep 15, 2026 | HIGH |
| CAP-007 | Conduct forensic review of all V-046 payments (AF-001) | AF-001 | CFO | Sep 30, 2026 | CRITICAL |
| CAP-008 | Investigate all 5 duplicate invoice pairs and initiate recovery | AF-003 | CFO | Sep 30, 2026 | HIGH |
| CAP-009 | Recover 5 duplicate expense reimbursements (₹87,500) | AF-008 | CFO | Sep 30, 2026 | HIGH |
| CAP-010 | Investigate EMP-037 post-termination Tally transactions | AF-037 | CFO + CTO | Sep 30, 2026 | CRITICAL |

---

## Phase 3: System Hardening (30-60 Days)

| # | Action Item | Finding | Owner | Due Date | Priority |
|---|------------|---------|-------|----------|----------|
| CAP-011 | Implement hard block on three-way match failures in SAP | AF-003, AF-021 | CTO | Oct 31, 2026 | HIGH |
| CAP-012 | Configure 15% discount ceiling with VP override in SAP | AF-006 | CTO | Oct 31, 2026 | HIGH |
| CAP-013 | Remove Finance Admin role from IT personnel (EMP-004) | AF-017, AF-030 | CTO + CFO | Oct 15, 2026 | HIGH |
| CAP-014 | Implement automated duplicate invoice detection rule | AF-003 | CTO | Oct 31, 2026 | HIGH |
| CAP-015 | Enforce PO approval workflow — remove manual status override | AF-005 | CTO | Oct 31, 2026 | HIGH |
| CAP-016 | Enable time-based payment restrictions on CorpConnect | AF-025 | CFO | Oct 15, 2026 | HIGH |
| CAP-017 | Issue all pending credit notes for sales returns | AF-015 | VP-Sales + CFO | Oct 15, 2026 | HIGH |
| CAP-018 | Block vendor status: implement hard stop for inactive/dormant vendors | AF-001, AF-027 | CTO | Oct 15, 2026 | HIGH |
| CAP-019 | Implement monthly vendor spend aggregation for PO splitting detection | AF-004 | CTO | Oct 31, 2026 | MEDIUM |

---

## Phase 4: Process Improvements (60-90 Days)

| # | Action Item | Finding | Owner | Due Date | Priority |
|---|------------|---------|-------|----------|----------|
| CAP-020 | Implement automated bank reconciliation in SAP | AF-011 | CTO + CFO | Nov 30, 2026 | MEDIUM |
| CAP-021 | Configure hard block for negative inventory in SAP | AF-010 | CTO | Nov 30, 2026 | MEDIUM |
| CAP-022 | Implement RBAC with role-based access definitions | AF-028 | CTO | Dec 31, 2026 | MEDIUM |
| CAP-023 | Establish quarterly budget review with automated alerts at 80%/100% | AF-036 | CFO | Dec 31, 2026 | MEDIUM |
| CAP-024 | Implement HRMS-to-payroll validation (employee ID check) | AF-016 | CTO | Nov 30, 2026 | MEDIUM |
| CAP-025 | Enforce revenue recognition only upon delivery confirmation | AF-018 | CFO | Nov 30, 2026 | MEDIUM |
| CAP-026 | Implement mandatory expense document upload with validation | AF-024 | CTO | Nov 30, 2026 | MEDIUM |
| CAP-027 | Configure per-diem limits in Keka HR with auto-escalation | AF-034 | CTO + VP-HR | Nov 30, 2026 | MEDIUM |
| CAP-028 | Implement stock write-off multi-level approval workflow | AF-029 | CTO | Nov 30, 2026 | MEDIUM |

---

## Phase 5: Strategic Improvements (90-180 Days)

| # | Action Item | Finding | Owner | Due Date | Priority |
|---|------------|---------|-------|----------|----------|
| CAP-029 | Implement SAP GRC for comprehensive SoD monitoring | AF-030 | CTO | Feb 28, 2027 | MEDIUM |
| CAP-030 | Deploy real-time transaction monitoring and anomaly detection | All | CTO | Feb 28, 2027 | MEDIUM |
| CAP-031 | Establish continuous audit program with monthly automated testing | All | CFO | Mar 31, 2027 | LOW |
| CAP-032 | Implement digital exit clearance with HRMS-IT integration | AF-038 | VP-HR + CTO | Feb 28, 2027 | MEDIUM |
| CAP-033 | Vendor master cleanup — re-validate all 50 vendors | AF-039 | Head-Procurement | Jan 31, 2027 | MEDIUM |
| CAP-034 | Implement vendor probation mechanism with spending caps | AF-039 | Head-Procurement | Jan 31, 2027 | MEDIUM |
| CAP-035 | File GST refund for August 2025 overpayment (₹1,50,000) | AF-031 | GM-Finance | Dec 31, 2026 | LOW |
| CAP-036 | Obtain late payment interest waiver/assessment for overdue TDS | AF-019 | GM-Finance | Dec 31, 2026 | LOW |
| CAP-037 | Implement off-hours access policy with VPN + pre-approval requirement | AF-023 | CTO | Mar 31, 2027 | LOW |
| CAP-038 | Implement rolling 30-day customer value aggregation for sales approvals | AF-014 | CTO | Mar 31, 2027 | LOW |

---

## Tracking Summary

| Phase | Total Items | Critical | High | Medium | Low |
|-------|------------|----------|------|--------|-----|
| Phase 1 (0-7 days) | 4 | 4 | 0 | 0 | 0 |
| Phase 2 (7-30 days) | 6 | 2 | 4 | 0 | 0 |
| Phase 3 (30-60 days) | 9 | 0 | 9 | 0 | 0 |
| Phase 4 (60-90 days) | 10 | 0 | 0 | 10 | 0 |
| Phase 5 (90-180 days) | 10 | 0 | 0 | 7 | 3 |
| **Total** | **39** | **6** | **13** | **17** | **3** |

---

## Follow-Up Schedule

| Checkpoint | Date | Scope |
|-----------|------|-------|
| Phase 1 Verification | Sep 5, 2026 | Emergency actions confirmed |
| Phase 2 Verification | Oct 15, 2026 | Critical remediation complete |
| Phase 3 Verification | Nov 30, 2026 | System hardening implemented |
| Phase 4 Verification | Jan 31, 2027 | Process improvements in place |
| Full Follow-Up Audit | Feb 2027 | Comprehensive reassessment |
| Annual Audit | Aug 2027 | Next annual internal audit |

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Managing Director | Rajesh K. Sharma | __________ | __________ |
| CFO | Priya V. Iyer | __________ | __________ |
| CTO | Vikram S. Patil | __________ | __________ |
| Head-Procurement | Sunita M. Kulkarni | __________ | __________ |
| VP-Sales | Arjun N. Mehta | __________ | __________ |
| VP-HR | Anand R. Deshmukh | __________ | __________ |
| Chief Audit Executive | [Name] | __________ | __________ |
