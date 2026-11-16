import { Toaster as SileoToaster } from 'sileo';
import { useColorScheme } from '../../hooks/chrome/use-color-scheme';
import 'sileo/styles.css';

const Toaster = () => <SileoToaster position='bottom-right' theme={useColorScheme()} />;

export default Toaster;
