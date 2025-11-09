import React from "react";

function UserHome(props) {
  return (
    <div>
      <div className="container-main" style={{width:"750px"}}>
        <div className="container-list title">
          <h1>{props.el.electionTitle}</h1>
          <br />
          <center>{props.el.organizationTitle}</center>
<table
  style={{
    marginTop: "21px",
    borderCollapse: "collapse",
    fontSize: "1rem",
  }}
>
  <tbody>
    <tr>
      <th
        style={{
          padding: "6px 10px",
          textTransform: "uppercase",
          color: "#2563eb",
          fontWeight: 600,
          width: "90px",
        }}
      >
        Admin
      </th>
      <td
        style={{
          padding: "6px 10px",
          textTransform: "capitalize",
          color: "#374151",
          fontWeight: 500,
        }}
      >
        {props.el.adminName} ({props.el.adminTitle})
      </td>
    </tr>
    <tr>
      <th
        style={{
          padding: "6px 10px",
          textTransform: "uppercase",
          color: "#2563eb",
          fontWeight: 600,
        }}
      >
        Contact
      </th>
      <td
        style={{
          padding: "6px 10px",
          textTransform: "none",
          color: "#374151",
          fontWeight: 500,
        }}
      >
        {props.el.adminEmail}
      </td>
    </tr>
  </tbody>
</table>

        </div>
      </div>
    </div>
  );
}

export default UserHome;