import React, { Component } from "react";
import Alert from "./Alert.js";
import "./App.css";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

const GAS = 4712388;

const styles = theme => ({
  button: {
    marginLeft: "10px"
  },
  textField: {
    marginLeft: "10px",
    width: "90px"
  }
});

class Token extends Component {
  /* CONSTRUCTOR */
  constructor(props) {
    super(props);
    this.curTokenPurchase;
    this.withdrawValue;
    this.stakeAmount;
    this.alert = React.createRef();
    this.tokenPurchase = this.tokenPurchase.bind(this);
    this.withdraw = this.withdraw.bind(this);
    this.stakeTokens = this.stakeTokens.bind(this);
  }

  /*
   * Purchase tokens.
   */
  async tokenPurchase(event) {
    if (event) event.preventDefault();

    // Contribute to the Mintable Token Factory
    console.log("Contribute to the crowdsale");
    this.props.tokenFactory
      .contribute({
        from: this.props.enigmaSetup.accounts[this.props.curAccount],
        value: this.props.enigmaSetup.web3.utils.toWei(
          String(this.curTokenPurchase.value / 10),
          "ether"
        ),
        gas: GAS
      })
      .then(result => {
        console.log("Update the state token balances");
        // Update the App state
        let balances = this.props.tokenBalances;
        balances[this.props.curAccount] =
          parseInt(this.props.tokenBalances[this.props.curAccount]) +
          parseInt(this.curTokenPurchase.value);
        this.props.updateToken(balances);

        this.alert.current.openAlert("You have successfully purchased tokens.");
        document.getElementById("token_form").reset();
      })
      .catch(error => {
        this.alert.current.openAlert(
          "User does not have enough Ether. Please enter a smaller amount."
        );
      });
  }

  /*
   * Allow a user to withdraw tokens.
   */
  withdraw(event) {
    if (event) event.preventDefault();
    // withdraw tokens
    let amount = this.props.enigmaSetup.web3.utils.toWei(
      this.withdrawValue.value,
      "ether"
    );
    return this.props.voting
      .withdrawTokens(String(amount), {
        from: this.props.enigmaSetup.accounts[this.props.curAccount],
        gas: GAS
      })
      .then(result => {
        // update the app state
        let balances = this.props.tokenBalances;
        balances[this.props.curAccount] += parseInt(this.withdrawValue.value);
        this.props.updateToken(balances);

        let staked = this.props.stakedTokens;
        staked[this.props.curAccount] -= parseInt(this.withdrawValue.value);
        this.props.updateStake(staked);

        this.alert.current.openAlert("You have successfully withdrawn tokens.");
        document.getElementById("withdraw_form").reset();
      })
      .catch(error => {
        console.log(error);
        this.alert.current.openAlert(
          "You are trying to withdraw too many tokens."
        );
      });
  }

  stakeTokens(event) {
    if (event) event.preventDefault();
    // approve transfer
    this.props.votingToken
      .approve(
        this.props.voting.address,
        this.props.enigmaSetup.web3.utils.toWei(
          this.stakeAmount.value,
          "ether"
        ),
        {
          from: this.props.enigmaSetup.accounts[this.props.curAccount],
          gas: GAS
        }
      )
      .then(result => {
        // stake tokens
        let amount = this.props.enigmaSetup.web3.utils.toWei(
          this.stakeAmount.value,
          "ether"
        );
        return this.props.voting.stakeVotingTokens(String(amount), {
          from: this.props.enigmaSetup.accounts[this.props.curAccount],
          gas: GAS
        });
      })
      .then(result => {
        // update the app state

        // update token balance
        let balances = this.props.tokenBalances;
        balances[this.props.curAccount] -= parseInt(this.stakeAmount.value);
        this.props.updateToken(balances);

        // update staked token balance
        let staked = this.props.stakedTokens;
        staked[this.props.curAccount] += parseInt(this.stakeAmount.value);
        this.props.updateStake(staked);

        this.alert.current.openAlert("You have successfully staked tokens.");
        document.getElementById("stake_form").reset();
      })
      .catch(error => {
        console.log(error);
        this.alert.current.openAlert(
          "You are trying to stake too many tokens."
        );
      });
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <h3> Tokens Operations: </h3>
        <List component="nav" disablePadding={true}>
          <ListItem>
            <form onSubmit={this.tokenPurchase} id="token_form">
              <label> Purchase voting tokens: </label>
              <TextField
                className={classes.textField}
                placeholder="Amount"
                inputRef={element => (this.curTokenPurchase = element)}
              />
              <Button
                className={classes.button}
                type="submit"
                variant="outlined"
                size="small"
              >
                Purchase
              </Button>
            </form>
          </ListItem>
          <Divider />

          <ListItem>
            <form onSubmit={this.stakeTokens} id="stake_form">
              <label> Stake voting tokens: </label>
              <TextField
                className={classes.textField}
                placeholder="Amount"
                inputRef={element => (this.stakeAmount = element)}
              />
              <Button
                className={classes.button}
                type="submit"
                variant="outlined"
                size="small"
              >
                Stake
              </Button>
            </form>
          </ListItem>
          <Divider />

          <ListItem>
            <form onSubmit={this.withdraw} id="withdraw_form">
              <label> Withdraw voting tokens: </label>
              <TextField
                className={classes.textField}
                placeholder="Amount"
                inputRef={element => (this.withdrawValue = element)}
              />
              <Button
                className={classes.button}
                type="submit"
                variant="outlined"
                size="small"
              >
                Withdraw
              </Button>
            </form>
          </ListItem>
        </List>

        <Alert ref={this.alert} />
      </div>
    );
  }
}

Token.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Token);
