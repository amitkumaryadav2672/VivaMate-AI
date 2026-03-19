import React, { useState, useEffect } from 'react';
import '../style/interview.scss';
import { useInterview } from '../hooks/useInterview.js';
import { useNavigate, useParams } from 'react-router';
import axios from 'axios';

const NAV_ITEMS = [
    { id: 'technical', label: 'Technical Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>) },
    { id: 'behavioral', label: 'Behavioral Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>) },
    { id: 'roadmap', label: 'Road Map', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>) },
];

const QuestionCard = ({ item, index }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className='q-card'>
            <div className='q-card__header' onClick={() => setOpen(o => !o)}>
                <span className='q-card__index'>Q{index + 1}</span>
                <p className='q-card__question'>{item.question}</p>
                <span className={`q-card__chevron ${open ? 'q-card__chevron--open' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
            </div>
            {open && (
                <div className='q-card__body'>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--intention'>Intention</span>
                        <p>{item.intention}</p>
                    </div>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--answer'>Model Answer</span>
                        <p>{item.answer}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const RoadMapDay = ({ day }) => (
    <div className='roadmap-day'>
        <div className='roadmap-day__header'>
            <span className='roadmap-day__badge'>Day {day.day}</span>
            <h3 className='roadmap-day__focus'>{day.focus}</h3>
        </div>
        <ul className='roadmap-day__tasks'>
            {day.tasks.map((task, i) => (
                <li key={i}>
                    <span className='roadmap-day__bullet' />
                    {task}
                </li>
            ))}
        </ul>
    </div>
);

const Interview = () => {
    const [activeNav, setActiveNav] = useState('technical');
    const { report, getReportById, loading, getResumePdf, generateReport } = useInterview();
    const { interviewId } = useParams();
    const navigate = useNavigate();

    const [jobDescription, setJobDescription] = useState("");
    const [resumeFile, setResumeFile] = useState(null);
    const [selfDescription, setSelfDescription] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (interviewId) {
            console.log("📋 Interview ID from URL:", interviewId);
            getReportById(interviewId);
        }
    }, [interviewId]);

    const handleGenerateReport = async () => {
        setError("");

        console.log("========== FORM SUBMISSION DEBUG ==========");
        console.log("Job Description:", jobDescription);
        console.log("Resume File:", resumeFile);
        console.log("Self Description:", selfDescription);

        if (resumeFile) {
            console.log("Resume Details:", {
                name: resumeFile.name,
                size: resumeFile.size,
                type: resumeFile.type
            });
        }

        if (!jobDescription.trim()) {
            setError("Job Description is required");
            return;
        }

        if (!resumeFile && !selfDescription.trim()) {
            setError("Either a Resume or Self Description is required");
            return;
        }

        const token = localStorage.getItem("token");
        console.log("Token exists:", !!token);

        if (!token) {
            setError("Please login first");
            return;
        }

        setIsGenerating(true);

        try {
            // Using the hook's generateReport function
            const result = await generateReport({
                jobDescription,
                selfDescription,
                resumeFile
            });

            console.log("✅ Success - Report Generated:", result);
            alert("Interview Strategy Generated Successfully! 🚀");

            // ✅ FIX: Check all possible ID locations
            const reportId = result?._id || result?.id || result?.interviewReport?._id;

            if (reportId) {
                console.log("➡️ Navigating to interview page with ID:", reportId);
                navigate(`/interview/${reportId}`);
            } else {
                console.log("⚠️ No ID found in response:", result);
                // Try to find ID in nested structure
                if (result?.interviewReport?._id) {
                    navigate(`/interview/${result.interviewReport._id}`);
                } else {
                    setError("Report generated but unable to navigate. Please check reports list.");
                }
            }

        } catch (err) {
            console.error("❌ Error in handleGenerateReport:", err);
            setError(err.response?.data?.message || "Error generating strategy ❌");
        } finally {
            setIsGenerating(false);
        }
    };

    if (!interviewId) {
        return (
            <div className="interview-form-container">
                <div className="interview-form">
                    <h1>Create Your Custom Interview Plan</h1>
                    <p className="form-subtitle">
                        Let our AI analyze the job requirements and your unique profile to build a winning strategy.
                    </p>

                    <div className="form-section">
                        <div className="section-header">
                            <h2>📋 Target Job Description</h2>
                            <span className="required-badge">REQUIRED</span>
                        </div>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the job description here..."
                            rows="5"
                            className="form-textarea"
                        />
                    </div>

                    <div className="form-section">
                        <div className="section-header">
                            <h2>🔍 Your Profile</h2>
                        </div>

                        <div className="profile-subsection">
                            <div className="subsection-header">
                                <h3>Upload Resume</h3>
                                <span className="best-badge">BEST RESULTS</span>
                            </div>
                            <input
                                type="file"
                                accept=".pdf,.docx,application/pdf"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    console.log("📁 File selected:", file);
                                    setResumeFile(file);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    border: '2px dashed #ccc',
                                    borderRadius: '8px',
                                    background: '#f9f9f9',
                                    cursor: 'pointer'
                                }}
                            />
                            {resumeFile && (
                                <div style={{
                                    marginTop: '0.5rem',
                                    padding: '0.5rem',
                                    background: '#e8f5e8',
                                    borderRadius: '4px',
                                    color: '#2e7d32',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <span>✅</span>
                                    <span><strong>{resumeFile.name}</strong></span>
                                    <span>({(resumeFile.size / 1024).toFixed(1)} KB)</span>
                                </div>
                            )}
                        </div>

                        <div className="or-divider">OR</div>

                        <div className="profile-subsection">
                            <h3>Quick Self-Description</h3>
                            <textarea
                                value={selfDescription}
                                onChange={(e) => setSelfDescription(e.target.value)}
                                placeholder="Describe your skills, experience, and what you're looking for..."
                                rows="4"
                                className="form-textarea"
                            />
                        </div>

                        <div className="form-helper">
                            <span className="helper-icon">ℹ️</span>
                            Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            ❌ {error}
                        </div>
                    )}

                    <button
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                        className="button primary-button generate-button"
                    >
                        {isGenerating ? (
                            <>⏳ Generating your interview plan...</>
                        ) : (
                            <>🚀 Generate My Interview Strategy</>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    if (loading || !report) {
        return (
            <main className='loading-screen'>
                <h1>Loading your interview plan...</h1>
            </main>
        );
    }

    const scoreColor =
        report.matchScore >= 80 ? 'score--high' :
            report.matchScore >= 60 ? 'score--mid' : 'score--low';

    return (
        <div className='interview-page'>
            <div className='interview-layout'>
                <nav className='interview-nav'>
                    <div className="nav-content">
                        <p className='interview-nav__label'>Sections</p>
                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.id}
                                className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                onClick={() => setActiveNav(item.id)}
                            >
                                <span className='interview-nav__icon'>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => { getResumePdf(interviewId); }}
                        className='button primary-button'
                    >
                        <svg height={"0.8rem"} style={{ marginRight: "0.8rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z"></path>
                        </svg>
                        Download Resume
                    </button>
                </nav>

                <div className='interview-divider' />

                <main className='interview-content'>
                    {activeNav === 'technical' && (
                        <section>
                            <div className='content-header'>
                                <h2>Technical Questions</h2>
                                <span className='content-header__count'>{report.technicalQuestions?.length || 0} questions</span>
                            </div>
                            <div className='q-list'>
                                {report.technicalQuestions?.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'behavioral' && (
                        <section>
                            <div className='content-header'>
                                <h2>Behavioral Questions</h2>
                                <span className='content-header__count'>{report.behavioralQuestions?.length || 0} questions</span>
                            </div>
                            <div className='q-list'>
                                {report.behavioralQuestions?.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'roadmap' && (
                        <section>
                            <div className='content-header'>
                                <h2>Preparation Road Map</h2>
                                <span className='content-header__count'>{report.preparationPlan?.length || 0}-day plan</span>
                            </div>
                            <div className='roadmap-list'>
                                {report.preparationPlan?.map((day) => (
                                    <RoadMapDay key={day.day} day={day} />
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                <div className='interview-divider' />

                <aside className='interview-sidebar'>
                    <div className='match-score'>
                        <p className='match-score__label'>Match Score</p>
                        <div className={`match-score__ring ${scoreColor}`}>
                            <span className='match-score__value'>{report.matchScore}</span>
                            <span className='match-score__pct'>%</span>
                        </div>
                        <p className='match-score__sub'>Strong match for this role</p>
                    </div>

                    <div className='sidebar-divider' />

                    <div className='skill-gaps'>
                        <p className='skill-gaps__label'>Skill Gaps</p>
                        <div className='skill-gaps__list'>
                            {report.skillGaps?.map((gap, i) => (
                                <span key={i} className={`skill-tag skill-tag--${gap.severity}`}>
                                    {gap.skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Interview;