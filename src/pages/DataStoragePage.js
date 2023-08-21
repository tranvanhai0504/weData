import React, { useEffect, useState, useCallback } from "react";
import { Widget, useAccount } from "near-social-vm";
import { Web3Storage } from 'web3.storage';
import { supabase } from "../utils/supabase";
import { callMethod, viewMethod } from "../utils/method";
import {
  useNear,
} from "near-social-vm";
import { create } from "@nearfoundation/near-js-encryption-box";

const contractID = process.env.REACT_APP_CONTRACT_ID

export default function StoragePage(props) {
  const client = new Web3Storage({ token: process.env.REACT_APP_WEB3STORAGE_TOKEN });
  const near = useNear()
  const account = useAccount();
  const [listFile, setListFile] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const getFiles = useCallback(async () => {
    let uploads = []

    if(!near){
      return uploads
    }

    uploads = await viewMethod(near, {contractId: contractID,
    method: "get_data_by_owner", args: {owner_account_id: account.accountId}})

    console.log(uploads)
    
    return uploads
  }, [near])

  const uploadFile = useCallback(async (file) => {
    if (!near) {
      return;
    }
    
    //upload file on web3storage
    var cid
    if(!file){
      return {
        status: false,
        message: "File not found"
      }
    }
    
    if(props.signedIn){
      cid = await client.put([file], {name: file.name, })
    }else{
      return {
        status: false,
        message: "You must to login for upload"
      }
    }
    
    if(!cid){
      return {
        status: false,
        message: "An Error has occurred."
      }
    } 

    
    //hash
    let {data} = await supabase.from("Profile").select().eq("accountID", near.accountId)
    const user = data[0]
    const {secret} = create(cid, user.public_key, user.private_key)
    const hashCID = secret

    //update data to supabase
    const { error } = await supabase
      .from("LookUp")
      .insert({CID: cid, hashCID})

    if(error){
      return {
        status: false,
        message: error.message
      }
    }

    //call contract to save data
    const args = {
      title_given: file.name.split('.')[0],
      tags_given: "Test",
      cid_encrypted_given: hashCID,
      size: String(file.size)
    }

    const response = await callMethod(near,
      {contractId: contractID,
      method: "new_meta_data",
      args: args})

    return {
        status: true,
        message: "Successful!"
      }

  }, [near, props]);

  const reloadData = useCallback(() => {
    setIsLoading(true)
    getFiles().then((response) => {
      setListFile(response)
      setIsLoading(false)
    })
  }, [near, props])

  useEffect(() => {
    reloadData()
  }, [near, props])

  const propsPassing = {
    ...props,
    uploadFile,
    listFile,
    reloadData,
    isLoading
  }

  return (
    <Widget props={propsPassing} src={"tvh050423.testnet/widget/DataStorage"} />
  );
}

