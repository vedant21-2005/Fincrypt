// Node modules
import React, { Component } from "react";

// Components
import Navbar from "../Navbar/Navigation";
import NavbarAdmin from "../Navbar/NavigationAdmin";
import NotInit from "../NotInit";

// CSS
import "./Registration.css";

// Contract
import getWeb3 from "../../getWeb3";
import Election from "../../contracts/Election.json";

export default class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      web3: null,
      account: null,
      isAdmin: false,
      isElStarted: false,
      isElEnded: false,
      voterCount: undefined,
      voterName: "",
      voterPhone: "",
      voters: [],
      currentVoter: {
        address: undefined,
        name: null,
        phone: null,
        hasVoted: false,
        isVerified: false,
        isRegistered: false,
      },
    };
  }

  // Load data
  componentDidMount = async () => {
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
      window.location.reload();
    }
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();

      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Election.networks[networkId];
      const instance = new web3.eth.Contract(
        Election.abi,
        deployedNetwork && deployedNetwork.address
      );

      this.setState({
        web3: web3,
        ElectionInstance: instance,
        account: accounts[0],
      });

      const admin = await this.state.ElectionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }

      const start = await this.state.ElectionInstance.methods.getStart().call();
      this.setState({ isElStarted: start });

      const end = await this.state.ElectionInstance.methods.getEnd().call();
      this.setState({ isElEnded: end });

      const voterCount = await this.state.ElectionInstance.methods
        .getTotalVoter()
        .call();
      this.setState({ voterCount: voterCount });

      // Load all voters
      for (let i = 0; i < voterCount; i++) {
        const voterAddress = await this.state.ElectionInstance.methods
          .voters(i)
          .call();
        const voter = await this.state.ElectionInstance.methods
          .voterDetails(voterAddress)
          .call();
        this.state.voters.push({
          address: voter.voterAddress,
          name: voter.name,
          phone: voter.phone,
          hasVoted: voter.hasVoted,
          isVerified: voter.isVerified,
          isRegistered: voter.isRegistered,
        });
      }
      this.setState({ voters: this.state.voters });

      const voter = await this.state.ElectionInstance.methods
        .voterDetails(this.state.account)
        .call();
      this.setState({
        currentVoter: {
          address: voter.voterAddress,
          name: voter.name,
          phone: voter.phone,
          hasVoted: voter.hasVoted,
          isVerified: voter.isVerified,
          isRegistered: voter.isRegistered,
        },
      });
    } catch (error) {
      console.error(error);
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
    }
  };

  updateVoterName = (event) => {
    this.setState({ voterName: event.target.value });
  };

  updateVoterPhone = (event) => {
    this.setState({ voterPhone: event.target.value });
  };

  registerAsVoter = async () => {
    await this.state.ElectionInstance.methods
      .registerAsVoter(this.state.voterName, this.state.voterPhone)
      .send({ from: this.state.account, gas: 1000000 });
    window.location.reload();
  };

  render() {
    if (!this.state.web3) {
      return (
        <>
          {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
          <div className="container-main">
            <div className="container-item info">
              <p>Loading Web3, accounts, and contract...</p>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}

        {!this.state.isElStarted && !this.state.isElEnded ? (
          <NotInit />
        ) : (
          <>
            {/* Total Registered Voters Box */}
            <div className="container-main">
              <div className="card voter-summary-card">
                <p>
                  <strong>Total Registered Voters:</strong>{" "}
                  {this.state.voters.length}
                </p>
              </div>
            </div>

            {/* Registration Form Section */}
            <div className="registration-section">
              <h3 className="registration-title">Registration</h3>
              <p className="registration-subtext">
                Register yourself to participate in the voting process.
              </p>

              <form className="registration-form">
                <label className="label-r">
                  Account Address
                  <input
                    className="input-r"
                    type="text"
                    value={this.state.account}
                    disabled
                  />
                </label>

                <label className="label-r">
                  Name
                  <input
                    className="input-r"
                    type="text"
                    placeholder="Enter your name"
                    value={this.state.voterName}
                    onChange={this.updateVoterName}
                  />
                </label>

                <label className="label-r">
                  Phone Number <span style={{ color: "tomato" }}>*</span>
                  <input
                    className="input-r"
                    type="number"
                    placeholder="e.g. 9876543210"
                    value={this.state.voterPhone}
                    onChange={this.updateVoterPhone}
                  />
                </label>

                <div className="note">
                  <strong style={{ color: "tomato" }}>Note:</strong> <br />
                  Please ensure that your Account Address and Phone Number are
                  correct. Admin might reject your registration if the phone
                  number doesn’t match their record.
                </div>

                <button
                  className="btn-add"
                  disabled={
                    this.state.voterPhone.length !== 10 ||
                    this.state.currentVoter.isVerified
                  }
                  onClick={this.registerAsVoter}
                >
                  {this.state.currentVoter.isRegistered
                    ? "Update Details"
                    : "Register"}
                </button>
              </form>
            </div>

            {/* Current Voter Info */}
            <div className="container-main">
              {loadCurrentVoter(
                this.state.currentVoter,
                this.state.currentVoter.isRegistered
              )}
            </div>

            {/* Admin View */}
            {this.state.isAdmin && (
              <div className="container-main">
                <small style={{ color: "white", fontWeight: "600", fontSize: "1rem" }}>
  Total Voters: {this.state.voters.length}
</small>
                {loadAllVoters(this.state.voters)}
              </div>
            )}
          </>
        )}
      </>
    );
  }
}

/* Helper functions */
export function loadCurrentVoter(voter, isRegistered) {
  return (
    <>
      <div
        className={
          "container-item " + (isRegistered ? "success" : "attention")
        }
      >
        <center>Your Registered Information</center>
      </div>
      <div
        className={"container-list " + (isRegistered ? "success" : "attention")} style={{width:"700px"}}
      >
        <table>
          <tbody>
            <tr>
              <th>Account Address</th>
              <td>{voter.address}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{voter.name}</td>
            </tr>
            <tr>
              <th>Phone</th>
              <td>{voter.phone}</td>
            </tr>
            <tr>
              <th>Voted</th>
              <td>{voter.hasVoted ? "True" : "False"}</td>
            </tr>
            <tr>
              <th>Verification</th>
              <td>{voter.isVerified ? "True" : "False"}</td>
            </tr>
            <tr>
              <th>Registered</th>
              <td>{voter.isRegistered ? "True" : "False"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export function loadAllVoters(voters) {
  return (
    <>
      <div className="container-item success">
        <center>List of Voters</center>
      </div>
      {voters.map((voter, index) => (
        <div key={index} className="container-list success" style={{width:"700px"}}>
          <table>
            <tbody>
              <tr>
                <th>Account Address</th>
                <td>{voter.address}</td>
              </tr>
              <tr>
                <th>Name</th>
                <td>{voter.name}</td>
              </tr>
              <tr>
                <th>Phone</th>
                <td>{voter.phone}</td>
              </tr>
              <tr>
                <th>Voted</th>
                <td>{voter.hasVoted ? "True" : "False"}</td>
              </tr>
              <tr>
                <th>Verified</th>
                <td>{voter.isVerified ? "True" : "False"}</td>
              </tr>
              <tr>
                <th>Registered</th>
                <td>{voter.isRegistered ? "True" : "False"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
}
