import React, { useCallback, useEffect, useState } from "react";
import {  Widget, useAccount, useNear } from "near-social-vm";
import { callMethod, viewMethod } from "../utils/method";
import { useNavigate } from "react-router-dom";
import {v4 as uuidv4} from 'uuid';

const contractID = process.env.REACT_APP_CONTRACT_ID
const contractID_AILauncher = process.env.REACT_APP_CONTRACT_ID_AILAUNCHER

export default function AILauncherPage(props) {

  const [projects, setProjects] = useState(null)
  const near = useNear()
  const account = useAccount();
  const navigate = useNavigate();
  const [listFile, setListFile] = useState(null)

  useEffect(() => {

    if(!near){
      return
    }

    viewMethod(near, {contractId: contractID_AILauncher, method: "get_all_projects"}).then((result) => {
      console.log(result)
      setProjects(result)
    })

    viewMethod(near, {contractId: contractID,
      method: "get_data_by_owner", args: {owner_account_id: account.accountId}})
      .then((data) => {
        setListFile(data)
      })
    
  }, [near, props])

  const createProject = useCallback((title, description, urls, roles, file) => {

    const id = uuidv4()
    const args = {
      id,
      title,
      description,
      pool: 0,
      urls,
      vec_roles: roles
    }

    callMethod(near, {contractId: contractID_AILauncher, method: "new_project", args}).then(() => {})
  }, [near, props])

  const passingProps = {
    ...props,
    projects,
    listFile,
    createProject,
    navigate,
}

  return (
    <Widget src={"tvh050423.testnet/widget/AIlauncherPage"} props={passingProps}/>
  );
}
