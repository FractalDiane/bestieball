import BeastieIcon from "./BeastieIcon";
import { Beastie } from "./types";

export interface BeastieRankingProps {
	beastie: Beastie;
	rank: number;
}

export default function BeastieRanking(props: BeastieRankingProps) {
	return (<>
		<div className="beastieRanking">
			<div className="beastieRankingNumber">{props.rank}</div>
			<div className="beastieRankingIcon">
				<BeastieIcon ranking={true} beastie={props.beastie} />
			</div>
			<div className="beastieRankingName">
				<div className="beastieName ranking">{props.beastie.beastieName}</div>
				<div className="beastieNumber ranking"><span className="hash"><b>#</b></span>{props.beastie.beastieNumber.toString().padStart(2, "0")}</div>
			</div>
		</div>
	</>);
}
