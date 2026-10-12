"""
visualizations.py — Plotly chart builders for the EduPredict AI dashboard.

All charts use a consistent dark theme with navy/blue/cyan/purple palette.
Charts are designed to be interactive and informative.
"""

import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd
import numpy as np


# ---------- Color Palette ----------

COLORS = {
    "bg": "#0a0e27",
    "card_bg": "#111638",
    "surface": "#1a1f4e",
    "primary": "#4f8cff",
    "secondary": "#00d4aa",
    "accent": "#a855f7",
    "warning": "#f59e0b",
    "danger": "#ef4444",
    "text": "#e2e8f0",
    "text_muted": "#94a3b8",
    "grid": "#1e2555",
    "on_track": "#00d4aa",
    "needs_review": "#f59e0b",
    "support": "#ef4444",
    "insufficient": "#64748b",
}

SEGMENT_COLORS = {
    "Strong Overall Performance": "#00d4aa",
    "Strong Academics, Low Placement": "#4f8cff",
    "Low Attendance, Reasonable Academics": "#f59e0b",
    "Low Academics, Adequate Attendance": "#f97316",
    "Multiple Support Needs": "#ef4444",
    "Insufficient Data": "#64748b",
    "Needs Review": "#a855f7",
}

STATUS_COLORS = {
    "On Track": COLORS["on_track"],
    "Needs Review": COLORS["needs_review"],
    "Support Recommended": COLORS["support"],
    "Insufficient Data": COLORS["insufficient"],
}

CHART_TEMPLATE = {
    "layout": {
        "paper_bgcolor": "rgba(0,0,0,0)",
        "plot_bgcolor": "rgba(0,0,0,0)",
        "font": {"color": COLORS["text"], "family": "Inter, sans-serif"},
        "margin": {"l": 40, "r": 20, "t": 40, "b": 40},
    }
}


def _apply_dark_theme(fig, height=400):
    """Apply consistent dark theme to a figure."""
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(color=COLORS["text"], family="Inter, sans-serif", size=12),
        height=height,
        margin=dict(l=40, r=20, t=50, b=40),
        legend=dict(
            bgcolor="rgba(0,0,0,0)",
            bordercolor="rgba(255,255,255,0.1)",
            font=dict(size=11),
        ),
    )
    fig.update_xaxes(
        gridcolor=COLORS["grid"],
        zerolinecolor=COLORS["grid"],
        tickfont=dict(size=11),
    )
    fig.update_yaxes(
        gridcolor=COLORS["grid"],
        zerolinecolor=COLORS["grid"],
        tickfont=dict(size=11),
    )
    return fig


# ---------- Dashboard Charts ----------

def score_distribution_chart(df: pd.DataFrame) -> go.Figure:
    """Histogram of Student Success Scores."""
    scores = df["success_score"].dropna()
    if scores.empty:
        return _empty_chart("No score data available")

    fig = go.Figure()
    fig.add_trace(go.Histogram(
        x=scores,
        nbinsx=20,
        marker=dict(
            color=COLORS["primary"],
            line=dict(color=COLORS["accent"], width=1),
        ),
        opacity=0.85,
        hovertemplate="Score: %{x:.0f}<br>Students: %{y}<extra></extra>",
    ))
    fig.update_layout(
        title="Student Success Score Distribution",
        xaxis_title="Success Score",
        yaxis_title="Number of Students",
    )
    return _apply_dark_theme(fig)


def risk_distribution_chart(df: pd.DataFrame) -> go.Figure:
    """Horizontal bar chart showing academic and placement support status counts."""
    fig = make_subplots(rows=1, cols=2, subplot_titles=("Academic Support", "Placement Support"))

    statuses = ["On Track", "Needs Review", "Support Recommended", "Insufficient Data"]

    for i, col in enumerate(["academic_support_status", "placement_support_status"], 1):
        if col not in df.columns:
            continue
        counts = df[col].value_counts()
        for status in statuses:
            count = counts.get(status, 0)
            fig.add_trace(go.Bar(
                y=[status],
                x=[count],
                orientation="h",
                marker_color=STATUS_COLORS.get(status, COLORS["text_muted"]),
                name=status,
                showlegend=(i == 1),
                hovertemplate=f"{status}: {count} students<extra></extra>",
            ), row=1, col=i)

    fig.update_layout(
        title="Support Status Distribution",
        barmode="group",
    )
    return _apply_dark_theme(fig, height=350)


