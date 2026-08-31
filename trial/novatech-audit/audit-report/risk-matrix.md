# Risk Matrix — NovaTech Industries Audit

## Overall Risk Distribution

| Severity | Count | % of Total | Findings |
|----------|-------|-----------|----------|
| **Critical** | 5 | 12.5% | AF-001, AF-002, AF-003, AF-016, AF-037 |
| **High** | 18 | 45.0% | AF-004 through AF-008, AF-009, AF-012, AF-013, AF-015, AF-017, AF-018, AF-020, AF-022, AF-025, AF-026, AF-027, AF-030, AF-040 |
| **Medium** | 16 | 40.0% | AF-010, AF-011, AF-014, AF-019, AF-021, AF-023, AF-024, AF-028, AF-029, AF-031, AF-032, AF-034, AF-035, AF-036, AF-038, AF-039 |
| **Low** | 1 | 2.5% | AF-033 |

## Risk Score Distribution

| Score Range | Severity | Count | Findings |
|-------------|----------|-------|----------|
| 20-25 | Critical | 5 | AF-002 (24), AF-003 (22), AF-016 (22), AF-037 (22), AF-001 (20) |
| 12-19 | High | 18 | AF-004 (16), AF-005 (16), AF-018 (16), AF-006 (15), AF-012 (15), AF-013 (15), AF-015 (15), AF-007 (14), AF-009 (14), AF-017 (14), AF-020 (14), AF-025 (14), AF-030 (14), AF-040 (14), AF-022 (13), AF-027 (13), AF-026 (13), AF-008 (12) |
| 6-11 | Medium | 16 | AF-032 (11), AF-019 (11), AF-010 (10), AF-011 (10), AF-021 (10), AF-029 (10), AF-036 (10), AF-014 (9), AF-024 (9), AF-028 (9), AF-039 (9), AF-034 (8), AF-035 (8), AF-038 (8), AF-023 (8), AF-031 (7) |
| 1-5 | Low | 1 | AF-033 (4) |

## Risk by Audit Area

| Area | Critical | High | Medium | Low | Total | Total Impact |
|------|----------|------|--------|-----|-------|-------------|
| Procurement | 2 | 3 | 1 | 0 | 6 | ₹55,81,475 |
| Finance | 1 | 5 | 7 | 0 | 13 | ₹3,87,20,000 |
| IT & Access Control | 1 | 3 | 3 | 0 | 7 | — |
| Sales | 0 | 4 | 2 | 0 | 6 | ₹2,14,80,000 |
| HR/Expense | 0 | 2 | 3 | 1 | 6 | ₹5,62,612 |
| Inventory | 0 | 1 | 2 | 0 | 3 | ₹12,45,000 |
| Compliance | 0 | 0 | 1 | 0 | 1 | — |

## Risk Heat Map

```
                    IMPACT
            Low    Medium    High    Very High
         ┌─────────┬─────────┬─────────┬─────────┐
  High   │  (0)    │ AF-007  │ AF-001  │ AF-002  │
         │         │ AF-008  │ AF-003  │ AF-016  │
         │         │         │ AF-037  │ AF-018  │
         ├─────────┼─────────┼─────────┼─────────┤
L        │  (0)    │ AF-006  │ AF-004  │ AF-005  │
I  Med   │         │ AF-009  │ AF-012  │ AF-015  │
K        │         │ AF-029  │ AF-013  │ AF-036  │
E        │         │ AF-021  │ AF-020  │ AF-039  │
L        ├─────────┼─────────┼─────────┼─────────┤
I        │  (0)    │ AF-010  │ AF-019  │ AF-014  │
H  Low   │         │ AF-011  │ AF-022  │ AF-027  │
O        │         │ AF-031  │ AF-032  │         │
O        │         │ AF-033  │         │         │
D        └─────────┴─────────┴─────────┴─────────┘
```

## Financial Impact by Category

| Category | Direct Impact | Potential | Total at Risk |
|----------|-------------|-----------|---------------|
| Procurement | ₹55,81,475 | ₹47,00,000 | ₹1,02,81,475 |
| Finance | ₹3,87,20,000 | ₹60,00,000 | ₹4,47,20,000 |
| Sales | ₹2,14,80,000 | ₹2,20,00,000 | ₹4,34,80,000 |
| HR/Expense | ₹5,62,612 | — | ₹5,62,612 |
| Inventory | ₹12,45,000 | — | ₹12,45,000 |
| **Total** | **₹8,43,09,387** | **₹3,27,00,000** | **₹11,70,09,387** |

## Risk Scoring Methodology

Each finding is scored on four dimensions (1-5 scale):

| Dimension | 1 | 2 | 3 | 4 | 5 |
|-----------|---|---|---|---|---|
| **Financial Impact** | None | <₹1L | ₹1-10L | ₹10L-1Cr | >₹1Cr |
| **Likelihood** | Rare | Unlikely | Possible | Likely | Almost Certain |
| **Control Weakness** | Strong | Adequate | Moderate | Weak | Non-existent |
| **Detection Difficulty** | Easy | Moderate | Hard | Very Hard | Undetectable |

**Risk Score = Financial Impact × Likelihood** (range 1-25)
