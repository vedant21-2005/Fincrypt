// Node modules
import React, { Component } from "react";
import { Link } from "react-router-dom";

// Components
import Navbar from "../Navbar/Navigation";
import NavbarAdmin from "../Navbar/NavigationAdmin";
import NotInit from "../NotInit";

// Contract
import getWeb3 from "../../getWeb3";
import Election from "../../contracts/Election.json";

// CSS
import "./Voting.css";

export default class Voting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      account: null,
      web3: null,
      isAdmin: false,
      candidateCount: undefined,
      candidates: [],
      isElStarted: false,
      isElEnded: false,
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
        web3,
        ElectionInstance: instance,
        account: accounts[0],
      });

      const candidateCount = await instance.methods.getTotalCandidate().call();
      this.setState({ candidateCount });

      const start = await instance.methods.getStart().call();
      const end = await instance.methods.getEnd().call();
      this.setState({ isElStarted: start, isElEnded: end });

      for (let i = 0; i < candidateCount; i++) {
        const candidate = await instance.methods.candidateDetails(i).call();
        this.state.candidates.push({
          id: candidate.candidateId,
          header: candidate.header,
          slogan: candidate.slogan,
        });
      }
      this.setState({ candidates: this.state.candidates });

      const voter = await instance.methods.voterDetails(accounts[0]).call();
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

      const admin = await instance.methods.getAdmin().call();
      if (accounts[0] === admin) this.setState({ isAdmin: true });
    } catch (error) {
      alert("Failed to load Web3, accounts, or contract.");
      console.error(error);
    }
  };

  renderCandidates = (candidate) => {
    const castVote = async (id) => {
      await this.state.ElectionInstance.methods
        .vote(id)
        .send({ from: this.state.account, gas: 1000000 });
      window.location.reload();
    };

    const confirmVote = (id, header) => {
      const r = window.confirm(
        `Vote for ${header} (ID: ${id}).\nAre you sure?`
      );
      if (r) castVote(id);
    };

    return (
      <div className="card candidate-card" key={candidate.id}>
        <div className="candidate-info">
          <h3>
            {candidate.header} <small>#{candidate.id}</small>
          </h3>
          <p className="slogan">{candidate.slogan}</p>
        </div>
        <div className="vote-btn-container">
          <button
            onClick={() => confirmVote(candidate.id, candidate.header)}
            className="vote-btn"
            disabled={
              !this.state.currentVoter.isRegistered ||
              !this.state.currentVoter.isVerified ||
              this.state.currentVoter.hasVoted
            }
          >
            Vote
          </button>
        </div>
      </div>
    );
  };

  render() {
    if (!this.state.web3) {
      return (
        <>
          {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
          <div className="loading-card">
            <h3>Loading Web3, accounts, and contract...</h3>
          </div>
        </>
      );
    }

    return (
      <>
        {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}

        <div className="home-wrapper">
          {!this.state.isElStarted && !this.state.isElEnded ? (
            <NotInit />
          ) : this.state.isElStarted && !this.state.isElEnded ? (
            <>
              <div className="card status-card">
                {this.state.currentVoter.isRegistered ? (
                  this.state.currentVoter.isVerified ? (
                    this.state.currentVoter.hasVoted ? (
                      <div className="success-card">
                        <h3>You've already cast your vote.</h3>
                        <Link to="/Results" className="results-link">
                          View Results
                        </Link>
                      </div>
                    ) : (
                      <p>Go ahead and cast your vote.</p>
                    )
                  ) : (
                    <p className="attention-card">
                      Please wait for admin verification.
                    </p>
                  )
                ) : (
                  <div className="attention-card">
                    <p>You’re not registered. Please register first.</p>
                    <Link to="/Registration" className="results-link">
                      Go to Registration Page
                    </Link>
                  </div>
                )}
              </div>

              <div className="card candidate-list-card">
                <h3>Candidates</h3>
                <small className="total-voters-text">
                  Total Candidates: {this.state.candidates.length}
                </small>
                {this.state.candidates.length < 1 ? (
                  <div className="attention-card">
                    <p>No candidates added yet.</p>
                  </div>
                ) : (
                  this.state.candidates.map(this.renderCandidates)
                )}
              </div>
            </>
          ) : (
            this.state.isElEnded && (
              <div className="card attention-card">
                <h3>The Election has ended.</h3>
                <Link to="/Results" className="results-link">
                  See Results
                </Link>
              </div>
            )
          )}
        </div>
      </>
    );
  }
}
