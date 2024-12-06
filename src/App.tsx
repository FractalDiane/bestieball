import { useEffect, useState } from 'react'
import './App.css'
import BeastieOption from './BeastieOption'
import { Beastie } from './types';
import beastiesFile from './beasties.json'

function App() {
	const [fullBeastiesList, setFullBeastiesList] = useState<Beastie[]>([]);
	const [currentBeastiesChoice, setCurrentBeastiesChoice] = useState<[Beastie, Beastie]>([{beastieName: "", beastieNumber: 0}, {beastieName: "", beastieNumber: 0}]);

	useEffect(() => {
		initializeFullBeastiesList();
	}, []);

	function initializeFullBeastiesList() {
		const newList: Beastie[] = [];
		beastiesFile.forEach((beastie: string, index: number) => {
			newList.push({beastieName: beastie, beastieNumber: index + 1});
		});

		// TODO: dry it
		const newCurrentBeastiesChoice: [Beastie, Beastie] = [{beastieName: "", beastieNumber: 0}, {beastieName: "", beastieNumber: 0}];
		for (let i = 0; i < 2; ++i) {
			const index = Math.floor(Math.random() * newList.length);
			const [newBeastie] = newList.splice(index, 1);
			newCurrentBeastiesChoice[i] = newBeastie;
		}

		setCurrentBeastiesChoice(newCurrentBeastiesChoice);

		setFullBeastiesList(newList);
	}

	function fetchRandomBeasties() {
		const newFullBeastiesList = fullBeastiesList.slice();
		const newCurrentBeastiesChoice: [Beastie, Beastie] = [{beastieName: "", beastieNumber: 0}, {beastieName: "", beastieNumber: 0}];
		for (let i = 0; i < 2; ++i) {
			const index = Math.floor(Math.random() * newFullBeastiesList.length);
			const [newBeastie] = newFullBeastiesList.splice(index, 1);
			newCurrentBeastiesChoice[i] = newBeastie;
		}

		setFullBeastiesList(newFullBeastiesList);
		setCurrentBeastiesChoice(newCurrentBeastiesChoice);
	};

	/*useEffect(() => {
		const newList: Beastie[] = [];
		beastiesFile.forEach((beastie: string, index: number) => {
			newList.push({beastieName: beastie, beastieNumber: index + 1});
		});

		setFullBeastiesList(newList);
		setTest(1);
		fetchRandomBeasties();
	}, []);*/

	function onClickOption(right: boolean) {
		fetchRandomBeasties();
	}

	return (
		<div id="mainApp">
		<div className="spacer" />
		<BeastieOption beastie={currentBeastiesChoice[0]} onRight={false} onClickCallback={() => onClickOption(false)} />
		<div className="spacer" />
		<BeastieOption beastie={currentBeastiesChoice[1]} onRight={true} onClickCallback={() => onClickOption(true)} />
		<div className="spacer" />
		</div>
	);

	/*const result = [];
	for (const beastie of fullBeastiesList) {
		//result.push(<div>#{beastie.beastieNumber.toString().padStart(2, "0")}: {beastie.beastieName}</div>);
		result.push(<BeastieOption beastie={beastie} />);
	}

	return result;*/
}

export default App;
