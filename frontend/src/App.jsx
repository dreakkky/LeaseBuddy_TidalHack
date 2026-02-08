import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadText, setUploadText] = useState("Click to upload");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [documentId, setDocumentId] = useState(null);
  const [summary, setSummary] = useState([]);
  const [clauses, setClauses] = useState([]);

  const [backendStatus, setBackendStatus] = useState("checking");

  const DEV_DOCUMENT_ID = "1d8664b2-20b5-446e-b455-d2a75cc012b6";
  const DEV_MODE = false;

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/health");
        setBackendStatus(res.ok ? "ok" : "down");
      } catch {
        setBackendStatus("down");
      }
    };
    checkHealth();
  }, []);
  
  // DEV function to fetch report without uploading (for faster testing)
  const fetchReportOnly = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `http://localhost:4000/api/lease/report/${DEV_DOCUMENT_ID}`
      );

      if (!res.ok) throw new Error("Failed to fetch report");

      const data = await res.json();

      setClauses(data?.report?.clauses || []);
      setPage("results");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch lease report");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ FILE HANDLING ------------------ */
  const handleFileChange = (e) => { 
    const file = e.target.files[0]; 
    if (file) { setSelectedFile(file); 
      document.getElementById("upload-text").innerText = "Uploaded: " + file.name; 
  }};
    
  /* ------------------ MAIN FLOW ------------------ */
  const analyzeLease = async () => {

    // DEV mode for quick testing without re-uploading every time
    if (DEV_MODE) {
      fetchReportOnly();
      return;
    }

    if (!selectedFile) {
      alert("Please upload a lease first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload
      const formData = new FormData();
      // Multer friendly naming
      formData.append("file", selectedFile);

      const uploadRes = await fetch(
        "http://localhost:4000/api/lease/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadRes.ok) throw new Error("Upload failed");

      const uploadData = await uploadRes.json();
      console.log("Upload response:", uploadData);

      setDocumentId(uploadData.documentId);
      setSummary(uploadData.summary || []);

      

      // Fetch report
      const reportRes = await fetch(
        `http://localhost:4000/api/lease/report/${uploadData.documentId}`
      );

      if (!reportRes.ok) throw new Error("Failed to fetch report");

      const reportData = await reportRes.json();
      console.log("Report data:", reportData);

      // handling clauses
      setClauses(
        reportData?.report?.clauses ||
        []
      );

      setPage("results");
    } catch (err) {
      console.error(err);
      setError("Failed to analyze lease.");
    } finally {
      setLoading(false);
    }
  };

  const highCount = clauses.filter(
    c => c.severity?.toLowerCase() === "high"
  ).length;

  const mediumCount = clauses.filter(
    c => c.severity?.toLowerCase() === "medium"
  ).length;

  const lowCount = clauses.filter(
    c => c.severity?.toLowerCase() === "low"
  ).length;

  // Overall verdict color
  let verdictColor = "#22c55e";

  if (highCount >= 2) {
    verdictColor = "#ef4444";
  } else if (highCount === 1 || mediumCount >= 2) {
    verdictColor = "#facc15";
  }

  return (
    <div className="App">
      {/* Backend status */}
      <div
        style={{
          padding: "0.5rem",
          backgroundColor:
            backendStatus === "ok" ? "#d1fae5" : "#fee2e2",
          color: backendStatus === "ok" ? "#065f46" : "#b91c1c",
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        {backendStatus === "checking"
          ? "Checking backend…"
          : backendStatus === "ok"
          ? "Connected to backend ✅"
          : "Backend not reachable ❌"}
      </div>

      {/* HOME */}
      {page === "home" && (
        <>
          <div className="header">🏠 LeaseBuddy</div>

          <div className="App-header">
            <img
              className="lease-image"
              src="/big-image1.png"
              alt="Lease"
            />

            <h1>Spot the red flags before you sign</h1>
            <p className="information-text">
              Upload your lease and get a breakdown of hidden fees,
              risky clauses, and what to negotiate — in seconds.
            </p>

            <div className="file-box">
              <label className="file-label"> 
              <p id="upload-text">Click to upload</p> 
              <input type="file" className="file-input" 
              accept="application/pdf" 
              onChange={handleFileChange} /> 
            </label>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <button onClick={analyzeLease} disabled={loading}>
              {loading ? "Analyzing…" : "Analyze Lease"}
            </button>
          </div>
        </>
      )}

      {/* RESULTS  */}
      {page === "results" && (
        <>
          <div className="header">🏠 LeaseBuddy</div>

          <div className="App-main">
            {/* Verdict - top and centered */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                <div
                  className="leaseBuddy-verdict"
                  style={{
                    backgroundColor: verdictColor,
                    color: verdictColor === "#facc15" ? "#000" : "#fff",
                    textAlign: "center",
                  }}
                >
                  <h1>LeaseBuddy Verdict</h1>

                  <p>
                    🔴 High: {highCount} &nbsp;&nbsp;
                    🟡 Medium: {mediumCount} &nbsp;&nbsp;
                    🟢 Low: {lowCount}
                  </p>

                  <p>
                    {highCount >= 2
                      ? "High risk lease — review carefully"
                      : highCount === 1 || mediumCount >= 2
                      ? "Moderate risk — check key clauses"
                      : "Low risk lease"}
                  </p>
                </div>
              </div>

            </div>

            {/* Containers grid */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "20px",
              }}
            >
              {clauses.map((clause, index) => (
                <div
                  className="container"
                  key={index}
                  style={{ width: "45%", minWidth: "300px" }}
                > 
                  <div className="side-to-side">
                  <h3>{clause.title}</h3>
                  <div
                    className="risk"
                    style={{
                      backgroundColor:
                        clause.severity === "high"
                          ? "#ef4444"
                          : clause.severity === "medium"
                          ? "#facc15"
                          : "#22c55e",
                      color: clause.severity === "medium" ? "#000" : "#fff",
                      textAlign: "left",
                    }}
                  >
                    <strong>Severity: {clause.severity}</strong>
                  </div>
                  </div>
                  <p>{clause.summary}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setPage("home");
              setSelectedFile(null);
              setUploadText("Click to upload");
              setClauses([]);
              setSummary([]);
              setDocumentId(null);
            }}
          >
            Analyze Another Lease
          </button>
        </>
      )}
    </div>
  );
}

export default App;

// import React, { useState } from "react";
// import "./App.css";

// function App() {
//   const [page, setPage] = useState("home");

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       console.log(file);
//       document.getElementById("upload-text").innerText = "Uploaded: " + file.name;
//     }
//   };

//   return (
//     <div className="App">

//       {/* -------- Page 1 -------- */}
//       {page === "home" && (
//         <>
//           <div className="header">🏠 LeaseBuddy</div>
//           <div className="App-header">
//             <div>
//               <img
//                 className="lease-image"
//                 src="/big-pic1.png"
//                 alt="image of a lease"
//               />
//             </div>
//             <h1>Spot the red flags before you sign</h1>
//             <p>
//               Upload your lease and get a breakdown of hidden fees,
//               risky clauses, and what to negotiate — in seconds.
//             </p>

//             <div className="file-box">
//               <label className="file-label">
//                 <p id = "upload-text">Click to upload</p>
//                 <input
//                   type="file"
//                   className="file-input"
//                   onChange={handleFileChange}
//                 />
//               </label>
//             </div>

//             {/* Button to go to Page 2 */}
//             <button onClick={() => setPage("results")}>
//               Analyze Lease
//             </button>
//             <p>🔒Your lease stays private     ⚡ Results in seconds 🆓 No account neede</p>
//           </div>
//         </>
//       )}

//       {/* -------- Page 2 -------- */}
//       {page === "results" && (
//         <>
//           <div className="header">🏠 LeaseBuddy</div>
//           <div className="App-main">
//             {/* Left: Document Viewer */}


//             <div className = "leaseBuddy-verdict">
//               <div className = "containers-text"> 
//                 <h1>LeaseBuddy Verdict</h1>
//                 <div className = "risk">
//                   <h2 id = "risk-text">high risk</h2>
//                 </div>
//               </div>
//               <p id = "verdict">summery of verdict</p>
//             </div>

//             <div className = "side-to-side">
//               <div className = "container">
//                 <div className = "containers-text"> 
//                   <h1>Parties</h1>
//                 </div>
//                 <p id = "container">container</p>
//               </div>

//               <div className = "container">
//                 <h1>Property</h1>
//                 <p id = "container">container</p>
//               </div>
//             </div>

//             <div className = "side-to-side">
//               <div className = "container">
//                 <h1>Term</h1>
//                 <p id = "container">container</p>
//               </div>

//               <div className = "container">
//                 <h1>Rent</h1>
//                 <p id = "container">container</p>
//               </div>
//             </div>

//             <div className = "side-to-side">
//             <div className = "container">
//                 <h1>Security Deposit</h1>
//                 <p id = "container">container</p>
//               </div>
//             </div>

//           </div>
          
//           {/* Back button */}
//           <button onClick={() => setPage("home")}>
//             Analyze Another Lease
//           </button>
//         </>
        
//       )}

//     </div>
//   );
// }

// export default App;
