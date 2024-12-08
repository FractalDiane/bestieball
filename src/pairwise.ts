import { Beastie } from "./types";

export class PairwiseEntry {
	item: Beastie;
	score = 0;
	comparedThisRound = false;
	index: number;

	constructor(item: Beastie, index: number) {
		this.item = item;
		this.index = index;
	}

	clone(): PairwiseEntry {
		return new PairwiseEntry({...this.item}, this.index);
	}
}

export class PairwiseState {
	allItems: PairwiseEntry[] = [];
	maxScore = 0;
	pastMatches: Map<number, Map<number, boolean>> = new Map<number, Map<number, boolean>>();

	constructor(startingItems: Beastie[]) {
		startingItems.forEach((value: Beastie, index: number) => {
			this.allItems.push(new PairwiseEntry({...value}, index));
		});
	}

	increaseScore(leftIndex: number, rightIndex: number, rightWon: boolean) {
		const index = rightWon ? rightIndex : leftIndex;

		const newScore = this.allItems[index].score + 1;
		this.allItems[index].score = newScore;
		if (newScore > this.maxScore) {
			this.maxScore = newScore;
		}

		this.allItems[leftIndex].comparedThisRound = true;
		this.allItems[rightIndex].comparedThisRound = true;
	}

	addPastResult(left: number, right: number, rightWon: boolean) {
		if (!this.pastMatches.has(left)) {
			this.pastMatches.set(left, new Map<number, boolean>());
			this.pastMatches.get(left)!.set(right, rightWon);
		} else if (!this.pastMatches.get(left)!.has(right)) {
			this.pastMatches.get(left)!.set(right, rightWon);
		}

		if (!this.pastMatches.has(right)) {
			this.pastMatches.set(right, new Map<number, boolean>());
			this.pastMatches.get(right)!.set(left, !rightWon);
		} else if (!this.pastMatches.get(right)!.has(left)) {
			this.pastMatches.get(right)!.set(left, !rightWon);
		}
	}

	getPastResult(left: number, right: number): boolean | undefined {
		const r1 = this.pastMatches.get(left);
		if (r1 !== undefined) {
			const r2 = r1.get(right);
			if (r2 !== undefined) {
				return r2;
			}
		}

		return undefined;
	}

	anyTies(): boolean {
		const found = new Set<number>();
		for (const item of this.allItems) {
			if (found.has(item.score)) {
				return true;
			} else {
				found.add(item.score);
			}
		}

		return false;
	}

	clone(): PairwiseState {
		const result = new PairwiseState([]);
		result.allItems = this.allItems;
		result.maxScore = this.maxScore;
		result.pastMatches = new Map(this.pastMatches);

		return result;
	}
}
