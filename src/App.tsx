import './App.css'
import { useEffect, useState } from 'react'
import BeastieOption from './BeastieOption'
import { Beastie, shuffleArray } from './types';
import beastiesFile from './beasties.json'
import { PairwiseEntry, PairwiseState } from './pairwise';

function App() {
	const [currentSelectIndex, setCurrentSelectIndex] = useState(0);
	//const [currentSelectCandidates, setCurrentSelectCandidates] = useState<[PairwiseEntry, number][]>([]);
	const [currentScore, setCurrentScore] = useState(0);
	const [currentBeastiesChoice, setCurrentBeastiesChoice] = useState<[PairwiseEntry, PairwiseEntry]>([new PairwiseEntry({beastieName: "", beastieNumber: 0}, 0), new PairwiseEntry({beastieName: "", beastieNumber: 0}, 0)]);
	const [pairwiseState, setPairwiseState] = useState<PairwiseState>(initializeState);

	useEffect(() => {
		//initializeFullBeastiesList();
		
		setCurrentScore(0);
		setCurrentSelectIndex(0);
		continueComparisons();
	}, []);

	function initializeState(): PairwiseState {
		const newList: Beastie[] = [];
		beastiesFile.forEach((beastie: string, index: number) => {
			newList.push({beastieName: beastie, beastieNumber: index + 1});
		});

		const newListTrimmed: Beastie[] = [];
		for (let i = 0; i < 25; ++i) {
			const index = Math.floor(Math.random() * newList.length);
			const [beastie] = newList.splice(index, 1);
			newListTrimmed.push(beastie);
		}

		shuffleArray(newListTrimmed);
		return new PairwiseState(newListTrimmed);
	}

	function startNextRound(): boolean {
		if (!pairwiseState!.anyTies()) {
			return false;
		}

		const newState = pairwiseState!.clone();
		newState.allItems.forEach((value: PairwiseEntry) => { value.comparedThisRound = false; });
		shuffleArray(newState.allItems);

		setPairwiseState(newState);

		setCurrentScore(0);
		setCurrentSelectIndex(0);
		continueComparisons();

		return true;
	}

	function continueComparisons() {
		let score = currentScore;
		let i = currentSelectIndex;
		const newState = pairwiseState.clone();
		const currentMaxScore = newState.maxScore;
		while (score <= currentMaxScore) {
			const candidates: [PairwiseEntry, number][] = [];
			while (i < newState.allItems.length) {
				if (!newState.allItems[i].comparedThisRound && newState.allItems[i].score == currentScore) {
					//const newCandidates = [...currentSelectCandidates];
					candidates.push([newState.allItems[i], i]);
					//setCurrentSelectCandidates(newCandidates);

					if (candidates.length == 2) {
						const pastResult = newState.getPastResult(candidates[0][0].item.beastieNumber, candidates[1][0].item.beastieNumber);
						if (pastResult !== undefined) {
							newState.increaseScore(candidates[0][1], candidates[1][1], pastResult);
							//setPairwiseState(newState);
						} else {
							const newChoice: [PairwiseEntry, PairwiseEntry] = [candidates[0][0], candidates[1][0]];
							setCurrentBeastiesChoice(newChoice);
							setPairwiseState(newState);
							setCurrentScore(score);
							setCurrentSelectIndex(i);
							return;
						}
					}
				}

				//setCurrentSelectIndex(currentSelectIndex + 1);
				++i;
			}

			//setCurrentScore(currentScore + 1);
			++score;
		}

		//setCurrentBeastiesChoice(newChoice);
		setPairwiseState(newState);
		setCurrentScore(score);
		setCurrentSelectIndex(i);

		if (!startNextRound()) {
			setCurrentBeastiesChoice([new PairwiseEntry({beastieName: "", beastieNumber: 0}, 0), new PairwiseEntry({beastieName: "", beastieNumber: 0}, 0)]);
			console.log("FINISHED");
		}
	}

	function onClickOption(right: boolean) {
		const newState = pairwiseState!.clone();
		newState.increaseScore(currentBeastiesChoice[0].index, currentBeastiesChoice[1].index, right);
		newState.addPastResult(currentBeastiesChoice[0].item.beastieNumber, currentBeastiesChoice[1].item.beastieNumber, right);
		setPairwiseState(newState);
		
		continueComparisons();
	}

	return (
		<div id="mainApp">
		<div className="spacer" />
		<BeastieOption beastie={currentBeastiesChoice[0].item} onRight={false} onClickCallback={() => onClickOption(false)} />
		<div className="spacer" />
		<BeastieOption beastie={currentBeastiesChoice[1].item} onRight={true} onClickCallback={() => onClickOption(true)} />
		<div className="spacer" />
		</div>
	);
}

export default App;
