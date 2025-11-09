
import React from "react";

const ElectionStatus = (props) => {
  const containerStyle = {
    background: "#f6f6f6",
    padding: "1.8rem 2rem",
    // margin: "2rem auto",
    width: "90%",
    maxWidth: "700px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    boxShadow: "0 3px 12px rgba(0, 0, 0, 0.08)",
    textAlign: "center",
  };

  const titleStyle = {
    color: "#1e293b",
    fontWeight: "600",
    fontSize: "1.4rem",
    marginBottom: "1.2rem",
  };

  const statusWrapper = {
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1.5rem",
  };

  const statusBox = (isTrue) => ({
    backgroundColor: isTrue ? "#dcfce7" : "#fee2e2", // light green/red
    border: `1px solid ${isTrue ? "#16a34a" : "#dc2626"}`, // green/red border
    color: isTrue ? "#166534" : "#991b1b", // dark green/red text
    borderRadius: "50px",
    padding: "0.6rem 1.4rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.6rem",
    minWidth: "140px",
    fontSize: "0.95rem",
  });

  const dotStyle = (isTrue) => ({
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor: isTrue ? "#16a34a" : "#dc2626",
  });

  return (
    <div
      className="container-main"
      style={{
        // borderTop: "1px solid #cbd5e1",
        marginTop: "0px",
        padding: "2rem 0",
      }}
    >
      <div style={containerStyle}>
      <h3 style={titleStyle}>Election Status</h3>
        <div style={statusWrapper}>
          <div style={statusBox(props.elStarted)}>
            <span style={dotStyle(props.elStarted)}></span>
            Started: {props.elStarted ? "True" : "False"}
          </div>
          <div style={statusBox(props.elEnded)}>
            <span style={dotStyle(props.elEnded)}></span>
            Ended: {props.elEnded ? "True" : "False"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionStatus;

/*import React from "react";

const ElectionStatus = (props) => {
  const electionStatus = {
    padding: "11px",
    margin: "7px",
    width: "100%",
    border: "1px solid tomato",
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "center",
    borderRadius: "0.5em",
    overflow: "auto",
    alignItems: "center",
    justifyContent: "space-around",
    display: "flex",
  };
  return (
    <div
      className="container-main"
      style={{ borderTop: "1px solid", marginTop: "0px" }}
    >
      <h3>Election Status</h3>
      <div style={electionStatus}>
        <p>Started: {props.elStarted ? "True" : "False"}</p>
        <p>Ended: {props.elEnded ? "True" : "False"}</p>
      </div>
      <div className="container-item" />
    </div>
  );
};

export default ElectionStatus;*/