import { Beastie } from "./types";

export interface BeastieIconProps {
	beastie: Beastie;
	ranking: boolean;
}

export default function BeastieIcon(props: BeastieIconProps) {
	return <img className={`beastieIcon ${props.ranking ? "ranking" : ""}`} src={`https://beastiepediaimg.s3.amazonaws.com/d76cpgnhqk1hcr/${props.beastie.beastieName}Idle.png`} />
}
