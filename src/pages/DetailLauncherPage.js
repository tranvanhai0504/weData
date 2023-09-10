import React, { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Widget, useAccount, useNear } from "near-social-vm";
import { callMethod, viewMethod } from "../utils/method";

const contractId = process.env.REACT_APP_CONTRACT_ID_AILAUNCHER

export default function DetailLauncherPage(props){

    const [queryParameters] = useSearchParams()
    const [inforProject, setInforProject] = useState()
    const [previews, setPreviews] = useState([])
    const near = useNear()
    const account = useAccount();
    const id = queryParameters.get("id").replaceAll(" ", "+")

    useEffect(() => {
        if(!near) return

        viewMethod(near, {contractId, method: "get_project_by_id", args: {id: id}}).then((result) => {
            console.log(result)
            if(result){
                setInforProject(result)
            }
        })

        viewMethod(near, {contractId, method: "get_feedbacks_by_project", args: {project_id: id}}).then((result) => {
            setPreviews(result)
        })
    }, [near])

    const postFeedback = useCallback((content) => {

        const args = {
            content,
            project_id: id,
            account_id: account.accountId
        }

        callMethod(near, {contractId, method: "new_feedback", args }).then(() => {})
    }, [near, account])

    const chooseRole = useCallback((role, permision) => {
        const args = {
            prj_id: id,
            role: role,
        }

        callMethod(near, {contractId, method: "request_contribute", args }).then(() => {})
    }, [near, account])

    const passingProps = {
        ...props,
        inforProject,
        id: account.accountId,
        previews,
        postFeedback,
        chooseRole
    }

    return <Widget src="tvh050423.testnet/widget/DetailLauncherPage" props={passingProps}/>
}