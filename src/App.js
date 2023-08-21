import React, { useCallback, useEffect, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@near-wallet-selector/modal-ui/styles.css";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-bootstrap-typeahead/css/Typeahead.bs5.css";
import "bootstrap/dist/js/bootstrap.bundle";
import "./App.scss";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { providers } from "near-api-js";
import DataStore from "./pages/DataStoragePage"
import DiscoverPage from "./pages/DiscoverPage";
import Marketplace from "./pages/MarketPlace"
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupNeth } from "@near-wallet-selector/neth";
import { setupModal } from "@near-wallet-selector/modal-ui";
import {
  useAccount,
  useInitNear,
  useNear,
  Widget
} from "near-social-vm";
import Navigation from "./components/navigation/Navigation";
import { NetworkId, Widgets } from "./data/widgets";
import { supabase } from "./utils/supabase";
import { utils } from 'near-api-js';

function App(props) {
  const [connected, setConnected] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [signedAccountId, setSignedAccountId] = useState(null);
  const [walletModal, setWalletModal] = useState(null);
  const [dataKey, setDataKey] = useState(null);

  const { initNear } = useInitNear();
  const near = useNear();
  const account = useAccount();
  const accountId = account.accountId;

  useEffect(() => {
    initNear &&
      initNear({
        networkId: NetworkId,
        selector: setupWalletSelector({
          network: NetworkId,
          modules: [
            setupNearWallet(),
            setupMyNearWallet(),
            setupSender(),
            setupHereWallet(),
            setupMeteorWallet(),
            setupNeth({
              gas: "0",
              bundle: false,
            }),
          ],
        }),
      });
  }, [initNear]);

  useEffect(() => {
    if (!near) {
      return;
    }
    near.selector.then((selector) => {
      setWalletModal(
        setupModal(selector, { contractId: near.config.contractName })
      );
    });
  }, [near]);

  const requestSignIn = useCallback(
    (e) => {
      e && e.preventDefault();
      walletModal.show();
      return false;
    },
    [walletModal]
  );

  const logOut = useCallback(async () => {
    if (!near) {
      return;
    }
    const wallet = await (await near.selector).wallet();
    wallet.signOut();
    near.accountId = null;
    setSignedIn(false);
    setSignedAccountId(null);
  }, [near]);

  const refreshAllowance = useCallback(async () => {
    alert(
      "You're out of access key allowance. Need sign in again to refresh it"
    );
    await logOut();
    requestSignIn();
  }, [logOut, requestSignIn]);

  useEffect(() => {
    if (!near) {
      return;
    }
    setSignedIn(!!accountId);
    setSignedAccountId(accountId);
    setConnected(true);
  }, [near, accountId]);

  useEffect(() => {
    if (!near) {
      return;
    }

    const primaryKey = utils.key_pair.KeyPairEd25519.fromRandom();
    const secondKey = utils.key_pair.KeyPairEd25519.fromRandom();

    setDataKey({
      accountId: accountId,
      primaryKey: {
        public: primaryKey.getPublicKey().toString(),
        private: primaryKey.secretKey
      },
      secondKey: {
        public: secondKey.getPublicKey().toString(),
        private: secondKey.secretKey
      }
    })
  }, [near])

  const passProps = {
    refreshAllowance: () => refreshAllowance(),
    signedAccountId,
    signedIn,
    connected,
    logOut,
    requestSignIn,
    widgets: Widgets,
  };

  return (
    <div className="App">
        <Widget props={dataKey} src={"tvh050423.testnet/widget/SaveKey"}/>
        <Router basename={process.env.PUBLIC_URL}>
          <Switch>
            <Route path={"/dataStorage"}>
              <Navigation {...passProps} />
              <DataStore {...passProps} />
            </Route>
            <Route path={"/marketplace"}>
              <Navigation {...passProps} />
              <Marketplace {...passProps} />
            </Route>
            <Route path={"/*"}>
              <Navigation {...passProps} />
              <DiscoverPage {...passProps} />
            </Route>
          </Switch>
        </Router>
    </div>
  );
}

export default App;
