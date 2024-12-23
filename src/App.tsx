import './App.css'
import React, { useEffect, useState } from 'react'
import BeastieOption from './BeastieOption'
import beastiesFile from './beasties.json'
import { PairwiseEntry, PairwiseState } from './pairwise';
import { Beastie, BEASTIE_EMPTY, shuffleArray } from './types';
import { BeastieRankingProps } from './BeastieRanking';
import BeastieRankingList from './BeastieRankingList';
import Disclaimer from './Disclaimer';

const DEFAULT_COUNT = 25;
const AVERAGE_CHOICES: [number, number][] = [
	[5, 8],
	[10, 24],
	[15, 53],
	[25, 122],
	[35, 220],
	[50, 415],
	[60, 570],
	[80, 925],
	[90, 1130],
	[106, 1470],
];

function lerp(from: number, to: number, alpha: number): number {
	return (1 - alpha) * from + alpha * to;
}

function getEstimatedChoices(rankingCount: number): number {
	for (let i = 0; i < AVERAGE_CHOICES.length; ++i) {
		const pair = AVERAGE_CHOICES[i];
		if (rankingCount == pair[0]) {
			return pair[1];
		} else if (rankingCount < pair[0]) {
			const lastPair = AVERAGE_CHOICES[i - 1];
			const diff = pair[0] - lastPair[0];
			const alpha = (rankingCount - lastPair[0]) / diff;
			return Math.round(lerp(lastPair[1], pair[1], alpha));
		}
	}

	return 0;
}

interface State {
	selectIndex: number;
	evaluatingScore: number;
	beastiesChoice: [PairwiseEntry, PairwiseEntry];
}

const STATE_DEFAULT: State = {
	selectIndex: 0,
	evaluatingScore: 0,
	beastiesChoice: [new PairwiseEntry({...BEASTIE_EMPTY}, 0), new PairwiseEntry({...BEASTIE_EMPTY}, 0)],
};

let initialized = false;

function App() {
	const [beastieRankCount, setBeastieRankCount] = useState(DEFAULT_COUNT);
	const [estimatedChoices, setEstimatedChoices] = useState(getEstimatedChoices(DEFAULT_COUNT));
	const [pairwiseState, setPairwiseState] = useState<PairwiseState>(initializePairwiseState(DEFAULT_COUNT));
	const [evalState, setEvalState] = useState<State>({...STATE_DEFAULT});

	const [finished, setFinished] = useState(false);
	const [finalRankings, setFinalRankings] = useState<BeastieRankingProps[]>([]);
	const [totalComparisons, setTotalComparisons] = useState(0);

	useEffect(() => {
		if (!initialized) {
			startNextRound();
			setTotalComparisons(0);
			initialized = true;
		}
	}, []);

	function reinitialize(beastieCount: number) {
		const newPairwiseState = initializePairwiseState(beastieCount);
		const newEvalState: State = {...STATE_DEFAULT};

		setFinished(false);
		setFinalRankings([]);

		startNextRound(newPairwiseState, newEvalState);
		setTotalComparisons(0);
	}

	function initializePairwiseState(beastieCount: number): PairwiseState {
		const newList: Beastie[] = [];
		beastiesFile.forEach((beastie: string, index: number) => {
			newList.push({beastieName: beastie, beastieNumber: index + 1});
		});

		shuffleArray(newList);
		const newListTrimmed: Beastie[] = [];
		for (let i = 0; i < beastieCount; ++i) {
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
			stateEval.beastiesChoice = [new PairwiseEntry({...BEASTIE_EMPTY}, 0), new PairwiseEntry({...BEASTIE_EMPTY}, 0)];

			setFinalRankings(
				statePairwise.allItems
				.sort((a: PairwiseEntry, b: PairwiseEntry) => b.score - a.score)
				.map<BeastieRankingProps>((value: PairwiseEntry, index: number) => {return {beastie: value.item, rank: index + 1}; })
			);

			setEvalState(stateEval);
			setPairwiseState(statePairwise);
			setFinished(true);
		}
	}

	function onClickOption(right: boolean) {
		const newState = pairwiseState.clone();
		newState.increaseScore(evalState.beastiesChoice[0].index, evalState.beastiesChoice[1].index, right);
		newState.addPastResult(evalState.beastiesChoice[0].item.beastieNumber, evalState.beastiesChoice[1].item.beastieNumber, right);

		continueComparisons(newState, {...evalState});
	}

	function onChangeRankingCount(event: React.ChangeEvent<HTMLInputElement>) {
		const newCount = parseInt(event.target.value);
		console.log(newCount);
		setBeastieRankCount(newCount);
		setEstimatedChoices(getEstimatedChoices(newCount));
		reinitialize(newCount);
	}

	const progress = Math.min(Math.floor(totalComparisons / estimatedChoices * 100), 100);

	return (<div id="parent">
		{!finished ? <>
			<div id="mainAppChoice">
				<div className="spacer horizontal" />
				<BeastieOption beastie={evalState.beastiesChoice[0].item} onRight={false} onClickCallback={() => onClickOption(false)} />
				<div className="spacer horizontal" />
				<BeastieOption beastie={evalState.beastiesChoice[1].item} onRight={true} onClickCallback={() => onClickOption(true)} />
				<div className="spacer horizontal" />
			</div>
			<div className="spacer" />
			<div id="bottomStats">
			<center>{progress < 100 ? `${progress}` : "Almost"}<span className="percent">{progress < 100 ? "%" : ""}</span> complete</center>
				<center><progress value={totalComparisons} max={estimatedChoices} /></center>
				<div id="rankingCountText">
					<center><input type="range" name="beastieRankCount" min={5} max={106} defaultValue={DEFAULT_COUNT} onChange={onChangeRankingCount} /></center>
					<center>Beasties to rank: {beastieRankCount}</center>
					<center>Estimated choices to make: {estimatedChoices}</center>
				</div>
				<Disclaimer />
			</div>
		</> :<>
			<div id="mainAppFinished">
				<div className="spacer" />
				<BeastieRankingList rankings={finalRankings} />
				<div className="spacer" />
			</div>
		</>
		}
	</div>);
}

export default App;
