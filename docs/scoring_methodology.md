# Scoring Methodology

CampusIQ AI uses a prototype weighted scoring model that intentionally remains transparent and configurable.

## Score components
- Academic performance: 30%
- Attendance: 20%
- LMS engagement: 15%
- Placement readiness: 15%
- Skills: 10%
- Engagement and feedback: 10%

## Normalization method
Each supported indicator is normalized to a 0–100 scale and clamped to valid bounds. Missing values are excluded instead of treated as zero.

## Aggregation formula
Student Success Score = sum(component score × component weight) / sum(weights of eligible components)

## Missing-data rules
If a component is missing, it is excluded from the denominator and the remaining eligible weights are renormalized. This preserves the score without using zero as a default for missing data.

## Risk thresholds
- Attendance below 75% triggers an academic warning.
- Academic performance below 60 triggers support.
- Placement indicators below 60 trigger placement-readiness support.
- Low coverage or missing critical field groups triggers an incomplete-data warning.

## Explanation logic
Each risk flag is tied to the actual indicator values currently stored. Explanations are generated from student data, not generic templates.

## Known limitations
This is a prototype scoring model for demonstration and academic support planning. It is not a deterministic predictor of academic failure or placement outcomes.
