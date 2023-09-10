import React, { useState, useCallback, useEffect } from "react";
import { Widget, useAccount, useNear } from "near-social-vm";
import { callMethod, viewMethod } from "../utils/method";
import { open, create } from "@nearfoundation/near-js-encryption-box";

const contractID = process.env.REACT_APP_CONTRACT_ID
const nonce = process.env.REACT_APP_NONCE
const contractID_AILauncher = process.env.REACT_APP_CONTRACT_ID_AILAUNCHER

export default function ListAcceptPage(props){
    const near = useNear()
    const account = useAccount();
    const [waitingList, setWaitingList] = useState([])
    const [waitingRole, setWaitingRole] = useState([])

    useEffect(() => {
        if(!near) return

        const fetchData = async () => {
            let data = await viewMethod(near, {
                contractId: contractID,
                method: "get_waiting_list",
                args: {
                    owner: account.accountId
                }
            })

            let response = data.map(item => {
                return viewMethod(near, {contractId: contractID, method: "get_data_by_id", args: {data_id: item[1]}})
                    .then((informationResponse) => {
                        let information = {
                            buyer: item[0],
                            ECID: item[1],
                            buyer_public_key: item[2],
                            informationData: informationResponse
                        }
                        return information
                    })
            })

            return response
        }

        fetchData().then((response => {
            Promise.all(response).then((results) => {
                setWaitingList(results)
            })
        }))
    }, [near, props])

    useEffect(() => {

        if(!near || !account.accountId) return

        viewMethod(near, {contractId: contractID_AILauncher, method: "get_request_by_owner", args: {account_id: account.accountId}}).then((result) => {
            console.log("asdfasf", result)
            setWaitingRole(result)
        })
    }, [near, props, account])

    const confirm = useCallback(async (buyerId, ECID, is_access, pub_key)=>{

        const key = JSON.parse(localStorage.getItem("keys")).filter(key => {
            return key.accountID === account.accountId
        })[0]

        const cid = open(ECID, key.primaryKey.public, key.secondKey.private, nonce)
        const {secret} = create(cid, pub_key, key.primaryKey.private, nonce)

        const args = {
            buyer_id: buyerId,
            encrypted_cid: ECID,
            is_access: is_access,
            access_key: secret,
            contract_id: "harvardtp_ft.testnet",
            pub_key: key.primaryKey.public
        }

        await callMethod(near, {
            contractId: contractID,
            method: "confirm_transaction",
            args
        })

        return true

    }, [near, props])

    const excute = useCallback((prj_id, user_id, role, is_accept) => {
        if(!near) return

        const args = {
            prj_id, user_id, role, is_accept
        }

        callMethod(near, {contractId: contractID_AILauncher, method: "excute_request", args}).then(() => {})
    }, [near, props])

    const passingProps = {
        ...props,
        waitingList,
        confirm,
        waitingRole,
        excute
    }

    return <Widget src="tvh050423.testnet/widget/ListAcceptPage" props={passingProps}/>
}