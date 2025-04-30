import 'tldraw/tldraw.css'
import './style.css'
import ClientEditor from './ClientEditor';

export default function Editor() {
    return <div className="h-screen">
        <ClientEditor />
    </div>;
}