def attendance_vs_academics_chart(df: pd.DataFrame) -> go.Figure:
    """Scatter plot of attendance vs academic marks, colored by success score."""
    if "attendance_percentage" not in df.columns or "avg_total_marks" not in df.columns:
        return _empty_chart("Attendance or academic data not available")

    plot_df = df.dropna(subset=["attendance_percentage", "avg_total_marks"])
    if plot_df.empty:
        return _empty_chart("No complete attendance/academic data")

    color_col = "success_score" if "success_score" in plot_df.columns else None

    fig = px.scatter(
        plot_df,
        x="attendance_percentage",
        y="avg_total_marks",
        color=color_col,
        color_continuous_scale=["#ef4444", "#f59e0b", "#00d4aa"],
        hover_data=["student_id", "student_name"],
        labels={
            "attendance_percentage": "Attendance %",
            "avg_total_marks": "Average Marks",
            "success_score": "Success Score",
        },
    )
    fig.update_traces(marker=dict(size=8, line=dict(width=1, color="rgba(255,255,255,0.3)")))
    fig.update_layout(title="Attendance vs Academic Performance")
    return _apply_dark_theme(fig)


def academic_vs_placement_chart(df: pd.DataFrame) -> go.Figure:
    """Scatter plot comparing academic and placement performance."""
    if "avg_total_marks" not in df.columns:
        return _empty_chart("Academic data not available")

    # Calculate average placement score
    placement_cols = ["aptitude_score", "coding_score", "communication_score", "mock_interview_score"]
    available_cols = [c for c in placement_cols if c in df.columns]
    if not available_cols:
        return _empty_chart("Placement data not available")

    plot_df = df.copy()
    plot_df["avg_placement"] = plot_df[available_cols].mean(axis=1)
    plot_df = plot_df.dropna(subset=["avg_total_marks", "avg_placement"])

    if plot_df.empty:
        return _empty_chart("No complete academic/placement data")

    fig = px.scatter(
        plot_df,
        x="avg_total_marks",
        y="avg_placement",
        color="segment" if "segment" in plot_df.columns else None,
        color_discrete_map=SEGMENT_COLORS,
        hover_data=["student_id", "student_name"],
        labels={
            "avg_total_marks": "Academic Performance (Avg Marks)",
            "avg_placement": "Placement Readiness (Avg Score)",
        },
    )
    fig.update_traces(marker=dict(size=9, line=dict(width=1, color="rgba(255,255,255,0.3)")))
    fig.update_layout(title="Academic vs Placement Performance")
    return _apply_dark_theme(fig, height=450)


def department_comparison_chart(df: pd.DataFrame) -> go.Figure:
    """Grouped bar chart comparing departments across key metrics."""
    if "department" not in df.columns or "success_score" not in df.columns:
        return _empty_chart("Department or score data not available")

    dept_stats = df.groupby("department").agg(
        avg_score=("success_score", "mean"),
        avg_marks=("avg_total_marks", "mean"),
        avg_attendance=("attendance_percentage", "mean"),
    ).reset_index()

    dept_stats = dept_stats.round(1)

    fig = go.Figure()

    metrics = [
        ("avg_score", "Avg Success Score", COLORS["primary"]),
        ("avg_marks", "Avg Marks", COLORS["secondary"]),
        ("avg_attendance", "Avg Attendance", COLORS["accent"]),
    ]

    for col, name, color in metrics:
        if col in dept_stats.columns:
            fig.add_trace(go.Bar(
                x=dept_stats["department"],
                y=dept_stats[col],
                name=name,
                marker_color=color,
                opacity=0.85,
            ))

    fig.update_layout(
        title="Department Comparison",
        barmode="group",
        xaxis_title="Department",
        yaxis_title="Score",
    )
    return _apply_dark_theme(fig)


def segment_distribution_chart(df: pd.DataFrame) -> go.Figure:
    """Donut chart showing student segment distribution."""
    if "segment" not in df.columns:
        return _empty_chart("Segmentation data not available")

    counts = df["segment"].value_counts().reset_index()
    counts.columns = ["Segment", "Count"]

    colors = [SEGMENT_COLORS.get(s, COLORS["text_muted"]) for s in counts["Segment"]]

    fig = go.Figure(go.Pie(
        labels=counts["Segment"],
        values=counts["Count"],
        hole=0.5,
        marker=dict(colors=colors, line=dict(color=COLORS["bg"], width=2)),
        textinfo="label+percent",
        textfont=dict(size=11),
        hovertemplate="%{label}: %{value} students (%{percent})<extra></extra>",
    ))
    fig.update_layout(title="Student Segmentation")
    return _apply_dark_theme(fig, height=400)


def score_by_indicator_radar(indicators: dict) -> go.Figure:
    """Radar chart showing individual student indicators."""
    labels = []
    values = []

    indicator_names = {
        "academic": "Academic",
        "attendance": "Attendance",
        "lms": "LMS",
        "placement": "Placement",
        "skills": "Skills",
        "engagement": "Engagement",
    }

    for key, label in indicator_names.items():
        val = indicators.get(key)
        labels.append(label)
        values.append(val if val is not None else 0)

    # Close the radar
    labels.append(labels[0])
    values.append(values[0])

    fig = go.Figure()
    fig.add_trace(go.Scatterpolar(
        r=values,
        theta=labels,
        fill="toself",
        fillcolor="rgba(79, 140, 255, 0.2)",
        line=dict(color=COLORS["primary"], width=2),
        marker=dict(size=6),
    ))

    fig.update_layout(
        polar=dict(
            bgcolor="rgba(0,0,0,0)",
            radialaxis=dict(
                visible=True,
                range=[0, 100],
                gridcolor=COLORS["grid"],
                tickfont=dict(size=10, color=COLORS["text_muted"]),
            ),
            angularaxis=dict(
                gridcolor=COLORS["grid"],
                tickfont=dict(size=11, color=COLORS["text"]),
            ),
        ),
        title="Indicator Profile",
    )
    return _apply_dark_theme(fig, height=380)


