import { StatusTone } from '../../contracts/status';
import { TONE_TEXT } from '../../utils/format/tone-text';

interface StatusTextProps{
    tone: StatusTone;
    children: string;
}

const StatusText = ({ tone, children }: StatusTextProps) => <span className={`shrink-0 ${TONE_TEXT[tone]}`}>{children}</span>;

export default StatusText;
