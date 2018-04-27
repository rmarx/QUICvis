import {Trace} from '../data/quic';

export default abstract class Parser{
    public abstract parse(name: string, tracefile: JSON): Trace;
}