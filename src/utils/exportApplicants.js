import { formatDate } from "./helpers";

/* ── CSV export helper ── */
export const exportToCsv = (applicants) => {
    if (!applicants?.length) return;

    const headers = [
        // Identity
        "Full Name",
        "Email",
        "Phone",
        "State of Origin",
        "LGA",
        // Job Info
        "Job ID",
        "Position",
        "Cadre",
        "Job Type",
        "Department / Faculty",
        "Job Published Date",
        "Job Deadline",
        // Application Status
        "Application Status",
        // Experience
        "Teaching Years",
        "Research Years",
        "Industry Years",
        "Publications",
        "Post-Qual. Experience (yrs)",
        // Qualifications
        "Degrees",
        "Has PhD",
        "NYSC Completed",
        // Professional Info
        "ICT Proficient",
        // Referees 
        "Total Referees",
        "Reacted Referees",
        "Referee Details",
        // Timestamps & Meta
        "Applied At",
    ];

    const capitalize = (str) => {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const rows = applicants.map((ap) => {
        const pi = ap.personalInfo ?? {};
        const exp = ap.experience ?? {};
        const pro = ap.professionalInfo ?? {};
        const job = ap.jobId ?? ap.job ?? {};
        const pos = job.position ?? {};

        // Identity
        const email = pi.email ?? ap.email ?? "";
        const phone = pi.phone ?? ap.phone ?? "";

        // Job
        const jobId = job._id ?? "";
        const position = pos.title ?? "";
        const cadre = pos.cadre ?? "";
        const jobType = job.description ?? "";
        const dept =
            ap.department ??
            pos.department ??
            pos.faculty ??
            "";
        const publishedDate = job.publishedDate ? formatDate(job.publishedDate) : "";
        const deadline = job.applicationDeadline ? formatDate(job.applicationDeadline) : "";

        // Status
        const appStatus = ap.status ?? "";

        // Experience
        const teaching = exp.teachingYears ?? 0;
        const research = exp.researchYears ?? 0;
        const industry = exp.industryYears ?? 0;
        const publications = exp.publications ?? 0;
        const postQualExp = exp.postQualificationExperience ?? 0;

        // Qualifications
        const hasPhd = ap.qualifications?.hasPhd ? "Yes" : "No";
        const nysc = ap.qualifications?.nysc?.completed ? "Yes" : "No";
        const degrees = (ap.qualifications?.degrees ?? [])
            .map((d) => {
                const parts = [capitalize(d.degreeType)];
                if (d.institution) parts.push(`- ${d.institution}`);
                const extras = [];
                if (d.yearAwarded || d.year) extras.push(d.yearAwarded ?? d.year);
                if (d.degreeClass) extras.push(d.degreeClass);
                if (extras.length) parts.push(`(${extras.join(", ")})`);
                return parts.join(" ");
            })
            .join("; ");

        // Professional Info
        const ict = pro.ictProficiency ? "Yes" : "No";

        // Referees
        const totalReferees = ap.referees?.length ?? 0;
        const reactedReferees = ap.ReactedReferees ?? 0;
        const refereeDetails = (ap.referees ?? [])
            .map((r) => `${r.name} (${r.email}) [${r.hasSubmitted ? "Submitted" : "Pending"}]`)
            .join("; ");

        // Timestamps
        const appliedAt = ap.appliedAt ? formatDate(ap.appliedAt) : "";

        return [
            ap.fullName ?? "",
            email,
            phone,
            ap.stateOfOrigin ?? "",
            ap.lga ?? "",
            jobId,
            position,
            cadre,
            jobType,
            dept,
            publishedDate,
            deadline,
            appStatus,
            teaching,
            research,
            industry,
            publications,
            postQualExp,
            degrees,
            hasPhd,
            nysc,
            ict,
            totalReferees,
            reactedReferees,
            refereeDetails,
            appliedAt,
        ];
    });

    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
        headers.map(escape).join(","),
        ...rows.map((r) => r.map(escape).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `applicants_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
};

/* ── CSV export for shortlisted candidates (all-shortlists view) ── */
export const exportShortlistedCandidatesToCsv = (candidates) => {
    if (!candidates?.length) return;

    const headers = [
        // Identity
        "#",
        "Application ID",
        "First Name",
        "Middle Name",
        "Last Name",
        "Email",
        "Phone",
        "Gender",
        "Date of Birth",
        "Marital Status",
        "NIN",
        // Shortlist outcome
        "Overall Score",
        "AI Recommendation",
        "AI Shortlist Status",
        "Shortlist Reason",
        // Detailed AI scores
        "Qualification Score",
        "Experience Score",
        "Publication Score",
        "Professional Score",
        "Missing Requirements",
        // Meta
        "Generation Date",
        "Job ID",
    ];

    const rows = candidates.map((c, i) => [
        i + 1,
        c.appId ?? "",
        c.firstName ?? "",
        c.middleName ?? "",
        c.lastName ?? "",
        c.email ?? "",
        c.phone ?? "",
        c.gender ?? "",
        c.dateOfBirth ? formatDate(c.dateOfBirth) : "",
        c.maritalStatus ?? "",
        c.nin ?? "",
        c.overallScore ?? "",
        c.recommendation ?? "",
        c.shortlistStatus ?? "",
        c.shortlistReason ?? "",
        c.qualificationScore ?? "",
        c.experienceScore ?? "",
        c.publicationScore ?? "",
        c.professionalScore ?? "",
        (c.missingRequirements ?? []).join(" | "),
        c.generationDate ? formatDate(c.generationDate) : "",
        c.jobId ?? "",
    ]);

    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
        headers.map(escape).join(","),
        ...rows.map((r) => r.map(escape).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `shortlisted_candidates_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
};