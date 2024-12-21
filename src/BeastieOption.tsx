import { MouseEventHandler } from "react";
import { Beastie } from "./types";
import BeastieIcon from "./BeastieIcon";

export interface BeastieOptionProps {
	beastie: Beastie;
	onRight: boolean;
	onClickCallback: MouseEventHandler;
}

export default function BeastieOption(props: BeastieOptionProps) {
	return (<>
		<button className={`beastieButton ${props.onRight ? "right" : "left"}`} onClick={props.onClickCallback}>
			<BeastieIcon ranking={false} beastie={props.beastie} />
			<div className="beastieName">{props.beastie.beastieName}</div>
			<div className="beastieNumber"><span className="hash"><b>#</b></span>{props.beastie.beastieNumber.toString().padStart(2, "0")}</div>
		</button>
	</>);
}
