// import React, { useEffect } from 'react';
// import logo from './logo.svg';
import './App.css';
import { ThreeIdConnect, EthereumAuthProvider } from '@3id/connect'
import CeramicClient from '@ceramicnetwork/http-client'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import { DID } from 'dids'
// import { IDX } from '@ceramicstudio/idx'
import { Integration } from 'lit-ceramic-sdk'


const endpoint = "https://ceramic-clay.3boxlabs.com"
let litCeramicIntegration = new Integration(endpoint, 'polygon')

function App() {
	let message = ""
	litCeramicIntegration.startLitClient(window)

	async function connect() {
		const addresses = await window.ethereum.request({
			method: "eth_requestAccounts"
		})
		return addresses
	}

	// creates did + connects to
	async function getProfile() {
		const [address] = await connect()
		const ceramic = new CeramicClient(endpoint)
		const threeIdConnect = new ThreeIdConnect()
		const provider = new EthereumAuthProvider(window.ethereum, address)

		await threeIdConnect.connect(provider)

		const did = new DID({
			provider: threeIdConnect.getDidProvider(),
			resolver: {
				...ThreeIdResolver.getResolver(ceramic)
			}
		})

		ceramic.setDID(did)
		await ceramic.did?.authenticate()
	}

	const accessControlConditions = [
		{
			contractAddress: '0x319ba3aab86e04a37053e984bd411b2c63bf229e',
			standardContractType: 'ERC721',
			chain: 'ethereum',
			method: 'balanceOf',
			parameters: [
			':userAddress'
			],
			returnValueTest: {
				comparator: '>',
				value: '0'
			}
		}
	]

	async function encrypt() {
		const stringToEncrypt = 'This is what we want to encrypt on Lit and then store on ceramic'
		// this is where the error occurs
		const response = litCeramicIntegration
			.encryptAndWrite(stringToEncrypt, accessControlConditions)
			.then((streamID) => console.log("streamID:", streamID))
	}

	function decrypt() {
		const response = litCeramicIntegration.readAndDecrypt(message)
			.then((value) => console.log("value:", value))
	}

	return (
		<div>
			<button onClick={encrypt}>Encrypt</button>
			<button onClick={decrypt}>Decrypt</button>
			<button onClick={getProfile}>Connect</button>
		</div>
	)
}

export default App;
