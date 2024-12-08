import './App.css'
import { useEffect, useState } from 'react'
import BeastieOption from './BeastieOption'
import beastiesFile from './beasties.json'
import { PairwiseEntry, PairwiseState } from './pairwise';
import { Beastie, shuffleArray } from './types';

interface State {
	selectIndex: number;
	evaluatingScore: number;
	beastiesChoice: [PairwiseEntry, PairwiseEntry];
}

let initialized = false;

function App() {
	const [pairwiseState, setPairwiseState] = useState<PairwiseState>(initializePairwiseState);
	const [evalState, setEvalState] = useState<State>({
		selectIndex: 0,
		evaluatingScore: 0,
		beastiesChoice: [new PairwiseEntry({beastieName: "", beastieNumber: 0}, 0), new PairwiseEntry({beastieName: "", beastieNumber: 0}, 0)],
	});

	const [finished, setFinished] = useState(false);
	const [totalComparisons, setTotalComparisons] = useState(0);

	useEffect(() => {
		if (!initialized) {
			startNextRound();
			initialized = true;
		}
	}, []);

	function initializePairwiseState(): PairwiseState {
		const newList: Beastie[] = [];
		beastiesFile.forEach((beastie: string, index: number) => {
			newList.push({beastieName: beastie, beastieNumber: index + 1});
		});

		shuffleArray(newList);
		const newListTrimmed: Beastie[] = [];
		for (let i = 0; i < 25; ++i) {
			newListTrimmed.push(newList.pop()!);
		}

		return new PairwiseState(newListTrimmed);
	}

	function startNextRound(statePairwise?: PairwiseState, stateEval?: State): boolean {
		if (!pairwiseState.anyTies()) {
			return false;
		}

		const newState = statePairwise !== undefined ? statePairwise.clone() : pairwiseState.clone();
		newState.clearValuesCompared();
		newState.shuffleItems();

		const newEvalState = stateEval !== undefined ? {...stateEval} : {...evalState};
		newEvalState.evaluatingScore = 0;
		newEvalState.selectIndex = 0;

		continueComparisons(newState, newEvalState);

		return true;
	}

	function continueComparisons(statePairwise: PairwiseState, stateEval: State) {
		const currentMaxScore = statePairwise.maxScore;
		for (; stateEval.evaluatingScore <= currentMaxScore; ++stateEval.evaluatingScore) {
			let candidates: [PairwiseEntry, number][] = [];
			for (; stateEval.selectIndex < statePairwise.allItems.length; ++stateEval.selectIndex) {
				if (!statePairwise.allItems[stateEval.selectIndex].comparedThisRound && statePairwise.allItems[stateEval.selectIndex].score == stateEval.evaluatingScore) {
					candidates.push([statePairwise.allItems[stateEval.selectIndex], stateEval.selectIndex]);
					if (candidates.length == 2) {
						const pastResult = statePairwise.getPastResult(candidates[0][0].item.beastieNumber, candidates[1][0].item.beastieNumber);
						if (pastResult !== undefined) {
							statePairwise.increaseScore(candidates[0][1], candidates[1][1], pastResult);
						} else {
							const newChoice: [PairwiseEntry, PairwiseEntry] = [candidates[0][0].clone(), candidates[1][0].clone()];
							stateEval.beastiesChoice = newChoice;
							++stateEval.selectIndex;
							setEvalState(stateEval);
							setPairwiseState(statePairwise);
							setTotalComparisons(totalComparisons + 1);
							return;
						}

						candidates = [];
					}
				}
			}

			stateEval.selectIndex = 0;
		}

		if (!startNextRound(statePairwise, stateEval)) {
			stateEval.beastiesChoice = [new PairwiseEntry({beastieName: "", beastieNumber: 0}, 0), new PairwiseEntry({beastieName: "", beastieNumber: 0}, 0)];
			setEvalState(stateEval);
			setPairwiseState(statePairwise);
			console.log("FINISHED");
		}
	}

	function onClickOption(right: boolean) {
		const newState = pairwiseState.clone();
		newState.increaseScore(evalState.beastiesChoice[0].index, evalState.beastiesChoice[1].index, right);
		newState.addPastResult(evalState.beastiesChoice[0].item.beastieNumber, evalState.beastiesChoice[1].item.beastieNumber, right);

		continueComparisons(newState, {...evalState});
	}

	const progressMax = 138;
	const progress = Math.min(Math.floor(totalComparisons / progressMax * 100), 100);

	return (
		<div id="mainApp">
		Comparisons: {totalComparisons}
		<div className="spacer" />
		<BeastieOption beastie={evalState.beastiesChoice[0].item} onRight={false} onClickCallback={() => onClickOption(false)} />
		<div className="spacer">
		{progress < 100 ? `${progress}%` : "Almost"} complete <progress value={totalComparisons} max={progressMax} />
		</div>
		<BeastieOption beastie={evalState.beastiesChoice[1].item} onRight={true} onClickCallback={() => onClickOption(true)} />
		<div className="spacer" />
		</div>
	);
}

export default App;
