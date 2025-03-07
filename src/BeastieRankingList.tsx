import BeastieRanking, { BeastieRankingProps } from "./BeastieRanking";
import Disclaimer from "./Disclaimer";

export interface BeastieRankingListProps {
	rankings: BeastieRankingProps[];
}

export default function BeastieRankingList(props: BeastieRankingListProps) {
	const entries: JSX.Element[] = [];
	for (const entry of props.rankings) {
		entries.push(<BeastieRanking beastie={entry.beastie} rank={entry.rank} key={entry.rank} />);
	}

	return (<>
		<div className="beastieRankingList">
			{entries}
			<Disclaimer />
		</div>
	</>);
}
