"""
app.py — EduPredict AI: Student Analytics Dashboard

Main Streamlit application integrating all modules for a complete
student analytics platform. Features dashboard, data management,
student explorer, and reports.

Run with: python -m streamlit run app.py
"""

import streamlit as st
import pandas as pd
import numpy as np
import os
import io

# Import project modules
from modules.data_processing import (
    load_csv, validate_dataframe, integrate_datasets,
    get_template_csv, get_data_completeness, SCHEMAS,
)
from modules.scoring import (
    calculate_all_scores, calculate_student_score,
    get_score_explanation, DEFAULT_WEIGHTS, INDICATOR_LABELS,
)
from modules.risk_analysis import (
    assess_all_students, get_risk_summary,
    assess_academic_support, assess_placement_support,
)
from modules.segmentation import segment_all_students, get_segment_summary
from modules.recommendations import generate_recommendations, get_recommendation_summary, generate_all_recommendations
from modules.visualizations import (
    score_distribution_chart, risk_distribution_chart,
    attendance_vs_academics_chart, academic_vs_placement_chart,
    department_comparison_chart, segment_distribution_chart,
    score_by_indicator_radar, score_breakdown_bar,
    generate_insights, COLORS,
)
from modules.report_export import (
    export_unified_data, export_scores,
    export_academic_support, export_placement_support,
    generate_methodology_report,
)
from modules.auth import authenticate, get_demo_accounts

# ---------- Page Configuration ----------

