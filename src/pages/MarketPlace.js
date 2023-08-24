import React, { useEffect, useState, useCallback } from "react";
import { Widget, useNear, useAccount } from "near-social-vm";
import { callMethod, viewMethod } from "../utils/method";

const contractID = process.env.REACT_APP_CONTRACT_ID

export default function DiscoverPage(props) {

  const near = useNear()
  const account = useAccount();
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const getFiles = useCallback(async () => {
    let uploads = []

    if(!near){
      return uploads
    }

    uploads = await viewMethod(near, {contractId: contractID,
    method: "get_published_data"})
    
    return uploads
  }, [near, account])

  const reloadData = useCallback(() => {
    setIsLoading(true)
    getFiles().then((response) => {
      setData(response)
      setIsLoading(false)
    })
  }, [near, props])

  useEffect(() => {
    reloadData()
  }, [near, props])

  const purchaseData = useCallback(async (id) => {
    if(!near){
      return
    }

    const key = JSON.parse(localStorage.getItem("keys")).filter(key => key.accountID === account.accountId)[0]
    const access_key = key.primaryKey.public

    const args = {
      encrypted_cid: id,
      access_key: access_key
    }

    const response = await callMethod(near, {contractId: contractID,
      method: "purchase", args })
  }, [near, props])

  const propsPassing = {
    ...props,
    data,
    reloadData,
    isLoading,
    purchaseData,
    accountId: account.accountId
  }

  return (
    <Widget props={propsPassing} src={"tvh050423.testnet/widget/MarketPlace"} />
  );
}