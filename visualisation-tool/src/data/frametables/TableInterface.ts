import { FrameColour } from "@/data/frametables/Frametypes";

export default interface TableInterface {
    findColor(framecode: number): string;
    getName(): string;
    getAllColors(): Array<FrameColour>;
}