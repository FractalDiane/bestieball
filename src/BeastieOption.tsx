import { MouseEventHandler } from "react";
import { Beastie } from "./types";

export interface BeastieOptionProps {
	beastie: Beastie;
	onRight: boolean;
	onClickCallback: MouseEventHandler;
}

export default function BeastieOption(props: BeastieOptionProps) {
	return (<>
		<button className={`beastieButton ${props.onRight ? "right" : "left"}`} onClick={props.onClickCallback}>
			<img className="beastieIcon" src={`https://beastiepediaimg.s3.amazonaws.com/d76cpgnhqk1hcr/${props.beastie.beastieName}Idle.png`} />
			<div className="beastieName">{props.beastie.beastieName}</div>
			<div className="beastieNumber"><span className="hash"><b>#</b></span>{props.beastie.beastieNumber.toString().padStart(2, "0")}</div>
		</button>
	</>);
}