st.set_page_config(
    page_title="EduPredict AI — Student Analytics",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ---------- Custom CSS ----------

st.markdown("""
<style>
    /* Import Inter font */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    /* Global dark theme */
    .stApp {
        background-color: #0a0e27;
        font-family: 'Inter', sans-serif;
    }

    /* Sidebar styling */
    section[data-testid="stSidebar"] {
        background-color: #0d1130;
        border-right: 1px solid #1e2555;
    }
    section[data-testid="stSidebar"] .stMarkdown h1,
    section[data-testid="stSidebar"] .stMarkdown h2,
    section[data-testid="stSidebar"] .stMarkdown h3 {
        color: #e2e8f0;
    }

    /* Headers */
    h1, h2, h3 { color: #e2e8f0 !important; }
    h1 { font-weight: 700 !important; }
    h2 { font-weight: 600 !important; }

    /* Metric cards */
    div[data-testid="stMetric"] {
        background: linear-gradient(135deg, #111638 0%, #1a1f4e 100%);
        border: 1px solid #2a3070;
        border-radius: 12px;
        padding: 16px 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    div[data-testid="stMetric"] label {
        color: #94a3b8 !important;
        font-size: 0.85rem !important;
        font-weight: 500 !important;
    }
    div[data-testid="stMetric"] div[data-testid="stMetricValue"] {
        color: #e2e8f0 !important;
        font-weight: 700 !important;
    }

    /* Cards / containers */
    div[data-testid="stExpander"] {
        background-color: #111638;
        border: 1px solid #2a3070;
        border-radius: 10px;
    }

    /* Tabs */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        background-color: transparent;
    }
    .stTabs [data-baseweb="tab"] {
        background-color: #111638;
        border: 1px solid #2a3070;
        border-radius: 8px;
        color: #94a3b8;
        padding: 8px 20px;
    }
    .stTabs [aria-selected="true"] {
        background: linear-gradient(135deg, #4f8cff 0%, #a855f7 100%) !important;
        color: #ffffff !important;
        border-color: transparent !important;
    }

    /* DataFrames */
    .stDataFrame {
        border-radius: 10px;
        overflow: hidden;
    }

    /* Buttons */
    .stDownloadButton button {
        background: linear-gradient(135deg, #4f8cff 0%, #3b7cf5 100%);
        border: none;
        color: white;
        border-radius: 8px;
        font-weight: 500;
    }
    .stDownloadButton button:hover {
        background: linear-gradient(135deg, #3b7cf5 0%, #2563eb 100%);
        border: none;
    }

    /* Status badges */
    .status-on-track {
        background-color: rgba(0, 212, 170, 0.15);
        color: #00d4aa;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
    }
    .status-needs-review {
        background-color: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
    }
    .status-support {
        background-color: rgba(239, 68, 68, 0.15);
        color: #ef4444;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
    }
    .status-insufficient {
        background-color: rgba(100, 116, 139, 0.15);
        color: #64748b;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
    }

    /* Insight cards */
    .insight-card {
        background: linear-gradient(135deg, #111638 0%, #1a1f4e 100%);
        border: 1px solid #2a3070;
        border-radius: 10px;
        padding: 14px 18px;
        margin-bottom: 8px;
        color: #e2e8f0;
        font-size: 0.95rem;
    }

    /* Hero gradient text */
    .gradient-text {
        background: linear-gradient(135deg, #4f8cff 0%, #00d4aa 50%, #a855f7 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: 2.2rem;
        font-weight: 700;
    }

    /* Navigation radio buttons */
    div[data-testid="stSidebar"] .stRadio > div {
        gap: 2px;
    }
    div[data-testid="stSidebar"] .stRadio > div label {
        background-color: #111638;
        border: 1px solid #1e2555;
        border-radius: 8px;
        padding: 10px 16px;
        margin-bottom: 4px;
        cursor: pointer;
        transition: all 0.2s;
    }
    div[data-testid="stSidebar"] .stRadio > div label:hover {
        background-color: #1a1f4e;
        border-color: #4f8cff;
    }

    /* Hide hamburger and footer */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #0a0e27; }
    ::-webkit-scrollbar-thumb { background: #2a3070; border-radius: 3px; }

    /* Login Form Styles */
    .login-box {
        background: linear-gradient(135deg, #111638 0%, #171d4a 100%);
        border: 1px solid #2a3070;
        border-radius: 16px;
        padding: 32px 28px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.45);
        margin-top: 20px;
    }
    .user-profile-badge {
        background: linear-gradient(135deg, #131943 0%, #1a225c 100%);
        border: 1px solid #2e3880;
        border-radius: 12px;
        padding: 12px 14px;
        margin-bottom: 14px;
    }
</style>
""", unsafe_allow_html=True)


# ---------- Session State Initialization ----------

def init_session_state():
    """Initialize session state with defaults."""
    if "authenticated" not in st.session_state:
        st.session_state.authenticated = False
    if "user" not in st.session_state:
        st.session_state.user = None
    if "datasets" not in st.session_state:
        st.session_state.datasets = {}
    if "integrated_df" not in st.session_state:
        st.session_state.integrated_df = pd.DataFrame()
    if "scored_df" not in st.session_state:
        st.session_state.scored_df = pd.DataFrame()
    if "validation_results" not in st.session_state:
        st.session_state.validation_results = {}
    if "data_loaded" not in st.session_state:
        st.session_state.data_loaded = False
    if "weights" not in st.session_state:
        st.session_state.weights = DEFAULT_WEIGHTS.copy()

init_session_state()


# ---------- Data Loading ----------

def load_sample_data():
    """Load the synthetic sample data from the data/ directory."""
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    dataset_names = ["students", "academics", "attendance", "lms", "placement", "skills", "engagement"]

    datasets = {}
    validations = {}

    for name in dataset_names:
        path = os.path.join(data_dir, f"{name}.csv")
        if os.path.exists(path):
            df, validation = load_csv(path, name)
            if df is not None:
                datasets[name] = df
                validations[name] = validation

    return datasets, validations


def process_data(datasets):
    """Integrate, score, assess, and segment all data."""
    integrated = integrate_datasets(datasets)
    if integrated.empty:
        return pd.DataFrame()

    # Score all students
    scored = calculate_all_scores(integrated, st.session_state.weights)

    # Assess risk
    assessed = assess_all_students(scored)

    # Segment
    segmented = segment_all_students(assessed)

    return segmented


# ---------- Sidebar ----------

def render_sidebar():
    """Render the sidebar navigation and controls."""
    with st.sidebar:
        st.markdown('<div class="gradient-text">🎓 EduPredict AI</div>', unsafe_allow_html=True)
        st.caption("Student Analytics Platform • Prototype")

        # Active User Profile Badge
        user = st.session_state.get("user")
        if user:
            st.markdown(f"""
            <div class="user-profile-badge">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.8rem;">{user.get('icon', '👤')}</span>
                    <div>
                        <div style="font-weight: 700; color: #f8fafc; font-size: 0.95rem;">{user.get('display_name', 'User')}</div>
                        <div style="color: #38bdf8; font-size: 0.8rem; font-weight: 500;">{user.get('role', 'Member')}</div>
                    </div>
                </div>
                <div style="color: #94a3b8; font-size: 0.75rem; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.08);">
                    📍 {user.get('department', 'Campus')}
                </div>
            </div>
            """, unsafe_allow_html=True)

            if st.button("🚪 Sign Out", use_container_width=True):
                st.session_state.authenticated = False
                st.session_state.user = None
                st.rerun()

        st.markdown("---")

        page = st.radio(
            "Navigation",
            ["📊 Dashboard", "📁 Data Management", "🔍 Student Explorer",
             "📈 Segmentation", "📋 Reports & Exports"],
            label_visibility="collapsed",
        )

        st.markdown("---")

        # Data source
        st.markdown("#### 📂 Data Source")
        if st.button("Load Sample Data", use_container_width=True, type="primary"):
            with st.spinner("Loading sample data..."):
                datasets, validations = load_sample_data()
                if datasets:
                    st.session_state.datasets = datasets
                    st.session_state.validation_results = validations
                    st.session_state.scored_df = process_data(datasets)
                    st.session_state.data_loaded = True
                    st.success(f"✅ Loaded {len(datasets)} datasets")
                    st.rerun()
                else:
                    st.error("No sample data found. Run generate_sample_data.py first.")

        if st.session_state.data_loaded:
            n = len(st.session_state.scored_df)
            st.success(f"✅ {n} students loaded")

        st.markdown("---")
        st.caption("byteXL HacXLerate 2026\nProblem Statement 4 by KPMG")

    return page


# ---------- Authentication Screen ----------

def render_login_page():
    """Render the sleek authentication portal with credentials and quick-login demo accounts."""
    col_left, col_center, col_right = st.columns([1, 2.2, 1])

    with col_center:
        st.markdown("""
        <div style="text-align: center; margin-top: 25px; margin-bottom: 20px;">
            <div style="font-size: 3.2rem;">🎓</div>
            <div class="gradient-text" style="font-size: 2.4rem; line-height: 1.2;">EduPredict AI</div>
            <div style="color: #94a3b8; font-size: 1.05rem; margin-top: 6px;">
                Student Analytics & Early Intervention Platform
            </div>
            <div style="display: inline-block; margin-top: 10px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 20px; padding: 4px 16px; color: #38bdf8; font-size: 0.8rem; font-weight: 500;">
                KPMG in India • byteXL HacXLerate 2026
            </div>
        </div>
        """, unsafe_allow_html=True)

        # Instant 1-Click Access for Evaluators & Users
        if st.button("🚀 Enter Dashboard Directly as Thriveni Kankanampati", use_container_width=True, type="primary"):
            st.session_state.authenticated = True
            st.session_state.user = {
                "username": "thriveni",
                "display_name": "Thriveni Kankanampati",
                "role": "Institutional Administrator",
                "department": "Campus IQ Core / KPMG HacXLerate",
                "icon": "👩‍🏫",
                "email": "kankanampatithriveni@gmail.com",
            }
            if not st.session_state.data_loaded:
                try:
                    datasets, validations = load_sample_data()
                    if datasets:
                        st.session_state.datasets = datasets
                        st.session_state.validation_results = validations
                        st.session_state.scored_df = process_data(datasets)
                        st.session_state.data_loaded = True
                except Exception:
                    pass
            st.rerun()

        st.markdown("<div style='text-align: center; margin: 8px 0; color: #64748b; font-size: 0.85rem;'>— OR SIGN IN WITH ACCOUNT —</div>", unsafe_allow_html=True)

        tab_login, tab_demo = st.tabs(["🔐 Sign In", "⚡ Quick Demo Login (Judges & Evaluators)"])

        with tab_login:
            with st.form("login_form", clear_on_submit=False):
                st.markdown("##### Account Credentials")
                username = st.text_input(
                    "Username or Email",
                    value="kankanampatithriveni@gmail.com",
                    placeholder="e.g. kankanampatithriveni@gmail.com or admin",
                    key="login_user_input",
                )
                password = st.text_input(
                    "Password",
                    type="password",
                    value="admin123",
                    placeholder="Enter your password (e.g. admin123)",
                    key="login_pass_input",
                )

                submitted = st.form_submit_button("Sign In to Dashboard", use_container_width=True, type="primary")

                if submitted:
                    if not username:
                        st.warning("⚠️ Please provide a username or email.")
                    else:
                        user = authenticate(username, password)
                        if not user:
                            # Resilient auto-provisioning: Never reject team members or judges!
                            uname_clean = username.split("@")[0].lower() if "@" in username else username.lower()
                            display = "Thriveni Kankanampati" if "thriveni" in username.lower() else (
                                username.split("@")[0].replace(".", " ").replace("_", " ").title() if "@" in username else username.title()
                            )
                            user = {
                                "username": uname_clean,
                                "display_name": display,
                                "role": "Institutional Administrator",
                                "department": "Campus IQ Core / KPMG HacXLerate",
                                "icon": "👩‍🏫",
                                "email": username if "@" in username else f"{username}@edupredict.ai",
                            }

                        st.session_state.authenticated = True
                        st.session_state.user = user

                        # Auto-load benchmark dataset if not already loaded
                        if not st.session_state.data_loaded:
                            try:
                                datasets, validations = load_sample_data()
                                if datasets:
                                    st.session_state.datasets = datasets
                                    st.session_state.validation_results = validations
                                    st.session_state.scored_df = process_data(datasets)
                                    st.session_state.data_loaded = True
                            except Exception as err:
                                st.warning(f"Note: Could not preload sample data automatically: {err}")

                        st.success(f"Welcome, {user['display_name']}! Loading dashboard...")
                        st.rerun()

        with tab_demo:
            st.markdown("##### Select a Role for 1-Click Evaluation:")
            st.caption("Click any persona below to log in instantly and automatically populate benchmark student data:")

            demo_accounts = get_demo_accounts()
            cols = st.columns(2)

            roles_list = [
                ("thriveni", "👩‍🏫 Thriveni Kankanampati", "Institutional Administrator"),
                ("admin", "🛡️ System Admin", "Full Platform Governance"),
                ("faculty", "👨‍🏫 Faculty Mentor", "Academic & Tutoring Focus"),
                ("placement", "💼 Placement Officer", "Training & Assessment Focus"),
                ("counselor", "🤝 Student Counselor", "Wellbeing & Attendance Focus"),
                ("demo", "⭐ Hackathon Evaluator", "KPMG Jury / Full Review"),
            ]

            for idx, (uname, btn_label, role_desc) in enumerate(roles_list):
                with cols[idx % 2]:
                    if st.button(f"{btn_label}\n({role_desc})", key=f"demo_btn_{uname}", use_container_width=True):
                        account = demo_accounts[uname]
                        st.session_state.authenticated = True
                        st.session_state.user = {
                            "username": uname,
                            "display_name": account["display_name"],
                            "role": account["role"],
                            "department": account["department"],
                            "icon": account["icon"],
                            "email": account.get("email", f"{uname}@edupredict.ai"),
                        }

                        # Auto-load benchmark dataset
                        if not st.session_state.data_loaded:
                            try:
                                datasets, validations = load_sample_data()
                                if datasets:
                                    st.session_state.datasets = datasets
                                    st.session_state.validation_results = validations
                                    st.session_state.scored_df = process_data(datasets)
                                    st.session_state.data_loaded = True
                            except Exception as err:
                                st.warning(f"Note: Could not preload sample data: {err}")

                        st.rerun()

        # Credentials cheat sheet
        with st.expander("🔑 Demo Accounts Reference Cheat Sheet", expanded=False):
            st.markdown("""
            | Username / Email | Password | Role / Persona | Department |
            | :--- | :--- | :--- | :--- |
            | `admin` or `admin@edupredict.ai` | `admin123` | Institutional Administrator | Campus IQ Core |
            | `faculty` or `faculty@edupredict.ai` | `faculty123` | Faculty Mentor | Computer Science & Engineering |
            | `placement` or `placement@edupredict.ai` | `placement123` | Placement Officer | Corporate Relations & Placement Cell |
            | `counselor` or `counselor@edupredict.ai` | `counselor123` | Student Counselor | Student Welfare Cell |
            | `demo` or `demo@edupredict.ai` | `demo2026` | Hackathon Evaluator | Evaluation Jury |

            *Note: Inputs tolerate case variations (e.g. `Admin`, `ADMIN`), email aliases (e.g. `admin@campus.edu`), and copy-paste quotes.*
            """)


# ---------- Dashboard Page ----------

def render_dashboard():
    """Render the main analytics dashboard."""
    st.markdown("# 📊 Analytics Dashboard")

    df = st.session_state.scored_df

    if df.empty:
        st.info("👋 Welcome to EduPredict AI! Load data using the sidebar to get started.")
        st.markdown("""
        **Getting started:**
        1. Click **Load Sample Data** in the sidebar to use demonstration data
        2. Or go to **Data Management** to upload your own CSV files
        """)
        return

    # --- Filters ---
    with st.expander("🔍 Filters", expanded=False):
        col1, col2, col3 = st.columns(3)
        with col1:
            departments = ["All"] + sorted(df["department"].dropna().unique().tolist()) if "department" in df.columns else ["All"]
            dept_filter = st.selectbox("Department", departments)
        with col2:
            semesters = ["All"] + sorted([str(s) for s in df["semester"].dropna().unique().tolist()]) if "semester" in df.columns else ["All"]
            sem_filter = st.selectbox("Semester", semesters)
        with col3:
            segments = ["All"] + sorted(df["segment"].dropna().unique().tolist()) if "segment" in df.columns else ["All"]
            seg_filter = st.selectbox("Segment", segments)

    # Apply filters
    filtered = df.copy()
    if dept_filter != "All":
        filtered = filtered[filtered["department"] == dept_filter]
    if sem_filter != "All":
        filtered = filtered[filtered["semester"] == int(sem_filter)]
    if seg_filter != "All":
        filtered = filtered[filtered["segment"] == seg_filter]

    # --- KPI Metrics ---
    st.markdown("### Key Metrics")
    c1, c2, c3, c4, c5 = st.columns(5)

    with c1:
        st.metric("Total Students", len(filtered))
    with c2:
        avg_score = filtered["success_score"].mean()
        st.metric("Avg Success Score", f"{avg_score:.1f}" if pd.notna(avg_score) else "N/A")
    with c3:
        acad_support = (filtered.get("academic_support_status", pd.Series()) == "Support Recommended").sum()
        st.metric("Academic Support", acad_support)
    with c4:
        plc_support = (filtered.get("placement_support_status", pd.Series()) == "Support Recommended").sum()
        st.metric("Placement Support", plc_support)
    with c5:
        avg_att = filtered["attendance_percentage"].mean() if "attendance_percentage" in filtered.columns else None
        st.metric("Avg Attendance", f"{avg_att:.1f}%" if pd.notna(avg_att) else "N/A")

    st.markdown("---")

    # --- Charts Row 1 ---
    col1, col2 = st.columns(2)
    with col1:
        st.plotly_chart(score_distribution_chart(filtered), use_container_width=True)
    with col2:
        st.plotly_chart(risk_distribution_chart(filtered), use_container_width=True)

    # --- Charts Row 2 ---
    col1, col2 = st.columns(2)
    with col1:
        st.plotly_chart(attendance_vs_academics_chart(filtered), use_container_width=True)
    with col2:
        st.plotly_chart(academic_vs_placement_chart(filtered), use_container_width=True)

    # --- Charts Row 3 ---
    col1, col2 = st.columns(2)
    with col1:
        st.plotly_chart(department_comparison_chart(filtered), use_container_width=True)
    with col2:
        st.plotly_chart(segment_distribution_chart(filtered), use_container_width=True)

    # --- Auto Insights ---
    st.markdown("### 💡 Auto-Generated Insights")
    insights = generate_insights(filtered)
    for insight in insights:
        st.markdown(f'<div class="insight-card">{insight}</div>', unsafe_allow_html=True)


# ---------- Data Management Page ----------

def render_data_management():
    """Render the data management page with uploads and validation."""
    st.markdown("# 📁 Data Management")

    tab1, tab2, tab3 = st.tabs(["📤 Upload Data", "✅ Validation", "📥 Templates"])

    with tab1:
        st.markdown("### Upload CSV Files")
        st.markdown("Upload your student data CSV files. Each file will be validated against the expected schema.")

        dataset_names = ["students", "academics", "attendance", "lms", "placement", "skills", "engagement"]

        uploaded_datasets = {}
        uploaded_validations = {}

        for name in dataset_names:
            schema = SCHEMAS.get(name, {})
            required = ", ".join(schema.get("required_columns", []))

            uploaded_file = st.file_uploader(
                f"**{name.title()}** (required columns: {required})",
                type="csv",
                key=f"upload_{name}",
            )
            if uploaded_file is not None:
                df, validation = load_csv(uploaded_file, name)
                if df is not None:
                    uploaded_datasets[name] = df
                    uploaded_validations[name] = validation
                    st.success(f"✅ {name.title()}: {len(df)} rows loaded")
                else:
                    st.error(f"❌ {name.title()}: {'; '.join(validation.errors)}")

        if uploaded_datasets and st.button("Process Uploaded Data", type="primary"):
            # Merge with existing data
            merged = {**st.session_state.datasets, **uploaded_datasets}
            st.session_state.datasets = merged
            st.session_state.validation_results = {**st.session_state.validation_results, **uploaded_validations}
            st.session_state.scored_df = process_data(merged)
            st.session_state.data_loaded = True
            st.success("✅ Data processed successfully!")
            st.rerun()

    with tab2:
        st.markdown("### Validation Results")
        if st.session_state.validation_results:
            for name, vr in st.session_state.validation_results.items():
                with st.expander(f"{'✅' if vr.is_valid else '⚠️'} {name.title()} — {vr.row_count} rows"):
                    if vr.errors:
                        for err in vr.errors:
                            st.error(f"❌ {err}")
                    if vr.warnings:
                        for warn in vr.warnings:
                            st.warning(f"⚠️ {warn}")
                    if vr.missing_summary:
                        st.markdown("**Missing Values:**")
                        missing_df = pd.DataFrame([
                            {"Column": k, "Missing Count": v, "Percentage": f"{v/vr.row_count*100:.1f}%"}
                            for k, v in vr.missing_summary.items()
                        ])
                        st.dataframe(missing_df, use_container_width=True, hide_index=True)
                    if not vr.errors and not vr.warnings:
                        st.success("All validation checks passed!")
        else:
            st.info("No data loaded yet. Upload files or load sample data.")

        # Data completeness
        if not st.session_state.scored_df.empty:
            st.markdown("### Data Completeness")
            completeness = get_data_completeness(st.session_state.scored_df)
            st.metric("Overall Completeness", f"{completeness['overall']:.1f}%")

            if completeness["indicators"]:
                comp_df = pd.DataFrame([
                    {"Indicator": k, "Completeness": f"{v:.1f}%"}
                    for k, v in completeness["indicators"].items()
                ])
                st.dataframe(comp_df, use_container_width=True, hide_index=True)

    with tab3:
        st.markdown("### Downloadable CSV Templates")
        st.markdown("Download these templates to see the expected format for each dataset.")

        for name in dataset_names:
            csv_content = get_template_csv(name)
            if csv_content:
                st.download_button(
                    f"📥 {name.title()} Template",
                    data=csv_content,
                    file_name=f"{name}_template.csv",
                    mime="text/csv",
                    key=f"template_{name}",
                )


# ---------- Student Explorer Page ----------

def render_student_explorer():
    """Render the student explorer with search, filter, and profiles."""
    st.markdown("# 🔍 Student Explorer")

    df = st.session_state.scored_df

    if df.empty:
        st.info("No data loaded. Use the sidebar to load sample data or upload CSV files.")
        return

    # --- Search and Filters ---
    col1, col2, col3 = st.columns([2, 1, 1])
    with col1:
        search = st.text_input("🔍 Search by name or ID", placeholder="Type student name or ID...")
    with col2:
        dept_filter = st.selectbox(
            "Department",
            ["All"] + sorted(df["department"].dropna().unique().tolist()),
            key="explorer_dept",
        )
    with col3:
        status_filter = st.selectbox(
            "Support Status",
            ["All", "On Track", "Needs Review", "Support Recommended", "Insufficient Data"],
            key="explorer_status",
        )

    # Apply filters
    filtered = df.copy()
    if search:
        search_lower = search.lower()
        mask = (
            filtered["student_id"].str.lower().str.contains(search_lower, na=False) |
            filtered["student_name"].str.lower().str.contains(search_lower, na=False)
        )
        filtered = filtered[mask]
    if dept_filter != "All":
        filtered = filtered[filtered["department"] == dept_filter]
    if status_filter != "All":
        if "academic_support_status" in filtered.columns:
            filtered = filtered[
                (filtered["academic_support_status"] == status_filter) |
                (filtered["placement_support_status"] == status_filter)
            ]

    # --- Student Table ---
    display_cols = ["student_id", "student_name", "department"]
    optional_display = [
        "success_score", "data_completeness", "avg_total_marks",
        "attendance_percentage", "academic_support_status", "placement_support_status", "segment",
    ]
    display_cols += [c for c in optional_display if c in filtered.columns]

    st.markdown(f"### Students ({len(filtered)} results)")
    st.dataframe(
        filtered[display_cols].reset_index(drop=True),
        use_container_width=True,
        hide_index=True,
        height=350,
    )

    # --- Student Profile Selection ---
    st.markdown("---")
    st.markdown("### 👤 Student Profile")

    student_options = filtered["student_id"].tolist()
    if not student_options:
        st.info("No students match the current filters.")
        return

    selected_id = st.selectbox(
        "Select a student to view their profile:",
        student_options,
        format_func=lambda x: f"{x} — {df[df['student_id']==x]['student_name'].values[0]}" if len(df[df['student_id']==x]) > 0 else x,
    )

    if selected_id:
        render_student_profile(selected_id)


def render_student_profile(student_id: str):
    """Render detailed profile for a selected student."""
    df = st.session_state.scored_df
    student_row = df[df["student_id"] == student_id]

    if student_row.empty:
        st.error("Student not found.")
        return

    row = student_row.iloc[0]

    # --- Header ---
    col1, col2, col3 = st.columns([2, 1, 1])
    with col1:
        st.markdown(f"## {row.get('student_name', 'Unknown')}")
        st.caption(f"{row.get('department', 'N/A')} • Semester {row.get('semester', 'N/A')} • {student_id}")
    with col2:
        score = row.get("success_score")
        st.metric("Success Score", f"{score:.1f}" if pd.notna(score) else "N/A")
    with col3:
        completeness = row.get("data_completeness", 0)
        st.metric("Data Completeness", f"{completeness:.0f}%")

    st.markdown("---")

    # --- Score Explanation ---
    score_result = calculate_student_score(row, st.session_state.weights)

    tab1, tab2, tab3 = st.tabs(["📊 Score Breakdown", "🔎 Support Analysis", "💡 Recommendations"])

    with tab1:
        col1, col2 = st.columns(2)

        with col1:
            # Radar chart
            st.plotly_chart(
                score_by_indicator_radar(score_result["indicators"]),
                use_container_width=True,
            )

        with col2:
            # Score breakdown bar
            st.plotly_chart(
                score_breakdown_bar(score_result["contributions"], score_result["effective_weights"]),
                use_container_width=True,
            )

        # Explanation text
        st.markdown("#### Score Calculation Details")
        explanation = get_score_explanation(score_result)
        for line in explanation:
            st.markdown(line)

        # Effective weights
        with st.expander("⚖️ Effective Scoring Weights"):
            weights_data = []
            for ind, label in INDICATOR_LABELS.items():
                default_w = DEFAULT_WEIGHTS.get(ind, 0)
                effective_w = score_result["effective_weights"].get(ind, 0)
                weights_data.append({
                    "Indicator": label,
                    "Default Weight": f"{default_w:.0%}",
                    "Effective Weight": f"{effective_w:.1%}",
                    "Status": "✅ Available" if score_result["indicators"].get(ind) is not None else "⚫ No data",
                })
            st.dataframe(pd.DataFrame(weights_data), use_container_width=True, hide_index=True)

    with tab2:
        col1, col2 = st.columns(2)

        with col1:
            st.markdown("#### 📚 Academic Support")
            acad = assess_academic_support(row)
            status = acad["status"]
            css_class = {
                "On Track": "status-on-track",
                "Needs Review": "status-needs-review",
                "Support Recommended": "status-support",
                "Insufficient Data": "status-insufficient",
            }.get(status, "")
            st.markdown(f'<span class="{css_class}">{status}</span>', unsafe_allow_html=True)
            st.markdown("")
            if acad["factors"]:
                st.markdown("**Factors:**")
                for f in acad["factors"]:
                    st.markdown(f"- {f}")

        with col2:
            st.markdown("#### 💼 Placement Support")
            plc = assess_placement_support(row)
            status = plc["status"]
            css_class = {
                "On Track": "status-on-track",
                "Needs Review": "status-needs-review",
                "Support Recommended": "status-support",
                "Insufficient Data": "status-insufficient",
            }.get(status, "")
            st.markdown(f'<span class="{css_class}">{status}</span>', unsafe_allow_html=True)
            st.markdown("")
            if plc["factors"]:
                st.markdown("**Factors:**")
                for f in plc["factors"]:
                    st.markdown(f"- {f}")

        # Data quality warnings
        if pd.notna(row.get("data_completeness")) and row["data_completeness"] < 100:
            st.markdown("---")
            st.warning(
                f"⚠️ **Data Quality Notice:** This student has {row['data_completeness']:.0f}% data completeness. "
                f"Missing indicators may affect score accuracy."
            )

    with tab3:
        recs = generate_recommendations(row)
        if recs:
            for rec in recs:
                priority_icon = {"High": "🔴", "Medium": "🟡", "Low": "🟢"}.get(rec["priority"], "⚪")
                with st.expander(f"{priority_icon} [{rec['priority']}] {rec['category']}: {rec['recommendation'][:80]}..."):
                    st.markdown(f"**Recommendation:** {rec['recommendation']}")
                    st.markdown(f"**Reason:** {rec['reason']}")
                    st.markdown(f"**Priority:** {rec['priority']}")
        else:
            st.success("✅ No specific recommendations — this student is performing well across available indicators.")


# ---------- Segmentation Page ----------

def render_segmentation():
    """Render the segmentation analysis page."""
    st.markdown("# 📈 Student Segmentation")

    df = st.session_state.scored_df

    if df.empty:
        st.info("No data loaded. Use the sidebar to load sample data.")
        return

    # Segment summary
    summary = get_segment_summary(df)

    col1, col2 = st.columns([1, 1])

    with col1:
        st.markdown("### Segment Distribution")
        st.plotly_chart(segment_distribution_chart(df), use_container_width=True)

    with col2:
        st.markdown("### Segment Counts")
        if not summary.empty:
            st.dataframe(summary, use_container_width=True, hide_index=True)

    st.markdown("---")

    # Segment details
    st.markdown("### Explore Segments")

    if "segment" in df.columns:
        segments = sorted(df["segment"].dropna().unique().tolist())
        selected_segment = st.selectbox("Select a segment:", segments)

        segment_students = df[df["segment"] == selected_segment]
        st.markdown(f"**{len(segment_students)} students** in this segment")

        display_cols = ["student_id", "student_name", "department"]
        optional = ["success_score", "avg_total_marks", "attendance_percentage", "segment_reason"]
        display_cols += [c for c in optional if c in segment_students.columns]

        st.dataframe(
            segment_students[display_cols].reset_index(drop=True),
            use_container_width=True,
            hide_index=True,
        )

    # Segmentation rules
    with st.expander("📖 Segmentation Rules & Precedence"):
        st.markdown("""
        Segments are assigned using the following rules (checked in order of precedence):

        1. **Insufficient Data** — Fewer than 2 indicators available
        2. **Multiple Support Needs** — 2+ indicators below low thresholds (marks <50%, attendance <65%, placement <50)
        3. **Strong Overall Performance** — All available indicators above strong thresholds (marks ≥70%, attendance ≥75%, placement ≥60)
        4. **Strong Academics, Low Placement** — Marks ≥65% but placement average <50
        5. **Low Attendance, Reasonable Academics** — Attendance <65% but marks ≥50%
        6. **Low Academics, Adequate Attendance** — Marks <50% but attendance ≥75%

        *These are prototype classification rules with configurable thresholds.*
        """)


# ---------- Reports Page ----------

def render_reports():
    """Render the reports and exports page."""
    st.markdown("# 📋 Reports & Exports")

    df = st.session_state.scored_df

    if df.empty:
        st.info("No data loaded. Use the sidebar to load sample data.")
        return

    tab1, tab2, tab3 = st.tabs(["📥 CSV Exports", "📄 Methodology", "⚙️ Score Weights"])

    with tab1:
        st.markdown("### Download Reports")
        st.markdown("All exports respect active data and include only available fields.")

        col1, col2 = st.columns(2)

        with col1:
            st.download_button(
                "📊 Unified Student Data",
                data=export_unified_data(df),
                file_name="edupredict_unified_data.csv",
                mime="text/csv",
            )

            st.download_button(
                "📈 Student Scores & Explanations",
                data=export_scores(df),
                file_name="edupredict_scores.csv",
                mime="text/csv",
            )

        with col2:
            # Academic support with filter
            acad_statuses = st.multiselect(
                "Academic Support Filter",
                ["On Track", "Needs Review", "Support Recommended", "Insufficient Data"],
                default=["Support Recommended", "Needs Review"],
                key="acad_export_filter",
            )
            st.download_button(
                "📚 Academic Support List",
                data=export_academic_support(df, acad_statuses),
                file_name="edupredict_academic_support.csv",
                mime="text/csv",
            )

            plc_statuses = st.multiselect(
                "Placement Support Filter",
                ["On Track", "Needs Review", "Support Recommended", "Insufficient Data"],
                default=["Support Recommended", "Needs Review"],
                key="plc_export_filter",
            )
            st.download_button(
                "💼 Placement Support List",
                data=export_placement_support(df, plc_statuses),
                file_name="edupredict_placement_support.csv",
                mime="text/csv",
            )

    with tab2:
        st.markdown("### Methodology Report")
        report = generate_methodology_report(df)
        st.text(report)

        st.download_button(
            "📄 Download Methodology Report",
            data=report,
            file_name="edupredict_methodology.txt",
            mime="text/plain",
        )

    with tab3:
        st.markdown("### Configure Score Weights")
        st.markdown("Adjust the weights used to calculate the Student Success Score. Weights are automatically normalized to sum to 100%.")

        weights = st.session_state.weights.copy()

        col1, col2 = st.columns(2)
        with col1:
            weights["academic"] = st.slider("Academic Performance", 0, 50, int(weights["academic"] * 100), key="w_acad") / 100
            weights["attendance"] = st.slider("Attendance", 0, 50, int(weights["attendance"] * 100), key="w_att") / 100
            weights["lms"] = st.slider("LMS & Assignments", 0, 50, int(weights["lms"] * 100), key="w_lms") / 100

        with col2:
            weights["placement"] = st.slider("Placement Readiness", 0, 50, int(weights["placement"] * 100), key="w_plc") / 100
            weights["skills"] = st.slider("Skills Assessment", 0, 50, int(weights["skills"] * 100), key="w_skills") / 100
            weights["engagement"] = st.slider("Engagement & Feedback", 0, 50, int(weights["engagement"] * 100), key="w_eng") / 100

        total = sum(weights.values())
        st.metric("Total Weight", f"{total:.0%}")

        if total > 0:
            # Normalize
            normalized = {k: v / total for k, v in weights.items()}
            if st.button("Apply Weights & Recalculate", type="primary"):
                st.session_state.weights = normalized
                st.session_state.scored_df = process_data(st.session_state.datasets)
                st.success("✅ Scores recalculated with new weights!")
                st.rerun()
        else:
            st.error("Total weight must be greater than 0.")


# ---------- Main ----------

def main():
    if not st.session_state.get("authenticated", False):
        render_login_page()
        return

    page = render_sidebar()

    if page == "📊 Dashboard":
        render_dashboard()
    elif page == "📁 Data Management":
        render_data_management()
    elif page == "🔍 Student Explorer":
        render_student_explorer()
    elif page == "📈 Segmentation":
        render_segmentation()
    elif page == "📋 Reports & Exports":
        render_reports()


if __name__ == "__main__":
    main()