def score_breakdown_bar(contributions: dict, effective_weights: dict) -> go.Figure:
    """Stacked bar showing score contributions by indicator."""
    indicator_names = {
        "academic": "Academic",
        "attendance": "Attendance",
        "lms": "LMS",
        "placement": "Placement",
        "skills": "Skills",
        "engagement": "Engagement",
    }

    colors_list = [COLORS["primary"], COLORS["secondary"], COLORS["accent"],
                   "#f59e0b", "#06b6d4", "#ec4899"]

    fig = go.Figure()

    for i, (key, label) in enumerate(indicator_names.items()):
        contrib = contributions.get(key, 0)
        weight = effective_weights.get(key, 0)
        fig.add_trace(go.Bar(
            x=[contrib],
            y=["Score"],
            orientation="h",
            name=f"{label} ({weight:.0%})",
            marker_color=colors_list[i % len(colors_list)],
            hovertemplate=f"{label}: {contrib:.1f} points<extra></extra>",
        ))

    fig.update_layout(
        title="Score Contribution Breakdown",
        barmode="stack",
        xaxis_title="Points",
        showlegend=True,
        legend=dict(orientation="h", y=-0.2),
    )
    return _apply_dark_theme(fig, height=200)


def _empty_chart(message: str) -> go.Figure:
    """Create an empty chart placeholder with a message."""
    fig = go.Figure()
    fig.add_annotation(
        text=message,
        xref="paper", yref="paper",
        x=0.5, y=0.5,
        showarrow=False,
        font=dict(size=14, color=COLORS["text_muted"]),
    )
    return _apply_dark_theme(fig, height=300)


def generate_insights(df: pd.DataFrame) -> list[str]:
    """
    Generate automatic text insights from the data.
    Returns a list of insight strings.
    """
    insights = []
    n = len(df)

    if n == 0:
        return ["No student data available for generating insights."]

    # Score insights
    if "success_score" in df.columns:
        valid_scores = df["success_score"].dropna()
        if len(valid_scores) > 0:
            avg = valid_scores.mean()
            high = (valid_scores >= 75).sum()
            low = (valid_scores < 50).sum()
            insights.append(
                f"📊 Average Student Success Score is **{avg:.1f}/100** across {len(valid_scores)} scored students."
            )
            if high > 0:
                insights.append(f"🌟 **{high} students** ({high/n*100:.0f}%) have scores above 75.")
            if low > 0:
                insights.append(f"⚠️ **{low} students** ({low/n*100:.0f}%) have scores below 50.")

    # Attendance insights
    if "attendance_percentage" in df.columns:
        low_att = df[df["attendance_percentage"].fillna(100) < 65]
        if len(low_att) > 0:
            insights.append(
                f"📅 **{len(low_att)} students** have attendance below 65% — consider follow-up."
            )

    # Academic insights
    if "avg_total_marks" in df.columns:
        failing = df[df["avg_total_marks"].fillna(100) < 40]
        if len(failing) > 0:
            insights.append(
                f"📚 **{len(failing)} students** have average marks below 40% — tutoring may help."
            )

    # Support status insights
    if "academic_support_status" in df.columns:
        support_count = (df["academic_support_status"] == "Support Recommended").sum()
        if support_count > 0:
            insights.append(
                f"🔴 **{support_count} students** have academic support recommended."
            )

    if "placement_support_status" in df.columns:
        placement_support = (df["placement_support_status"] == "Support Recommended").sum()
        if placement_support > 0:
            insights.append(
                f"🔴 **{placement_support} students** have placement support recommended."
            )

    # Department insights
    if "department" in df.columns and "success_score" in df.columns:
        dept_avg = df.groupby("department")["success_score"].mean().dropna()
        if len(dept_avg) > 0:
            best = dept_avg.idxmax()
            worst = dept_avg.idxmin()
            if best != worst:
                insights.append(
                    f"🏛️ **{best}** has the highest average score ({dept_avg[best]:.1f}), "
                    f"while **{worst}** has the lowest ({dept_avg[worst]:.1f})."
                )

    # Data completeness
    if "data_completeness" in df.columns:
        low_data = (df["data_completeness"] < 50).sum()
        if low_data > 0:
            insights.append(
                f"📋 **{low_data} students** have less than 50% data completeness — scores may not be representative."
            )

    return insights if insights else ["✅ All indicators look healthy based on available data."]
