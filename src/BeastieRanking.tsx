import { Beastie } from "./types";

export interface BeastieRankingProps {
	beastie: Beastie;
	rank: number;
}

export default function BeastieRanking(props: BeastieRankingProps) {
	return (<>
		<div className="beastieRanking">
			<div className="beastieRankingNumber">{props.rank}</div>
			<img className="beastieIcon ranking" src={`https://beastiepediaimg.s3.amazonaws.com/d76cpgnhqk1hcr/${props.beastie.beastieName}Idle.png`} />
			<div className="beastieName ranking">{props.beastie.beastieName}</div>
			<div className="beastieNumber ranking"><span className="hash"><b>#</b></span>{props.beastie.beastieNumber.toString().padStart(2, "0")}</div>
		</div>
	</>);
}
